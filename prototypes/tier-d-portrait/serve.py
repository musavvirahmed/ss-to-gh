#!/usr/bin/env python3
"""PROTOTYPE server — tier D cursor portrait in homepage bio layout."""

from __future__ import annotations

import argparse
import errno
import mimetypes
import os
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
PROTOTYPE = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROTOTYPE), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        raw = unquote(parsed.path)

        if raw.startswith("/site/"):
            rel = raw[len("/site/") :]
            if rel and ".." not in rel:
                candidate = PUBLIC / rel
                if candidate.is_file():
                    return self._send_file(candidate)

        fs_path = self.translate_path(self.path)
        if os.path.isfile(fs_path) or os.path.isdir(fs_path):
            return super().do_GET()

        self.send_error(404)

    def _send_file(self, path: Path):
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def _port_owner_hint(port: int) -> str:
    try:
        out = subprocess.check_output(
            ["lsof", "-i", f":{port}", "-sTCP:LISTEN", "-n", "-P"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if out:
            return f"\nAlready listening:\n{out}"
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    return ""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4188)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()
    try:
        httpd = ThreadingHTTPServer((args.bind, args.port), Handler)
    except OSError as err:
        if err.errno == errno.EADDRINUSE:
            raise SystemExit(
                f"Port {args.port} is in use.{_port_owner_hint(args.port)}"
            ) from err
        raise
    print(
        f"Tier D prototype http://{args.bind}:{args.port}/ "
        f"(site assets at /site/…)"
    )
    httpd.serve_forever()


if __name__ == "__main__":
    main()
