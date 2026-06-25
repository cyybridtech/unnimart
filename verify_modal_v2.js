import { chromium } from '@playwright/test';

async function verify_modal() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 320, height: 700 }
  });
  const page = await context.newPage();

  let url = 'http://localhost:5173';
  try {
    await page.goto(url);
  } catch (e) {
    url = 'http://localhost:5174';
    await page.goto(url);
  }

  await page.click('button:has-text("Connect")');
  await page.waitForSelector('div.bg-slate-900.border-slate-800');

  // Take a screenshot of the modal to see where the logo is
  await page.screenshot({ path: 'screenshots/auth_modal_320px.png' });

  // Use a more direct click if possible
  const logo = page.locator('div.bg-indigo-600.p-2.sm\\:p-2\\.5').first();

  // Try to click with force or scroll into view
  for (let i = 0; i < 5; i++) {
    await logo.click({ force: true });
    await page.waitForTimeout(100);
  }

  await page.waitForSelector('text=Developer Test Suite');
  await page.screenshot({ path: 'screenshots/auth_modal_dev_320px.png' });
  console.log('Captured Auth Modal Dev Pane at 320px');

  await browser.close();
}

verify_modal().catch(err => {
  console.error(err);
  process.exit(1);
});
