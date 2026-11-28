---
title: "Referrer and Redirect Guides | Suparedirect Blog"
titleTemplate: false
description: "Guides to the Referer header and Referrer-Policy: strict-origin-when-cross-origin, noopener noreferrer, HTTP_REFERER, URL redirects and hiding referrers."
---

# Suparedirect blog

<p class="lead">How browsers decide what the Referer header says, how to read it on the server and how to stop sending it. Each post links to the spec or documentation it relies on, and the redirect results come from tests in headless Chrome.</p>

## [strict-origin-when-cross-origin, explained](/blog/strict-origin-when-cross-origin)

What the strict-origin-when-cross-origin referrer policy sends for each kind of request, why DevTools shows it next to failed requests, and how to change it.

## [rel="noopener noreferrer": what each part does](/blog/noopener-noreferrer)

What rel=noopener and rel=noreferrer each do on a link, why target=_blank already implies noopener, and when noreferrer is worth adding to your links.

## [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)

Every Referrer-Policy value in one table, a recommended default, fallback syntax, and how to set the header in nginx, Apache, IIS web.config and Express.

## [Reading HTTP_REFERER in PHP and nginx](/blog/http-referer-php-nginx)

How to read the Referer header as $_SERVER['HTTP_REFERER'] in PHP and $http_referer in nginx, why it is often empty, and why it cannot be trusted.

## [How URL redirects work: 301, 302, meta refresh and JavaScript](/blog/how-url-redirects-work)

The four ways to redirect a URL, what each status code means, how Google reads them, and which Referer the destination gets, tested in headless Chrome.

## [Redirect services with the target URL in the path](/blog/redirect-service-url-in-path)

Path-style redirect URLs put the target after a slash instead of in ?to=. How they differ, where they break, and how to add a path route to Suparedirect.

## [The Referer in an HTTP request: how to read and test it](/blog/referer-in-http-request)

Where the Referer header sits in an HTTP request, how to see it in DevTools, send or fake it with curl, read it in JavaScript and check what a link sends.

## [How to hide the referrer URL when linking out](/blog/hide-referrer-url)

Four ways to hide the referrer URL from the sites you link to: rel=noreferrer, a Referrer-Policy header, a meta tag, or a self-hosted dereferer link.
