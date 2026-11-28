---
title: "Referer vs Referrer: Why the HTTP Header Is Misspelled"
titleTemplate: false
description: "Why the HTTP header is spelled Referer while Referrer-Policy, document.referrer and rel=noreferrer use two r's, and which spelling each server expects."
headline: "Referer or referrer: which spelling goes where"
date: "2026-11-28"
keyword: "referer vs referrer"
faq: [{"q": "Is it referer or referrer?", "a": "Both, depending on where. The HTTP header is Referer, a misspelling kept since HTTP/1.0. The English word and newer web APIs such as Referrer-Policy and document.referrer use referrer."}, {"q": "Why is the Referer header misspelled?", "a": "The misspelling went into the HTTP specifications in the 1990s and was kept for compatibility, since every browser and server already used it. MDN notes that Referer is a misspelling of referrer."}, {"q": "Does a Referrer header work?", "a": "Browsers do not send one. Some server frameworks, Express among them, accept either spelling when you read the header, but clients should send Referer."}]
---

# Referer or referrer: which spelling goes where

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">The header browsers send is spelled `Referer`, with one r in the middle. The English word, and almost every web API added since, is `referrer`. Both are correct in their place, and mixing them up is a common reason a header check silently finds nothing.</p>

## Where the misspelling comes from

The field was defined as `Referer` in [RFC 1945](https://www.rfc-editor.org/rfc/rfc1945), HTTP/1.0, in 1996, and every HTTP specification since has kept that spelling. Today it is section 10.1.3 of [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110#section-10.1.3). [MDN's Referer page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer) puts it plainly: the header name is a misspelling of the word "referrer". Changing it would break every server that reads the header, so it stays.

## Which spelling goes where

| Place | Spelling |
| --- | --- |
| HTTP request header | `Referer` |
| CGI and PHP variable | `HTTP_REFERER`, `$_SERVER['HTTP_REFERER']` |
| nginx variable | `$http_referer` |
| Apache log format | `%{Referer}i` |
| Response header that controls it | `Referrer-Policy` |
| HTML meta tag | `<meta name="referrer">` |
| Link and element attribute | `referrerpolicy="..."` |
| Link type | `rel="noreferrer"` |
| DOM property | `document.referrer` |
| fetch() options | `referrer`, `referrerPolicy` |

The rule of thumb: the original header and everything derived from it by name (CGI, PHP, nginx, Apache) uses `Referer`. Everything designed later, in HTML, the DOM and the Referrer Policy specification, uses the correct `referrer`.

## Reading the header in code

Header names are case-insensitive, but the spelling must match:

```js
// Node.js: header names arrive lowercase
req.headers.referer
```

```php
$from = $_SERVER['HTTP_REFERER'] ?? '';
```

```nginx
log_format refs '$remote_addr "$http_referer"';
```

Express is forgiving. We tested `req.get()` in Express 5.3: it returns the same value for `req.get('Referer')` and `req.get('Referrer')`, because the method treats the two names as one. It even returns a value when a client sends a non-standard `Referrer` header, and if both arrive, the `Referrer` one wins. Plain `req.headers.referer` only sees the standard one.

## Sending it

Browsers send `Referer`. When you set it yourself, for example with curl, use the same spelling:

```bash
curl -H 'Referer: https://example.com/page' https://httpbin.org/headers
curl -e https://example.com/page https://httpbin.org/headers
```

A header named `Referrer` is not part of HTTP; most servers will ignore it.

## Policies spell it correctly

Controlling the header uses the correct spelling throughout:

```http
Referrer-Policy: no-referrer
```

```html
<a href="https://example.org/" rel="noreferrer">Example</a>
<meta name="referrer" content="no-referrer">
```

[Suparedirect](/) uses both in one response: it sends `Referrer-Policy: no-referrer` and a `<meta name="referrer" content="no-referrer">` tag on its redirect page, so the destination gets no `Referer` header at all. [Referrer-Policy best practices](/blog/referrer-policy-best-practices) lists every policy value, and [the Referer in an HTTP request](/blog/referer-in-http-request) shows how to see what a link sends.

## FAQ

### Is it referer or referrer?

Both, depending on where. The HTTP header is Referer, a misspelling kept since HTTP/1.0. The English word and newer web APIs such as Referrer-Policy and document.referrer use referrer.

### Why is the Referer header misspelled?

The misspelling went into the HTTP specifications in the 1990s and was kept for compatibility, since every browser and server already used it. MDN notes that Referer is a misspelling of referrer.

### Does a Referrer header work?

Browsers do not send one. Some server frameworks, Express among them, accept either spelling when you read the header, but clients should send Referer.

## Related posts

- [The Referer in an HTTP request: how to read and test it](/blog/referer-in-http-request)
- [Reading HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx)
- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [The Referer header: what it is and how to hide it](/guide/referer-header)
- [All posts](/blog/)
