---
title: How an anonymous redirect works
description: How Suparedirect strips the Referer header with a no-referrer redirect page, what the target site still sees, and the limits of an anonymous redirect.
---

# Inside an anonymous redirect, step by step

Suparedirect does not rewrite or filter requests. It serves one small page, and that page tells the browser to leave the `Referer` header off the next request. This page goes through the mechanism using the code in `src/index.ts`.

## The request, step by step

Say a forum post contains this link:

```text
https://go.example/?to=https://shop.example/pricing
```

1. The visitor clicks. The browser requests `/?to=...` from `go.example`, your Suparedirect host. This request may carry a `Referer` pointing at the forum. Only your server sees it.
2. The server reads `to`. If the value does not start with `http://` or `https://`, it adds `https://`.
3. The server records the redirect in memory and answers `200 OK` with an HTML page.
4. The page runs one line of script that sets `window.location` to the target.
5. The browser navigates to `shop.example`. The page it is leaving has the policy `no-referrer`, so the request goes out without a `Referer` header.

## The redirect page

This is the whole response body, with the target filled in:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="referrer" content="no-referrer">
  </head>
  <body>
    <script>
      window.location = "https://shop.example/pricing";
    </script>
  </body>
</html>
```

It is sent with this response header:

```http
Referrer-Policy: no-referrer
```

The policy is stated twice, once as a header and once as a `<meta>` tag. Either is enough for the browser. `no-referrer` is the strictest value of the policy: the browser omits the header for every request that starts from this document, to any destination.

The response is a normal page, not a `3xx` redirect. That is why the policy applies: the navigation to the target starts from a document that Suparedirect controls. On the target, `document.referrer` is an empty string.

## How the target URL is written into the page

The server passes the target through `encodeURI` and then `JSON.stringify` before placing it in the script. Characters such as quotes and angle brackets end up percent-encoded, so a crafted `to` value cannot close the string or the script tag. For example, `"</script>` in a target becomes `%22%3C/script%3E`.

Two side effects follow from how query strings are parsed:

- A `+` in the `to` value is read as a space and reaches the target as `%20`.
- An unencoded `&` ends the `to` value. Percent-encode targets that have several query parameters, as shown in [Getting started](./getting-started#make-your-first-anonymous-link).

## What the target no longer sees

- The `Referer` request header. Not the full URL of the linking page, and not its origin either.
- `document.referrer`, which scripts and analytics tools on the target read to attribute visits.

In the target's analytics the visit shows up like one where the address was typed in or opened from a bookmark.

## What the target still sees

Suparedirect is not a proxy. After the redirect page, the visitor's browser talks to the target directly.

- The visitor's IP address.
- The user agent and every other request header the browser normally sends.
- The target URL itself. Query strings, campaign tags and IDs in the link pass through untouched. If the URL says where the visitor came from, such as `?utm_source=forum`, removing the header does not help.
- Cookies the target has already set for that visitor.

## What your Suparedirect server sees

Your own server is now in the path of every click.

- It receives the `Referer` of the page that held the link, if the browser sends one. The code does not read or store it.
- It stores the target URL, a timestamp and the user agent of each redirect in memory. Only the latest 500 are kept, and all of them are lost on restart.
- It serves that history at `GET /api/stats` without authentication. See [Self-hosting notes](./self-hosting#the-stats-endpoint-is-open).

It does not store IP addresses, and it writes no log file of its own.

## Limits

- The redirect needs JavaScript. With JavaScript turned off, the visitor stays on a blank page. There is no `<noscript>` fallback or meta refresh.
- The link shows the destination in plain text. Anyone who reads the link can see where it goes.
- The service redirects to any URL it is given. There is no allowlist.
- An extra request happens before the target loads, so each click depends on your server being up.

If you control the page that holds the link, you can get the same result without the extra hop. See [do you need a dereferer?](./noreferrer-referrer-policy)
