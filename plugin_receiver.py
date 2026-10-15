import json
import subprocess
import sys
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# ── MongoDB ────────────────────────────────────────────────────────────────────
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

    MONGO_URI = (
        "mongodb+srv://shriyapachunuri_db_user:Cmi33oOgHm2pQKjy"
        "@cluster0.xjcesga.mongodb.net/?retryWrites=true&w=majority"
    )
    _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Verify connection on startup
    _client.admin.command("ping")
    db          = _client["figma2insight"]
    col_dashboards = db["dashboards"]
    MONGO_OK    = True
    print("[MongoDB] ✅ Connected to Atlas — db: figma2insight, collection: dashboards")
except Exception as e:
    MONGO_OK = False
    print(f"[MongoDB] ⚠️  Could not connect: {e}")
    print("[MongoDB]    The receiver will still work; data won't be persisted.")
# ──────────────────────────────────────────────────────────────────────────────

ROOT       = Path(__file__).resolve().parent
HOST       = "127.0.0.1"
PORT       = 8765
INPUT_FILE = ROOT / "dataset" / "new_dashboard" / "figma_data.json"
PIPELINE   = []


class Handler(BaseHTTPRequestHandler):

    # ── helpers ────────────────────────────────────────────────────────────────
    def send_json(self, status, data):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type",                "application/json")
        self.send_header("Content-Length",              str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods","POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods","POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")
        self.end_headers()

    # ── GET /status ────────────────────────────────────────────────────────────
    def do_GET(self):
        if self.path == "/status":
            self.send_json(200, {
                "server":  "online",
                "port":    PORT,
                "mongodb": "connected" if MONGO_OK else "disconnected",
            })
        else:
            self.send_json(404, {"error": "Unknown endpoint"})

    # ── POST /ingest ───────────────────────────────────────────────────────────
    def do_POST(self):
        if self.path != "/ingest":
            self.send_json(404, {"error": "Unknown endpoint"})
            return

        # 1. Read body
        length  = int(self.headers.get("Content-Length", 0))
        raw     = self.rfile.read(length)

        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            self.send_json(400, {"error": f"Invalid JSON: {exc}"})
            return

        print(f"[Receiver] Received payload — keys: {list(payload.keys())}")

        # 2. Save raw JSON to disk (for the local pipeline)
        INPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        INPUT_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"[Receiver] Saved to {INPUT_FILE}")

        # 3. Run local pipeline (if configured)
        pipeline_results = []
        for step_cmd in PIPELINE:
            try:
                result = subprocess.run(
                    [sys.executable, str(ROOT / step_cmd)],
                    capture_output=True, text=True, timeout=120
                )
                pipeline_results.append({
                    "step":   step_cmd,
                    "stdout": result.stdout[-2000:],
                    "stderr": result.stderr[-500:],
                    "code":   result.returncode,
                })
                print(f"[Pipeline] {step_cmd} exited {result.returncode}")
            except Exception as exc:
                pipeline_results.append({"step": step_cmd, "error": str(exc)})

        # 4. Persist to MongoDB Atlas
        mongo_id = None
        if MONGO_OK:
            try:
                doc = {
                    "received_at":      datetime.datetime.utcnow(),
                    "figma_file_key":   payload.get("fileKey", "unknown"),
                    "frame_count":      len(payload.get("frames", [])),
                    "raw_payload":      payload,
                    "pipeline_results": pipeline_results,
                    "status":           "processed",
                }
                inserted = col_dashboards.insert_one(doc)
                mongo_id = str(inserted.inserted_id)
                print(f"[MongoDB] ✅ Saved document _id={mongo_id}")
            except Exception as exc:
                print(f"[MongoDB] ⚠️  Save failed: {exc}")

        # 5. Respond
        self.send_json(200, {
            "status":       "ok",
            "frames":       len(payload.get("frames", [])),
            "pipeline":     pipeline_results,
            "mongo_doc_id": mongo_id,
            "mongo_status": "saved" if mongo_id else ("disabled" if not MONGO_OK else "error"),
        })

    def log_message(self, fmt, *args):
        print(f"[HTTP] {self.address_string()} — {fmt % args}")


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"[Receiver] 🚀 Listening on http://{HOST}:{PORT}")
    print(f"[Receiver]    POST /ingest  — receive Figma plugin data")
    print(f"[Receiver]    GET  /status  — health check")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Receiver] Shutting down.")
        server.shutdown()
