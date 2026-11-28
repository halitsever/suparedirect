---
title: 'Do you need a dereferer?'
description: Before you set up a dereferer, check whether a link attribute or a Referrer-Policy header already hides the referrer, and when a dereferer still helps.
---

# Do you need a dereferer?

There are three ways to stop a link from telling the destination where the visitor came from. Two are built into HTML and HTTP and cost nothing. The third is a dereferer, a redirect service such as Suparedirect. For most links on your own site, the built-in ones are the right answer, and this page helps you tell which case you are in.

## The short version

| You control | Use | Scope |
| --- | --- | --- |
| The HTML of the link | `rel="noreferrer"` | That one link |
| The page or the server | `Referrer-Policy` | Every request from the page |
| Only the URL you post | A dereferer link | That one link |

## On one link: the rel attribute

If you can edit the link's HTML, one attribute removes the referrer for that link:

```html
<a href="https://shop.example/pricing" rel="noreferrer">Pricing</a>
```

`rel="noopener"` alone does not do this, and `rel="nofollow"` is unrelated. [rel="noopener noreferrer": what each part does](/blog/noopener-noreferrer) explains the attribute in full.

## On a whole page: a referrer policy

If you control the page or the server, one setting covers every link, image and script on it. Send it as a response header:

```http
Referrer-Policy: no-referrer
```

or put it in the page's `<head>`:

```html
<meta name="referrer" content="no-referrer">
```

Browsers already default to [strict-origin-when-cross-origin](/blog/strict-origin-when-cross-origin), so other sites see only your origin, not the page path. Use `no-referrer` or `same-origin` when even the origin should stay private. [Referrer-Policy best practices](/blog/referrer-policy-best-practices) lists every value and the server settings for nginx, Apache, IIS and Express.

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
