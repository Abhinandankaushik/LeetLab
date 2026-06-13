/**
 * Numeric language ids used across the app (kept stable for DB compatibility):
 *   71 Python · 63 JavaScript · 62 Java · 54 C++ · 50 C
 */
const LANGUAGE_IDS = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
    C: 50,
    CPP: 54,
    "C++": 54,
};

const LANGUAGE_NAMES = {
    71: "PYTHON",
    62: "JAVA",
    63: "JAVASCRIPT",
    50: "C",
    54: "CPP",
};

/** Map a language name (e.g. "PYTHON") to its numeric id. */
export const getLanguageId = (language) => LANGUAGE_IDS[String(language || "").toUpperCase()];

/** Map a numeric language id back to its canonical name. */
export const getLanguageName = (language_id) => LANGUAGE_NAMES[language_id] ?? "Unknown";

/**
 * Language configuration for the warm-container executor.
 *
 * Each `language_id` maps to:
 *  - poolName : which warm-container pool to borrow from (containers in a pool
 *               share the same Docker image, so C and C++ both use the `gcc`
 *               pool).
 *  - file     : the source filename written into the container workdir.
 *  - compile  : optional compile command (run once per submission). When absent
 *               the language is interpreted and we skip compilation.
 *  - run      : the command used to run the program for every test case.
 *
 * Commands are plain strings executed with `sh -c` inside the per-submission
 * workdir, so they may reference the files above directly.
 */
export const LANGUAGES = {
    // Python (interpreted)
    71: {
        name: "PYTHON",
        poolName: "python",
        file: "main.py",
        compile: null,
        run: "python3 main.py",
    },
    // JavaScript / Node (interpreted)
    63: {
        name: "JAVASCRIPT",
        poolName: "node",
        file: "main.js",
        compile: null,
        run: "node main.js",
    },
    // Java (compiled). Convention: user code declares `public class Main`.
    62: {
        name: "JAVA",
        poolName: "java",
        file: "Main.java",
        compile: "javac Main.java",
        run: "java Main",
    },
    // C++ (compiled)
    54: {
        name: "CPP",
        poolName: "gcc",
        file: "main.cpp",
        compile: "g++ -O2 -std=c++17 -o sol main.cpp",
        run: "./sol",
    },
    // C (compiled)
    50: {
        name: "C",
        poolName: "gcc",
        file: "main.c",
        compile: "gcc -O2 -o sol main.c",
        run: "./sol",
    },
};

/**
 * Pool definitions. One pool per distinct image; `size` is how many warm
 * containers we keep running for that pool. Sizes are overridable per pool via
 * env (e.g. POOL_PYTHON=3) and otherwise fall back to sensible small defaults.
 */
export const POOL_DEFS = {
    python: { image: "python:3.11-slim", size: envSize("POOL_PYTHON", 2) },
    node: { image: "node:20-slim", size: envSize("POOL_NODE", 1) },
    java: { image: "eclipse-temurin:21-jdk", size: envSize("POOL_JAVA", 1) },
    gcc: { image: "gcc:13", size: envSize("POOL_GCC", 2) },
};

/**
 * Which pools to warm up at boot. Defaults to the lighter, most-used set so we
 * don't pull ~2GB of images on first start. Override with
 * EXECUTOR_LANGUAGES="python,gcc,java,node". Pools not listed here are still
 * created lazily the first time a submission needs them.
 */
export const WARM_POOLS = (process.env.EXECUTOR_LANGUAGES || "python,gcc")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => POOL_DEFS[s]);

export const getLanguageConfig = (language_id) => LANGUAGES[language_id] || null;

function envSize(key, fallback) {
    const v = Number(process.env[key]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
}
