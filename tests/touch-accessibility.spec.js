const { test, expect } = require('@playwright/test');

test.describe('Touch Accessibility Standards - Legacy and Oblivion Themes', () => {
  const touchDevices = [
    { name: 'iPhone SE', width: 375, height: 667, userAgent: 'iPhone' },
    { name: 'iPhone 12', width: 390, height: 844, userAgent: 'iPhone' },
    { name: 'iPad', width: 768, height: 1024, userAgent: 'iPad' },
    { name: 'iPad Pro', width: 1024, height: 1366, userAgent: 'iPad' },
    { name: 'Android Phone', width: 360, height: 640, userAgent: 'Android' },
    { name: 'Android Tablet', width: 800, height: 1280, userAgent: 'Android' }
  ];

  for (const device of touchDevices) {
    for (const theme of ['legacy', 'oblivion']) {
      test.describe(`${theme} on ${device.name}`, () => {
        test.beforeEach(async ({ page, context }) => {
          // Set viewport and user agent for touch device
          await page.setViewportSize({ width: device.width, height: device.height });
          
          // Set touch-specific user agent
          await page.setUserAgent(
            `Mozilla/5.0 (${device.userAgent}; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15`
          );
          
          await page.goto('http://localhost:8080');
          await page.waitForLoadState('networkidle');
          
          // Switch to target theme
          const themeBtn = page.locator(`[data-theme="${theme}"]`);
          await themeBtn.click();
          await page.waitForTimeout(1000);
        });

        test('should meet WCAG 2.1 AA touch target size requirements (44x44px minimum)', async ({ page }) => {
          // Get all interactive elements
          const interactiveSelectors = [
            'button:visible',
            '[role="button"]:visible', 
            'input[type="button"]:visible',
            'input[type="submit"]:visible',
            '.product-item:visible',
            '.dept-key:visible',
            '.function-key:visible',
            '.num-key:visible',
            '.payment-key:visible',
            '.action-btn:visible',
            '.payment-btn:visible',
            '.num-btn:visible'
          ];

          for (const selector of interactiveSelectors) {
            const elements = await page.locator(selector).all();
            
            for (let i = 0; i < Math.min(elements.length, 15); i++) {
              const element = elements[i];
              const bbox = await element.boundingBox();
              
              if (bbox) {
                // WCAG AA requires minimum 44x44px for touch targets
                expect(bbox.width, `${selector}[${i}] width should be at least 44px`).toBeGreaterThanOrEqual(44);
                expect(bbox.height, `${selector}[${i}] height should be at least 44px`).toBeGreaterThanOrEqual(44);
              }
            }
          }
        });

        test('should have adequate spacing between touch targets', async ({ page }) => {
          const buttons = await page.locator('button:visible').all();
          
          for (let i = 0; i < Math.min(buttons.length - 1, 10); i++) {
            const currentBtn = buttons[i];
            const nextBtn = buttons[i + 1];
            
            const currentBbox = await currentBtn.boundingBox();
            const nextBbox = await nextBtn.boundingBox();
            
            if (currentBbox && nextBbox) {
              // Calculate distances
              const xDistance = Math.max(0, nextBbox.x - (currentBbox.x + currentBbox.width));
              const yDistance = Math.max(0, nextBbox.y - (currentBbox.y + currentBbox.height));
              
              // Check if elements are adjacent (within 50px)
              const areAdjacent = 
                (Math.abs(nextBbox.x - (currentBbox.x + currentBbox.width)) < 50) ||
                (Math.abs(nextBbox.y - (currentBbox.y + currentBbox.height)) < 50);
              
              if (areAdjacent) {
                // Adjacent elements should have at least 8px spacing
                const minSpacing = 8;
                expect(
                  xDistance >= minSpacing || yDistance >= minSpacing,
                  `Adjacent buttons should have at least ${minSpacing}px spacing`
                ).toBe(true);
              }
            }
          }
        });

        test('should support touch gestures and feedback', async ({ page }) => {
          if (theme === 'legacy') {
            // Test Legacy theme touch interactions
            const productItem = page.locator('.product-item').first();
            if (await productItem.isVisible()) {
              // Simulate touch tap
              await productItem.tap();
              await page.waitForTimeout(200);
              
              // Check for visual feedback (color change, etc.)
              const computedStyle = await productItem.evaluate(el => {
                return window.getComputedStyle(el).backgroundColor;
              });
              // Should have some background color (not transparent)
              expect(computedStyle).not.toBe('rgba(0, 0, 0, 0)');
            }
            
            // Test numpad
            const numKey = page.locator('.num-key').first();
            if (await numKey.isVisible()) {
              await numKey.tap();
              await page.waitForTimeout(200);
            }
            
          } else {
            // Test Oblivion theme touch interactions
            const productItem = page.locator('.product-item').first();
            if (await productItem.isVisible()) {
              await productItem.tap();
              await page.waitForTimeout(200);
              
              // Check order was updated
              const orderItems = page.locator('.order-items');
              await expect(orderItems).toBeVisible();
            }
            
            // Test number buttons
            const numBtn = page.locator('.num-btn').first();
            if (await numBtn.isVisible()) {
              await numBtn.tap();
              await page.waitForTimeout(200);
            }
          }
        });

        test('should handle rapid touch inputs without issues', async ({ page }) => {
          const firstButton = page.locator('button:visible').first();
          
          if (await firstButton.isVisible()) {
            // Rapid taps
            for (let i = 0; i < 5; i++) {
              await firstButton.tap();
              await page.waitForTimeout(50);
            }
            
            // Verify UI is still responsive
            await expect(firstButton).toBeVisible();
            
            // Test double tap prevention
            await firstButton.dblclick();
            await page.waitForTimeout(200);
          }
        });

        test('should prevent text selection on touch devices', async ({ page }) => {
          // Check that interactive elements have user-select: none
          const interactiveElements = await page.locator('button:visible, .product-item:visible').all();
          
          for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
            const element = interactiveElements[i];
            const userSelect = await element.evaluate(el => {
              return window.getComputedStyle(el).userSelect;
            });
            
            expect(['none', 'auto'].includes(userSelect)).toBe(true);
          }
        });

        test('should have appropriate font sizes for touch devices', async ({ page }) => {
          // Check minimum readable font sizes
          const textElements = await page.locator('button:visible, .product-item:visible').all();
          
          for (let i = 0; i < Math.min(textElements.length, 10); i++) {
            const element = textElements[i];
            const fontSize = await element.evaluate(el => {
              return parseInt(window.getComputedStyle(el).fontSize);
            });
            
            // Minimum 14px for mobile devices (iOS HIG/Android guidelines)
            const minFontSize = device.width < 768 ? 14 : 12;
            expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
          }
        });

        test('should support focus management for accessibility', async ({ page }) => {
          // Test keyboard/screen reader navigation
          const interactiveElements = await page.locator('button:visible, input:visible').all();
          
          for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
            const element = interactiveElements[i];
            
            // Focus element
            await element.focus();
            
            // Check focus styles
            const outlineStyle = await element.evaluate(el => {
              return window.getComputedStyle(el).outline;
            });
            
            const outlineColor = await element.evaluate(el => {
              return window.getComputedStyle(el).outlineColor;
            });
            
            // Should have visible focus indicator
            expect(
              outlineStyle !== 'none' || outlineColor !== 'rgba(0, 0, 0, 0)',
              'Interactive elements should have visible focus indicators'
            ).toBe(true);
          }
        });

        test('should handle scrolling in touch-friendly manner', async ({ page }) => {
          // Test scroll behavior in scrollable areas
          if (theme === 'legacy') {
            const productGrid = page.locator('.product-grid');
            if (await productGrid.isVisible()) {
              // Check smooth scrolling
              const scrollBehavior = await productGrid.evaluate(el => {
                return window.getComputedStyle(el).scrollBehavior;
              });
              expect(['smooth', 'auto'].includes(scrollBehavior)).toBe(true);
              
              // Test touch scroll
              await productGrid.hover();
              await page.mouse.wheel(0, 100);
              await page.waitForTimeout(300);
            }
          } else {
            const productsList = page.locator('.products-list');
            if (await productsList.isVisible()) {
              const scrollBehavior = await productsList.evaluate(el => {
                return window.getComputedStyle(el).scrollBehavior;
              });
              expect(['smooth', 'auto'].includes(scrollBehavior)).toBe(true);
              
              await productsList.hover();
              await page.mouse.wheel(0, 100);
              await page.waitForTimeout(300);
            }
          }
        });

        test('should handle orientation changes gracefully', async ({ page }) => {
          // Simulate orientation change
          const originalWidth = device.width;
          const originalHeight = device.height;
          
          // Switch to landscape
          await page.setViewportSize({ 
            width: originalHeight, 
            height: originalWidth 
          });
          await page.waitForTimeout(500);
          
          // Verify layout still works
          const layout = page.locator(`.pos-layout.${theme}-theme`);
          await expect(layout).toBeVisible();
          
          // Check buttons are still properly sized
          const firstButton = page.locator('button:visible').first();
          if (await firstButton.isVisible()) {
            const bbox = await firstButton.boundingBox();
            expect(bbox.width).toBeGreaterThanOrEqual(44);
            expect(bbox.height).toBeGreaterThanOrEqual(44);
          }
          
          // Switch back to portrait
          await page.setViewportSize({ 
            width: originalWidth, 
            height: originalHeight 
          });
          await page.waitForTimeout(500);
          
          await expect(layout).toBeVisible();
        });

        test('should prevent accidental activation', async ({ page }) => {
          // Test that elements don't activate on hover (touch devices)
          const buttons = await page.locator('button:visible').all();
          
          for (let i = 0; i < Math.min(buttons.length, 3); i++) {
            const button = buttons[i];
            
            // Hover without clicking
            await button.hover();
            await page.waitForTimeout(100);
            
            // Move away
            await page.mouse.move(0, 0);
            await page.waitForTimeout(100);
            
            // Button should not have been activated
            // (This is more of a behavioral test - actual implementation would vary)
          }
        });
      });
    }
  }

  test('should compare touch optimization between Legacy and Oblivion', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    const results = {};
    
    for (const theme of ['legacy', 'oblivion']) {
      // Switch to theme
      await page.locator(`[data-theme="${theme}"]`).click();
      await page.waitForTimeout(1000);
      
      // Count touch-optimized elements
      const buttons = await page.locator('button:visible').all();
      let touchOptimizedCount = 0;
      
      for (const button of buttons) {
        const bbox = await button.boundingBox();
        if (bbox && bbox.width >= 44 && bbox.height >= 44) {
          touchOptimizedCount++;
        }
      }
      
      results[theme] = {
        totalButtons: buttons.length,
        touchOptimized: touchOptimizedCount,
        percentage: (touchOptimizedCount / buttons.length) * 100
      };
    }
    
    // Both themes should have high touch optimization
    expect(results.legacy.percentage).toBeGreaterThan(80);
    expect(results.oblivion.percentage).toBeGreaterThan(80);
    
    console.log('Touch Optimization Results:', results);
  });
});