import fs from 'fs';

import puppeteer from 'puppeteer-core';

import { getChromeExecutablePath } from './env';

export default async function generatePdfFromHtml(html: string, outputPath: string) {
  const browser = await puppeteer.launch({
    executablePath: getChromeExecutablePath(),
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.setContent(html);

  await Promise.all([
    page.waitForNetworkIdle(),
    page.evaluate(() => history.pushState(undefined, '', '#')),
  ]);

  await page.emulateMediaType('screen');
  const pdfContent = await page.pdf({
    printBackground: true,
    format: 'a4',
    margin: {
      top: '25mm',
      right: '25mm',
      bottom: '25mm',
      left: '25mm',
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%;">
      <span class="pageNumber"></span>
    </div>
    `,
  });

  await page.close();
  await browser.close();

  fs.writeFileSync(outputPath, pdfContent);
}
