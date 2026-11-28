---
title: "How to Hide the Referrer URL When Linking Out"
titleTemplate: false
description: "Four ways to hide the referrer URL from the sites you link to: rel=noreferrer, a Referrer-Policy header, a meta tag, or a self-hosted dereferer link."
headline: "Hiding the referrer URL on outgoing links"
date: "2026-11-28"
keyword: "hide referrer url"
faq: [{"q": "How do I hide the referrer on a link?", "a": "Add rel=\"noreferrer\" to the link, set Referrer-Policy: no-referrer on the page, or, where you can only paste a URL, send it through a dereferer such as Suparedirect."}, {"q": "Does hiding the referrer hide my IP address?", "a": "No. The destination still sees the IP address and user agent. Only the page you came from is hidden."}]
---

# Hiding the referrer URL on outgoing links

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">To stop a site from seeing the page your visitors came from, remove the Referer header from the request. Where you control the HTML, one attribute or header does it. Where you can only paste a URL, a dereferer link does.</p>

## If you control the link: rel="noreferrer"

```html
<a href="https://example.org/" rel="noreferrer">Example</a>
```

That link sends no Referer, and `document.referrer` on the destination is empty. [rel="noopener noreferrer"](/blog/noopener-noreferrer) explains the attribute in full.

## If you control the page: Referrer-Policy

One header covers every link, image and script on the page:

```http
Referrer-Policy: no-referrer
```

Or, without server access, in the `<head>`:

```html
<meta name="referrer" content="no-referrer">
```

Use `same-origin` instead if your own analytics should still see internal clicks. [Referrer-Policy best practices](/blog/referrer-policy-best-practices) has server snippets for nginx, Apache, IIS and Express.

## If you only control the URL: a dereferer link

Forums, wikis, issue trackers, chat apps and site builders write the `<a>` tag for you. There, wrap the target in a dereferer URL:

```text
https://go.example/?to=https%3A%2F%2Fexample.org%2F
```

[Suparedirect](/) is a self-hosted dereferer. Its redirect page is sent with `Referrer-Policy: no-referrer` and moves on with a script, so the destination gets no referrer whatever page the link was posted on. Run it with Docker:

```bash
docker run -p 3000:3000 halitsever/suparedirect:latest
```

Then build links with the [link generator](/link-generator/), which encodes the target and lets you test the result. [Getting started](/guide/getting-started) covers the setup and [self-hosting notes](/guide/self-hosting) what to know before putting it on a public address.

## Which to choose

| You can edit | Use |
| --- | --- |
| The link's HTML | `rel="noreferrer"` |
| The page or server | `Referrer-Policy: no-referrer` |
| Only the URL | A dereferer link |

The built-in options cost nothing and need no server. [Do you need a dereferer?](/guide/noreferrer-referrer-policy) walks through the decision.

## What hiding the referrer does not hide

- **Your IP address and browser.** The destination still sees the visitor's IP address and user agent.
- **The click itself.** A dereferer's server sees every link that goes through it. Suparedirect keeps the last 500 redirects in memory for its [stats dashboard](/guide/dashboard).
- **Parameters in the URL.** Tracking parameters such as `utm_source` or `ref=` in the target URL tell the destination where you came from. Remove them before you share the link.

## Check that it worked

Open the [referrer test page](https://projects.halit.org/suparedirect/referrer-test.html) through your link. It prints `document.referrer`; an empty value means nothing was sent.

## FAQ

### How do I hide the referrer on a link?

Add rel="noreferrer" to the link, set Referrer-Policy: no-referrer on the page, or, where you can only paste a URL, send it through a dereferer such as Suparedirect.

### Does hiding the referrer hide my IP address?

No. The destination still sees the IP address and user agent. Only the page you came from is hidden.

## Related posts

- [rel="noopener noreferrer": what each part does](/blog/noopener-noreferrer)
- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [The Referer in an HTTP request: how to read and test it](/blog/referer-in-http-request)
- [All posts](/blog/)
