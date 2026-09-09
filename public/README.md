# Public

Cloudflare Pages publishes this folder as [musavvir.info](https://musavvir.info/). The build command is `npm run apply-content`.


## Edit page copy

Whenever any homepage content, 404 content, or any other pages need editing, it must happen from [`content/`](../content/). Do NOT directly edit any HTML files inside this `public/` folder.

Read [`content/README.md`](../content/README.md) for step-by-step instructions.

## Files

- `index.html` is the home page.
- `404.html` is the not-found page.
- `ai/` is the Building with AI page.
- `admin/` is the visual editor. Do not edit it here.
- `assets/` holds images, the favicon, and avatar config.
- `s/` holds the résumé PDF.
- `_capture/` holds CSS from the old Squarespace site.
- `_redirects` sends `/home` to `/`.
- `goatcounter.js` is the visit counter.
- `highlights.css` and `highlights.js` draw bio underline and scribble marks.
- `interactive-profile-photo.js` and `interactive-profile-photo-bootstrap.js` control the profile photo.
- `site-chrome.css` holds shared link and layout styles.

Leave `_capture/` unchanged. Change it only when you replace the Squarespace CSS.

You can change scripts, CSS, images, and the résumé PDF in this folder.

## Preview

```bash
npm run serve:public
```

This starts a local server from this folder. Unknown paths return `404.html`. The path `/home` shows the home page.
