"""Check the static portfolio's local references without installing dependencies."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class PortfolioPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line = self.getpos()[0]
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                self.errors.append(f"Line {line}: duplicate id {element_id!r}")
            self.ids.add(element_id)

        attribute = {"a": "href", "link": "href", "img": "src", "script": "src"}.get(tag)
        if attribute and attrs.get(attribute):
            self.references.append((attrs[attribute], line))


def check_site(root):
    entry = root / "index.html"
    if not entry.is_file() or not entry.stat().st_size:
        return ["index.html is missing or empty"]

    page = PortfolioPage()
    page.feed(entry.read_text(encoding="utf-8"))
    page.close()
    errors = page.errors

    for reference, line in page.references:
        url = urlsplit(reference)
        # External destinations and mailto links are not local build inputs.
        if url.scheme or url.netloc:
            continue

        target = root / unquote(url.path).lstrip("/") if url.path else entry
        if target.is_dir():
            target /= "index.html"
        if not target.is_file():
            errors.append(f"Line {line}: missing local file {reference!r}")
        elif not target.stat().st_size:
            errors.append(f"Line {line}: empty local file {reference!r}")
        elif target.resolve() == entry.resolve() and url.fragment:
            if unquote(url.fragment) not in page.ids:
                errors.append(f"Line {line}: missing section {reference!r}")

    return errors


if __name__ == "__main__":
    errors = check_site(Path(__file__).resolve().parents[1])
    if errors:
        print("Static portfolio checks failed:")
        for error in errors:
            print(f"  - {error}")
        raise SystemExit(1)
    print("PASS: local assets, downloads, section links, and unique element IDs.")
