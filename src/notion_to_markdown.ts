import { Client } from '@notionhq/client';
import prettier from 'prettier';

import blocksToMarkdown from './markdown';
import { fetchBlocksWithChildren } from './notion_api';
import { OptionsType } from './types';

export default async function notionToMarkdown({
  pageId,
  notion,
  options,
}: {
  pageId: string;
  notion: Client;
  options?: OptionsType;
}) {
  const blocks = await fetchBlocksWithChildren(pageId, notion);
  const markdown = await blocksToMarkdown(blocks, options);
  const formatted = await prettier.format(markdown, { parser: 'markdown' });

  return formatted;
}
