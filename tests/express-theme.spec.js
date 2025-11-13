const { test, expect } = require('@playwright/test');

test.describe('Express Theme Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should display Express theme button', async ({ page }) => {
    // Check Express theme button exists
    await expect(page.locator('.theme-btn[data-theme="express"]')).toBeVisible();
    await expect(page.locator('.theme-btn[data-theme="express"]')).toContainText('Express');
  });

  test('should switch to Express theme', async ({ page }) => {
    // Click Express theme button
    const expressBtn = page.locator('.theme-btn[data-theme="express"]');
    await expressBtn.click();
    
    // Wait for theme to load
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Should have express theme class
    await expect(page.locator('.pos-layout.express-theme')).toBeVisible();
    
    // Express button should be active
    await expect(expressBtn).toHaveClass(/active/);
  });

  test('should display Express theme elements', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check Express-specific elements
    await expect(page.locator('.express-header')).toBeVisible();
    await expect(page.locator('.express-logo')).toContainText('EXPRESS');
    await expect(page.locator('.quick-actions-panel')).toBeVisible();
    await expect(page.locator('.order-summary-panel')).toBeVisible();
    await expect(page.locator('.payment-zone-panel')).toBeVisible();
  });

  test('should display Express stats', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check stats display
    await expect(page.locator('.express-stats')).toBeVisible();
    await expect(page.locator('.stat-item').first()).toBeVisible();
    await expect(page.locator('.stat-label').first()).toBeVisible();
    await expect(page.locator('.stat-value').first()).toBeVisible();
  });

  test('should display category chips', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check category chips
    await expect(page.locator('.category-chips')).toBeVisible();
    await expect(page.locator('.category-chip').first()).toBeVisible();
    
    // Should have popular category active by default
    await expect(page.locator('.category-chip.active')).toContainText('🔥 Popular');
  });

  test('should display product grid', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check smart grid
    await expect(page.locator('.smart-grid')).toBeVisible();
    await expect(page.locator('.product-card').first()).toBeVisible();
    
    // Check product card elements
    await expect(page.locator('.product-icon').first()).toBeVisible();
    await expect(page.locator('.product-name').first()).toBeVisible();
    await expect(page.locator('.product-price').first()).toBeVisible();
  });

  test('should display payment methods', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check payment methods
    await expect(page.locator('.payment-methods')).toBeVisible();
    await expect(page.locator('.payment-method').first()).toBeVisible();
    
    // Should have card selected by default
    await expect(page.locator('.payment-method.selected')).toContainText('Card');
  });

  test('should display Express checkout button', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check Express checkout button
    const checkoutBtn = page.locator('[data-action="express-checkout"]');
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toContainText('EXPRESS CHECKOUT');
    await expect(checkoutBtn).toHaveClass(/express-btn/);
    await expect(checkoutBtn).toHaveClass(/success/);
  });

  test('should handle category switching', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Click drinks category
    const drinksChip = page.locator('.category-chip').filter({ hasText: '🥤 Drinks' });
    await drinksChip.click();
    
    // Should become active
    await expect(drinksChip).toHaveClass(/active/);
    
    // Products should update
    await expect(page.locator('.product-card').first()).toBeVisible();
  });

  test('should handle product selection', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Click first product
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();
    
    // Order should update
    await page.waitForTimeout(500); // Wait for order update
    await expect(page.locator('.order-item').first()).toBeVisible();
  });

  test('should handle payment method selection', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Click cash payment method
    const cashMethod = page.locator('.payment-method').filter({ hasText: 'Cash' });
    await cashMethod.click();
    
    // Should become selected
    await expect(cashMethod).toHaveClass(/selected/);
  });

  test('should handle number pad input', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check number pad
    await expect(page.locator('.number-pad')).toBeVisible();
    
    // Click number 5
    const num5Btn = page.locator('.num-btn').filter({ hasText: '5' });
    await num5Btn.click();
    
    // Should be clickable
    await expect(num5Btn).toBeVisible();
  });

  test('should handle fast actions', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check fast action buttons
    await expect(page.locator('.fast-actions')).toBeVisible();
    await expect(page.locator('[data-action="clear-order"]')).toBeVisible();
    await expect(page.locator('[data-action="hold-order"]')).toBeVisible();
    await expect(page.locator('[data-action="discount"]')).toBeVisible();
  });

  test('should switch back to other themes from Express', async ({ page }) => {
    // Switch to Express theme first
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Switch back to Evolution
    const evolutionBtn = page.locator('.theme-btn[data-theme="evolution"]');
    await evolutionBtn.click();
    
    // Should load Evolution theme
    await page.waitForSelector('.pos-layout', { timeout: 5000 });
    await expect(page.locator('.express-theme')).not.toBeVisible();
    await expect(evolutionBtn).toHaveClass(/active/);
  });

  test('should display Express branding elements', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check Express branding
    await expect(page.locator('.express-logo')).toContainText('EXPRESS');
    
    // Check lightning bolt emoji in logo
    const logoText = await page.locator('.express-logo').textContent();
    expect(logoText).toContain('EXPRESS');
    
    // Check Express time display
    await expect(page.locator('.express-time')).toBeVisible();
  });
});

test.describe('Express Theme Performance Tests', () => {
  test('should load Express theme quickly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
    
    // Measure theme switch time
    const startTime = Date.now();
    
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle animations smoothly', async ({ page }) => {
    // Switch to Express theme
    await page.locator('.theme-btn[data-theme="express"]').click();
    await page.waitForSelector('.express-theme', { timeout: 5000 });
    
    // Check that animated elements are present
    await expect(page.locator('.express-header')).toBeVisible();
    await expect(page.locator('.quick-actions-panel')).toBeVisible();
    await expect(page.locator('.order-summary-panel')).toBeVisible();
    await expect(page.locator('.payment-zone-panel')).toBeVisible();
    
    // All panels should be visible without layout issues
    const panelCount = await page.locator('[class*="panel"]').count();
    expect(panelCount).toBeGreaterThan(2);
  });
});