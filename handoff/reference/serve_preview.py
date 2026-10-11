from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import argparse
parser=argparse.ArgumentParser(description="Run the JMiseikis design preview locally")
parser.add_argument("--port",type=int,default=8767)
args=parser.parse_args()
root=Path(__file__).resolve().parent/"preview"
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control","no-store")
        self.send_header("X-Robots-Tag","noindex, nofollow")
        super().end_headers()
try:
    with ThreadingHTTPServer(("127.0.0.1",args.port),partial(Handler,directory=str(root))) as server:
        print(f"Open http://127.0.0.1:{args.port}/index.html",flush=True)
        server.serve_forever()
except OSError as error:
    raise SystemExit(f"Could not start preview: {error}. If already running, open http://127.0.0.1:{args.port}/index.html")
