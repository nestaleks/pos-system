const { test, expect } = require('@playwright/test');

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should adapt layout for tablet landscape (1024x768)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Main layout should be visible
    await expect(page.locator('.pos-layout')).toBeVisible();
    
    // Three-panel layout should be maintained
    await expect(page.locator('.order-panel')).toBeVisible();
    await expect(page.locator('.categories-panel')).toBeVisible();
    await expect(page.locator('.payment-panel')).toBeVisible();
    
    // Check panel widths
    const orderPanel = page.locator('.order-panel');
    const paymentPanel = page.locator('.payment-panel');
    
    const orderWidth = await orderPanel.evaluate(el => el.offsetWidth);
    const paymentWidth = await paymentPanel.evaluate(el => el.offsetWidth);
    
    // Order panel should be ~300px, payment panel ~280px
    expect(orderWidth).toBeCloseTo(300, 20);
    expect(paymentWidth).toBeCloseTo(280, 20);
    
    // Categories grid should adapt
    const categoriesGrid = page.locator('#categories-grid');
    await expect(categoriesGrid).toBeVisible();
    
    const gridColumns = await categoriesGrid.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns.split(' ').length;
    });
    
    // Should have appropriate number of columns for tablet
    expect(gridColumns).toBeGreaterThan(3);
  });

  test('should adapt layout for tablet portrait (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Layout should still be functional
    await expect(page.locator('.pos-layout')).toBeVisible();
    await expect(page.locator('.pos-main')).toBeVisible();
    
    // Panels should be visible but may be smaller
    await expect(page.locator('.order-panel')).toBeVisible();
    await expect(page.locator('.categories-panel')).toBeVisible();
    await expect(page.locator('.payment-panel')).toBeVisible();
    
    // Categories should still be in grid
    const categoriesGrid = page.locator('#categories-grid');
    await expect(categoriesGrid).toHaveCSS('display', 'grid');
    
    // Bottom navigation should be visible
    await expect(page.locator('.bottom-nav')).toBeVisible();
  });

  test('should handle small tablets (800x600)', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    
    // Core functionality should remain
    await expect(page.locator('.pos-layout')).toBeVisible();
    
    // Check if horizontal scrolling is needed
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflowX;
    });
    
    // Should not have horizontal scrolling
    expect(bodyOverflow).not.toBe('scroll');
    
    // Essential elements should be visible
    await expect(page.locator('.categories-panel')).toBeVisible();
    await expect(page.locator('.payment-panel')).toBeVisible();
  });

  test('should handle large desktop screens (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Layout should expand appropriately
    await expect(page.locator('.pos-layout')).toBeVisible();
    
    // Categories panel should have more space
    const categoriesPanel = page.locator('.categories-panel');
    const categoryWidth = await categoriesPanel.evaluate(el => el.offsetWidth);
    
    // Should be wider on large screens
    expect(categoryWidth).toBeGreaterThan(600);
    
    // Categories grid should have more columns
    const categoriesGrid = page.locator('#categories-grid');
    const gridColumns = await categoriesGrid.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns.split(' ').length;
    });
    
    expect(gridColumns).toBeGreaterThan(5);
  });

  test('should maintain button sizes across screen sizes', async ({ page }) => {
    const viewports = [
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1200, height: 800 },
      { width: 1440, height: 900 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Category buttons should maintain minimum touch size
      const categoryBtn = page.locator('.category-btn').first();
      const categoryBox = await categoryBtn.boundingBox();
      
      expect(categoryBox.height).toBeGreaterThanOrEqual(44); // WCAG minimum
      expect(categoryBox.width).toBeGreaterThanOrEqual(44);
      
      // Numpad buttons should maintain size
      const numBtn = page.locator('.num-btn').first();
      const numBox = await numBtn.boundingBox();
      
      expect(numBox.height).toBeGreaterThanOrEqual(44);
      expect(numBox.width).toBeGreaterThanOrEqual(44);
      
      // Payment buttons should be large enough
      const paymentBtn = page.locator('.payment-btn.cash');
      const paymentBox = await paymentBtn.boundingBox();
      
      expect(paymentBox.height).toBeGreaterThanOrEqual(48); // Larger for payment actions
    }
  });

  test('should handle zoom levels', async ({ page }) => {
    const zoomLevels = [0.8, 1.0, 1.2, 1.5];
    
    for (const zoomLevel of zoomLevels) {
      // Set zoom level
      await page.evaluate((zoom) => {
        document.body.style.zoom = zoom;
      }, zoomLevel);
      
      await page.waitForTimeout(300); // Let zoom settle
      
      // Layout should remain functional
      await expect(page.locator('.pos-layout')).toBeVisible();
      await expect(page.locator('.categories-panel')).toBeVisible();
      
      // Interactive elements should be clickable
      const categoryBtn = page.locator('.category-btn').first();
      await expect(categoryBtn).toBeVisible();
      
      // Test click functionality
      await categoryBtn.click();
      await expect(categoryBtn).toBeVisible();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '';
    });
  });

  test('should handle different aspect ratios', async ({ page }) => {
    const aspectRatios = [
      { width: 1024, height: 768 }, // 4:3
      { width: 1366, height: 768 }, // 16:9
      { width: 1440, height: 900 }, // 16:10
      { width: 800, height: 1280 }  // 5:8 (mobile-like)
    ];
    
    for (const ratio of aspectRatios) {
      await page.setViewportSize(ratio);
      
      // Core layout should adapt
      await expect(page.locator('.pos-main')).toBeVisible();
      
      // Check if all panels fit
      const posMain = page.locator('.pos-main');
      const mainBox = await posMain.boundingBox();
      
      // Should not overflow viewport
      expect(mainBox.width).toBeLessThanOrEqual(ratio.width + 10); // Small tolerance
      
      // Essential UI should be accessible
      await expect(page.locator('.categories-panel')).toBeVisible();
      await expect(page.locator('.payment-panel')).toBeVisible();
    }
  });

  test('should handle font size changes', async ({ page }) => {
    const fontSizes = ['12px', '14px', '16px', '18px', '20px'];
    
    for (const fontSize of fontSizes) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = size;
      }, fontSize);
      
      await page.waitForTimeout(200);
      
      // Layout should accommodate different font sizes
      await expect(page.locator('.pos-layout')).toBeVisible();
      
      // Text should be readable
      const categoryBtn = page.locator('.category-btn').first();
      await expect(categoryBtn).toBeVisible();
      
      // Buttons should still be functional
      await categoryBtn.click();
      await expect(categoryBtn).toBeVisible();
    }
    
    // Reset font size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
  });

  test('should maintain layout integrity during window resizing', async ({ page }) => {
    // Start with medium size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Simulate window resizing
    const sizes = [
      { width: 800, height: 600 },
      { width: 1400, height: 900 },
      { width: 1024, height: 768 },
      { width: 1600, height: 1000 }
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300); // Allow layout to settle
      
      // Check for layout breaks
      await expect(page.locator('.pos-layout')).toBeVisible();
      await expect(page.locator('.pos-main')).toBeVisible();
      
      // No elements should be completely off-screen
      const importantElements = [
        '.order-panel',
        '.categories-panel',
        '.payment-panel',
        '.bottom-nav'
      ];
      
      for (const selector of importantElements) {
        const element = page.locator(selector);
        await expect(element).toBeVisible();
        
        const box = await element.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle orientation changes on tablets', async ({ page }) => {
    // Test landscape to portrait transition
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.pos-layout')).toBeVisible();
    
    // Simulate orientation change
    await page.evaluate(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });
    
    // Change to portrait
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow orientation change to settle
    
    // Layout should adapt
    await expect(page.locator('.pos-layout')).toBeVisible();
    await expect(page.locator('.categories-panel')).toBeVisible();
    
    // Should still be functional
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.click();
    await expect(categoryBtn).toBeVisible();
    
    // Test back to landscape
    await page.evaluate(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.pos-layout')).toBeVisible();
  });
});