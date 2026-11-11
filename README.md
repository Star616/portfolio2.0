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

## Updating the résumé

Edit `data/resume.json` and run `python3 scripts/build_resume.py` with ReportLab and the
DejaVu Sans fonts installed. This generates the two-page `uploads/resume.pdf` and updates
all three download links with a content version and a readable filename. Render and check
both pages before committing the PDF, source data, script, and changed HTML together.
This manual editorial step does not add a dependency to the static deployment.


## Traffic and search setup

The static site loads Vercel Web Analytics and Speed Insights through js/analytics.js.
Enable each product in the Vercel project dashboard, then redeploy. Instrumentation alone
is not evidence that the dashboard is receiving data. No paid plan or subscription was enabled.
Custom event reporting currently requires Vercel Pro/Enterprise; the wiring can remain in place
on other plans, but reporting those events requires an eligible account.

Events: Section selected, Welcome audio played/completed, Short player opened (not confirmed playback),
Resume downloaded, Contact or social clicked, Career explored, Interest explored, LinkedIn post opened.
The labels are fixed UI categories; URLs, emails and the audio itself are not event properties.
The visitor privacy page describes collection, and GPC/DNT disables the measurement loader.

Connect Google Search Console using the URL-prefix property
https://portfolio2-0-eight-bice.vercel.app/ and the ownership verification method available to you.
No verification token is fabricated or included. Submit /sitemap.xml after verification.
Indexing and increased traffic are not guaranteed by adding metadata or a sitemap.

New searchable routes: /experience/, /insights/manufacturing/, /projects/, and /privacy/.
These pages remain static; the portfolio did not acquire a framework dependency.
