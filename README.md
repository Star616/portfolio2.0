# Ananda Raj Nadar — personal portfolio

A static HTML, CSS, and JavaScript portfolio deployed from GitHub to Vercel.
No package installation or build step is required.

The design includes a tactile Work / Notes / Off duty selector, interactive career chapters,
a reversible portrait, persistent day/night appearance, and reduced-motion support.
Sections can be linked directly using `#work`, `#notes`, and `#off-duty`.
The profile photo remains the existing original PNG, without cropping, filters, or recompression.

## LinkedIn in Notes

Two verified public posts are available as native LinkedIn embeds. The iframe is only loaded
when a visitor selects **Read here**; the original LinkedIn links remain available if scripts,
third-party content, or configuration requests are blocked.

Native embeds display content served by LinkedIn. The selected post list does **not**
automatically discover future posts. No LinkedIn credentials or access tokens are stored.

### Optional automatic profile feed

`data/linkedin-feed.json` contains an optional `provider.iframeUrl` field. It is empty by default.
To enable it, obtain the **public iframe/link embed URL** for a LinkedIn **Profile Posts** widget
from your SociableKIT account, verify its permitted use and personal-profile support, and paste
that URL into the field. Only this format is accepted:

```text
https://widgets.sociablekit.com/linkedin-profile-posts/iframe/<numeric-widget-id>
```

Commit that configuration change to deploy it. The widget then owns post discovery, refresh
timing, and edit/deletion propagation. Confirm those behaviours and the applicable plan before
enabling it. A company-page widget is not a substitute for a personal-profile widget.

No automatic feed account or subscription has been created. No claim of LinkedIn approval is
made for a third-party service. LinkedIn's member-read permission is restricted, and its
Community Management APIs cannot be used for public social feeds; this site does not use them.
The site accepts only HTTPS embeds from the explicit host/path allowlist, never pasted HTML
or arbitrary script code. Selected posts remain available through the feed's recovery control.

Relevant documentation:

- [LinkedIn embedding](https://www.linkedin.com/help/linkedin/answer/a529065/embed-content-from-the-linkedin-feed)
- [LinkedIn API use restrictions](https://learn.microsoft.com/en-us/linkedin/marketing/restricted-use-cases)
- [SociableKIT profile feed information](https://www.sociablekit.com/linkedin-feed-widget/)

## Checks

Run from the repository root with Node.js 24 and Python 3:

```sh
git ls-files -z -- '*.js' | xargs -0 -r -n 1 node --check
node --check js/linkedin-feed.js
python3 scripts/check_site.py
```

The Portfolio CI workflow checks JavaScript syntax, local files, section links, duplicate IDs,
ARIA control targets, and LinkedIn post/embed correspondence. External sites are not fetched by CI.

`server/server.js` and `package-lock.json` belong to the earlier Express setup and are not used
by the static deployment.
