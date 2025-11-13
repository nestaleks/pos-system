const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');
  await page.waitForSelector('.pos-layout', { timeout: 10000 });
  
  // Take screenshot
  await page.screenshot({ path: 'current-state.png', fullPage: true });
  
  // Check order items
  const orderItems = await page.locator('.order-item').count();
  console.log('Order items found:', orderItems);
  
  const orderPanelHTML = await page.locator('.order-panel').innerHTML();
  console.log('Order panel HTML:', orderPanelHTML.substring(0, 500) + '...');
  
  await browser.close();
})();