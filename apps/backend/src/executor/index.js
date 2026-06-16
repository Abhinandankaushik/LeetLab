import dotenv from "dotenv";
import { runSubmissions as dockerRunSubmissions } from "./dockerExecutor.js";
import { registerPool, getAllPools, getPool } from "./pool.js";
import { WARM_POOLS } from "./languages.js";

dotenv.config();

/**
 * Code execution backend: a pool of warm Docker containers (compile once, run
 * many). This is the single execution engine for the app.
 */
export const runSubmissions = (args) => dockerRunSubmissions(args);

/** Warm up the configured container pools at boot. */
export const initExecutor = async () => {
    console.log(`🔥 [executor] warming pools: ${WARM_POOLS.join(", ") || "(none)"}`);
    for (const poolName of WARM_POOLS) {
        registerPool(poolName);
        try {
            await getPool(poolName);
        } catch (e) {
            console.error(`[executor] failed to warm pool "${poolName}":`, e.message);
        }
    }
};

/** Tear down all warm containers on shutdown so we don't leak them. */
export const shutdownExecutor = async () => {
    await Promise.all(getAllPools().map((p) => p.shutdown()));
};
