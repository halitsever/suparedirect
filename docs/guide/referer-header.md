---
title: The Referer header and how to hide it
description: What the HTTP Referer header contains, when browsers send or trim it, whether it can be spoofed, and the ways to hide it from the sites you link to.
---

# The Referer header: what it is and how to hide it

The `Referer` header is a line in an HTTP request that names the page the request came from. When you click a link on one site and land on another, the second site usually receives it. This page explains what is in the header, when browsers send it, how far it can be trusted and how to stop sending it.

## What the Referer header looks like

A request for a page, made by clicking a link on `https://forum.example/thread/4821`, can look like this:

```http
GET /pricing HTTP/1.1
Host: shop.example
Referer: https://forum.example/
```

The header is spelled `Referer`, with one R in the middle. The misspelling was in the original HTTP specification and stayed. Newer features use the correct spelling, which is why the policy header is `Referrer-Policy` and the link attribute is `noreferrer`.

Browsers send it on more than link clicks. Requests for images, scripts, stylesheets and fonts carry it too, and so do form submissions. In JavaScript the same value is available on the destination page as `document.referrer`.

## What sites use it for

- Analytics. The "referring sites" report in an analytics tool is built from this header or from `document.referrer`.
- Logging and debugging, for example finding which page holds a broken link.
- Hotlink protection, where an image server refuses requests whose referrer is another site.
- A secondary check against cross-site request forgery.

## How much it reveals

It depends on the referrer policy in effect. With no policy set, current versions of Chrome, Firefox and Safari use `strict-origin-when-cross-origin`:

| Request | What is sent |
| --- | --- |
| To the same site | The full URL, without the fragment |
| To another site over HTTPS | Only the origin, such as `https://forum.example/` |
| From an HTTPS page to an HTTP address | Nothing |

So by default another site learns which site the visitor came from, but not which page. A page can loosen this. With `Referrer-Policy: unsafe-url` the full URL goes to every destination, including the path and query string. Anything that is part of a URL can leak this way, such as a search query or a password reset token.

Browsers never include the fragment (the part after `#`) or a username and password from the URL.

## Why you might want to hide it

- The linking page is private: an intranet tool, an admin panel, a staging site. Even the bare origin tells the other site that it exists.
- You do not want the destination to know that your community or your customers are discussing it.
- You link to a competitor or a source and prefer not to show up in their referral report.

## Can the Referer header be spoofed?

Yes. The header is written by the client, and the server has no way to verify it.

Any program that makes HTTP requests can set it to whatever it likes:

```bash
curl -H 'Referer: https://www.example.org/' https://shop.example/pricing
```

Inside a browser it is harder. Page scripts cannot set `Referer` on their requests to an arbitrary value, because browsers treat it as a header they control. A page can only reduce what is sent. Browser extensions and proxies can still rewrite it.

Treat the header as a hint. It is fine for statistics. It should not be the only thing that guards access to content or confirms where a request came from.

## How to hide the Referer header

Which method fits depends on what you control.

### You control the page with the link

Add `rel="noreferrer"` to the link, or set a policy for the whole page:

```html
<a href="https://shop.example/pricing" rel="noreferrer">Pricing</a>

<meta name="referrer" content="no-referrer">
```

The policy can also be sent as a response header, `Referrer-Policy: no-referrer`. The guide to [noreferrer and Referrer-Policy](./noreferrer-referrer-policy) covers the options and their differences.

### You only control the link itself

On a forum, a wiki, a chat or someone else's CMS you can post a URL, but you cannot add attributes or headers. The page's own policy decides what is sent. In that case the link can point at a dereferer: a redirect service that loads an intermediate page with a `no-referrer` policy and then sends the browser on. The destination receives no `Referer` at all.

Suparedirect is a dereferer you host yourself. A link looks like this:

```text
https://go.example/?to=https://shop.example/pricing
```

[How it works](./how-it-works) shows the intermediate page and what the destination still sees.

### You are the visitor

As a reader you can change your own browser. Firefox has preferences under `network.http.referer` that limit or disable the header, and privacy extensions for other browsers do the same. Some sites break without it, mostly ones that use the header for hotlink protection or for form checks.

## What hiding it does not do

Removing the `Referer` header removes one signal. The destination still sees the visitor's IP address and user agent, and any tracking parameter in the URL itself still arrives. A link such as `https://shop.example/?utm_source=forum` says where the visitor came from with or without the header.
