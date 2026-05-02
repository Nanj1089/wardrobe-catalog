const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8787);
const ENTRY = "wardrobe-catalog.html";
const DATA_FILE = path.resolve(process.env.WARDROBE_DATA_FILE || path.join(ROOT, "wardrobe-shared-store.json"));
const EDIT_KEY = process.env.WARDROBE_EDIT_KEY || "";

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, "http://localhost");

        if (req.method === "OPTIONS") {
            writeJson(res, 204, {});
            return;
        }

        if (url.pathname === "/api/meta" && req.method === "GET") {
            writeJson(res, 200, {
                authRequired: Boolean(EDIT_KEY),
                originLabel: "Shared JSON server",
                dataFile: path.basename(DATA_FILE)
            });
            return;
        }

        if (url.pathname === "/api/store" && req.method === "GET") {
            const store = await readStore();
            if (!store) {
                writeJson(res, 404, { missing: true });
                return;
            }
            writeJson(res, 200, store);
            return;
        }

        if (url.pathname === "/api/store" && req.method === "PUT") {
            if (!isAuthorized(req)) {
                writeJson(res, 401, {
                    error: "unauthorized",
                    message: "An edit key is required to save this shared wardrobe."
                });
                return;
            }

            const body = await readRequestBody(req);
            let payload;
            try {
                payload = JSON.parse(body || "{}");
            } catch (error) {
                writeJson(res, 400, { error: "invalid_json", message: "Request body is not valid JSON." });
                return;
            }

            if (!isValidStore(payload)) {
                writeJson(res, 400, { error: "invalid_store", message: "Store payload must include profile and items." });
                return;
            }

            const normalized = {
                ...payload,
                version: payload.version || "1.0.0",
                updatedAt: new Date().toISOString()
            };

            await writeStore(normalized);
            writeJson(res, 200, { ok: true, store: normalized });
            return;
        }

        await serveStatic(url.pathname, res);
    } catch (error) {
        console.error(error);
        writeJson(res, 500, { error: "server_error", message: error.message });
    }
});

function isAuthorized(req) {
    if (!EDIT_KEY) return true;
    return req.headers["x-wardrobe-key"] === EDIT_KEY;
}

function isValidStore(payload) {
    return Boolean(payload)
        && typeof payload === "object"
        && !Array.isArray(payload)
        && Boolean(payload.profile)
        && Array.isArray(payload.items);
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 5 * 1024 * 1024) {
                reject(new Error("Request body is too large."));
                req.destroy();
            }
        });
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}

async function readStore() {
    try {
        const raw = await fs.promises.readFile(DATA_FILE, "utf8");
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
    }
}

async function writeStore(store) {
    await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const tempFile = `${DATA_FILE}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(store, null, 2), "utf8");
    await fs.promises.rename(tempFile, DATA_FILE);
}

async function serveStatic(requestPath, res) {
    let targetPath = decodeURIComponent(requestPath || "/");
    if (targetPath === "/") targetPath = `/${ENTRY}`;

    const safePath = path.normalize(path.join(ROOT, targetPath));
    if (!safePath.startsWith(ROOT)) {
        writeJson(res, 403, { error: "forbidden" });
        return;
    }

    try {
        const file = await fs.promises.readFile(safePath);
        const ext = path.extname(safePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        res.end(file);
    } catch (error) {
        if (error.code === "ENOENT") {
            writeJson(res, 404, { error: "not_found" });
            return;
        }
        throw error;
    }
}

function writeJson(res, status, payload) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache"
    });
    if (status === 204) {
        res.end();
        return;
    }
    res.end(JSON.stringify(payload));
}

server.listen(PORT, "0.0.0.0", () => {
    const interfaces = Object.values(os.networkInterfaces())
        .flat()
        .filter((item) => item && item.family === "IPv4" && !item.internal);
    const localUrl = `http://localhost:${PORT}/${ENTRY}`;

    console.log("");
    console.log("Shared wardrobe server is running.");
    console.log(`Desktop: ${localUrl}`);
    interfaces.forEach((item) => {
        console.log(`Mobile:  http://${item.address}:${PORT}/${ENTRY}`);
    });
    console.log(`Data file: ${DATA_FILE}`);
    if (EDIT_KEY) {
        console.log("Edit key protection: enabled");
    } else {
        console.log("Edit key protection: disabled");
    }
    console.log("");
    console.log("Keep this terminal open while the wardrobe is in use.");
});
