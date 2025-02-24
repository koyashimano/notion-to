import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default function getAuthToken() {
  const token = process.env.NOTION_AUTH_TOKEN;

  if (!token) {
    console.error('NOTION_AUTH_TOKEN is required');
    process.exit(1);
  }
  return token;
}
