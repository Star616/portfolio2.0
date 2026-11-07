"""Check the static portfolio's local references without installing dependencies."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


class PortfolioPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.errors = []
        self.controls = []
        self.post_slots = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line = self.getpos()[0]
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                self.errors.append(f"Line {line}: duplicate id {element_id!r}")
            self.ids.add(element_id)

        if attrs.get("aria-controls"):
            self.controls.append((attrs["aria-controls"], line))
        if attrs.get("data-post"):
            self.post_slots.add(attrs["data-post"])

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

    for controlled, line in page.controls:
        for element_id in controlled.split():
            if element_id not in page.ids:
                errors.append(f"Line {line}: missing controlled element {element_id!r}")

    config_file = root / "data/linkedin-feed.json"
    try:
        config = json.loads(config_file.read_text(encoding="utf-8"))
        posts = config["posts"]
        ids = [post["id"] for post in posts]
        if len(ids) != len(set(ids)) or set(ids) != page.post_slots:
            errors.append("LinkedIn configuration must match the page's unique post slots")
        for post in posts:
            url = urlsplit(post["url"])
            embed = urlsplit(post["embedUrl"])
            activity = re.search(r"activity-(\d+)-", url.path)
            if url.scheme != "https" or url.netloc != "www.linkedin.com" or not activity:
                errors.append(f"Invalid LinkedIn post URL for {post['id']!r}")
            elif embed.scheme != "https" or embed.netloc != "www.linkedin.com" or embed.path != "/embed/feed/update/urn:li:activity:" + activity.group(1) or embed.query or embed.fragment:
                errors.append(f"LinkedIn embed does not match post {post['id']!r}")
            if not post.get("title", "").strip():
                errors.append(f"LinkedIn post {post['id']!r} needs an accessible title")
        provider = config.get("provider", {}).get("iframeUrl", "")
        if provider:
            url = urlsplit(provider)
            if url.scheme != "https" or url.netloc != "widgets.sociablekit.com" or not re.fullmatch(r"/linkedin-profile-posts/iframe/\d+/?", url.path) or url.query or url.fragment:
                errors.append("Automatic feed requires a public SociableKIT LinkedIn Profile Posts iframe URL")
    except (OSError, ValueError, KeyError, TypeError) as error:
        errors.append(f"Invalid LinkedIn feed configuration: {error}")

    return errors


if __name__ == "__main__":
    errors = check_site(Path(__file__).resolve().parents[1])
    if errors:
        print("Static portfolio checks failed:")
        for error in errors:
            print(f"  - {error}")
        raise SystemExit(1)
    print("PASS: assets, downloads, links, unique IDs, accessible controls, and LinkedIn configuration.")

