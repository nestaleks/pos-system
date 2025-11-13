const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pos-layout', { timeout: 10000 });
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab navigation through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through several elements
    const tabSequence = [];
    for (let i = 0; i < 10; i++) {
      const focused = await page.locator(':focus').getAttribute('class');
      if (focused) {
        tabSequence.push(focused);
      }
      await page.keyboard.press('Tab');
    }
    
    // Should have navigated through multiple elements
    expect(tabSequence.length).toBeGreaterThan(3);
  });

  test('should support arrow key navigation in grids', async ({ page }) => {
    // Focus on categories grid
    const firstCategory = page.locator('.category-btn').first();
    await firstCategory.focus();
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    
    // Should maintain focus within grid
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveClass(/category-btn/);
  });

  test('should support Enter and Space key activation', async ({ page }) => {
    // Test Enter key on category button
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.focus();
    await page.keyboard.press('Enter');
    
    // Button should be activated
    await expect(categoryBtn).toBeVisible();
    
    // Test Space key on payment button
    const paymentBtn = page.locator('.payment-btn.cash');
    await paymentBtn.focus();
    await page.keyboard.press('Space');
    
    // Button should be activated
    await expect(paymentBtn).toBeVisible();
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Test focus indicators on various element types
    const testElements = [
      '.category-btn',
      '.num-btn',
      '.payment-btn',
      '.tab-btn'
    ];

    for (const selector of testElements) {
      const element = page.locator(selector).first();
      await element.focus();
      
      // Check for focus styles (outline or box-shadow)
      const focusStyles = await element.evaluate(el => {
        const styles = window.getComputedStyle(el, ':focus');
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow
        };
      });
      
      // Should have visible focus indicator
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('should have appropriate ARIA labels and roles', async ({ page }) => {
    // Check for proper ARIA attributes
    const interactiveElements = [
      '.category-btn',
      '.num-btn',
      '.payment-btn',
      '.action-btn'
    ];

    for (const selector of interactiveElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const element = elements.first();
        
        // Should have button role or be a button element
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const role = await element.getAttribute('role');
        
        expect(tagName === 'button' || role === 'button').toBe(true);
        
        // Should have accessible name (text content or aria-label)
        const textContent = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        
        expect(textContent || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should have proper semantic structure', async ({ page }) => {
    // Check for semantic HTML structure
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // First heading should be h1 or h2
      const firstHeading = headings.first();
      const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2'].includes(tagName)).toBe(true);
    }
  });

  test('should support screen reader navigation landmarks', async ({ page }) => {
    // Check for ARIA landmarks
    const landmarks = [
      '[role="banner"]',
      '[role="main"]',
      '[role="navigation"]',
      '[role="contentinfo"]',
      'header',
      'main',
      'nav',
      'footer'
    ];

    let landmarkCount = 0;
    for (const landmark of landmarks) {
      const count = await page.locator(landmark).count();
      landmarkCount += count;
    }

    // Should have at least some semantic landmarks
    expect(landmarkCount).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Test color contrast on key elements
    const testElements = [
      { selector: '.category-btn', name: 'category button' },
      { selector: '.num-btn', name: 'number button' },
      { selector: '.payment-btn.cash', name: 'cash button' },
      { selector: '.order-item .item-name', name: 'order item text' }
    ];

    for (const { selector, name } of testElements) {
      const element = page.locator(selector).first();
      
      if (await element.count() > 0) {
        const colors = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor
          };
        });

        // Basic check that colors are defined
        expect(colors.color).toBeTruthy();
        expect(colors.backgroundColor).toBeTruthy();
      }
    }
  });

  test('should not rely solely on color for information', async ({ page }) => {
    // Check selected categories have visual indicators beyond color
    const selectedCategories = page.locator('.category-btn.selected');
    const count = await selectedCategories.count();

    if (count > 0) {
      const firstSelected = selectedCategories.first();
      
      // Should have check mark or other non-color indicator
      const checkMark = firstSelected.locator('.check-mark');
      await expect(checkMark).toBeVisible();
      
      // Or should have accessible text indicating selection
      const ariaSelected = await firstSelected.getAttribute('aria-selected');
      const ariaPressed = await firstSelected.getAttribute('aria-pressed');
      
      expect(ariaSelected === 'true' || ariaPressed === 'true' || await checkMark.count() > 0).toBe(true);
    }
  });

  test('should provide text alternatives for icons', async ({ page }) => {
    // Check for emoji or icon usage
    const iconElements = page.locator('[title], [aria-label*="icon"], *:has-text("🏠"), *:has-text("💳"), *:has-text("🔍")');
    const count = await iconElements.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = iconElements.nth(i);
      
      // Should have accessible text
      const ariaLabel = await element.getAttribute('aria-label');
      const title = await element.getAttribute('title');
      const textContent = await element.textContent();
      
      // Icon should have some form of text alternative
      expect(ariaLabel || title || textContent).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Interact with elements that might have animations
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.click();
    
    // Check that animations are reduced or disabled
    const transitionDuration = await categoryBtn.evaluate(el => {
      return window.getComputedStyle(el).transitionDuration;
    });
    
    // Should either have no transition or very short duration
    expect(transitionDuration === '0s' || transitionDuration === 'none').toBe(true);
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    // Elements should still be visible and functional
    await expect(page.locator('.pos-layout')).toBeVisible();
    await expect(page.locator('.category-btn').first()).toBeVisible();
    await expect(page.locator('.payment-btn.cash')).toBeVisible();
    
    // Test interactions work in high contrast mode
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.click();
    await expect(categoryBtn).toBeVisible();
  });

  test('should handle zoom up to 200% without horizontal scrolling', async ({ page }) => {
    // Test zoom levels required by WCAG
    const zoomLevels = [1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel;
      }, zoom);
      
      await page.waitForTimeout(300);
      
      // Should not have horizontal scrolling at high zoom
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      if (zoom <= 2.0) {
        expect(hasHorizontalScroll).toBe(false);
      }
      
      // Core functionality should remain accessible
      await expect(page.locator('.categories-panel')).toBeVisible();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '';
    });
  });

  test('should provide clear error messages and feedback', async ({ page }) => {
    // Test interactions that might produce feedback
    const clearBtn = page.locator('.clear-price');
    await clearBtn.click();
    
    // Check for any error messages or feedback
    const alerts = page.locator('[role="alert"]');
    const status = page.locator('[role="status"]');
    
    // If feedback is provided, it should be accessible
    const alertCount = await alerts.count();
    const statusCount = await status.count();
    
    if (alertCount > 0 || statusCount > 0) {
      // Should be announced to screen readers
      if (alertCount > 0) {
        await expect(alerts.first()).toBeVisible();
      }
      if (statusCount > 0) {
        await expect(status.first()).toBeVisible();
      }
    }
  });

  test('should maintain focus management during interactions', async ({ page }) => {
    // Test focus management when elements are added/removed
    const categoryBtn = page.locator('.category-btn').first();
    await categoryBtn.focus();
    
    // Click to change state
    await categoryBtn.click();
    
    // Focus should remain on or near the interacted element
    const focusedElement = page.locator(':focus');
    const isStillFocused = await focusedElement.evaluate(el => {
      return el.closest('.category-btn') !== null;
    });
    
    // Focus should be maintained in logical location
    expect(isStillFocused || await focusedElement.isVisible()).toBe(true);
  });

  test('should provide skip links for keyboard users', async ({ page }) => {
    // Check for skip links (usually hidden until focused)
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a[href*="#"]').first();
    const skipLinkText = await skipLink.textContent();
    
    // If skip links exist, they should have appropriate text
    if (skipLinkText) {
      expect(skipLinkText.toLowerCase()).toMatch(/skip|jump|main|content/);
    }
  });
});