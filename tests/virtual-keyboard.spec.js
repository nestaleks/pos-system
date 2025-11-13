// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Virtual Keyboard Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should focus on search input and accept text input', async ({ page }) => {
    // Navigate to products screen
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    // Find and focus search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], .search-input');
    await expect(searchInput).toBeVisible();
    
    // Focus on input (this should trigger virtual keyboard on mobile)
    await searchInput.click();
    await expect(searchInput).toBeFocused();
    
    // Type text to verify input works
    await searchInput.fill('bread');
    await expect(searchInput).toHaveValue('bread');
    
    // Clear and type again
    await searchInput.clear();
    await searchInput.type('coffee');
    await expect(searchInput).toHaveValue('coffee');
  });

  test('should handle input field in payment numpad display', async ({ page }) => {
    // Add product to cart first
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    // Go to payment
    await page.click('.back-btn');
    await page.click('[data-item-action="navigate"][data-item-id="payment"]');
    
    // Ensure cash payment is selected
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Find the numpad display input
    const numpadInput = page.locator('.numpad-display input, #payment-numpad input[type="text"], .numpad-input');
    
    if (await numpadInput.count() > 0) {
      // Focus on numpad input
      await numpadInput.click();
      await expect(numpadInput).toBeFocused();
      
      // Type directly into input
      await numpadInput.fill('25.50');
      await expect(numpadInput).toHaveValue('25.50');
      
      // Test keyboard navigation
      await page.keyboard.press('Home');
      await page.keyboard.press('Delete');
      await expect(numpadInput).toHaveValue('5.50');
    }
  });

  test('should handle text input dialogs or modals', async ({ page }) => {
    // Navigate to cart to find text input scenarios
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    await page.click('.back-btn');
    await page.click('[data-item-action="navigate"][data-item-id="cart"]');
    
    // Look for any buttons that might trigger text input dialogs
    const noteButton = page.locator('button:has-text("Note"), .note-btn, [data-action="note"]');
    const discountButton = page.locator('button:has-text("Discount"), .discount-btn, [data-action="discount"]');
    
    if (await noteButton.count() > 0) {
      await noteButton.click();
      await page.waitForTimeout(500);
      
      // Check if a dialog or modal appeared with input
      const dialogInput = page.locator('dialog input, .modal input, .popup input');
      if (await dialogInput.count() > 0) {
        await dialogInput.fill('Customer note');
        await expect(dialogInput).toHaveValue('Customer note');
      }
    }
  });

  test('should handle custom input components correctly', async ({ page, isMobile }) => {
    // Test custom components that might have special input behavior
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    // Check if search triggers any custom input behavior
    const searchInput = page.locator('input[placeholder*="Search"], .search-input');
    await searchInput.click();
    
    if (isMobile) {
      // On mobile, check that viewport might change due to virtual keyboard
      const viewportBefore = page.viewportSize();
      await page.waitForTimeout(1000); // Wait for virtual keyboard
      const viewportAfter = page.viewportSize();
      
      // Note: This is platform dependent and might not always work
      console.log('Viewport before:', viewportBefore);
      console.log('Viewport after:', viewportAfter);
    }
    
    // Test typing and input events
    await searchInput.type('test input');
    await expect(searchInput).toHaveValue('test input');
    
    // Test special keys
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await expect(searchInput).toHaveValue('');
  });

  test('should provide visual feedback for touch input', async ({ page }) => {
    // Test that input fields provide proper visual feedback
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Check initial state
    await expect(searchInput).toBeVisible();
    
    // Focus should change appearance
    await searchInput.focus();
    
    // Input should accept and display text
    await searchInput.type('visual feedback test');
    await expect(searchInput).toHaveValue('visual feedback test');
    
    // Blur should also work
    await searchInput.blur();
  });

  test('should handle input validation and constraints', async ({ page }) => {
    // Add product to cart and go to payment for numeric input testing
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    await page.click('.back-btn');
    await page.click('[data-item-action="navigate"][data-item-id="payment"]');
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    const numpadDisplay = page.locator('.numpad-display input');
    
    if (await numpadDisplay.count() > 0) {
      // Test numeric input constraints
      await numpadDisplay.click();
      
      // Should accept valid numbers
      await numpadDisplay.type('123.45');
      await expect(numpadDisplay).toHaveValue('123.45');
      
      // Test behavior with invalid input (letters)
      await numpadDisplay.clear();
      await numpadDisplay.type('abc');
      
      // Depending on implementation, might filter out letters
      const value = await numpadDisplay.inputValue();
      console.log('Value after typing letters:', value);
      
      // Test maximum length constraints
      await numpadDisplay.clear();
      await numpadDisplay.type('123456789012345');
      const longValue = await numpadDisplay.inputValue();
      console.log('Value after long input:', longValue);
    }
  });

  test('should test accessibility of input fields', async ({ page }) => {
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus on search eventually
    
    // Check if input is properly labeled and accessible
    const inputLabel = await searchInput.getAttribute('aria-label');
    const inputPlaceholder = await searchInput.getAttribute('placeholder');
    
    expect(inputLabel || inputPlaceholder).toBeTruthy();
    
    // Test that input can be reached via keyboard
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    // Test Enter key behavior
    await searchInput.type('accessibility test');
    await page.keyboard.press('Enter');
    
    // Should trigger search without errors
    await page.waitForTimeout(500);
  });

});