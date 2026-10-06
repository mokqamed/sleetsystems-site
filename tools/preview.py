"""Local preview with the public product site's existing route mappings.

Run from any directory: python3 tools/preview.py
Product: http://127.0.0.1:4317/   Company: http://127.0.0.1:4317/company/
This serves static files only. It does not submit signup or partner forms.
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
PRODUCT_PAGES = {"features", "partnerships", "signup", "support", "book"}
AUTH_PAGES = {"login", "forgot-password", "activate"}


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path.strip("/") in AUTH_PAGES:
            # The real auth UI belongs to the separate dashboard preview.
            target = "http://127.0.0.1:4320" + parsed.path.rstrip("/")
            if parsed.query:
                target += "?" + parsed.query
            self.send_response(302)
            self.send_header("Location", target)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return
        super().do_GET()

    def translate_path(self, path):
        parsed = urlsplit(path).path
        slug = parsed.strip("/")
        if parsed == "/":
            path = "/product/index.html"
        elif slug == "company":
            path = "/index.html"
        elif slug in PRODUCT_PAGES:
            path = f"/product/{slug}/index.html"
        return super().translate_path(path)

    def end_headers(self):
        path = Path(self.translate_path(self.path))
        if path.suffix.lower() == ".mp4":
            self.send_header("Accept-Ranges", "bytes")
        if path.suffix.lower() in {".html", ".css", ".js"} or path.is_dir():
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        self._range_length = None
        path = Path(self.translate_path(self.path))
        requested_range = self.headers.get("Range")
        if not requested_range or path.suffix.lower() != ".mp4" or not path.is_file():
            return super().send_head()

        try:
            source = path.open("rb")
        except OSError:
            self.send_error(404, "File not found")
            return None
        stat = os.fstat(source.fileno())
        size = stat.st_size
        modified = self.date_time_string(stat.st_mtime)
        if self.headers.get("If-Range") not in {None, modified}:
            source.close()
            return super().send_head()

        match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested_range.strip())
        try:
            if not match or not size or not any(match.groups()):
                raise ValueError
            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), size - 1) if last else size - 1
                if start >= size or end < start:
                    raise ValueError
            else:
                suffix_length = int(last)
                if suffix_length <= 0:
                    raise ValueError
                start, end = max(0, size - suffix_length), size - 1
        except ValueError:
            source.close()
            self.send_response(416, "Requested Range Not Satisfiable")
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        source.seek(start)
        self._range_length = end - start + 1
        self.send_response(206, "Partial Content")
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(self._range_length))
        self.send_header("Last-Modified", modified)
        self.end_headers()
        return source

    def copyfile(self, source, outputfile):
        if self._range_length is None:
            return super().copyfile(source, outputfile)
        remaining = self._range_length
        while remaining:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    print("Product preview: http://127.0.0.1:4317/", flush=True)
    print("Company preview: http://127.0.0.1:4317/company/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 4317), PreviewHandler).serve_forever()
