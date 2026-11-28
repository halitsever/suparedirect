---
title: "strict-origin-when-cross-origin Explained"
titleTemplate: false
description: "What the strict-origin-when-cross-origin referrer policy sends for each kind of request, why DevTools shows it next to failed requests, and how to change it."
headline: "strict-origin-when-cross-origin, explained"
date: "2026-11-28"
keyword: "referrer policy strict-origin-when-cross-origin"
faq: [{"q": "Is strict-origin-when-cross-origin an error?", "a": "No. It is the browser's default referrer policy. DevTools shows it in the General section of every request, and it never blocks a request or causes a 403."}, {"q": "What does strict-origin-when-cross-origin send?", "a": "The full URL to the same origin, only the origin (such as https://example.com/) to other HTTPS sites, and nothing from an HTTPS page to an HTTP address."}]
---

# strict-origin-when-cross-origin, explained

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">strict-origin-when-cross-origin is the referrer policy browsers use when a page sets none. It sends the full URL to your own site, only the origin to other sites, and nothing when a request goes from HTTPS to HTTP. If you saw it in DevTools next to an error, it is almost certainly not the cause.</p>

## What it sends

The rule has three parts, taken from [MDN's Referrer-Policy reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy):

| From | To | Referer sent |
| --- | --- | --- |
| `https://example.com/page?q=1` | `https://example.com/other` (same origin) | `https://example.com/page?q=1` |
| `https://example.com/page?q=1` | `https://mozilla.org/` (another origin, HTTPS) | `https://example.com/` |
| `https://example.com/page?q=1` | `http://example.org/` (HTTPS to HTTP) | nothing |

Same origin means the same scheme, host and port. `https://www.example.com` and `https://example.com` are different origins, so a link between them sends only the origin.

The fragment (`#section`) is never sent under any policy, and neither are user names or passwords in the URL.

## It is the default

The Referrer Policy specification made `strict-origin-when-cross-origin` the default in November 2020; before that it was `no-referrer-when-downgrade`, which sent the full URL to every HTTPS site. Chrome switched in version 85. [web.dev's referrer best practices](https://web.dev/articles/referrer-best-practices) lists it as the default in Chrome, Edge and Firefox, and Safari uses a similar policy with some differences. The default also applies when a page sets an invalid value.

So, with no work on your part, other sites already see only your origin, not the path and query of the page the visitor was on.

## The same rule for every request type

The policy is not only for link clicks. A page's policy applies to everything it loads:

- **Navigation:** clicking a link, submitting a form, `window.location` changes.
- **Subresources:** images, scripts, stylesheets, fonts, iframes.
- **Scripts:** `fetch()` and `XMLHttpRequest`. A `fetch` call can set its own policy with the `referrerPolicy` option.

External stylesheets are a special case: resources they load follow the stylesheet's own policy, which is this default unless the CSS response sets another.

## "Referrer Policy: strict-origin-when-cross-origin" in DevTools

In Chrome DevTools, open the Network panel and click any request. The **Headers** tab starts with a **General** section that lists the URL, the method, the status code and the **Referrer Policy**. Because it sits right next to the status, people often read it as the reason a request failed. It is not. A referrer policy only changes what the `Referer` header contains. It never blocks a request and never produces a status code.

When you see `403 Forbidden` with this line, the 403 came from the server. One real connection exists: servers with hotlink protection or a referrer allow-list check the `Referer` header, and under this policy they receive only your origin, or nothing at all from an HTTPS page to an HTTP server. If such a server expects a full page URL or an exact path, it rejects the request. Check the server's rules, or set a different policy for that one request (below).

CORS errors are also unrelated. They come from missing `Access-Control-Allow-Origin` headers on the response, not from the referrer policy.

## Changing it

For the whole page, send a header or a meta tag:

```http
Referrer-Policy: no-referrer
```

```html
<meta name="referrer" content="no-referrer">
```

For one element, use the `referrerpolicy` attribute on `<a>`, `<area>`, `<img>`, `<iframe>`, `<script>` or `<link>`:

```html
<iframe src="https://partner.example/embed" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

For one script request:

```js
fetch(url, { referrerPolicy: 'no-referrer' })
```

[Referrer-Policy best practices](/blog/referrer-policy-best-practices) compares every value and covers server configuration.

## Where Suparedirect fits

[Suparedirect](/) is for the cases where none of this is in your hands: you can paste a URL into a forum or a chat, but you cannot set the page's policy. Its redirect page uses `no-referrer`, so the destination receives nothing at all, not even your origin. [How it works](/guide/how-it-works) shows the page it serves.

## FAQ

### Is strict-origin-when-cross-origin an error?

No. It is the browser's default referrer policy. DevTools shows it in the General section of every request, and it never blocks a request or causes a 403.

### What does strict-origin-when-cross-origin send?

The full URL to the same origin, only the origin (such as https://example.com/) to other HTTPS sites, and nothing from an HTTPS page to an HTTP address.

## Related posts

- [rel="noopener noreferrer": what each part does](/blog/noopener-noreferrer)
- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [The Referer in an HTTP request: how to read and test it](/blog/referer-in-http-request)
- [All posts](/blog/)
