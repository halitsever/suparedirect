---
title: "Does a Double Meta Refresh Hide the Referrer?"
titleTemplate: false
description: "We tested single and double meta refresh redirects in Chrome: which Referer each hop sends, why the refresh page becomes the referrer, and what really hides it."
headline: "Meta refresh and the Referer header: what a second refresh changes"
date: "2026-11-28"
keyword: "will a double meta refresh pass referrers"
faq: [{"q": "Does a meta refresh pass the referrer?", "a": "Yes. In our Chrome 157 tests the destination received a Referer header naming the page that did the refresh, trimmed by that page's referrer policy."}, {"q": "Does a double meta refresh hide the referrer?", "a": "It hides the original page, but so does a single refresh on another domain. The destination sees the last refresh page as the referrer, and the first refresh page still receives the original referrer."}, {"q": "How do I send no referrer at all?", "a": "Put a no-referrer policy on the page that navigates: a Referrer-Policy: no-referrer header or a meta referrer tag. With that, our test destination received no Referer header."}]
---

# Meta refresh and the Referer header: what a second refresh changes

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">The double meta refresh is an old trick for hiding where visitors come from: send them to a page that refreshes to a second page that refreshes to the destination, and the destination supposedly sees no referrer. We built the chain on three test hostnames and watched the Referer header at every hop in Google Chrome 157.</p>

## The setup

A local server answered on three names mapped to 127.0.0.1: `a.test` with the source page and its link, `c.test` with a page that does nothing but `<meta http-equiv="refresh" content="0; url=...">`, and `b.test` as the destination. Playwright clicked the link in headless Chrome, and every hop logged the `Referer` it received.

## What arrived at each hop

With the browser's default referrer policy on the source page:

| Chain | Referer at the refresh page | Referer at the destination |
| --- | --- | --- |
| single refresh on c.test | `http://a.test:4794/` | `http://c.test:4794/` |
| double refresh on c.test | `http://a.test:4794/`, then the first refresh URL | `http://c.test:4794/` |

With `Referrer-Policy: unsafe-url` on the source page, so that it sends its full URL:

| Chain | Referer at the first refresh page | Referer at the destination |
| --- | --- | --- |
| single refresh on c.test | the full source URL, path and query included | `http://c.test:4794/` |
| double refresh on c.test | the full source URL | `http://c.test:4794/` |
| single refresh on a.test (own site) | the full source URL | `http://a.test:4794/` |

Three things follow:

1. **A meta refresh does send a Referer.** It is the URL of the page that did the refresh, cut down by that page's referrer policy. MDN's Referer page says the same: a navigation caused by a Refresh header or the equivalent meta tag sends a Referer if the referrer policy allows it.
2. **The second refresh adds nothing.** One refresh on another hostname already replaced the source page with the refresh page as the referrer. The double version only made the visitor wait for one more page.
3. **The first hop sees everything.** Whoever runs the refresh page receives the original referrer, with the full URL if the source page allows it. And a refresh page on your own domain still tells the destination your domain.

## What actually removes the referrer

The policy of the page that starts the navigation decides. We added one tag to the refresh page:

```html
<meta name="referrer" content="no-referrer">
<meta http-equiv="refresh" content="0; url=https://destination.example/">
```

and the destination received no `Referer` header at all. A `Referrer-Policy: no-referrer` response header on that page does the same, and so does `rel="noreferrer"` on a link you control. The [Referrer-Policy best practices](/blog/referrer-policy-best-practices) post lists every value.

## How Suparedirect does it

[Suparedirect](/) is one hop that applies this rule. `GET /?to=<url>` answers with a page sent with `Referrer-Policy: no-referrer` and a `<meta name="referrer" content="no-referrer">` tag, and a script on that page sets `window.location` to the target. In the same test setup, a link through a local Suparedirect instance reached the destination with no `Referer`.

The first-hop rule still applies to it: the Suparedirect server receives the original Referer, like any server you link to. That is why it is meant to be self-hosted; the [self-hosting notes](/guide/self-hosting) cover what it stores. It keeps the last 500 redirect targets in memory and serves them on `/api/stats`.

## Meta refresh as a redirect

Apart from referrers, a meta refresh needs the HTML to load before it moves on. [Google's redirect documentation](https://developers.google.com/search/docs/crawling-indexing/301-redirects) reads a 0-second meta refresh as a permanent redirect and one with a delay as temporary, and ranks both below a server-side redirect. [How URL redirects work](/blog/how-url-redirects-work) compares it with 301, 302 and JavaScript redirects.

## FAQ

### Does a meta refresh pass the referrer?

Yes. In our Chrome 157 tests the destination received a Referer header naming the page that did the refresh, trimmed by that page's referrer policy.

### Does a double meta refresh hide the referrer?

It hides the original page, but so does a single refresh on another domain. The destination sees the last refresh page as the referrer, and the first refresh page still receives the original referrer.

### How do I send no referrer at all?

Put a no-referrer policy on the page that navigates: a Referrer-Policy: no-referrer header or a meta referrer tag. With that, our test destination received no Referer header.

## Related posts

- [How URL redirects work: 301, 302, meta refresh and JavaScript](/blog/how-url-redirects-work)
- [Hiding the referrer URL on outgoing links](/blog/hide-referrer-url)
- [What strict-origin-when-cross-origin sends, and when](/blog/strict-origin-when-cross-origin)
- [Inside an anonymous redirect, step by step](/guide/how-it-works)
- [All posts](/blog/)
