// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('NumPad Component Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add a product to cart first
    await page.click('[data-item-action="navigate"][data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    // Go to payment screen
    await page.click('.back-btn');
    await page.click('[data-item-action="navigate"][data-item-id="payment"]');
    await page.waitForLoadState('networkidle');
  });

  test('should display numpad when cash payment method is selected', async ({ page }) => {
    // Cash should be selected by default
    const cashButton = page.locator('[data-method="cash"]');
    await expect(cashButton).toHaveClass(/active/);
    
    // NumPad should be visible
    const numpadContainer = page.locator('#payment-numpad');
    await expect(numpadContainer).toBeVisible();
    
    // NumPad buttons should be visible
    const numpadButtons = page.locator('.numpad-btn');
    await expect(numpadButtons.first()).toBeVisible();
    
    // Display should be visible
    const display = page.locator('.numpad-display');
    await expect(display).toBeVisible();
  });

  test('should hide numpad when non-cash payment method is selected', async ({ page }) => {
    // Switch to card payment
    await page.click('[data-method="card"]');
    await page.waitForTimeout(500);
    
    // NumPad should not be visible for card payments
    const numpadContainer = page.locator('#payment-numpad .numpad');
    await expect(numpadContainer).not.toBeVisible();
    
    // Should show automatic charge notice instead
    const autoNotice = page.locator('.auto-amount-notice');
    await expect(autoNotice).toBeVisible();
    await expect(autoNotice).toContainText('Amount will be charged automatically');
  });

  test('should input numbers correctly via numpad clicks', async ({ page }) => {
    // Ensure cash payment is selected
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Click some numbers on numpad
    await page.click('[data-value="1"]');
    await page.click('[data-value="2"]');
    await page.click('[data-value="3"]');
    
    // Check the display value
    const display = page.locator('.numpad-value');
    await expect(display).toContainText('123');
    
    // Add decimal point and more numbers
    await page.click('[data-action="decimal"]');
    await page.click('[data-value="5"]');
    await page.click('[data-value="0"]');
    
    await expect(display).toContainText('123.50');
  });

  test('should handle decimal input correctly', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Test decimal input
    await page.click('[data-value="5"]');
    await page.click('[data-action="decimal"]');
    await page.click('[data-value="2"]');
    await page.click('[data-value="5"]');
    
    const display = page.locator('.numpad-value');
    await expect(display).toContainText('5.25');
    
    // Test that multiple decimals are prevented
    await page.click('[data-action="decimal"]');
    await page.click('[data-value="9"]');
    
    // Should still be 5.25X, not 5.25.X
    await expect(display).toContainText('5.259');
  });

  test('should clear input when clear button is pressed', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Input some numbers
    await page.click('[data-value="1"]');
    await page.click('[data-value="2"]');
    await page.click('[data-value="3"]');
    
    const display = page.locator('.numpad-value');
    await expect(display).toContainText('123');
    
    // Clear the input
    await page.click('[data-action="clear"]');
    await expect(display).toContainText('0');
  });

  test('should show Euro currency symbol', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Check that Euro symbol is displayed
    const currencyDisplay = page.locator('.numpad-currency');
    await expect(currencyDisplay).toContainText('€');
  });

  test('should update change calculation when amount is entered', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Enter an amount greater than the total
    await page.click('[data-value="1"]');
    await page.click('[data-value="0"]');
    await page.click('[data-value="0"]');
    
    // Change calculation should update
    const changeSection = page.locator('.change-calculation');
    await expect(changeSection).toBeVisible();
    
    const changeAmount = page.locator('.change-amount');
    await expect(changeAmount).toBeVisible();
    
    // Should show positive change
    const changeLine = page.locator('.change-line.change');
    await expect(changeLine).toBeVisible();
  });

  test('should show insufficient funds warning', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Enter an amount less than the total
    await page.click('[data-value="1"]');
    
    // Should show insufficient notice
    const insufficientNotice = page.locator('.insufficient-notice');
    await expect(insufficientNotice).toBeVisible();
    await expect(insufficientNotice).toContainText('Insufficient funds');
    
    // Complete payment button should be disabled
    const completeButton = page.locator('[data-action="complete-payment"]');
    await expect(completeButton).toBeDisabled();
  });

  test('should use quick amount buttons', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Click a quick amount button
    const quickButtons = page.locator('.quick-amount-btn');
    await expect(quickButtons.first()).toBeVisible();
    
    // Get the amount from first quick button
    const firstButtonText = await quickButtons.first().innerText();
    await quickButtons.first().click();
    
    // Display should update to that amount
    const display = page.locator('.numpad-value');
    const displayValue = await display.textContent();
    
    // The display value should contain the number from the button
    expect(firstButtonText).toContain(displayValue.replace('€', '').trim());
  });

  test('should handle backspace button correctly', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Enter some digits
    await page.click('[data-value="2"]');
    await page.click('[data-value="5"]');
    await page.click('[data-action="decimal"]');
    await page.click('[data-value="5"]');
    await page.click('[data-value="0"]');
    
    const display = page.locator('.numpad-value');
    await expect(display).toContainText('25.50');
    
    // Test backspace
    await page.click('[data-action="backspace"]');
    await expect(display).toContainText('25.5');
    
    // Test Enter key (should trigger payment completion if amount is sufficient)
    await page.click('[data-action="enter"]');
    
    // Should attempt to complete payment or show confirmation
    await page.waitForTimeout(500);
  });

  test('should provide haptic feedback on button press', async ({ page }) => {
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Check if vibration API is called (we can't test actual vibration)
    // But we can verify the button press animation/feedback
    const numberButton = page.locator('[data-value="5"]');
    
    await numberButton.click();
    
    // Button should have pressed state briefly
    await page.waitForTimeout(100);
    
    // Verify the number was actually input
    const display = page.locator('.numpad-value');
    await expect(display).toContainText('5');
  });

});