import prettier from 'prettier';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export default async function markdownToHtml(
  markdown: string,
  options: { fontSize?: number } = {},
) {
  const { fontSize = 16 } = options;

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkGfm)
    .use(remarkMath)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .use(rehypeKatex)
    .process(markdown);
  const body = file.toString();
  const html = `
<html>
	<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js" integrity="sha384-Rma6DA2IPUwhNxmrB/7S3Tno0YY7sFu9WSYMCuulLhIqYSGZ2gKCJWIqhBWqMQfh" crossorigin="anonymous"></script>
    <style>
      body {
        font-family: sans-serif;
        font-size: ${fontSize}px;
        line-height: 2;
      }
      table {
        border: 1px solid #ccc;
        border-collapse: collapse;
      }
      thead {
        background-color: #f9f9f9;
      }
      tr {
        page-break-inside: avoid;
      }
      th, td {
        padding: 0.5em;
        border: 1px solid #ccc;
      }
      blockquote {
        border-left: 4px solid #ccc;
        padding-left: 1em;
        padding: 0.5em;
        background-color: #f9f9f9;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
	<body>
    ${body}
	</body>
</html>
`;
  const formatted = prettier.format(html, { parser: 'html' });
  return formatted;
}
