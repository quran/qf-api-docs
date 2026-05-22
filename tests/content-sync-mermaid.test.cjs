const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const contentSyncDocsDir = path.join(
  __dirname,
  '..',
  'docs',
  'tutorials',
  'content-sync',
);

const extractMermaidBlocks = (content) => {
  const blocks = [];
  const blockPattern = /```mermaid\n([\s\S]*?)\n```/g;
  let match;

  while ((match = blockPattern.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  return blocks;
};

test('content sync tutorial sequence diagrams parse', async () => {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({ startOnLoad: false });

  const docs = fs
    .readdirSync(contentSyncDocsDir)
    .filter((fileName) => fileName.endsWith('.mdx'));

  for (const fileName of docs) {
    const filePath = path.join(contentSyncDocsDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const blocks = extractMermaidBlocks(content).filter((block) =>
      block.trimStart().startsWith('sequenceDiagram'),
    );

    for (const [index, block] of blocks.entries()) {
      try {
        await mermaid.parse(block);
      } catch (error) {
        assert.fail(
          `${fileName} Mermaid block ${index + 1} failed to parse:\n${error.message}`,
        );
      }
    }
  }
});
