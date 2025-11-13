const { test, expect } = require('@playwright/test');

test.describe('POS Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should display main POS layout components', async ({ page }) => {
    // Check header components
    await expect(page.locator('.pos-header')).toBeVisible();
    await expect(page.locator('.promotion-banner')).toBeVisible();
    await expect(page.locator('.promo-text')).toContainText('Buy 2 Valley milk packs');
    
    // Check tab buttons
    await expect(page.locator('.tab-btn')).toHaveCount(3);
    await expect(page.locator('.tab-btn.active')).toContainText('Scale');
    
    // Check search button
    await expect(page.locator('.search-btn')).toBeVisible();
  });

  test('should display three main panels', async ({ page }) => {
    // Order panel (left)
    await expect(page.locator('.order-panel')).toBeVisible();
    await expect(page.locator('.order-items')).toBeVisible();
    await expect(page.locator('.order-summary')).toBeVisible();
    
    // Categories panel (center)
    await expect(page.locator('.categories-panel')).toBeVisible();
    await expect(page.locator('#categories-grid')).toBeVisible();
    
    // Payment panel (right)
    await expect(page.locator('.payment-panel')).toBeVisible();
    await expect(page.locator('.price-display')).toBeVisible();
    await expect(page.locator('.numpad-grid')).toBeVisible();
  });

  test('should display order items correctly', async ({ page }) => {
    // Check if sample order items are displayed
    const orderItems = page.locator('.order-item');
    await expect(orderItems).toHaveCount(5);
    
    // Check specific items
    await expect(page.locator('.order-item').first()).toContainText('Tequila El Tesoro Platinum');
    await expect(page.locator('.order-item').first()).toContainText('$30.00');
    
    // Check item with quantity
    const gladeItem = page.locator('.order-item').nth(2);
    await expect(gladeItem).toContainText('Glade Clean Linen');
    await expect(gladeItem).toContainText('2 @ 2.00');
  });

  test('should display order summary correctly', async ({ page }) => {
    const summary = page.locator('.order-summary');
    
    // Check summary rows
    await expect(summary.locator('.summary-row').first()).toContainText('Sub Total');
    await expect(summary.locator('.summary-row.discount')).toContainText('Discount / Savings');
    await expect(summary.locator('.summary-row.total')).toContainText('Total:');
    
    // Check action buttons
    await expect(page.locator('.action-btn.cancel')).toContainText('Cancel');
    await expect(page.locator('.action-btn.hold')).toContainText('Hold');
  });

  test('should display bottom navigation', async ({ page }) => {
    // Check user info
    await expect(page.locator('.user-info')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('Johny Wallenstein');
    await expect(page.locator('.logout-btn')).toContainText('Logout');
    
    // Check navigation buttons
    const navButtons = page.locator('.nav-btn');
    await expect(navButtons).toHaveCount(5);
    await expect(navButtons.first()).toContainText('Home');
    
    // Check brand buttons
    const brandButtons = page.locator('.brand-btn');
    await expect(brandButtons).toHaveCount(3);
    await expect(brandButtons.last()).toContainText('BOSS REVOLUTION');
  });

  test('should be responsive to different screen sizes', async ({ page }) => {
    // Test tablet size
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.pos-layout')).toBeVisible();
    
    // Test smaller tablet
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('.pos-main')).toBeVisible();
    
    // Categories should still be in grid
    const categoriesGrid = page.locator('#categories-grid');
    await expect(categoriesGrid).toHaveCSS('display', 'grid');
  });

  test('should handle promotional banner navigation', async ({ page }) => {
    const prevArrow = page.locator('.nav-arrow.prev');
    const nextArrow = page.locator('.nav-arrow.next');
    
    await expect(prevArrow).toBeVisible();
    await expect(nextArrow).toBeVisible();
    
    // Test clicking navigation arrows
    await prevArrow.click();
    await nextArrow.click();
    
    // Should not cause layout issues
    await expect(page.locator('.promotion-banner')).toBeVisible();
  });

  test('should display price correctly in payment panel', async ({ page }) => {
    const priceDisplay = page.locator('.price-display');
    await expect(priceDisplay).toBeVisible();
    
    const currentPrice = page.locator('.current-price');
    await expect(currentPrice).toContainText('$6.95');
    
    // Check SKU button
    await expect(page.locator('.sku-btn')).toContainText('SKU');
    
    // Check clear button
    await expect(page.locator('.clear-price')).toBeVisible();
  });
});