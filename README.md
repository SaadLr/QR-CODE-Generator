# SAAD — QR Code Generator

A small, no-backend QR code generator. Type or paste text, pick a size, correction
level, and colors, and get a downloadable PNG. Runs entirely in the browser —
nothing you type is sent anywhere. Recent codes are remembered locally via
`localStorage` so you can reuse them.

## Running it locally

No build step. Open `index.html` in a browser, or serve the folder with any
static server, e.g.:

```
npx serve .
```

## Deploying it publicly

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo Settings → Pages → set the source branch to `main` (or `gh-pages`) and
   the folder to `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/` within a
   few minutes.

### Netlify
1. Drag-and-drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
   or connect the GitHub repo for continuous deploys.
2. No build command or environment variables are needed — it's a static site.

Either option is free for a project this size.

## Adding ads

There's a placeholder block in `index.html` with `id="ad-slot"` and a comment
right above it. To actually earn from it:

1. **Apply to an ad network.** Google AdSense is the most common option for a
   small static site — you'll need to apply at
   [adsense.google.com](https://www.google.com/adsense/), verify you own the
   site, and get approved before ads will actually show. Approval isn't
   automatic and can take days; a very small, single-purpose tool like this
   one may take a while to get meaningful traffic and revenue.
2. **Read the program policies first.** AdSense (and most networks) prohibit
   things like encouraging accidental clicks, placing ads on pages with very
   little original content, or auto-refreshing ads. Worth reading before you
   build around it so you don't get rejected or suspended later.
3. **Swap the placeholder for the real snippet.** Once approved, replace the
   contents of `#ad-slot` in `index.html` with the ad unit code the network
   gives you. Leave the outer `<aside>` in place so the layout and spacing
   stay intact.
4. **Add an `ads.txt` file** at the root of the domain once you have a
   publisher ID — networks use this to confirm you're an authorized seller of
   ad space on your own site.
5. **Consider alternatives** if AdSense approval is slow or your traffic is
   small: options like Ethical Ads (privacy-friendly, developer-tool focused)
   or a simple "buy me a coffee" / sponsor link tend to work better than
   display ads for low-traffic utility pages.

None of this is legal or financial advice — check each network's current
terms before signing up, since they do change.

## SEO — what's already in place and what to fix after deploying

The page ships with a title tag, meta description, Open Graph/Twitter tags,
`WebApplication` structured data (JSON-LD), a `robots.txt`, and a `sitemap.xml`.

**The meta keywords tag is included but doesn't do anything for ranking** —
Google and Bing have both ignored it since around 2009, since it was too easy
to stuff with irrelevant terms. It's harmless to leave in, just don't spend
time optimizing it.

What actually affects a small static tool's ranking, roughly in order of
impact:
1. **The title tag and H1** — both already lead with "QR code generator"
   here, matching what people actually search for.
2. **Backlinks** — a few real links from other sites (a GitHub README, a
   relevant subreddit or forum post, Product Hunt, a directory of free tools)
   tend to matter more than any on-page tweak for a page like this.
3. **Page speed and mobile usability** — this page is a single static file
   with no build step, so it should already score well; check with
   [PageSpeed Insights](https://pagespeed.web.dev/) once it's live.
4. **Matching search intent** — people searching "qr code generator" want to
   generate one immediately, which is what the page does above the fold with
   no sign-up wall.

**Things to update once you have a real domain** (currently all set to the
placeholder `https://example.com/`):
- `<link rel="canonical">` and the `og:url` / structured-data `url` in
  `index.html`
- the `Sitemap:` line in `robots.txt`
- the `<loc>` in `sitemap.xml`
- once deployed, submit the site in
  [Google Search Console](https://search.google.com/search-console) and
  [Bing Webmaster Tools](https://www.bing.com/webmasters) — this is what
  actually gets a new page crawled and indexed quickly, more than any meta
  tag does.

## Notes on the QR library

This uses `davidshimjs/qrcodejs` via jsDelivr (`qrcode.min.js`), a small,
dependency-free library that renders to a `<canvas>` (or an `<img>` as a
fallback in older browsers). If you'd rather not depend on a third-party CDN
in production, download that one file and serve it alongside your own files
instead.

## License

MIT — see `LICENSE`.
