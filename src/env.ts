import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function getAuthToken() {
  const token = process.env.NOTION_AUTH_TOKEN;

  if (!token) {
    console.error('NOTION_AUTH_TOKEN is required');
    process.exit(1);
  }
  return token;
}

export function getChromeExecutablePath() {
  const path = process.env.CHROME_EXECUTABLE_PATH;

  if (!path) {
    console.error('CHROME_EXECUTABLE_PATH is required');
    process.exit(1);
  }
  return path;
}
