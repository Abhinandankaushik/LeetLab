import { docker, ensureImage, prepareTimeImage } from "./docker.client.js";
import { POOL_DEFS } from "./languages.js";

const LABEL = "leetlab-executor";

/** Per-container memory / cpu / pids limits applied to every warm container. */
const containerSecurity = () => ({
    NetworkMode: "none", // no network access for untrusted code
    Memory: (Number(process.env.EXECUTOR_MEMORY_MB) || 256) * 1024 * 1024,
    MemorySwap: (Number(process.env.EXECUTOR_MEMORY_MB) || 256) * 1024 * 1024, // disable swap
    NanoCpus: (Number(process.env.EXECUTOR_CPUS) || 1) * 1_000_000_000,
    PidsLimit: Number(process.env.EXECUTOR_PIDS) || 128,
    CapDrop: ["ALL"],
    SecurityOpt: ["no-new-privileges"],
    // Work happens in a tmpfs so the container filesystem stays clean and
    // bounded. exec is required so compiled binaries can run.
    Tmpfs: { "/tmp": "rw,exec,nosuid,size=128m" },
});

/**
 * A pool of warm, long-lived containers for one image. Containers sit idle
 * running `sleep infinity`; we `docker exec` compile/run commands into them and
 * recycle a container if a command leaves it in a bad state.
 */
export class ContainerPool {
    constructor(poolName, { image, size }) {
        this.poolName = poolName;
        this.baseImage = image;
        this.image = image; // may be swapped for a memory-instrumented derived image
        this.size = size;
        this.hasTime = false; // whether /usr/bin/time is available for memory measurement
        this.idle = []; // ready containers
        this.all = new Set(); // every container we manage
        this.waiters = []; // resolvers waiting for a free container
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;
        this.initPromise = (async () => {
            console.log(`🐳 [executor] preparing pool "${this.poolName}" (${this.baseImage} x${this.size})`);
            // Build/reuse a derived image with GNU `time` so we can measure memory.
            const prepared = await prepareTimeImage(this.baseImage);
            this.image = prepared.image;
            this.hasTime = prepared.hasTime;
            await ensureImage(this.image);
            await this._cleanupStale();
            for (let i = 0; i < this.size; i++) {
                const c = await this._spawn(i);
                this.idle.push(c);
            }
            this.initialized = true;
            console.log(`✅ [executor] pool "${this.poolName}" ready`);
        })();
        return this.initPromise;
    }

    async _spawn(index) {
        const container = await docker.createContainer({
            Image: this.image,
            name: `${LABEL}-${this.poolName}-${index}-${Date.now()}`,
            Cmd: ["sleep", "infinity"],
            WorkingDir: "/tmp",
            Tty: false,
            Labels: { [LABEL]: this.poolName },
            HostConfig: containerSecurity(),
        });
        await container.start();
        this.all.add(container);
        return container;
    }

    /** Remove leftover containers from a previous (crashed) run of this pool. */
    async _cleanupStale() {
        try {
            const list = await docker.listContainers({
                all: true,
                filters: { label: [`${LABEL}=${this.poolName}`] },
            });
            await Promise.all(
                list.map(async (info) => {
                    try {
                        await docker.getContainer(info.Id).remove({ force: true });
                    } catch {
                        /* ignore */
                    }
                })
            );
        } catch {
            /* listing failed; ignore and continue */
        }
    }

    /** Borrow a container, waiting if all are currently busy. */
    async acquire(timeoutMs = 60000) {
        if (!this.initialized) await this.init();
        if (this.idle.length > 0) return this.idle.pop();

        return new Promise((resolve, reject) => {
            const waiter = { resolve, reject };
            const timer = setTimeout(() => {
                this.waiters = this.waiters.filter((w) => w !== waiter);
                reject(new Error(`Timed out waiting for a "${this.poolName}" container`));
            }, timeoutMs);
            waiter.timer = timer;
            this.waiters.push(waiter);
        });
    }

    /** Return a container to the pool, handing it to the next waiter if any. */
    release(container) {
        if (!this.all.has(container)) return; // was recycled
        const waiter = this.waiters.shift();
        if (waiter) {
            clearTimeout(waiter.timer);
            waiter.resolve(container);
        } else {
            this.idle.push(container);
        }
    }

    /** Destroy a misbehaving container and replace it so the pool stays full. */
    async recycle(container) {
        this.all.delete(container);
        this.idle = this.idle.filter((c) => c !== container);
        try {
            await container.remove({ force: true });
        } catch {
            /* ignore */
        }
        try {
            const replacement = await this._spawn(Math.floor(Math.random() * 100000));
            this.release(replacement);
        } catch (e) {
            console.error(`[executor] failed to replace "${this.poolName}" container:`, e.message);
        }
    }

    async shutdown() {
        const containers = [...this.all];
        this.all.clear();
        this.idle = [];
        await Promise.all(
            containers.map(async (c) => {
                try {
                    await c.remove({ force: true });
                } catch {
                    /* ignore */
                }
            })
        );
    }
}

/** Registry of pools keyed by poolName, created lazily on first use. */
const pools = new Map();

export const getPool = async (poolName) => {
    const existing = pools.get(poolName);
    if (existing) {
        if (!existing.initialized) await existing.init();
        return existing;
    }
    const def = POOL_DEFS[poolName];
    if (!def) throw new Error(`No pool definition for "${poolName}"`);
    const pool = new ContainerPool(poolName, def);
    pools.set(poolName, pool);
    await pool.init();
    return pool;
};

export const getAllPools = () => [...pools.values()];

export const registerPool = (poolName) => {
    if (pools.has(poolName)) return pools.get(poolName);
    const def = POOL_DEFS[poolName];
    if (!def) throw new Error(`No pool definition for "${poolName}"`);
    const pool = new ContainerPool(poolName, def);
    pools.set(poolName, pool);
    return pool;
};
