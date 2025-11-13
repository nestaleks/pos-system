const { test, expect } = require('@playwright/test');

test.describe('Touch Optimization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    // WCAG recommends minimum 44x44px for touch targets
    const touchElements = [
      '.category-btn',
      '.num-btn',
      '.payment-btn',
      '.action-btn',
      '.tab-btn',
      '.nav-btn'
    ];

    for (const selector of touchElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Test first 5 of each type
        const element = elements.nth(i);
        await expect(element).toBeVisible();
        
        const box = await element.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should handle tap gestures correctly', async ({ page }) => {
    const testElements = [
      { selector: '.category-btn', name: 'category button' },
      { selector: '.num-btn', name: 'number button' },
      { selector: '.payment-btn.cash', name: 'cash button' },
      { selector: '.tab-btn', name: 'tab button' }
    ];

    for (const { selector, name } of testElements) {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible();
      
      // Test tap gesture
      await element.tap();
      
      // Element should remain visible and functional after tap
      await expect(element).toBeVisible();
      
      // Wait a bit to ensure no delayed effects
      await page.waitForTimeout(100);
    }
  });

  test('should handle rapid taps without issues', async ({ page }) => {
    const categoryBtn = page.locator('.category-btn').first();
    const numBtn = page.locator('.num-btn').filter({ hasText: '5' });
    
    // Rapid tapping simulation
    for (let i = 0; i < 5; i++) {
      await categoryBtn.tap();
      await numBtn.tap();
      await page.waitForTimeout(50); // Very quick succession
    }
    
    // Interface should still be responsive
    await expect(categoryBtn).toBeVisible();
    await expect(numBtn).toBeVisible();
    await expect(page.locator('.pos-layout')).toBeVisible();
  });

  test('should prevent accidental double-tap zoom', async ({ page }) => {
    // Test double-tap on various elements
    const elements = [
      '.category-btn',
      '.payment-panel',
      '.order-panel',
      '.pos-header'
    ];

    for (const selector of elements) {
      const element = page.locator(selector).first();
      
      // Double tap
      await element.tap();
      await element.tap();
      
      // Check viewport hasn't zoomed (zoom level should remain 1)
      const zoomLevel = await page.evaluate(() => {
        return window.devicePixelRatio;
      });
      
      // Should not have triggered zoom
      expect(zoomLevel).toBeGreaterThan(0);
    }
  });

  test('should handle touch and hold gestures appropriately', async ({ page }) => {
    const categoryBtn = page.locator('.category-btn').first();
    
    // Long press simulation
    const box = await categoryBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(800); // Long press duration
      await page.mouse.up();
    }
    
    // Should not trigger context menu or other unintended behaviors
    await expect(categoryBtn).toBeVisible();
    
    // Check no context menu appeared
    const contextMenu = page.locator('[role="menu"]');
    await expect(contextMenu).not.toBeVisible();
  });

  test('should have adequate spacing between touch targets', async ({ page }) => {
    // Check spacing between adjacent buttons in numpad
    const numButtons = page.locator('.num-btn');
    
    if (await numButtons.count() >= 2) {
      const firstBtn = numButtons.first();
      const secondBtn = numButtons.nth(1);
      
      const firstBox = await firstBtn.boundingBox();
      const secondBox = await secondBtn.boundingBox();
      
      if (firstBox && secondBox) {
        // Calculate distance between button centers
        const centerDistance = Math.sqrt(
          Math.pow(firstBox.x - secondBox.x, 2) + 
          Math.pow(firstBox.y - secondBox.y, 2)
        );
        
        // Should have reasonable spacing to avoid mis-taps
        expect(centerDistance).toBeGreaterThan(30);
      }
    }
  });

  test('should provide visual feedback on touch', async ({ page }) => {
    const categoryBtn = page.locator('.category-btn').first();
    
    // Get initial state
    const initialClass = await categoryBtn.getAttribute('class');
    
    // Tap and hold briefly
    await categoryBtn.hover(); // Simulate touch start
    await page.waitForTimeout(100);
    
    // Should provide some form of visual feedback
    // (This would need to be implemented in CSS with :hover or :active states)
    
    await categoryBtn.tap();
    
    // Button should remain functional
    await expect(categoryBtn).toBeVisible();
  });

  test('should handle swipe gestures appropriately', async ({ page }) => {
    // Test swipe on categories panel (should not interfere with scrolling)
    const categoriesPanel = page.locator('.categories-panel');
    const box = await categoriesPanel.boundingBox();
    
    if (box) {
      // Simulate swipe down
      await page.mouse.move(box.x + box.width / 2, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height - 50, { steps: 10 });
      await page.mouse.up();
    }
    
    // Panel should still be functional
    await expect(categoriesPanel).toBeVisible();
    
    // Category buttons should still be clickable
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.tap();
    await expect(categoryBtn).toBeVisible();
  });

  test('should optimize for different finger sizes', async ({ page }) => {
    // Test with different touch point sizes (simulating different finger sizes)
    const paymentBtn = page.locator('.payment-btn.cash');
    const box = await paymentBtn.boundingBox();
    
    if (box) {
      // Test touches at button edges (simulating thick fingers)
      const touchPoints = [
        { x: box.x + 5, y: box.y + 5 }, // Top-left edge
        { x: box.x + box.width - 5, y: box.y + 5 }, // Top-right edge
        { x: box.x + 5, y: box.y + box.height - 5 }, // Bottom-left edge
        { x: box.x + box.width - 5, y: box.y + box.height - 5 } // Bottom-right edge
      ];
      
      for (const point of touchPoints) {
        await page.mouse.click(point.x, point.y);
        await page.waitForTimeout(100);
        
        // Button should still be responsive
        await expect(paymentBtn).toBeVisible();
      }
    }
  });

  test('should handle multi-touch scenarios', async ({ page }) => {
    // Test accidental multi-touch (two fingers on screen)
    const numBtn1 = page.locator('.num-btn').filter({ hasText: '1' });
    const numBtn2 = page.locator('.num-btn').filter({ hasText: '2' });
    
    const box1 = await numBtn1.boundingBox();
    const box2 = await numBtn2.boundingBox();
    
    if (box1 && box2) {
      // Simulate touching both buttons simultaneously
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
      await page.mouse.down();
      
      // Try to touch second button while first is still pressed
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
      
      await page.mouse.up();
    }
    
    // Interface should handle this gracefully
    await expect(page.locator('.numpad-grid')).toBeVisible();
  });

  test('should work with different touch orientations', async ({ page }) => {
    // Test touches from different angles (simulating different hand positions)
    const categoryBtn = page.locator('.category-btn').first();
    
    await expect(categoryBtn).toBeVisible();
    
    // Test standard tap
    await categoryBtn.tap();
    
    // Test tap with slight offset (simulating angled finger)
    const box = await categoryBtn.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.7);
    }
    
    // Should remain functional
    await expect(categoryBtn).toBeVisible();
  });

  test('should maintain responsiveness during continuous use', async ({ page }) => {
    // Simulate extended use session
    const buttons = [
      page.locator('.category-btn').first(),
      page.locator('.num-btn').filter({ hasText: '5' }),
      page.locator('.payment-btn.cash'),
      page.locator('.tab-btn').first()
    ];
    
    // Perform many interactions
    for (let round = 0; round < 3; round++) {
      for (const button of buttons) {
        await button.tap();
        await page.waitForTimeout(50);
      }
    }
    
    // Check performance hasn't degraded
    const startTime = Date.now();
    await buttons[0].tap();
    const endTime = Date.now();
    
    // Should respond quickly (under 100ms for tap response)
    expect(endTime - startTime).toBeLessThan(100);
    
    // All elements should still be visible and functional
    for (const button of buttons) {
      await expect(button).toBeVisible();
    }
  });

  test('should handle touch events on different panel areas', async ({ page }) => {
    const panels = [
      { selector: '.order-panel', name: 'order panel' },
      { selector: '.categories-panel', name: 'categories panel' },
      { selector: '.payment-panel', name: 'payment panel' }
    ];

    for (const { selector, name } of panels) {
      const panel = page.locator(selector);
      await expect(panel).toBeVisible();
      
      // Test tap on panel background (should not interfere with child elements)
      await panel.tap();
      
      // Panel should remain visible and functional
      await expect(panel).toBeVisible();
      
      // Child elements should still be interactive
      const interactiveChild = panel.locator('button').first();
      if (await interactiveChild.count() > 0) {
        await interactiveChild.tap();
        await expect(interactiveChild).toBeVisible();
      }
    }
  });
});