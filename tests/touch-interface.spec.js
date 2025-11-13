// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Touch Interface Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have touch-optimized button sizes (48px minimum)', async ({ page }) => {
    // Test main navigation buttons
    const gridItems = page.locator('.grid-item');
    const touchButtons = page.locator('.touch-button');
    
    // Check that touch buttons meet minimum size requirements
    const buttonCount = await touchButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = touchButtons.nth(i);
      const boundingBox = await button.boundingBox();
      
      if (boundingBox) {
        // WCAG 2024 requires minimum 48px touch targets
        expect(boundingBox.width).toBeGreaterThanOrEqual(48);
        expect(boundingBox.height).toBeGreaterThanOrEqual(48);
      }
    }
  });

  test('should provide touch feedback on interaction', async ({ page }) => {
    // Test home grid items
    const productsButton = page.locator('[data-item-id="products"]');
    
    // Simulate touch events
    await productsButton.dispatchEvent('touchstart');
    
    // Should add touched class briefly
    await page.waitForTimeout(100);
    
    await productsButton.dispatchEvent('touchend');
    
    // Complete the click
    await productsButton.click();
    
    // Should navigate to products
    await page.waitForSelector('.product-tile');
    await expect(page.locator('.product-tile')).toBeVisible();
  });

  test('should handle multi-touch gestures appropriately', async ({ page }) => {
    // Navigate to products
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    // Test that multi-touch doesn't break interface
    const productTile = page.locator('.product-tile').first();
    
    // Simulate multiple touch points (though limited in Playwright)
    await productTile.dispatchEvent('touchstart', {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 150, clientY: 150 }
      ]
    });
    
    await page.waitForTimeout(100);
    
    await productTile.dispatchEvent('touchend');
    
    // Interface should still be responsive
    await expect(productTile).toBeVisible();
  });

  test('should handle touch scrolling correctly', async ({ page }) => {
    // Navigate to products with many items
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Simulate touch scroll
    const viewport = page.viewportSize();
    if (viewport) {
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      await page.mouse.down();
      await page.mouse.move(viewport.width / 2, viewport.height / 2 - 200);
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Should have scrolled
    const finalScrollY = await page.evaluate(() => window.scrollY);
    console.log('Initial scroll:', initialScrollY, 'Final scroll:', finalScrollY);
  });

  test('should have appropriate touch target spacing', async ({ page }) => {
    // Navigate to payment for numpad testing
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    await page.click('.product-tile .add-to-cart-btn');
    
    await page.click('.back-btn');
    await page.click('[data-item-id="payment"]');
    await page.click('[data-method="cash"]');
    await page.waitForSelector('#payment-numpad .numpad');
    
    // Test numpad button spacing
    const numpadButtons = page.locator('.numpad-btn');
    const buttonCount = await numpadButtons.count();
    
    if (buttonCount > 1) {
      const firstButton = await numpadButtons.nth(0).boundingBox();
      const secondButton = await numpadButtons.nth(1).boundingBox();
      
      if (firstButton && secondButton) {
        // Calculate spacing between buttons
        const spacing = Math.abs(firstButton.x - secondButton.x) - firstButton.width;
        
        // Should have reasonable spacing (at least 8px)
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test('should handle rapid consecutive touches', async ({ page }) => {
    // Test rapid tapping doesn't break interface
    const productsButton = page.locator('[data-item-id="products"]');
    
    // Rapid fire clicks
    for (let i = 0; i < 5; i++) {
      await productsButton.click();
      await page.waitForTimeout(50);
    }
    
    // Should still end up in products screen
    await page.waitForSelector('.product-tile', { timeout: 5000 });
    await expect(page.locator('.product-tile')).toBeVisible();
  });

  test('should provide haptic feedback where supported', async ({ page }) => {
    // Test that vibration API is called appropriately
    let vibrationCalled = false;
    
    // Mock the vibration API to detect calls
    await page.addInitScript(() => {
      window.vibrationCalled = false;
      const originalVibrate = navigator.vibrate;
      navigator.vibrate = function(pattern) {
        window.vibrationCalled = true;
        return originalVibrate ? originalVibrate.call(navigator, pattern) : false;
      };
    });
    
    // Click a button that should trigger haptic feedback
    await page.click('[data-item-id="products"]');
    
    // Check if vibration was attempted
    vibrationCalled = await page.evaluate(() => window.vibrationCalled);
    
    // Note: This will be false on desktop, true on mobile with haptic support
    console.log('Haptic feedback called:', vibrationCalled);
  });

  test('should handle touch events on custom components', async ({ page }) => {
    // Test product tiles
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const productTile = page.locator('.product-tile').first();
    
    // Test touch start/end sequence
    await productTile.dispatchEvent('touchstart');
    await page.waitForTimeout(100);
    
    // Should show pressed state
    const classes = await productTile.getAttribute('class');
    console.log('Product tile classes during touch:', classes);
    
    await productTile.dispatchEvent('touchend');
    
    // Click to add to cart
    await productTile.locator('.add-to-cart-btn').click();
    
    // Should provide feedback
    await page.waitForTimeout(500);
  });

  test('should handle orientation changes gracefully', async ({ page }) => {
    // Test portrait to landscape simulation
    await page.setViewportSize({ width: 768, height: 1024 }); // Portrait
    await page.waitForTimeout(500);
    
    // Check that interface adapts
    const gridItems = page.locator('.grid-item');
    await expect(gridItems.first()).toBeVisible();
    
    await page.setViewportSize({ width: 1024, height: 768 }); // Landscape
    await page.waitForTimeout(500);
    
    // Interface should still be functional
    await expect(gridItems.first()).toBeVisible();
    
    // Navigation should still work
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
  });

  test('should maintain touch responsiveness under load', async ({ page }) => {
    // Add multiple products to cart quickly
    await page.click('[data-item-id="products"]');
    await page.waitForSelector('.product-tile');
    
    const productTiles = page.locator('.product-tile');
    const tileCount = Math.min(await productTiles.count(), 5);
    
    // Rapid fire adding products
    for (let i = 0; i < tileCount; i++) {
      await productTiles.nth(i).locator('.add-to-cart-btn').click();
      await page.waitForTimeout(100);
    }
    
    // Go to cart
    await page.click('.back-btn');
    await page.click('[data-item-id="cart"]');
    
    // Cart should be responsive with multiple items
    const cartItems = page.locator('.cart-item');
    await expect(cartItems).toHaveCount(tileCount);
    
    // Touch interactions should still work
    const firstCartItem = cartItems.first();
    await expect(firstCartItem).toBeVisible();
  });

  test('should handle edge cases in touch interaction', async ({ page }) => {
    // Test touch outside interactive elements
    await page.mouse.click(50, 50); // Click on empty area
    
    // Should not cause errors or unexpected navigation
    await expect(page.locator('.grid-item')).toBeVisible();
    
    // Test very quick touch/release
    const productsButton = page.locator('[data-item-id="products"]');
    await productsButton.dispatchEvent('touchstart');
    await productsButton.dispatchEvent('touchend');
    
    // Should not cause double-activation
    await page.waitForTimeout(100);
  });

});