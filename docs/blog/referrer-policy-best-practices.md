---
title: "Referrer-Policy Header: Best Practices and Values"
titleTemplate: false
description: "Every Referrer-Policy value in one table, a recommended default, fallback syntax, and how to set the header in nginx, Apache, IIS web.config and Express."
headline: "Referrer-Policy header: best practices and every value"
date: "2026-11-28"
keyword: "referrer-policy"
faq: [{"q": "What is the best Referrer-Policy?", "a": "strict-origin-when-cross-origin for most sites, which is also the browser default. Use same-origin or no-referrer on pages whose URLs contain tokens or other private data."}, {"q": "Can I set several Referrer-Policy values?", "a": "Yes, as a comma-separated list in the header. Browsers apply the last value they support, so the preferred policy goes last."}]
---

# Referrer-Policy header: best practices and every value

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">The Referrer-Policy header decides how much of the current page's URL the browser shares with the next request. Browsers already default to a reasonable policy, but setting one yourself makes the behaviour explicit and lets you go stricter where URLs carry private data.</p>

## The values

From [MDN's Referrer-Policy reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy), ordered from least to most revealing:

| Value | Same-origin requests | Other origins (HTTPS) | HTTPS to HTTP |
| --- | --- | --- | --- |
| `no-referrer` | nothing | nothing | nothing |
| `same-origin` | full URL | nothing | nothing |
| `strict-origin` | origin | origin | nothing |
| `strict-origin-when-cross-origin` (default) | full URL | origin | nothing |
| `origin` | origin | origin | origin |
| `origin-when-cross-origin` | full URL | origin | origin |
| `no-referrer-when-downgrade` | full URL | full URL | nothing |
| `unsafe-url` | full URL | full URL | full URL |

"Full URL" means origin, path and query string. The fragment is never sent. An invalid value is ignored and the default applies.

## Recommended defaults

1. **Set a policy explicitly.** [web.dev's referrer best practices](https://web.dev/articles/referrer-best-practices) recommends `strict-origin-when-cross-origin` or stricter. It is the browser default already, so this changes nothing for visitors and documents your intent.
2. **Go to `same-origin` or `no-referrer` when URLs carry private data.** Password reset tokens, session IDs, search terms and document IDs in the query string travel in the `Referer` of every image, script and link on that page. `same-origin` keeps your own analytics working; `no-referrer` hides everything.
3. **Never use `unsafe-url`.** It sends the full URL, query included, even to plain HTTP sites.
4. **Do not use the referrer for security.** web.dev advises against using it for CSRF protection because it can be missing or spoofed; use CSRF tokens. nginx's own referer module documentation says faking the header is "quite easy".
5. **Relax per element, not per page.** If one partner embed needs more, give that `<iframe>` a `referrerpolicy` attribute instead of weakening the whole page.

## Fallback syntax

The header accepts a comma-separated list. Browsers use the last value they understand, so put the policy you want last:

```http
Referrer-Policy: no-referrer, strict-origin-when-cross-origin
```

Here `no-referrer` applies only in a browser that does not know `strict-origin-when-cross-origin`. Lists work only in the header, not in the `referrerpolicy` attribute.

## Setting the header

**nginx:**

```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

`always` adds it to error responses too. Remember that nginx does not inherit `add_header` from a parent block when the child block has its own `add_header` lines.

**Apache** (mod_headers):

```apache
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

**IIS** (`web.config`):

```xml
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

**Express:** the [helmet](https://github.com/helmetjs/helmet) middleware sets `Referrer-Policy: no-referrer` by default. To use the browser default instead:

```js
app.use(helmet({ referrerPolicy: { policy: 'strict-origin-when-cross-origin' } }))
```

**Without server access:** a meta tag in the `<head>` sets the policy for the document.

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

Check the result with `curl -sI https://your.site/ | grep -i referrer-policy`, or in DevTools under the request's response headers.

## How Suparedirect uses it

[Suparedirect](/) sends `Referrer-Policy: no-referrer` as a header on its redirect page and repeats it in a `<meta name="referrer">` tag, then moves to the target from a script. The destination gets no `Referer`, whatever policy the page with the link had. It is meant for links whose page you do not control; on your own pages, the header above is simpler. [How it works](/guide/how-it-works) and [How URL redirects work](/blog/how-url-redirects-work) explain why it uses a page and not a bare 302.

## FAQ

### What is the best Referrer-Policy?

strict-origin-when-cross-origin for most sites, which is also the browser default. Use same-origin or no-referrer on pages whose URLs contain tokens or other private data.

### Can I set several Referrer-Policy values?

Yes, as a comma-separated list in the header. Browsers apply the last value they support, so the preferred policy goes last.

## Related posts

- [strict-origin-when-cross-origin, explained](/blog/strict-origin-when-cross-origin)
- [rel="noopener noreferrer": what each part does](/blog/noopener-noreferrer)
- [Reading HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx)
- [All posts](/blog/)
