---
id: index
title: "📢 API Updates"
sidebar_label: Updates
displayed_sidebar: APIsSidebar
---

# 📢 Recent API Updates

We would like to inform our developers of the following changes made to the API:

### Sign-in page moved to a quran.com host (November 2026)

The OAuth2 sign-in page (`authorization_endpoint` in the discovery document) is now served from `https://oauth2.quran.com/oauth2/auth` in production and `https://prelive-oauth2.quran.com/oauth2/auth` in pre-production. The issuer and every other endpoint (token, userinfo, JWKS, revoke, logout) are unchanged on `oauth2.quran.foundation`. Old `/oauth2/auth` links on the issuer host are redirected, so most apps need no change. If your app checks that every discovery endpoint shares the issuer's host, or allows only `quran.foundation` hosts in a WebView, CSP or firewall, add the `quran.com` sign-in host. See [OIDC Discovery](/docs/tutorials/oidc/openid-connect#oidc-discovery--jwks).

### Removed resources

1. **Clear Quran Translation Removed**
2. **Russian Word-for-Word Translation Removed**

These resources have been **removed at the request of their respective copyright holders**. We respect the rights of all publishers and are committed to complying with intellectual property requirements.

We understand that this may impact some applications and ongoing projects. We sincerely **apologize for any inconvenience** this may cause. If you're looking for alternative translations or need help adjusting your integration, please don’t hesitate to reach out to us at **[developers@quran.com](mailto:developers@quran.com)**.

We appreciate your continued support and understanding.
— *Quran Foundation Team*
