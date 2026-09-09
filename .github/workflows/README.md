# Workflows

This folder holds GitHub Actions workflows. Each YAML file is one workflow.

A workflow runs checks. It does not publish the site. Cloudflare Pages publishes `public/` after a merge to `main`.

## content-smoke.yml

GitHub starts this workflow after each push to `main`. GitHub also starts this workflow for each pull request.

The workflow does the following:

1. Gets a copy of the repository.
2. Installs Node.js 22.
3. Installs the npm packages.
4. Installs Chromium for Playwright.
5. Adds or repairs the HTML content markers.
6. Writes `content/*.yaml` into the HTML slots.
7. Runs `npm test`.

That `npm test` checks:

- The YAML schema
- The content bake
- The HTML output
- The unit tests
- That the profile photo stays square

If a step fails, do not merge. Fix the problem. Push again.

## Run the same checks on your computer

```bash
npm ci
npx playwright install --with-deps chromium
npm run init-content-slots
npm run apply-content
npm test
```

To add a check, add a new `.yml` file in this folder.

Read [`scripts/README.md`](../../scripts/README.md) for the scripts that these steps call.
