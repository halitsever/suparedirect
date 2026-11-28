---
title: "HTTP_REFERER in PHP and $http_referer in nginx"
titleTemplate: false
description: "How to read the Referer header as $_SERVER['HTTP_REFERER'] in PHP and $http_referer in nginx, why it is often empty, and why it cannot be trusted."
headline: "Reading HTTP_REFERER in PHP and nginx"
date: "2026-11-28"
keyword: "http_referer"
faq: [{"q": "Why is $_SERVER['HTTP_REFERER'] empty?", "a": "The browser did not send a Referer: the visitor typed the URL, came from an app, from an HTTPS page to HTTP, or through a link or page with a no-referrer policy."}, {"q": "Can HTTP_REFERER be faked?", "a": "Yes. Any client can send any value, so never use it for authentication or access control."}]
---

# Reading HTTP_REFERER in PHP and nginx

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">On the server, the Referer header shows up as HTTP_REFERER in PHP and as $http_referer in nginx. Both give you whatever the client sent, which is often nothing and sometimes made up. Here is how to read it safely and what changes it.</p>

## PHP: $_SERVER['HTTP_REFERER']

PHP exposes request headers in `$_SERVER` with an `HTTP_` prefix, upper case and underscores. The header keeps its historical misspelling, one R in the middle: `HTTP_REFERER`.

```php
<?php
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$host = $referer !== '' ? parse_url($referer, PHP_URL_HOST) : null;

echo 'You came from ' . htmlspecialchars($host ?? 'nowhere', ENT_QUOTES);
```

Three rules:

- **It may not exist.** Use `?? ''` or `isset()`; reading a missing key raises a warning.
- **Escape it before output.** It is user input. Printing it raw is an XSS hole.
- **Do not trust it.** The [PHP manual](https://www.php.net/manual/en/reserved.variables.server.php) says it is set by the user agent, not all user agents set it, some let users change it, and "in short, it cannot really be trusted."

## nginx: $http_referer

nginx makes every request header available as `$http_<name>`, lower case with dashes turned into underscores. The Referer header is `$http_referer`. It is already in the default `combined` log format:

```nginx
log_format combined '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
```

A missing header shows up in the log as `"-"`.

### Blocking hotlinks with valid_referers

The [referer module](https://nginx.org/en/docs/http/ngx_http_referer_module.html) sets `$invalid_referer` when the header does not match a list:

```nginx
location /images/ {
    valid_referers none blocked server_names *.example.com;
    if ($invalid_referer) {
        return 403;
    }
}
```

`none` allows requests without the header, and `blocked` allows headers that a proxy or firewall emptied (values that do not start with `http://` or `https://`). Keep `none` in the list: privacy settings, `rel="noreferrer"` and dereferer links all send no header, and those visitors are legitimate. The module's own docs say faking a Referer is "quite easy", so treat it as a filter for casual hotlinking, not as access control.

## Why it is empty so often

| Situation | What arrives |
| --- | --- |
| Typed URL, bookmark, link from an app or email client | No header |
| Link from another HTTPS site, default policy | Only that site's origin, such as `https://forum.example/` |
| HTTPS page linking to your HTTP page | No header |
| Link with `rel="noreferrer"`, or a page with `Referrer-Policy: no-referrer` | No header |
| Link through a dereferer such as Suparedirect | No header |
| Request from curl, a script or a bot | Whatever it chose to send |

The second row surprises people most. Since browsers adopted [strict-origin-when-cross-origin](/blog/strict-origin-when-cross-origin) as the default, a visit from another site carries the origin only. Code that looks for a path in `HTTP_REFERER` will rarely find one.

## What a dereferer changes

[Suparedirect](/) puts a page between the link and your site. That page is served with `Referrer-Policy: no-referrer`, so the request that reaches you has no Referer at all: `$_SERVER['HTTP_REFERER']` is unset and nginx logs `"-"`. The [Referer header guide](/guide/referer-header) covers it from the linking side.

## Testing your code

Send a fake value with curl and watch what your script or log records:

```bash
curl -s -e 'https://forum.example/thread/4821' https://your.site/ref.php
```

[Referer in an HTTP request](/blog/referer-in-http-request) shows more ways to test, including DevTools.

## FAQ

### Why is $_SERVER['HTTP_REFERER'] empty?

The browser did not send a Referer: the visitor typed the URL, came from an app, from an HTTPS page to HTTP, or through a link or page with a no-referrer policy.

### Can HTTP_REFERER be faked?

Yes. Any client can send any value, so never use it for authentication or access control.

## Related posts

- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [The Referer in an HTTP request: how to read and test it](/blog/referer-in-http-request)
- [How to hide the referrer URL when linking out](/blog/hide-referrer-url)
- [All posts](/blog/)
