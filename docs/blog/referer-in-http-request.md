---
title: "Referer in an HTTP Request: How to Read and Test It"
titleTemplate: false
description: "Where the Referer header sits in an HTTP request, how to see it in DevTools, send or fake it with curl, read it in JavaScript and check what a link sends."
headline: "The Referer in an HTTP request: how to read and test it"
date: "2026-11-28"
keyword: "http referer url"
faq: [{"q": "How do I see the Referer of a request?", "a": "Open DevTools, Network, click the request and look under Request Headers. On the opened page, document.referrer holds the same value."}, {"q": "How do I send a fake Referer?", "a": "With curl, use -e followed by the URL, or -H 'Referer: ...'. Servers cannot tell it apart from a real one, which is why it must not be trusted."}]
---

# The Referer in an HTTP request: how to read and test it

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">The Referer header is one line in the request a browser sends. You can see it in DevTools, set it to anything with curl, and read it on the page with document.referrer. Here is how to check what a link really sends.</p>

## What it looks like on the wire

A browser following a link from `https://forum.example/thread/4821` to `https://shop.example/pricing` sends something like this, under the default [strict-origin-when-cross-origin](/blog/strict-origin-when-cross-origin) policy:

```http
GET /pricing HTTP/1.1
Host: shop.example
Referer: https://forum.example/
User-Agent: Mozilla/5.0 ...
```

The value is a URL, or only an origin, or the line is missing. The [Referer header guide](/guide/referer-header) explains when each happens.

## In DevTools

1. Open DevTools and the **Network** panel, then load or click through to the page.
2. Click the request and open **Headers**.
3. Under **Request Headers**, find `Referer`. If it is missing, none was sent.
4. The **General** section at the top shows the **Referrer Policy** that decided it.

Firefox shows the same under the request's **Headers** tab.

## In JavaScript

On the page that was opened, the referrer of the navigation is in `document.referrer`:

```js
console.log(document.referrer || '(empty)')
```

It is an empty string when no referrer was sent. It only changes on a full page load, so in single-page apps it keeps the value from the first load.

## With curl

curl sends no Referer unless you ask. Set one with `-e` (`--referer`) or a plain header:

```bash
curl -e 'https://forum.example/thread/4821' https://your.site/
curl -H 'Referer: https://forum.example/thread/4821' https://your.site/
```

To see exactly what curl sends, point it at a listener. In one terminal run `nc -l 8080` (the flags differ slightly between netcat versions), and in another:

```bash
curl -s -e 'https://forum.example/' http://localhost:8080/
```

netcat prints the raw request, including the `Referer:` line. With `-v`, curl also prints its outgoing headers prefixed with `>`.

## Faking it

Because curl, scripts and browser extensions can send any value, the header proves nothing. A request with `Referer: https://your.site/admin` may come from anywhere. [web.dev](https://web.dev/articles/referrer-best-practices) and the [PHP manual](https://www.php.net/manual/en/reserved.variables.server.php) both warn against relying on it. Use it for analytics and debugging, never for access control. [HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx) covers the server side.

## Check what a link sends

This site has a [referrer test page](https://projects.halit.org/suparedirect/referrer-test.html) that prints `document.referrer` for whatever opened it. The [link generator](/link-generator/) has three ready-made links to it: a normal link, a `rel="noreferrer"` link and one through your own Suparedirect instance. Opening the normal one shows the generator page's URL; the other two show an empty referrer.

You can also send any link through [Suparedirect](/) to the test page to see the no-referrer redirect at work:

```text
https://your-suparedirect.example/?to=https%3A%2F%2Fprojects.halit.org%2Fsuparedirect%2Freferrer-test.html
```

## FAQ

### How do I see the Referer of a request?

Open DevTools, Network, click the request and look under Request Headers. On the opened page, document.referrer holds the same value.

### How do I send a fake Referer?

With curl, use -e followed by the URL, or -H 'Referer: ...'. Servers cannot tell it apart from a real one, which is why it must not be trusted.

## Related posts

- [strict-origin-when-cross-origin, explained](/blog/strict-origin-when-cross-origin)
- [Reading HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx)
- [How to hide the referrer URL when linking out](/blog/hide-referrer-url)
- [All posts](/blog/)
