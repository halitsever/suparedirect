---
title: "JavaScript Redirect: location.href, assign or replace"
titleTemplate: false
description: "Redirect with JavaScript using location.href, assign or replace, tested in Chrome: which ones keep the page in history and why redirects during load differ."
headline: "Redirecting with JavaScript, and what the Back button does after"
date: "2026-11-28"
keyword: "javascript redirect"
faq: [{"q": "How do I redirect to another page in JavaScript?", "a": "Set window.location.href to the new URL, or call location.assign(url). Use location.replace(url) when the current page should not stay in the browser history."}, {"q": "What is the difference between location.href and location.replace?", "a": "Setting href adds a history entry, so Back returns to the current page. replace swaps the current entry out, so Back skips it. During page load both behave like replace."}, {"q": "Is a JavaScript redirect good for SEO?", "a": "Google can follow JavaScript redirects when it renders the page, but a server-side 301 or 302 is clearer and works without JavaScript. Use a JavaScript redirect when you cannot send a status code."}]
---

# Redirecting with JavaScript, and what the Back button does after

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A JavaScript redirect is one line, but the line you pick decides what the Back button does afterwards, and whether visitors can get back out at all. We tested the four common forms in Google Chrome 157, once while the page was still loading and once after it had loaded.</p>

## The four ways to write it

```js
window.location.href = 'https://example.com/'     // add a history entry
window.location = 'https://example.com/'          // the same
location.assign('https://example.com/')           // the same, as a method
location.replace('https://example.com/')          // replace the current entry
```

`window.location` and `document.location` are the same `Location` object, and assigning a string to it is the same as setting `href`. [MDN's Location.replace page](https://developer.mozilla.org/en-US/docs/Web/API/Location/replace) states the difference that matters: after `replace()`, the current page is not saved in session history, so the user cannot use Back to return to it.

## What Back does after each one

Our test: a start page links to a redirect page, the redirect page sends the browser to a destination, then we read `history.length` and pressed Back.

| Method | Redirect while the page loads | Redirect after load |
| --- | --- | --- |
| `location.href = url` | Back returns to the start page | Back returns to the redirect page, which redirects again |
| `location.assign(url)` | Back returns to the start page | same trap |
| `window.location = url` | Back returns to the start page | same trap |
| `location.replace(url)` | Back returns to the start page | Back returns to the start page |

Two findings:

- **During load, all four replace.** The [HTML Standard](https://html.spec.whatwg.org/multipage/nav-history-apis.html#location-object-navigate) says that when the document is not yet completely loaded and there is no user activation, a navigation through `location` uses "replace". So an inline script that redirects right away never leaves its page in history, whichever method it uses.
- **After load, only `replace` avoids the Back-button loop.** With the others, the redirect page stays in history. Back lands on it, it runs its script again and sends the visitor forward, and the visitor is stuck. In our run, pressing Back ended on the destination again.

Use `replace()` for redirects, and `href` or `assign()` for navigation the user asked for, such as after a click or a form submit.

## A complete redirect page

```html
<!doctype html>
<meta charset="utf-8">
<title>Redirecting</title>
<script>location.replace('https://example.com/new-page')</script>
<noscript><meta http-equiv="refresh" content="0; url=https://example.com/new-page"></noscript>
<p><a href="https://example.com/new-page">Continue to the new page</a></p>
```

The link helps people with JavaScript off and anyone whose browser blocks the redirect.

## Putting a URL from the query string into the script

When the target comes from input, as in a redirect service, it must not be able to break out of the script:

```js
// Express: build the script value with JSON.stringify, after encodeURI
const safeUrl = encodeURI(target)
res.send(`<script>window.location = ${JSON.stringify(safeUrl)};</script>`)
```

This is what [Suparedirect](/) does in `src/index.ts`. `encodeURI` turns characters such as `<` and `>` into percent escapes, and `JSON.stringify` produces a correctly quoted JavaScript string. Suparedirect also prefixes `https://` to targets without a scheme, so `?to=javascript:alert(1)` becomes the harmless `https://javascript:alert(1)` instead of running code. Accepting any target is still an open redirect; [the open redirect post](/blog/open-redirect) explains when that matters and how to restrict it.

## JavaScript or a server redirect?

Prefer a server redirect, `301` or `302` with a `Location` header, when you can: it works without JavaScript, it is faster because no page has to load, and it carries a status code. [Google's redirect documentation](https://developers.google.com/search/docs/crawling-indexing/301-redirects) says to use JavaScript redirects only when server-side or meta refresh redirects are not possible: Google sees them only after rendering the page, and if rendering fails it might never see them.

Suparedirect answers with a small page that sends `Referrer-Policy: no-referrer` and redirects by script, so the destination gets no Referer. A plain `302` would pass the original page along as the referrer; a `302` that carries `Referrer-Policy: no-referrer` itself hid it just as well in [our redirect tests](/blog/how-url-redirects-work), and works without JavaScript.

## FAQ

### How do I redirect to another page in JavaScript?

Set window.location.href to the new URL, or call location.assign(url). Use location.replace(url) when the current page should not stay in the browser history.

### What is the difference between location.href and location.replace?

Setting href adds a history entry, so Back returns to the current page. replace swaps the current entry out, so Back skips it. During page load both behave like replace.

### Is a JavaScript redirect good for SEO?

Google can follow JavaScript redirects when it renders the page, but a server-side 301 or 302 is clearer and works without JavaScript. Use a JavaScript redirect when you cannot send a status code.

## Related posts

- [How URL redirects work: 301, 302, meta refresh and JavaScript](/blog/how-url-redirects-work)
- [Meta refresh and the Referer header](/blog/meta-refresh-referrer)
- [Open redirects: why they are risky and how to lock one down](/blog/open-redirect)
- [Inside an anonymous redirect, step by step](/guide/how-it-works)
- [All posts](/blog/)
