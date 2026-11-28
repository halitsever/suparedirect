---
title: "How URL Redirects Work: 301, 302, Meta, JavaScript"
titleTemplate: false
description: "The four ways to redirect a URL, what each status code means, how Google reads them, and which Referer the destination gets, tested in headless Chrome."
headline: "How URL redirects work: 301, 302, meta refresh and JavaScript"
date: "2026-11-28"
keyword: "redirecting urls"
faq: [{"q": "What is the difference between a 301 and a 302 redirect?", "a": "A 301 says the page moved permanently, so search engines move their signals to the new URL. A 302 is temporary, and the old URL usually stays in results."}, {"q": "Does a redirect hide the referrer?", "a": "A plain 301 or 302 does not: the destination gets the original page as the referrer. A redirect response or page with Referrer-Policy: no-referrer does."}]
---

# How URL redirects work: 301, 302, meta refresh and JavaScript

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A URL redirect sends the browser from one address to another. It can happen in the HTTP response, in the HTML of a page, or in a script. The choice changes how search engines treat the move and what the destination learns about where the visitor came from.</p>

## Server-side redirects: the 3xx codes

The server answers with a 3xx status and a `Location` header, and the browser requests that address next. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-redirection-3xx) defines the codes:

| Code | Name | Permanent? | Method on the next request |
| --- | --- | --- | --- |
| 301 | Moved Permanently | Yes | May change POST to GET (historical behaviour) |
| 302 | Found | No | May change POST to GET (historical behaviour) |
| 303 | See Other | No | Always GET |
| 307 | Temporary Redirect | No | Same method and body |
| 308 | Permanent Redirect | Yes | Same method and body |

Examples:

```nginx
# nginx
return 301 https://new.example$request_uri;
```

```apache
# Apache
Redirect 301 /old-page https://new.example/new-page
```

```js
// Express
res.redirect(301, 'https://new.example/new-page')
```

## Meta refresh

An HTML page can redirect itself:

```html
<meta http-equiv="refresh" content="0; url=https://new.example/">
```

The number is a delay in seconds. It works without JavaScript but needs the HTML to load first.

## JavaScript

```js
window.location.href = 'https://new.example/'   // adds a history entry
window.location.replace('https://new.example/') // replaces the current one
```

This needs JavaScript and a page load, and does nothing for clients that do not run scripts.

## How Google reads them

From Google's [redirects documentation](https://developers.google.com/search/docs/crawling-indexing/301-redirects):

- 301 and 308 are permanent: the target usually becomes the URL shown in results.
- 302, 303 and 307 are temporary: Google follows them, but the source usually stays in results.
- An instant meta refresh counts as permanent, a delayed one as temporary.
- JavaScript redirects are the last resort, because rendering can fail.

For moving a site or a page, use a server-side 301 or 308.

## Which Referer reaches the destination

Here the methods differ in a way most guides skip. We tested each one in headless Chrome 157 on 28 November 2026. The starting page was `http://localhost:4300/start?secret=1` with `Referrer-Policy: unsafe-url`, so it shared its full URL; the redirect ran on another origin and the destination logged the `Referer` it received:

| Redirect | Referer at the destination |
| --- | --- |
| Plain 302 | `http://localhost:4300/start?secret=1`, the original page |
| 302 with `Referrer-Policy: no-referrer` on the redirect response | none |
| Meta refresh page, no policy | `http://localhost:4301/`, the redirect page's origin |
| Page with `Referrer-Policy: no-referrer` and a script redirect (Suparedirect's method) | none |

Two lessons:

1. **A plain 3xx hides nothing.** The redirect hop is not a page, so the browser keeps the original page as the referrer. A link shortener without a policy passes your page's referrer straight through.
2. **A policy header on the redirect response counts.** The [Fetch standard](https://fetch.spec.whatwg.org/#http-redirect-fetch) updates the request's referrer policy from each redirect response, and Chrome follows it.

## Why Suparedirect uses a page

[Suparedirect](/) answers `GET /?to=<url>` with a small HTML page, served with `Referrer-Policy: no-referrer`, a matching `<meta name="referrer">` tag and a script that sets `window.location`. In the test above it hid the referrer just as the 302 with a policy header did. The page form needs JavaScript in the visitor's browser; the 302 form does not. [How it works](/guide/how-it-works) shows the exact response.

If you self-host and want a variant that works without scripts, a 302 with `Referrer-Policy: no-referrer` is the header-only alternative, and it hid the referrer in our Chrome test. [Path-based redirect services](/blog/redirect-service-url-in-path) shows how to add routes to the app.

## FAQ

### What is the difference between a 301 and a 302 redirect?

A 301 says the page moved permanently, so search engines move their signals to the new URL. A 302 is temporary, and the old URL usually stays in results.

### Does a redirect hide the referrer?

A plain 301 or 302 does not: the destination gets the original page as the referrer. A redirect response or page with Referrer-Policy: no-referrer does.

## Related posts

- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [Redirect services with the target URL in the path](/blog/redirect-service-url-in-path)
- [How to hide the referrer URL when linking out](/blog/hide-referrer-url)
- [Redirecting with JavaScript, and what the Back button does after](/blog/javascript-redirect)
- [Meta refresh and the Referer header: what a second refresh changes](/blog/meta-refresh-referrer)
- [All posts](/blog/)
