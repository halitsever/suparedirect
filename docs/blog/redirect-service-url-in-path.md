---
title: "Redirect Services With the Target URL in the Path"
titleTemplate: false
description: "Path-style redirect URLs put the target after a slash instead of in ?to=. How they differ, where they break, and how to add a path route to Suparedirect."
headline: "Putting the target URL in a redirect service's path"
date: "2026-11-28"
keyword: "free url redirect service target in path no query parameter"
faq: [{"q": "Does Suparedirect support the target URL in the path?", "a": "Not out of the box. It takes the target in the to query parameter. Self-hosters can add a small Express middleware that forwards path-style requests to the query form."}, {"q": "Why does a path-style redirect lose part of the URL?", "a": "Proxies may merge the double slash after https:, and the target's own query string is parsed as the service's query unless the code reads the raw request URL."}]
---

# Putting the target URL in a redirect service's path

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Redirect and dereferer services take the target in one of two places: a query parameter, as in /?to=https://example.org, or the path, as in /https://example.org. Suparedirect uses the query form. This post compares the two and shows a tested route that adds the path form to a self-hosted instance.</p>

## The two forms

```text
Query form:  https://go.example/?to=https%3A%2F%2Fexample.org%2Fpage
Path form:   https://go.example/https://example.org/page
```

The path form is popular because you can build it by hand: type the service's address and a slash in front of any URL. The query form needs the target encoded to be safe.

## Where the path form breaks

- **Merged slashes.** nginx has `merge_slashes on` by default, which turns `//` into `/`, so `/https://example.org` can arrive as `/https:/example.org`. Some other proxies and frameworks do the same. The receiving code has to accept one or more slashes after the scheme.
- **The target's query string.** In `/https://example.org/search?q=a&lang=en`, everything after `?` is parsed as the redirect service's own query. Code must read the raw request URL, not a parsed path, or it loses `?q=a&lang=en`.
- **Fragments.** `#section` never reaches any server, in either form, unless it is encoded as `%23`.
- **Characters that need encoding.** Spaces and non-ASCII characters still have to be percent-encoded somewhere along the way.

The query form has its own trap: an unencoded `&` in the target splits it. `/?to=https://example.org/?a=1&b=2` arrives as `to=https://example.org/?a=1` plus a separate `b=2`. Encode the target with `encodeURIComponent` and both problems go away; the [link generator](/link-generator/) does that for you.

## What Suparedirect accepts today

[Suparedirect](/) has one redirect route, `GET /?to=<url>`, in `src/index.ts`. A target without `http://` or `https://` gets `https://` added. Anything else, including a path-style URL, is not a redirect: `/` without `to` answers `400 Missing params`, and other paths get Express's default 404. [Getting started](/guide/getting-started) has the full request format.

## Adding a path route when you self-host

If you run your own instance and want the path form, this middleware turns a path-style request into the query form. Add it to `src/index.ts` above the `app.get("/")` handler:

```ts
/** Accepts /https://target.example/page as well as /?to=. Proxies may merge "//", so any number of slashes is allowed. */
app.use((req, res, next) => {
  const m = req.originalUrl.slice(1).match(/^(https?):\/+(.+)$/i)
  if (!m) return next()
  res.redirect(302, `/?to=${encodeURIComponent(`${m[1]}://${m[2]}`)}`)
})
```

We ran it against Express 5.3.0, the version the app uses:

| Request | Result |
| --- | --- |
| `/https://example.com/a?b=1&c=2` | 302 to `/?to=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1%26c%3D2` |
| `/https:/example.com/x` (merged slashes) | 302 to `/?to=https%3A%2F%2Fexample.com%2Fx` |
| `/?to=https://example.com` | Unchanged, handled by the existing route |
| `/api/stats` | Unchanged |

It reads `req.originalUrl`, so the target keeps its own query string. The extra hop goes to your own server, and the final hop still runs through the `no-referrer` page, so the destination sees no referrer. As [how URL redirects work](/blog/how-url-redirects-work) shows, the first 302 alone would not hide anything; it only forwards to the page that does.

This is a change to the app, not a feature it ships with. Rebuild the image after editing (`docker build -t suparedirect .`), and see the [self-hosting notes](/guide/self-hosting) about running an open redirect on a public address.

## Free hosted services

Hosted dereferers with either URL form exist, and they see every link you send through them. [Dereferer services compared](/guide/dereferer-alternatives) lists what to check before you rely on one.

## FAQ

### Does Suparedirect support the target URL in the path?

Not out of the box. It takes the target in the to query parameter. Self-hosters can add a small Express middleware that forwards path-style requests to the query form.

### Why does a path-style redirect lose part of the URL?

Proxies may merge the double slash after https:, and the target's own query string is parsed as the service's query unless the code reads the raw request URL.

## Related posts

- [Reading HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx)
- [How URL redirects work: 301, 302, meta refresh and JavaScript](/blog/how-url-redirects-work)
- [How to hide the referrer URL when linking out](/blog/hide-referrer-url)
- [All posts](/blog/)
