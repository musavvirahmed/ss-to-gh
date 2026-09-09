#!/usr/bin/env python3
"""Local preview for public/ — homepage, custom 404, /home redirect."""

from __future__ import annotations

import argparse
import errno
import os
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        raw = unquote(parsed.path)

        if raw in ("/home", "/home/"):
            self.path = "/index.html"
            return super().do_GET()

        fs_path = self.translate_path(self.path)
        if os.path.isfile(fs_path) or os.path.isdir(fs_path):
            return super().do_GET()

        body = (PUBLIC / "404.html").read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def _port_owner_hint(port: int) -> str:
    try:
        out = subprocess.check_output(
            ["lsof", "-i", f":{port}", "-sTCP:LISTEN", "-n", "-P"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if out:
            return f"\nAlready listening:\n{out}\nStop it, or pick another port: npm run serve:public -- --port {port + 1}"
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    return f"\nPick another port: npm run serve:public -- --port {port + 1}"


def main():
    if not PUBLIC.is_dir():
        raise SystemExit(f"Missing {PUBLIC} — Publish tree is missing.")

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()
    try:
        httpd = ThreadingHTTPServer((args.bind, args.port), Handler)
    except OSError as err:
        if err.errno == errno.EADDRINUSE:
            raise SystemExit(
                f"Port {args.port} is already in use.{_port_owner_hint(args.port)}"
            ) from err
        raise
    print(f"Publish tree http://{args.bind}:{args.port}/ (custom 404)")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
