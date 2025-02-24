import {
  MentionRichTextItemResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { AnnotationResponse } from './types';
import { getNotionPageUrl } from './utils';

function annotate(text: string, annotation: AnnotationResponse) {
  let annotated = text;

  if (annotation.code) {
    annotated = `\`${annotated}\``;
  }

  if (annotation.bold) {
    annotated = `**${annotated}**`;
  }

  if (annotation.italic) {
    annotated = `*${annotated}*`;
  }

  if (annotation.strikethrough) {
    annotated = `~~${annotated}~~`;
  }

  return annotated;
}

function mentionToMarkdown(mention: MentionRichTextItemResponse['mention']) {
  switch (mention.type) {
    case 'user':
      if ('name' in mention.user) {
        return `@${mention.user.name}`;
      }
      return `@${mention.user.id}`;
    case 'page':
      return getNotionPageUrl(mention.page.id);
    case 'database':
      return getNotionPageUrl(mention.database.id);
    case 'link_mention':
      return mention.link_mention.href;
    case 'link_preview':
      return mention.link_preview.url;
    case 'template_mention':
      return mention.template_mention.type === 'template_mention_date'
        ? `@${mention.template_mention.template_mention_date}`
        : `@${mention.template_mention.template_mention_user}`;
    case 'date':
      return mention.date.start + (mention.date.end ? ` ~ ${mention.date.end}` : '');
    case 'custom_emoji':
      return `(${mention.custom_emoji.name})`;
  }
}

function addLink(content: string, href?: string | null) {
  if (!href) {
    return content;
  }

  if (href.startsWith('/')) {
    return `[${content}](https://www.notion.so${href})`;
  }
  return `[${content}](${href})`;
}

function richTextToMarkdown(richText: RichTextItemResponse) {
  const content = (() => {
    switch (richText.type) {
      case 'text':
        return annotate(richText.text.content, richText.annotations);
      case 'mention':
        return annotate(mentionToMarkdown(richText.mention), richText.annotations);
      case 'equation':
        return `$${richText.equation.expression}$`;
    }
  })();

  return addLink(content, richText.href);
}

export default function richTextsToMarkdown(richTexts: RichTextItemResponse[]) {
  return richTexts.map(richTextToMarkdown).join('');
}
