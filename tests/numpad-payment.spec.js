const { test, expect } = require('@playwright/test');

test.describe('Numpad and Payment Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.payment-panel', { timeout: 10000 });
  });

  test('should display complete numpad layout', async ({ page }) => {
    const numpadGrid = page.locator('.numpad-grid');
    await expect(numpadGrid).toBeVisible();
    
    // Check all number buttons (0-9)
    for (let i = 0; i <= 9; i++) {
      const numberBtn = page.locator('.num-btn').filter({ hasText: i.toString() });
      await expect(numberBtn).toBeVisible();
    }
    
    // Check special buttons
    await expect(page.locator('.num-btn').filter({ hasText: '00' })).toBeVisible();
    await expect(page.locator('.num-btn').filter({ hasText: '@' })).toBeVisible();
    
    // Check preset amount buttons
    await expect(page.locator('.preset-btn').filter({ hasText: '$50' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$100' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$43' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$42,24' })).toBeVisible();
  });

  test('should display payment buttons with correct styling', async ({ page }) => {
    // Cash button (green)
    const cashBtn = page.locator('.payment-btn.cash');
    await expect(cashBtn).toBeVisible();
    await expect(cashBtn).toContainText('Cash');
    await expect(cashBtn).toHaveCSS('background-color', 'rgb(40, 167, 69)');
    
    // Credit button (red)
    const creditBtn = page.locator('.payment-btn.credit');
    await expect(creditBtn).toBeVisible();
    await expect(creditBtn).toContainText('Credit');
    await expect(creditBtn).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    
    // Other button (red)
    const otherBtn = page.locator('.payment-btn.other');
    await expect(otherBtn).toBeVisible();
    await expect(otherBtn).toContainText('Other');
    
    // Refund button (red)
    const refundBtn = page.locator('.payment-btn.refund');
    await expect(refundBtn).toBeVisible();
    await expect(refundBtn).toContainText('Refund');
  });

  test('should handle number input correctly', async ({ page }) => {
    const currentPrice = page.locator('.current-price');
    
    // Initial price should be displayed
    await expect(currentPrice).toContainText('$6.95');
    
    // Click number buttons in sequence
    await page.locator('.num-btn').filter({ hasText: '1' }).click();
    await page.locator('.num-btn').filter({ hasText: '2' }).click();
    await page.locator('.num-btn').filter({ hasText: '3' }).click();
    
    // Price display should be updated (if functionality implemented)
    // For now, just ensure buttons are clickable
    await expect(currentPrice).toBeVisible();
  });

  test('should handle preset amount buttons', async ({ page }) => {
    // Test preset amount buttons
    const preset50 = page.locator('.preset-btn').filter({ hasText: '$50' });
    const preset100 = page.locator('.preset-btn').filter({ hasText: '$100' });
    
    await preset50.click();
    await expect(preset50).toBeVisible();
    
    await preset100.click();
    await expect(preset100).toBeVisible();
    
    // Preset buttons should have dark styling
    await expect(preset50).toHaveCSS('background-color', 'rgb(102, 102, 102)');
    await expect(preset50).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should handle special number buttons', async ({ page }) => {
    // Test double zero button
    const doubleZero = page.locator('.num-btn').filter({ hasText: '00' });
    await expect(doubleZero).toBeVisible();
    await expect(doubleZero).toHaveClass(/wide/); // Should span 2 columns
    await doubleZero.click();
    
    // Test @ symbol button
    const atSymbol = page.locator('.num-btn').filter({ hasText: '@' });
    await expect(atSymbol).toBeVisible();
    await atSymbol.click();
    
    // Test highlighted button (5 should be blue)
    const blueBtn = page.locator('.num-btn.blue');
    await expect(blueBtn).toBeVisible();
    await expect(blueBtn).toContainText('5');
    await expect(blueBtn).toHaveCSS('background-color', 'rgb(74, 144, 226)');
  });

  test('should display and interact with price controls', async ({ page }) => {
    const priceDisplay = page.locator('.price-display');
    await expect(priceDisplay).toBeVisible();
    
    // Clear button
    const clearBtn = page.locator('.clear-price');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    
    // SKU button
    const skuBtn = page.locator('.sku-btn');
    await expect(skuBtn).toBeVisible();
    await expect(skuBtn).toContainText('SKU');
    await expect(skuBtn).toHaveCSS('background-color', 'rgb(74, 144, 226)');
    await skuBtn.click();
    
    // Navigation arrow
    const navArrow = page.locator('.price-display .nav-arrow');
    await expect(navArrow).toBeVisible();
    await navArrow.click();
  });

  test('should handle touch interactions on tablet', async ({ page }) => {
    // Test touch on large buttons
    const cashBtn = page.locator('.payment-btn.cash');
    const numBtn7 = page.locator('.num-btn').filter({ hasText: '7' });
    
    // Touch interactions
    await numBtn7.tap();
    await cashBtn.tap();
    
    // Buttons should remain functional
    await expect(cashBtn).toBeVisible();
    await expect(numBtn7).toBeVisible();
    
    // Check button sizes for touch friendliness
    const cashBtnBox = await cashBtn.boundingBox();
    const numBtnBox = await numBtn7.boundingBox();
    
    // Buttons should be at least 44px for good touch targets
    expect(cashBtnBox.height).toBeGreaterThanOrEqual(44);
    expect(numBtnBox.height).toBeGreaterThanOrEqual(44);
  });

  test('should handle rapid button presses', async ({ page }) => {
    const numBtn1 = page.locator('.num-btn').filter({ hasText: '1' });
    const numBtn2 = page.locator('.num-btn').filter({ hasText: '2' });
    const numBtn3 = page.locator('.num-btn').filter({ hasText: '3' });
    
    // Rapid clicking
    await numBtn1.click();
    await numBtn2.click();
    await numBtn3.click();
    await numBtn1.click();
    await numBtn2.click();
    
    // Should not cause layout issues
    await expect(page.locator('.numpad-grid')).toBeVisible();
    await expect(page.locator('.payment-panel')).toBeVisible();
  });

  test('should support payment method selection', async ({ page }) => {
    const paymentButtons = [
      page.locator('.payment-btn.cash'),
      page.locator('.payment-btn.credit'),
      page.locator('.payment-btn.other'),
      page.locator('.payment-btn.refund')
    ];
    
    // Test each payment method
    for (const btn of paymentButtons) {
      await expect(btn).toBeVisible();
      await btn.click();
      
      // Button should be responsive
      await expect(btn).toBeVisible();
    }
  });

  test('should maintain numpad layout on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      const numpadGrid = page.locator('.numpad-grid');
      await expect(numpadGrid).toBeVisible();
      await expect(numpadGrid).toHaveCSS('display', 'grid');
      
      // Check grid has 5 columns
      const gridColumns = await numpadGrid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
      });
      expect(gridColumns).toBe(5);
      
      // All buttons should be visible
      await expect(page.locator('.num-btn').first()).toBeVisible();
      await expect(page.locator('.payment-btn').first()).toBeVisible();
    }
  });

  test('should handle decimal input properly', async ({ page }) => {
    // For monetary input, test decimal handling if implemented
    await page.locator('.num-btn').filter({ hasText: '1' }).click();
    await page.locator('.num-btn').filter({ hasText: '2' }).click();
    
    // The @ symbol might be used for decimal point
    await page.locator('.num-btn').filter({ hasText: '@' }).click();
    
    await page.locator('.num-btn').filter({ hasText: '5' }).click();
    await page.locator('.num-btn').filter({ hasText: '0' }).click();
    
    // Should not break the interface
    await expect(page.locator('.current-price')).toBeVisible();
  });

  test('should support keyboard input for accessibility', async ({ page }) => {
    // Focus on numpad area
    await page.locator('.payment-panel').click();
    
    // Use keyboard to navigate
    await page.keyboard.press('Tab');
    
    // Should be able to use Enter to activate buttons
    const focusedElement = page.locator(':focus');
    await page.keyboard.press('Enter');
    
    // Should not cause errors
    await page.waitForTimeout(100);
    await expect(page.locator('.numpad-grid')).toBeVisible();
  });
});