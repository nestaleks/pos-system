// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Input Fields Comprehensive Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should test all text input fields across the application', async ({ page }) => {
    // Test search input in products screen
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], .search-input input');
    await expect(searchInput).toBeVisible();
    
    // Test basic text input
    await searchInput.fill('coffee');
    await expect(searchInput).toHaveValue('coffee');
    
    // Test clearing
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
    
    // Test typing with keyboard events
    await searchInput.type('bread', { delay: 50 });
    await expect(searchInput).toHaveValue('bread');
  });

  test('should test numeric input in payment numpad', async ({ page }) => {
    // Setup: Add product to cart
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    // Go to payment
    await page.click('.back-btn');
    await page.click('[data-item-id="payment"]');
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad');
    
    // Test numpad display input
    const numpadDisplay = page.locator('.numpad-display input, .numpad-input');
    
    if (await numpadDisplay.count() > 0) {
      await expect(numpadDisplay).toBeVisible();
      
      // Test direct input
      await numpadDisplay.click();
      await numpadDisplay.fill('25.50');
      await expect(numpadDisplay).toHaveValue('25.50');
      
      // Test keyboard input
      await numpadDisplay.clear();
      await numpadDisplay.type('123.45');
      await expect(numpadDisplay).toHaveValue('123.45');
      
      // Test number validation
      await numpadDisplay.clear();
      await numpadDisplay.type('abc123');
      const value = await numpadDisplay.inputValue();
      // Should filter out non-numeric characters or handle gracefully
      console.log('Value after typing letters and numbers:', value);
    }
  });

  test('should test input validation and error handling', async ({ page }) => {
    // Test search input validation
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test very long input
    const longText = 'a'.repeat(1000);
    await searchInput.fill(longText);
    const actualValue = await searchInput.inputValue();
    
    console.log('Long input handling - Length:', actualValue.length);
    
    // Test special characters
    await searchInput.clear();
    await searchInput.fill('!@#$%^&*()_+-={}[]|\\:";\'<>?,./"');
    const specialCharsValue = await searchInput.inputValue();
    
    console.log('Special characters handling:', specialCharsValue);
  });

  test('should test input focus and blur events', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test focus
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    // Test that focused input receives keyboard events
    await page.keyboard.type('focus test');
    await expect(searchInput).toHaveValue('focus test');
    
    // Test blur
    await searchInput.blur();
    // Focus should be removed (though this might be hard to test directly)
    
    // Test clicking to focus again
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test('should test input accessibility features', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Check for accessibility attributes
    const ariaLabel = await searchInput.getAttribute('aria-label');
    const placeholder = await searchInput.getAttribute('placeholder');
    const role = await searchInput.getAttribute('role');
    
    console.log('Accessibility attributes:', { ariaLabel, placeholder, role });
    
    // Should have some form of label or placeholder
    expect(ariaLabel || placeholder).toBeTruthy();
    
    // Test keyboard navigation to input
    await page.keyboard.press('Tab');
    // Should eventually reach the input field
  });

  test('should test input performance with rapid typing', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test rapid typing
    const rapidText = 'rapid typing test';
    await searchInput.click();
    
    // Type very quickly
    for (const char of rapidText) {
      await page.keyboard.type(char, { delay: 10 });
    }
    
    await expect(searchInput).toHaveValue(rapidText);
  });

  test('should test input with different character sets', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test Unicode characters
    const unicodeText = '测试 тест 🍕 café naïve';
    await searchInput.fill(unicodeText);
    await expect(searchInput).toHaveValue(unicodeText);
    
    // Test emoji
    await searchInput.clear();
    await searchInput.fill('🍞🥐🥖');
    await expect(searchInput).toHaveValue('🍞🥐🥖');
  });

  test('should test input copy and paste functionality', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Type some text
    await searchInput.fill('copy paste test');
    
    // Select all and copy
    await searchInput.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    // Clear and paste
    await searchInput.clear();
    await page.keyboard.press('Control+v');
    
    await expect(searchInput).toHaveValue('copy paste test');
  });

  test('should test input behavior on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test that input is visible and accessible on mobile
    await expect(searchInput).toBeVisible();
    
    // Test touch interaction
    await searchInput.click();
    await expect(searchInput).toBeFocused();
    
    // Type on mobile keyboard
    await searchInput.type('mobile test');
    await expect(searchInput).toHaveValue('mobile test');
  });

  test('should test all interactive form elements', async ({ page }) => {
    // Test any buttons that might trigger input dialogs
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    await page.click('.back-btn');
    await page.click('[data-item-id="cart"]');
    
    // Look for discount, note, or other input triggers
    const interactiveButtons = page.locator('button:has-text("Note"), button:has-text("Discount"), .note-btn, .discount-btn');
    
    const buttonCount = await interactiveButtons.count();
    console.log('Found interactive buttons that might trigger inputs:', buttonCount);
    
    if (buttonCount > 0) {
      await interactiveButtons.first().click();
      
      // Check if any input fields appeared
      const dialogInputs = page.locator('dialog input, .modal input, .popup input');
      const inputCount = await dialogInputs.count();
      
      if (inputCount > 0) {
        const firstInput = dialogInputs.first();
        await firstInput.fill('test input');
        await expect(firstInput).toHaveValue('test input');
      }
    }
  });

  test('should verify input field tab order and navigation', async ({ page }) => {
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    // Test keyboard navigation through interactive elements
    let tabCount = 0;
    let currentFocused = '';
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const focused = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl ? {
          tagName: activeEl.tagName,
          type: activeEl.type || '',
          className: activeEl.className,
          id: activeEl.id
        } : null;
      });
      
      if (focused) {
        console.log(`Tab ${tabCount}:`, focused);
        
        // If we reach the search input, test it
        if (focused.type === 'text' || focused.type === 'search') {
          await page.keyboard.type('tab navigation test');
          const inputValue = await page.evaluate(() => {
            const activeEl = document.activeElement;
            return activeEl ? activeEl.value : '';
          });
          expect(inputValue).toContain('tab navigation test');
          break;
        }
      }
    }
  });

});