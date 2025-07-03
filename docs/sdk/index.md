---
id: index
title: "📦 SDK Overview"
sidebar_label: SDK Overview
---

The Quran Foundation JavaScript SDK simplifies interaction with the [Quran Foundation API](https://api-docs.quran.foundation). It works in Node.js and modern browsers and handles authentication for you.

## Installation

```bash
npm install @quranjs/api
```

or with Yarn:

```bash
yarn add @quranjs/api
```

or with pnpm:

```bash
pnpm add @quranjs/api
```

## Basic Setup

Before using the SDK, configure it with your client credentials. You can obtain a **Client ID** and **Client Secret** from the [Request Access](https://api-docs.quran.foundation/request-access) page:

```javascript
import { configure, quran } from '@quranjs/api';

configure({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
});
```

After configuration you can call the SDK methods directly. Tokens are fetched and refreshed automatically.

### Example: list chapters

```javascript
const chapters = await quran.qf.chapters.findAll();
console.log(chapters);
```

Continue to the [Authentication](authentication.md) guide for details on how tokens are managed.
