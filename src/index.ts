#!/usr/bin/env node

import fs from 'fs';

import { Client } from '@notionhq/client';
import { defineCommand, runMain } from 'citty';

import pkg from '../package.json';

import getAuthToken from './env';
import markdownToHtml from './markdown_to_html';
import notionToMarkdown from './notion_to_markdown';
import { getOutputPath, getPageId } from './utils';

const main = defineCommand({
  meta: {
    name: 'nt',
    version: pkg.version,
    description: 'Convert Notion page to other formats',
  },
  args: {
    url: {
      type: 'positional',
      description: 'Notion page URL',
      required: true,
    },
    output: {
      type: 'string',
      description: 'Output markdown file path',
      alias: ['o'],
    },
    html: {
      type: 'boolean',
      description: 'Output as HTML file',
    },
    version: {
      type: 'boolean',
      description: 'Show version',
    },
  },
  async run({ args }) {
    const pageId = getPageId(args.url);
    const notion = new Client({ auth: getAuthToken() });
    const markdown = await notionToMarkdown({ pageId, notion });
    const outputPath =
      args.output || (await getOutputPath(pageId, notion, args.html ? 'html' : 'md'));

    if (args.html) {
      const html = await markdownToHtml(markdown);
      fs.writeFileSync(outputPath, html);
    } else {
      fs.writeFileSync(outputPath, markdown);
    }
  },
});

runMain(main).catch((e) => console.error('Uncaught error:', e));
