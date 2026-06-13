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

/** Pull an image if it isn't present locally. Resolves when the pull finishes. */
export const ensureImage = async (image) => {
    const images = await docker.listImages();
    const present = images.some((img) =>
        (img.RepoTags || []).includes(image) ||
        (img.RepoTags || []).some((t) => t === image)
    );
    if (present) return;

    await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (doneErr) =>
                doneErr ? reject(doneErr) : resolve()
            );
        });
    });
};
