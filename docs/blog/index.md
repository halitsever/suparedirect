---
title: "Referrer and Redirect Guides | Suparedirect Blog"
titleTemplate: false
description: "Guides to the Referer header and Referrer-Policy, noreferrer and nofollow, JavaScript and meta refresh redirects, open redirects and UTM tracking."
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

## [Meta refresh and the Referer header: what a second refresh changes](/blog/meta-refresh-referrer)

We tested single and double meta refresh redirects in Chrome: which Referer each hop sends, why the refresh page becomes the referrer, and what really hides it.

## [Redirecting with JavaScript, and what the Back button does after](/blog/javascript-redirect)

Redirect with JavaScript using location.href, assign or replace, tested in Chrome: which ones keep the page in history and why redirects during load differ.

## [Open redirects: why they are risky and how to lock one down](/blog/open-redirect)

What an open redirect vulnerability is, how phishing uses it, OWASP's fixes with a tested Node.js allowlist, and why a dereferer is an open redirect by design.

## [Referer or referrer: which spelling goes where](/blog/referer-vs-referrer)

Why the HTTP header is spelled Referer while Referrer-Policy, document.referrer and rel=noreferrer use two r's, and which spelling each server expects.

## [What rel nofollow tells search engines, and what it does not change](/blog/rel-nofollow)

What rel=nofollow does for Google, when to use sponsored or ugc instead, and how it differs from noreferrer and noopener, which change the browser instead.

## [UTM parameters explained, and how they survive a hidden referrer](/blog/utm-parameters)

What UTM parameters are, the five Google Analytics reads, how they keep attribution when the Referer is hidden, and how to pass them through a redirect intact.
