---
title: 'noreferrer, Referrer-Policy or a dereferer'
description: When rel="noreferrer" or a Referrer-Policy header is enough to make a no referrer link, how the policy values differ, and when a dereferer still helps.
---

# noreferrer, Referrer-Policy or a dereferer

There are three ways to stop a link from telling the destination where the visitor came from. Two are built into HTML and HTTP and cost nothing. The third is a redirect service such as Suparedirect. For most links on your own site, the built-in ones are the right answer.

## The short version

| You control | Use | Scope |
| --- | --- | --- |
| The HTML of the link | `rel="noreferrer"` | That one link |
| The page or the server | `Referrer-Policy` | Every request from the page |
| Only the URL you post | A dereferer link | That one link |

## rel="noreferrer"

`noreferrer` is a value of the `rel` attribute on `<a>`, `<area>` and `<form>` elements:

```html
<a href="https://shop.example/pricing" rel="noreferrer">Pricing</a>
```

The browser follows the link without a `Referer` header, and `document.referrer` on the destination is empty. It also implies `noopener`: a page opened in a new tab this way cannot reach back to yours through `window.opener`.

A common mix-up: `rel="noopener"` alone does not remove the referrer. It only cuts the `window.opener` connection. If you want both effects, `noreferrer` gives you both.

`rel="nofollow"` is unrelated. It is a hint for search engines and changes nothing in the request.

## The Referrer-Policy header

`Referrer-Policy` sets the rule for a whole document. Send it as a response header:

```http
Referrer-Policy: no-referrer
```

or put it in the page's `<head>`:

```html
<meta name="referrer" content="no-referrer">
```

It applies to link clicks and also to images, scripts and other requests the page makes. The values, from least to most revealing:

| Value | What other sites receive |
| --- | --- |
| `no-referrer` | Nothing, for any request |
| `same-origin` | Nothing. Requests to your own origin get the full URL |
| `strict-origin` | Your origin only, and nothing on HTTPS to HTTP |
| `strict-origin-when-cross-origin` | Your origin only, and nothing on HTTPS to HTTP. Same-origin requests get the full URL |
| `origin` | Your origin only, even on HTTPS to HTTP |
| `origin-when-cross-origin` | Your origin only. Same-origin requests get the full URL |
| `no-referrer-when-downgrade` | The full URL, except on HTTPS to HTTP |
| `unsafe-url` | The full URL, always |

`strict-origin-when-cross-origin` is what current browsers use when a page sets nothing. So without any work on your side, other sites already see only your origin and not the page path. Use `no-referrer` or `same-origin` when even the origin should stay private.

### A policy for one element

The `referrerpolicy` attribute sets a policy for a single element. It works on `<a>`, `<img>`, `<iframe>`, `<script>` and `<link>`:

```html
<img src="https://cdn.example/chart.png" referrerpolicy="no-referrer">
```

## When these are enough

If you can edit the page that holds the link, they are enough. That covers your own website, your web app and your blog theme. A redirect service would add an extra request, a dependency on a server and a need for JavaScript, with no gain in privacy over `no-referrer`.

One caveat about same-site analytics: `no-referrer` as a page-wide policy also hides the referrer from your own pages. `same-origin` keeps your internal reports working while sending nothing to other sites.

## When a dereferer is still useful

A dereferer does the same thing as `no-referrer`, but from inside the URL. It helps where the URL is the only thing you control:

- Posts on forums, wikis and issue trackers, where the platform writes the `<a>` tag.
- Chat tools that turn a pasted URL into a link on their own page.
- A hosted CMS or site builder that gives you no access to headers or `rel` attributes.
- Links created by many people in an organisation, where one rule ("post links through go.example") is easier to follow than checking every page's policy.

Suparedirect serves an intermediate page with `Referrer-Policy: no-referrer`, both as a header and as a meta tag, and then navigates to the target from a script. The destination gets no `Referer`, whatever policy the page with the link had. [How it works](./how-it-works) has the details.

It also keeps a count and a short in-memory history of the redirects it served, shown in the [stats dashboard](./dashboard).

## What a dereferer costs

- One more request before the destination loads, and a blank page if your server is down.
- JavaScript is required for Suparedirect's redirect.
- Your server sees every click, including the referrer you are hiding from the destination.
- The link is longer, and readers see an unfamiliar domain before the real one.
- An open redirect service can be used by other people for their own links. See [Self-hosting notes](./self-hosting#it-redirects-to-any-url).

## Choosing

Start with the page. If you can set `Referrer-Policy` or add `rel="noreferrer"`, do that and stop. Reach for a dereferer link for the places where you can only paste a URL.
