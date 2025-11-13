const { test, expect } = require('@playwright/test');

test.describe('Evolution Accuracy Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
    
    // Ensure we're on Evolution theme
    const bossBtn = page.locator('.theme-btn[data-theme="evolution"]');
    const isActive = await bossBtn.getAttribute('class');
    if (!isActive || !isActive.includes('active')) {
      await bossBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display iPad status bar accurately', async ({ page }) => {
    // Check iPad status bar elements
    await expect(page.locator('.ipad-status-bar')).toBeVisible();
    await expect(page.locator('.status-left')).toContainText('iPad');
    await expect(page.locator('.status-center')).toContainText('10:16 AM');
    await expect(page.locator('.status-right')).toContainText('91%');
    
    // Check status bar styling
    const statusBar = page.locator('.ipad-status-bar');
    await expect(statusBar).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(statusBar).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should display exact order items from pos.jpg', async ({ page }) => {
    const expectedItems = [
      'Tequila El Tesoro Platinum',
      'Canned', 
      'Glade Clean Linen Solid Air Freshener',
      'Snacks',
      'Small Coffee'
    ];
    
    for (const itemName of expectedItems) {
      await expect(page.locator('.order-item').filter({ hasText: itemName })).toBeVisible();
    }
    
    // Check specific prices from image
    await expect(page.locator('.order-item').filter({ hasText: 'Tequila El Tesoro Platinum' })).toContainText('$30.00');
    await expect(page.locator('.order-item').filter({ hasText: 'Canned' })).toContainText('$7.59');
    await expect(page.locator('.order-item').filter({ hasText: 'Snacks' })).toContainText('$0.65');
    
    // Check quantity details
    await expect(page.locator('.order-item').filter({ hasText: 'Glade Clean Linen' })).toContainText('2 @ 2.00');
    await expect(page.locator('.order-item').filter({ hasText: 'Small Coffee' })).toContainText('3 @ 0.89');
  });

  test('should display exact order summary totals', async ({ page }) => {
    // Check order summary values from pos.jpg
    await expect(page.locator('.summary-row').filter({ hasText: 'Sub Total' })).toContainText('$30.00');
    await expect(page.locator('.summary-row').filter({ hasText: 'Tax' })).toContainText('$7.59');
    await expect(page.locator('.summary-row').filter({ hasText: 'Total:' })).toContainText('$42.24');
    
    // Check discount formatting
    await expect(page.locator('.summary-row.discount')).toContainText('$0.43 / -$0.22');
    
    // Verify total is prominently displayed
    const totalRow = page.locator('.summary-row.total');
    await expect(totalRow).toHaveCSS('font-weight', '700'); // bold
  });

  test('should have exact 6x4 category grid layout', async ({ page }) => {
    const categoriesGrid = page.locator('#categories-grid');
    
    // Should be 6 columns x 4 rows = 24 cells (including empty ones)
    await expect(categoriesGrid).toHaveCSS('display', 'grid');
    
    // Count all category buttons and empty cells
    const allCells = page.locator('#categories-grid > *');
    await expect(allCells).toHaveCount(24);
    
    // Check specific categories are in correct positions
    await expect(page.locator('.category-btn').filter({ hasText: 'Alcohol' })).toBeVisible();
    await expect(page.locator('.category-btn').filter({ hasText: 'Cleaning' })).toBeVisible();
    await expect(page.locator('.category-btn').filter({ hasText: 'Snacks' })).toBeVisible();
    
    // Check General Food has blue selection
    const generalFood = page.locator('.category-btn').filter({ hasText: 'General Food' });
    if (await generalFood.count() > 0) {
      await expect(generalFood).toHaveClass(/selected-blue/);
    }
  });

  test('should display green selected categories with checkmarks', async ({ page }) => {
    const selectedCategories = page.locator('.category-btn.selected');
    
    // Should have green selected categories
    await expect(selectedCategories).toHaveCount(3); // Alcohol, Cleaning, Snacks
    
    // Each selected category should have a checkmark
    for (let i = 0; i < await selectedCategories.count(); i++) {
      const category = selectedCategories.nth(i);
      await expect(category.locator('.check-mark')).toBeVisible();
      await expect(category.locator('.check-mark')).toContainText('✓');
    }
    
    // Check green styling
    const alcoholBtn = page.locator('.category-btn').filter({ hasText: 'Alcohol' });
    await expect(alcoholBtn).toHaveCSS('background-color', 'rgb(212, 237, 218)');
    await expect(alcoholBtn).toHaveCSS('border-color', 'rgb(40, 167, 69)');
  });

  test('should display exact numpad layout with SKU button', async ({ page }) => {
    // Check price display section
    await expect(page.locator('.price-display')).toBeVisible();
    await expect(page.locator('.current-price')).toContainText('$6.95');
    await expect(page.locator('.sku-btn')).toContainText('SKU');
    await expect(page.locator('.clear-price')).toBeVisible();
    
    // Check SKU button styling
    const skuBtn = page.locator('.sku-btn');
    await expect(skuBtn).toHaveCSS('background-color', 'rgb(0, 123, 255)');
    await expect(skuBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
    
    // Check numpad grid has 5 columns
    const numpadGrid = page.locator('.numpad-grid');
    await expect(numpadGrid).toHaveCSS('display', 'grid');
    
    // Check specific number buttons
    await expect(page.locator('.num-btn').filter({ hasText: '5' })).toHaveClass(/blue/);
    await expect(page.locator('.num-btn').filter({ hasText: '00' })).toHaveClass(/wide/);
  });

  test('should display dark preset buttons correctly', async ({ page }) => {
    const presetButtons = page.locator('.preset-btn.dark');
    
    // Should have 4 dark preset buttons
    await expect(presetButtons).toHaveCount(4);
    
    // Check specific values
    await expect(page.locator('.preset-btn').filter({ hasText: '$50' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$100' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$43' })).toBeVisible();
    await expect(page.locator('.preset-btn').filter({ hasText: '$42,24' })).toBeVisible();
    
    // Check dark styling
    const preset50 = page.locator('.preset-btn').filter({ hasText: '$50' });
    await expect(preset50).toHaveCSS('background-color', 'rgb(73, 80, 87)');
    await expect(preset50).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should display payment buttons with correct colors', async ({ page }) => {
    // Check Credit and Other buttons (red)
    const creditBtn = page.locator('.payment-btn.credit');
    const otherBtn = page.locator('.payment-btn.other');
    const refundBtn = page.locator('.payment-btn.refund');
    
    await expect(creditBtn).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    await expect(otherBtn).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    await expect(refundBtn).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    
    // Check Cash button (green) - should be larger
    const cashBtn = page.locator('.payment-btn.cash');
    await expect(cashBtn).toHaveCSS('background-color', 'rgb(40, 167, 69)');
    await expect(cashBtn).toContainText('Cash');
    
    // Cash button should be more prominent
    await expect(cashBtn).toHaveCSS('font-size', '14px');
    await expect(cashBtn).toHaveCSS('font-weight', '700');
  });

  test('should display action buttons with badge', async ({ page }) => {
    const cancelBtn = page.locator('.action-btn.cancel');
    const holdBtn = page.locator('.action-btn.hold');
    
    // Both should be visible
    await expect(cancelBtn).toBeVisible();
    await expect(holdBtn).toBeVisible();
    
    // Cancel button should have badge with number 3
    await expect(cancelBtn.locator('.btn-badge')).toContainText('3');
    await expect(cancelBtn.locator('.btn-badge')).toHaveCSS('background-color', 'rgb(255, 193, 7)');
    
    // Check button icons
    await expect(cancelBtn.locator('.btn-icon')).toContainText('⏰');
    await expect(holdBtn.locator('.btn-icon')).toContainText('⏸');
  });

  test('should display bottom navigation layout correctly', async ({ page }) => {
    // Check three sections: left (user), center (nav), right (branding)
    await expect(page.locator('.nav-left')).toBeVisible();
    await expect(page.locator('.nav-center')).toBeVisible();
    await expect(page.locator('.nav-right')).toBeVisible();
    
    // Check user info
    await expect(page.locator('.user-name')).toContainText('Johny Wallenstein');
    await expect(page.locator('.logout-btn')).toContainText('Logout');
    
    // Check navigation buttons (should have line breaks)
    const navButtons = page.locator('.nav-center .nav-btn');
    await expect(navButtons).toHaveCount(5);
    
    // Check brand buttons
    const brandButtons = page.locator('.brand-btn');
    await expect(brandButtons).toHaveCount(3);
    await expect(brandButtons.filter({ hasText: 'EVOLUTION' })).toBeVisible();
  });

  test('should display Evolution branding accurately', async ({ page }) => {
    const bossRevBtn = page.locator('.brand-btn.evolution-brand');
    
    // Should be most prominent brand button
    await expect(bossRevBtn).toContainText('EVOLUTION');
    await expect(bossRevBtn).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    
    // Should have gradient and shadow effects
    await expect(bossRevBtn).toHaveCSS('border-radius', '20px');
    
    // Footer message should be present
    await expect(page.locator('.footer-message')).toContainText('Ask the Customer for the their Evolution Account Number for Savings');
  });

  test('should have accurate overall layout proportions', async ({ page }) => {
    // Check main three-panel layout
    const orderPanel = page.locator('.order-panel');
    const categoriesPanel = page.locator('.categories-panel');
    const paymentPanel = page.locator('.payment-panel');
    
    // Check panel widths match design
    const orderWidth = await orderPanel.evaluate(el => el.offsetWidth);
    const paymentWidth = await paymentPanel.evaluate(el => el.offsetWidth);
    
    // Order panel should be ~320px, payment panel ~300px
    expect(orderWidth).toBeCloseTo(320, 30);
    expect(paymentWidth).toBeCloseTo(300, 30);
    
    // Categories panel should take remaining space
    await expect(categoriesPanel).toHaveCSS('flex', '1 1 0%');
  });

  test('should maintain visual hierarchy like original', async ({ page }) => {
    // iPad status bar should be at top
    const statusBar = page.locator('.ipad-status-bar');
    const statusBarBox = await statusBar.boundingBox();
    expect(statusBarBox.y).toBeLessThan(30);
    
    // Current price should be prominent
    const currentPrice = page.locator('.current-price');
    await expect(currentPrice).toHaveCSS('font-size', '24px');
    await expect(currentPrice).toHaveCSS('font-weight', '700');
    
    // Total should be most prominent in order summary
    const totalAmount = page.locator('.summary-row.total');
    await expect(totalAmount).toHaveCSS('font-weight', '700');
    
    // Cash button should stand out
    const cashBtn = page.locator('.payment-btn.cash');
    await expect(cashBtn).toHaveCSS('background-color', 'rgb(40, 167, 69)');
  });

  test('should handle interactions accurately', async ({ page }) => {
    // Test category selection
    const unselectedCategory = page.locator('.category-btn').filter({ hasText: 'Dairy' }).first();
    await unselectedCategory.click();
    
    // Should become selected with green styling
    await expect(unselectedCategory).toHaveClass(/selected/);
    await expect(unselectedCategory.locator('.check-mark')).toBeVisible();
    
    // Test numpad button click
    const numBtn7 = page.locator('.num-btn').filter({ hasText: '7' });
    await numBtn7.click();
    
    // Should provide visual feedback
    await expect(numBtn7).toBeVisible();
    
    // Test payment button
    const cashBtn = page.locator('.payment-btn.cash');
    await cashBtn.click();
    
    // Should remain functional
    await expect(cashBtn).toBeVisible();
  });
});