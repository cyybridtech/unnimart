import { chromium, expect } from '@playwright/test';
import { readFileSync } from 'fs';

async function verify_dashboards() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 320, height: 700 }
  });
  const page = await context.newPage();

  // Try ports 5173 then 5174
  let url = 'http://localhost:5173';
  try {
    await page.goto(url);
  } catch (e) {
    url = 'http://localhost:5174';
    await page.goto(url);
  }

  console.log(`Using URL: ${url}`);

  // 1. Marketplace Mobile Screenshot
  await page.screenshot({ path: 'screenshots/v3_marketplace_320px.png' });
  console.log('Captured Marketplace at 320px');

  // 2. Open Auth Modal and Login as Seller (sarah_bags)
  await page.click('button:has-text("Connect")');
  await page.waitForSelector('div.bg-slate-900.border-slate-800'); // Modal check

  // Click logo 5 times to show dev pane
  const logo = page.locator('div.bg-indigo-600.p-2.sm\\:p-2\\.5').first();
  for (let i = 0; i < 5; i++) {
    await logo.click();
  }

  await page.waitForSelector('text=Developer Test Suite');

  // Login as sarah_bags (Seller)
  await page.click('button:has-text("sarah_bags")');
  console.log('Logged in as sarah_bags');

  // Wait for Seller Hub to be active or switch to it
  // On mobile, the "Seller" button is in the bottom nav
  const sellerNav = page.locator('div.md\\:hidden.fixed.bottom-0').locator('button').filter({ hasText: 'Seller' });
  await sellerNav.click();

  await page.waitForTimeout(1000); // Wait for transition
  await page.screenshot({ path: 'screenshots/v3_seller_dashboard_320px.png', fullPage: true });
  console.log('Captured Seller Dashboard at 320px');

  // 3. Switch to Buyer Dashboard
  const meNav = page.locator('div.md\\:hidden.fixed.bottom-0').locator('button').filter({ hasText: 'Me' });
  // Buyer login might be needed if sarah_bags isn't a buyer?
  // sarah_bags role is 'seller'. Let's logout and login as jordan_buyer.

  // Logout: Open role dropdown in header
  await page.click('button:has-text("S")'); // sarah_bags initials on mobile
  await page.click('button:has-text("Log Out")');
  console.log('Logged out');

  // Login as jordan_buyer
  await page.click('button:has-text("Connect")');
  // Dev pane should still be active if page didn't reload, but let's be safe
  try {
    await page.waitForSelector('text=Developer Test Suite', { timeout: 2000 });
  } catch (e) {
    for (let i = 0; i < 5; i++) {
      await logo.click();
    }
  }
  await page.click('button:has-text("jordan_buyer")');
  console.log('Logged in as jordan_buyer');

  // Navigate to "Me"
  await page.locator('div.md\\:hidden.fixed.bottom-0').locator('button').filter({ hasText: 'Me' }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/v3_buyer_dashboard_320px.png', fullPage: true });
  console.log('Captured Buyer Dashboard at 320px');

  await browser.close();
}

verify_dashboards().catch(err => {
  console.error(err);
  process.exit(1);
});
