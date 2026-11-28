---
title: "Anonymous Link Generator: Hide the Referrer"
titleTemplate: false
description: "Turn any URL into an anonymous link for your Suparedirect instance, then test the referrer it sends against a page that prints document.referrer."
aside: false
faq:
  - q: "Is there a public Suparedirect server I can use?"
    a: "No. Suparedirect is self-hosted, and this generator builds links for the instance you run. Start one with docker run -p 3000:3000 halitsever/suparedirect:latest."
  - q: "Why is the target URL encoded?"
    a: "So that characters such as & and ? in the target stay part of it. Without encoding, https://go.example/?to=https://shop.example/?a=1&b=2 would lose b=2."
  - q: "Does the link work without JavaScript?"
    a: "No. Suparedirect's redirect page moves on with a script, so a browser with JavaScript turned off stays on a blank page."
  - q: "Does the generator send my URLs anywhere?"
    a: "No. Links are built in your browser. Only the Suparedirect address is kept, in this browser's local storage, so you do not have to type it again."
---

# Anonymous link generator

Paste a URL and get an anonymous link that opens it without a `Referer` header. The link goes through your own [Suparedirect](/) instance, which serves a page with `Referrer-Policy: no-referrer` and then sends the visitor on. Use it where you can only post a URL: forums, wikis, issue trackers, chat messages.

<LinkGenerator />

## How the link is built

The format is the one Suparedirect reads in `src/index.ts`:

```text
https://<your-suparedirect>/?to=<target, percent-encoded>
```

The generator encodes the target with `encodeURIComponent`, so `?`, `&` and `#` stay part of it. A target without `http://` or `https://` gets `https://`, the same rule the server applies. Nothing leaves your browser while you type; the Suparedirect address is kept in local storage so it is there next time.

## Test it

The three test links open a [small page](https://projects.halit.org/suparedirect/referrer-test.html) that prints `document.referrer`:

| Link | Expected result |
| --- | --- |
| Normal link | This page's address, because it is the same site |
| `rel="noreferrer"` link | Empty |
| Through your Suparedirect | Empty |

The last one needs your instance to be reachable from your browser. If it shows a referrer, check that the request really went through Suparedirect and that nothing in front of it, such as a reverse proxy, rewrites the response headers. [How it works](/guide/how-it-works) shows the exact response the redirect page should have.

## Run your own instance

The generator needs a Suparedirect address. Start one with Docker:

```bash
docker run -p 3000:3000 halitsever/suparedirect:latest
```

Then use `http://localhost:3000` as the address to try it locally. For links other people will open, put it on a public HTTPS address; [self-hosting notes](/guide/self-hosting) covers the fixed port, the open stats endpoint and what an open redirect means. [Getting started](/guide/getting-started) has the full setup.

## When you do not need it

If you can edit the link's HTML, `rel="noreferrer"` is enough. If you control the page, a `Referrer-Policy: no-referrer` header covers every link on it. [How to hide the referrer URL](/blog/hide-referrer-url) compares the options, and [do you need a dereferer?](/guide/noreferrer-referrer-policy) helps you choose.

## FAQ

### Is there a public Suparedirect server I can use?

No. Suparedirect is self-hosted, and this generator builds links for the instance you run. Start one with `docker run -p 3000:3000 halitsever/suparedirect:latest`.

### Why is the target URL encoded?

So that characters such as `&` and `?` in the target stay part of it. Without encoding, `https://go.example/?to=https://shop.example/?a=1&b=2` would lose `b=2`.

### Does the link work without JavaScript?

No. Suparedirect's redirect page moves on with a script, so a browser with JavaScript turned off stays on a blank page.

### Does the generator send my URLs anywhere?

No. Links are built in your browser. Only the Suparedirect address is kept, in this browser's local storage, so you do not have to type it again.
