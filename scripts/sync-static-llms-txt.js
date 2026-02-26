'use strict';

const fs = require('fs');
const path = require('path');

const { generateLlmsTxt } = require('../plugins/llms-txt-plugin');

const siteDir = path.resolve(__dirname, '..');
const docsDir = path.join(siteDir, 'docs');
const outFile = path.join(siteDir, 'static', 'llms.txt');

const { content, linkCount } = generateLlmsTxt(docsDir);
fs.writeFileSync(outFile, content, 'utf8');
console.log(`[llms-txt-sync] Wrote ${outFile} with ${linkCount} links`);
