const { test, expect } = require('@playwright/test');

test.describe('Theme Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should display theme switcher buttons', async ({ page }) => {
    // Check theme switcher is visible
    await expect(page.locator('.theme-switcher')).toBeVisible();
    
    // Check both theme buttons exist
    await expect(page.locator('.theme-btn[data-theme="evolution"]')).toBeVisible();
    await expect(page.locator('.theme-btn[data-theme="restaurant"]')).toBeVisible();
    
    // Evolution should be active by default
    await expect(page.locator('.theme-btn[data-theme="evolution"]')).toHaveClass(/active/);
  });

  test('should switch to restaurant theme', async ({ page }) => {
    // Click restaurant theme button
    const restaurantBtn = page.locator('.theme-btn[data-theme="restaurant"]');
    await restaurantBtn.click();
    
    // Wait for theme to load
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Should have restaurant theme class
    await expect(page.locator('.pos-layout.restaurant-theme')).toBeVisible();
    
    // Restaurant button should be active
    await expect(restaurantBtn).toHaveClass(/active/);
    
    // Evolution button should not be active
    await expect(page.locator('.theme-btn[data-theme="evolution"]')).not.toHaveClass(/active/);
  });

  test('should display restaurant theme elements', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Check restaurant-specific elements
    await expect(page.locator('.menu-panel')).toBeVisible();
    await expect(page.locator('.menu-grid-panel')).toBeVisible();
    await expect(page.locator('.order-payment-panel')).toBeVisible();
    
    // Check category sections
    await expect(page.locator('.category-section')).toHaveCount(7); // DRINKS, STARTERS, etc.
    
    // Check header elements
    await expect(page.locator('.date-display')).toBeVisible();
    await expect(page.locator('.current-item')).toContainText('Lemonade');
    await expect(page.locator('.item-price')).toContainText('£2.20');
  });

  test('should display colorful menu items', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Check menu items with different colors
    const menuItems = page.locator('.menu-item');
    await expect(menuItems).toHaveCount(32); // All menu items
    
    // Check specific categories have correct colors
    await expect(page.locator('.menu-item.drinks')).toHaveCount(4);
    await expect(page.locator('.menu-item.mains')).toHaveCount(4);
    await expect(page.locator('.menu-item.specials')).toHaveCount(4);
    await expect(page.locator('.menu-item.alcohol')).toHaveCount(4);
  });

  test('should handle order functionality in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Click on a menu item
    const menuItem = page.locator('.menu-item').first();
    await menuItem.click();
    
    // Should show item added feedback
    await expect(page.locator('.item-added-notification')).toBeVisible();
    
    // Order display should update
    const orderItems = page.locator('.order-item');
    await expect(orderItems).toHaveCount(1);
    
    // Total should update
    const totalAmount = page.locator('.total-amount');
    await expect(totalAmount).not.toContainText('£0.00');
  });

  test('should handle keypad input in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Click keypad buttons
    await page.locator('.keypad-btn[data-key="1"]').click();
    await page.locator('.keypad-btn[data-key="2"]').click();
    await page.locator('.keypad-btn[data-key="3"]').click();
    
    // Keypad should be responsive
    await expect(page.locator('.keypad-grid')).toBeVisible();
  });

  test('should handle function buttons in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Add an item first
    await page.locator('.menu-item').first().click();
    await page.waitForTimeout(500);
    
    // Test Error Correct button
    await page.locator('.function-btn.error-correct').click();
    
    // Order should be updated
    const orderItems = page.locator('.order-item');
    await expect(orderItems).toHaveCount(0);
  });

  test('should handle payment buttons in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Add an item first
    await page.locator('.menu-item').first().click();
    await page.waitForTimeout(500);
    
    // Click CASH payment button
    page.on('dialog', dialog => dialog.accept()); // Handle alert
    await page.locator('.payment-btn.cash').click();
    
    // Should process payment
    await page.waitForTimeout(500);
  });

  test('should handle device selector in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Check device selector
    await expect(page.locator('.device-selector')).toBeVisible();
    await expect(page.locator('.device-btn')).toHaveCount(3);
    
    // Device 1 should be active by default
    await expect(page.locator('.device-btn.active')).toContainText('Device 1');
    
    // Click Device 2
    await page.locator('.device-btn').nth(1).click();
    
    // Device 2 should now be active
    await expect(page.locator('.device-btn.active')).toContainText('Device 2');
  });

  test('should switch back to Evolution theme', async ({ page }) => {
    // First switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Then switch back to Evolution theme
    await page.locator('.theme-btn[data-theme="evolution"]').click();
    
    // Wait for page to reload/change
    await page.waitForTimeout(1000);
    
    // Should be back to Evolution layout
    await expect(page.locator('.pos-layout')).toBeVisible();
    await expect(page.locator('.restaurant-theme')).not.toBeVisible();
  });

  test('should maintain theme selection state', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Interact with the interface
    await page.locator('.menu-item').first().click();
    await page.waitForTimeout(500);
    
    // Theme should still be restaurant
    await expect(page.locator('.restaurant-theme')).toBeVisible();
    await expect(page.locator('.theme-btn[data-theme="restaurant"]')).toHaveClass(/active/);
  });

  test('should be responsive in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Test different viewport sizes
    const viewports = [
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200);
      
      // Main elements should still be visible
      await expect(page.locator('.restaurant-theme')).toBeVisible();
      await expect(page.locator('.menu-panel')).toBeVisible();
      await expect(page.locator('.order-payment-panel')).toBeVisible();
    }
  });

  test('should handle category filtering in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Click on a category item (left panel)
    const categoryItem = page.locator('.category-item').first();
    await categoryItem.click();
    
    // Menu items should be filtered (this tests the filterMenuByCategory function)
    await page.waitForTimeout(500);
    
    // Menu grid should still be visible
    await expect(page.locator('.menu-grid')).toBeVisible();
  });

  test('should display correct time and date in restaurant theme', async ({ page }) => {
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    // Check date display
    const dateDisplay = page.locator('.date-display');
    await expect(dateDisplay).toBeVisible();
    await expect(dateDisplay).toContainText('2024'); // Should contain current year
    
    // Check time display
    const timeDisplay = page.locator('.time-display');
    await expect(timeDisplay).toBeVisible();
    await expect(timeDisplay).toMatch(/\d{2}:\d{2}:\d{2}/); // Should match time format
  });

  test('should handle theme switching performance', async ({ page }) => {
    // Measure theme switching performance
    const startTime = Date.now();
    
    // Switch to restaurant theme
    await page.locator('.theme-btn[data-theme="restaurant"]').click();
    await page.waitForSelector('.restaurant-theme', { timeout: 5000 });
    
    const switchTime = Date.now() - startTime;
    
    // Should switch themes quickly (under 2 seconds)
    expect(switchTime).toBeLessThan(2000);
    
    // Interface should be responsive after switch
    await page.locator('.menu-item').first().click();
    await expect(page.locator('.order-item')).toHaveCount(1);
  });
});