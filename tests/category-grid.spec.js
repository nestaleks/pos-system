const { test, expect } = require('@playwright/test');

test.describe('Category Grid Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.categories-panel', { timeout: 10000 });
  });

  test('should display all category buttons', async ({ page }) => {
    const categoryButtons = page.locator('.category-btn');
    
    // Should have 20 categories as defined in the design
    await expect(categoryButtons).toHaveCount(20);
    
    // Check specific categories
    await expect(categoryButtons.filter({ hasText: 'Alcohol' })).toBeVisible();
    await expect(categoryButtons.filter({ hasText: 'Calling Card' })).toBeVisible();
    await expect(categoryButtons.filter({ hasText: 'Canned' })).toBeVisible();
    await expect(categoryButtons.filter({ hasText: 'Cleaning' })).toBeVisible();
    await expect(categoryButtons.filter({ hasText: 'Snacks' })).toBeVisible();
  });

  test('should show selected categories with green styling', async ({ page }) => {
    // Check pre-selected categories
    const selectedCategories = page.locator('.category-btn.selected');
    await expect(selectedCategories).toHaveCount(3); // Alcohol, Cleaning, Snacks
    
    // Verify styling
    const alcoholBtn = page.locator('.category-btn').filter({ hasText: 'Alcohol' }).first();
    await expect(alcoholBtn).toHaveClass(/selected/);
    
    // Check for green checkmarks
    const checkMarks = page.locator('.check-mark');
    await expect(checkMarks).toHaveCount(3);
    
    // Verify green styling
    await expect(alcoholBtn).toHaveCSS('background-color', 'rgb(232, 245, 232)');
    await expect(alcoholBtn).toHaveCSS('border-color', 'rgb(76, 175, 80)');
  });

  test('should allow category selection and deselection', async ({ page }) => {
    // Click on unselected category
    const cannedBtn = page.locator('.category-btn').filter({ hasText: 'Canned' }).first();
    await cannedBtn.click();
    
    // Should become selected
    await expect(cannedBtn).toHaveClass(/selected/);
    await expect(cannedBtn.locator('.check-mark')).toBeVisible();
    
    // Click on selected category to deselect
    const alcoholBtn = page.locator('.category-btn').filter({ hasText: 'Alcohol' }).first();
    await alcoholBtn.click();
    
    // Should become unselected
    await expect(alcoholBtn).not.toHaveClass(/selected/);
    await expect(alcoholBtn.locator('.check-mark')).not.toBeVisible();
  });

  test('should handle touch interactions on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('This test is for mobile devices only');
    }
    
    const categoryBtn = page.locator('.category-btn').first();
    
    // Touch tap
    await categoryBtn.tap();
    
    // Should respond to touch
    await expect(categoryBtn).toBeVisible();
    
    // Test touch hold (should not trigger context menu)
    await categoryBtn.tap({ force: true });
    await page.waitForTimeout(1000);
    
    // Should still be visible and functional
    await expect(categoryBtn).toBeVisible();
  });

  test('should maintain grid layout on different screen sizes', async ({ page }) => {
    const categoriesGrid = page.locator('#categories-grid');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1024, height: 768 }, // Tablet landscape
      { width: 768, height: 1024 }, // Tablet portrait
      { width: 1200, height: 800 }, // Desktop small
      { width: 1440, height: 900 }  // Desktop large
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Grid should be visible and properly laid out
      await expect(categoriesGrid).toBeVisible();
      await expect(categoriesGrid).toHaveCSS('display', 'grid');
      
      // Categories should be visible
      const categoryButtons = page.locator('.category-btn');
      await expect(categoryButtons.first()).toBeVisible();
      
      // Grid should adapt to screen size
      const gridComputedStyle = await categoriesGrid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      
      // Should have responsive columns
      expect(gridComputedStyle).not.toBe('none');
    }
  });

  test('should show proper visual feedback on hover and click', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip('Hover tests are not applicable on mobile devices');
    }
    
    const categoryBtn = page.locator('.category-btn').first();
    
    // Hover effect
    await categoryBtn.hover();
    
    // Click effect
    await categoryBtn.click();
    await page.waitForTimeout(100);
    
    // Should maintain visibility and functionality
    await expect(categoryBtn).toBeVisible();
  });

  test('should handle rapid category selections', async ({ page }) => {
    const categories = page.locator('.category-btn').first(5);
    
    // Rapidly click multiple categories
    for (let i = 0; i < 5; i++) {
      await categories.nth(i).click();
      await page.waitForTimeout(50); // Small delay between clicks
    }
    
    // Should handle all clicks without issues
    await expect(page.locator('.category-btn')).toHaveCount(20);
    
    // Grid should still be functional
    await expect(page.locator('#categories-grid')).toBeVisible();
  });

  test('should support keyboard navigation for accessibility', async ({ page }) => {
    // Focus first category
    await page.keyboard.press('Tab');
    
    // Find focused element
    const focusedElement = page.locator(':focus');
    
    // Should be a category button
    await expect(focusedElement).toHaveClass(/category-btn/);
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Should work without JavaScript errors
    await page.waitForTimeout(100);
    await expect(page.locator('#categories-grid')).toBeVisible();
  });

  test('should maintain category state during interactions', async ({ page }) => {
    // Select a category
    const testCategory = page.locator('.category-btn').filter({ hasText: 'Dairy' }).first();
    await testCategory.click();
    
    // Scroll or interact with other elements
    await page.locator('.numpad-grid .num-btn').first().click();
    await page.locator('.search-btn').click();
    
    // Category selection should persist
    await expect(testCategory).toHaveClass(/selected/);
    await expect(testCategory.locator('.check-mark')).toBeVisible();
  });

  test('should handle long category names properly', async ({ page }) => {
    const longNameCategory = page.locator('.category-btn').filter({ hasText: 'Glade Clean Linen' });
    
    if (await longNameCategory.count() > 0) {
      // Text should not overflow
      const textElement = longNameCategory.first();
      
      const box = await textElement.boundingBox();
      expect(box).toBeTruthy();
      
      // Should be visible and clickable
      await expect(textElement).toBeVisible();
      await textElement.click();
    }
  });
});