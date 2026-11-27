<p align="center" class="logo-section">
<img src="./assets/icon.svg" height="80" width="80" alt="Suparedirect logo"/>
</br>
<img src="https://halitsever-api.vercel.app/api/repo-title?title=Suparedirect">

<p align="center">
Self-hosted dereferer that hides the referrer: it turns any URL into an anonymous link that opens without the Referer header. Built on Node.js and Express, with a Docker image and a React stats dashboard<br>
<br/>
<br/>
<img src="https://img.shields.io/github/sponsors/halitsever" alt="GitHub Sponsors"/>
</p>
<p align="center">
<a align="center" href="https://halitsever.github.io/suparedirect/">Documentation</a>
  </p>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/details"/>
</p>

<p align="center">

<img src="/assets/screenshot.png" alt="Suparedirect stats dashboard showing total redirects and redirect history"/>

</p>

- **Referer stripping**: each redirect page is sent with `Referrer-Policy: no-referrer` and a `<meta name="referrer" content="no-referrer">` tag, so the target site does not see where the visitor came from.
- **One-parameter API**: `GET /?to=<url>` redirects to any URL. Bare domains get `https://` added.
- **Stats dashboard**: a React dashboard on port 5173 reads `GET /api/stats` every 5 seconds and shows the total redirect count and the latest 500 redirects with URL, time and user agent. Stats live in memory and reset on restart.
- **Docker image**: `halitsever/suparedirect:latest` on Docker Hub, rebuilt on every push to `main`.

<p align="center" >
<img src="https://halitsever-api.vercel.app/api/installation"/>
</p>

Running via docker:

```bash
# expose api port only
docker run -p 3000:3000  halitsever/suparedirect:latest

# expose dashboard & api ports
docker run -p 3000:3000 -p 5173:5173  halitsever/suparedirect:latest

```

For development:

```bash
npm i
```

```bash
npm run start
```

Usage:

```bash
curl http://localhost:3000/?to=https://halit.org
```

you can use `to` parameter for redirecting to any website

## How it hides the Referer header

When a browser follows a link, it usually sends a `Referer` header that tells the target site which page the visitor came from. (The header is spelled `Referer`, the policy `Referrer-Policy`.) Suparedirect sits in between. A link to `https://your-host/?to=https://example.com` first loads a small page from your server. That response carries the `Referrer-Policy: no-referrer` header and a matching `<meta name="referrer" content="no-referrer">` tag, and a one-line script then sends the browser on with `window.location`.

Because that page's policy is `no-referrer`, the browser sends no `Referer` header to the target, and `document.referrer` is empty there. The target site cannot tell where the visitor came from, not even which domain.

A few limits to know:

- The redirect needs JavaScript. With JavaScript turned off, the visitor stays on a blank page.
- Your Suparedirect server still receives the Referer of the page that held the link. It does not store it: the in-memory history keeps the target URL, the time and the user agent.
- `GET /api/stats` has no authentication and returns that history to anyone who can reach port 3000. Put it behind your reverse proxy if the history should stay private.

## Referrer-Policy, rel="noreferrer" or a dereferer?

If you control the page that holds the link, you do not need a redirect service:

- `Referrer-Policy: no-referrer`, sent as a response header or as `<meta name="referrer" content="no-referrer">`, stops the browser from sending a Referer for every link and request on that page.
- `rel="noreferrer"` on an `<a>` tag gives you a no referrer link for that one link. It also opens the link without access to `window.opener`.

Browsers also trim the header on their own. With no policy set, they use `strict-origin-when-cross-origin`, so a link to another site sends only your origin (`https://example.com/`) and not the full path.

A dereferer covers the case those options cannot: a link on a page whose HTML and headers you do not control, such as a forum post, a wiki page, a chat message or a third-party CMS. Post `https://your-host/?to=<url>` instead of the bare URL and the target receives no Referer, whatever policy the hosting page uses.

<p align="center" href="https://github.com/halitsever/suparedirect/issues">
<img src="https://halitsever-api.vercel.app/api/issue"/>
</p>

<p align="center">
Found a bug or have an idea? Open an <a href="https://github.com/halitsever/suparedirect/issues">issue</a>.<br/>
Read the <a href=".github/CONTRIBUTING.md">contributing guide</a> before sending a pull request.
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/sponsor"/>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/license"/>
</p>

<p align="center">
  MIT License - Halit Sever
</p>
