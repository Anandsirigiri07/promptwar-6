import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function testRecord() {
  const recordingsDir = path.resolve('demo_video/test_recordings');
  fs.mkdirSync(recordingsDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Close context to finish writing the video file
  await context.close();
  await browser.close();

  const files = fs.readdirSync(recordingsDir);
  console.log('Recorded files in directory:', files);
}

testRecord().catch(console.error);
