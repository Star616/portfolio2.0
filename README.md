# portfolio2.0

Personal portfolio served by Vercel as static HTML, CSS, and JavaScript.
The live site does not need an npm install or build step.

## Local checks

Run from the repository root with Node.js 24 and Python 3:

```sh
git ls-files -z -- '*.js' | xargs -0 -r -n 1 node --check
python3 scripts/check_site.py
```

The Portfolio CI workflow runs these checks on pushes and pull requests to
`main`. It checks JavaScript syntax, local assets and downloads, section links,
and duplicate element IDs. External websites are not fetched by CI.

`server/server.js` and `package-lock.json` are from the earlier Express setup;
they are not required by the current static deployment.
