import { markdownTable } from 'markdown-table';

import richTextsToMarkdown from './rich_text';
import { BlockObjectResponseWithChildren, OptionsType } from './types';
import { downloadImage, throwNotSupportedError } from './utils';

async function getParentText(block: BlockObjectResponseWithChildren, options?: OptionsType) {
  const { saveImage = true } = options ?? {};

  if (!('type' in block)) {
    return '';
  }

  switch (block.type) {
    case 'paragraph':
      return richTextsToMarkdown(block.paragraph.rich_text);
    case 'callout':
    case 'quote':
      return ''; // Quote is handled in the children
    case 'equation':
      return `$$\n${block.equation.expression}\n$$`;
    case 'heading_1':
      return `# ${richTextsToMarkdown(block.heading_1.rich_text)}`;
    case 'heading_2':
      return `## ${richTextsToMarkdown(block.heading_2.rich_text)}`;
    case 'heading_3':
      return `### ${richTextsToMarkdown(block.heading_3.rich_text)}`;
    case 'bulleted_list_item':
      return `- ${richTextsToMarkdown(block.bulleted_list_item.rich_text)}`;
    case 'numbered_list_item':
      return `1. ${richTextsToMarkdown(block.numbered_list_item.rich_text)}`;
    case 'to_do':
      return `- [${block.to_do.checked ? 'x' : ' '}] ${richTextsToMarkdown(block.to_do.rich_text)}`;
    case 'code':
      return `\`\`\`${block.code.language}\n${richTextsToMarkdown(block.code.rich_text)}\n\`\`\``;
    case 'divider':
      return `---`;
    case 'synced_block':
      if (block.children.length === 0) {
        throw new Error('Empty synced block.');
      }
      return '';
    case 'image':
      if (block.image.type === 'external') {
        return `![${richTextsToMarkdown(block.image.caption)}](${block.image.external.url})`;
      }

      if (saveImage) {
        const filePath = await downloadImage(block.image.file.url, block.id);
        return `![${richTextsToMarkdown(block.image.caption)}](${filePath})`;
      }
      return `![${richTextsToMarkdown(block.image.caption)}](${block.image.file.url})`;

    case 'toggle':
      return richTextsToMarkdown(block.toggle.rich_text);
    case 'file':
      return block.file.name;
    case 'table':
      return '';
    case 'audio':
    case 'bookmark':
    case 'breadcrumb':
    case 'child_database':
    case 'child_page':
    case 'column':
    case 'column_list':
    case 'embed':
    case 'link_preview':
    case 'link_to_page':
    case 'pdf':
    case 'table_of_contents':
    case 'table_row':
    case 'template':
    case 'unsupported':
    case 'video':
      throwNotSupportedError(block.type);
  }
}

function tableToMarkdown(block: Extract<BlockObjectResponseWithChildren, { type: 'table' }>) {
  const rowBlocks = block.children.filter((block) => 'type' in block && block.type === 'table_row');

  if (rowBlocks.length !== block.children.length) {
    throw new Error('Unexpected block in table');
  }

  const rows = rowBlocks.map((rowBlock) => {
    return rowBlock.table_row.cells.map((cell) => richTextsToMarkdown(cell));
  });

  return markdownTable(rows);
}

async function getChildrenText(block: BlockObjectResponseWithChildren, options?: OptionsType) {
  if ('type' in block && block.type === 'table') {
    return tableToMarkdown(block);
  }

  const isQuote = 'type' in block && (block.type === 'quote' || block.type === 'callout');

  const children: BlockObjectResponseWithChildren[] = (() => {
    if (isQuote) {
      const richText = block.type === 'quote' ? block.quote.rich_text : block.callout.rich_text;

      return richText.length > 0
        ? [
            {
              ...block,
              type: 'paragraph',
              paragraph: {
                rich_text: richText,
              },
              children: [],
            },
            ...block.children,
          ]
        : block.children;
    }
    return block.children;
  })();

  const childrenText = await blocksToMarkdown(children, options);

  const indentedChildrenText = childrenText
    .split('\n')
    .map((line) => {
      if ('type' in block && (block.type === 'toggle' || block.type === 'synced_block')) {
        return line;
      }
      return isQuote ? `> ${line}` : `  ${line}`;
    })
    .join('\n');

  return indentedChildrenText;
}

async function blockToMarkdown(
  block: BlockObjectResponseWithChildren,
  options?: OptionsType,
): Promise<string> {
  const parentText = await getParentText(block, options);
  const childrenText = await getChildrenText(block, options);

  return parentText + (parentText && childrenText ? '\n\n' : '') + childrenText;
}

export default async function blocksToMarkdown(
  blocks: BlockObjectResponseWithChildren[],
  options?: OptionsType,
) {
  return (await Promise.all(blocks.map((block) => blockToMarkdown(block, options)))).join('\n\n');
}
