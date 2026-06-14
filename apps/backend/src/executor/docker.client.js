import Docker from "dockerode";
import { Writable } from "stream";

/**
 * Shared Docker Engine client. dockerode auto-detects the right transport:
 *  - Linux/macOS: the unix socket /var/run/docker.sock
 *  - Windows (Docker Desktop): the named pipe //./pipe/docker_engine
 * You can override with DOCKER_HOST / DOCKER_SOCKET if needed.
 */
export const docker = new Docker();

const collector = () => {
    const chunks = [];
    const stream = new Writable({
        write(chunk, _enc, cb) {
            chunks.push(chunk);
            cb();
        },
    });
    return { stream, value: () => Buffer.concat(chunks).toString("utf-8") };
};

/**
 * Run a command inside an already-running container and capture stdout/stderr +
 * exit code.
 *
 * We deliberately don't stream stdin over the hijacked socket (that races with
 * output capture and can truncate stdout). Callers instead feed input via a
 * file redirection (`program < input.txt`), so this only needs stdout/stderr.
 *
 * We rely on an in-container `timeout` wrapper (see dockerExecutor) for hard
 * time limits so the process is actually killed; `hardTimeoutMs` here is only a
 * JS-side safety net in case the stream never closes.
 */
export const execInContainer = async (container, cmd, { hardTimeoutMs = 30000 } = {}) => {
    const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
    });

    const stream = await exec.start({});
    const out = collector();
    const err = collector();
    container.modem.demuxStream(stream, out.stream, err.stream);

    await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (fn, arg) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            fn(arg);
        };
        const timer = setTimeout(() => {
            try {
                stream.destroy();
            } catch {
                /* ignore */
            }
            finish(resolve);
        }, hardTimeoutMs);

        stream.on("end", () => finish(resolve));
        stream.on("close", () => finish(resolve));
        stream.on("error", (e) => finish(reject, e));
    });

    let exitCode = null;
    try {
        const info = await exec.inspect();
        exitCode = info.ExitCode;
    } catch {
        /* exec may be gone; treat as unknown */
    }

    return { exitCode, stdout: out.value(), stderr: err.value() };
};

const imageExists = async (image) => {
    const images = await docker.listImages();
    return images.some((img) => (img.RepoTags || []).includes(image));
};

/** Pull an image if it isn't present locally. Resolves when the pull finishes. */
export const ensureImage = async (image) => {
    if (await imageExists(image)) return;

    await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (doneErr) =>
                doneErr ? reject(doneErr) : resolve()
            );
        });
    });
};

/**
 * Build (once) a derived image that has the GNU `time` binary (`/usr/bin/time`)
 * installed, so we can measure peak memory of each run via `time -v`.
 *
 * Why a derived image: warm containers run with NetworkMode:"none", so we can't
 * `apt-get install` at run time. Instead we do a one-time, network-enabled
 * install in a throwaway container and `commit` it to a local image tag. All our
 * base images are Debian/Ubuntu based, so a single apt command works for all.
 *
 * Best-effort: if anything fails (e.g. no network during prep), we fall back to
 * the base image and memory measurement is simply skipped (reported as null).
 *
 * @returns {Promise<{ image: string, hasTime: boolean }>}
 */
export const prepareTimeImage = async (baseImage) => {
    const derived = `leetlab-exec:${baseImage.replace(/[/:]/g, "-")}`;

    try {
        if (await imageExists(derived)) return { image: derived, hasTime: true };

        await ensureImage(baseImage);

        const installCmd =
            "apt-get update && apt-get install -y --no-install-recommends time && rm -rf /var/lib/apt/lists/*";
        const tmp = await docker.createContainer({
            Image: baseImage,
            Cmd: ["sh", "-c", installCmd],
            HostConfig: { NetworkMode: "bridge" }, // network needed only for this prep step
        });
        await tmp.start();
        const { StatusCode } = await tmp.wait();

        if (StatusCode !== 0) {
            await tmp.remove({ force: true }).catch(() => {});
            console.warn(`[executor] could not install 'time' in ${baseImage}; memory will be unavailable`);
            return { image: baseImage, hasTime: false };
        }

        const [repo, tag] = derived.split(":");
        await tmp.commit({ repo, tag });
        await tmp.remove({ force: true }).catch(() => {});
        console.log(`🧮 [executor] built memory-instrumented image ${derived}`);
        return { image: derived, hasTime: true };
    } catch (e) {
        console.warn(`[executor] time-image prep failed for ${baseImage}: ${e.message}; memory disabled`);
        return { image: baseImage, hasTime: false };
    }
};
