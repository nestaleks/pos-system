const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load initial page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for main layout to be visible
    await page.waitForSelector('.pos-layout', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Critical elements should be visible
    await expect(page.locator('.pos-header')).toBeVisible();
    await expect(page.locator('.pos-main')).toBeVisible();
    await expect(page.locator('.bottom-nav')).toBeVisible();
  });

  test('should render categories grid efficiently', async ({ page }) => {
    await page.waitForSelector('.categories-panel');
    
    const startTime = Date.now();
    
    // Wait for all category buttons to be visible
    await page.waitForSelector('.category-btn', { timeout: 2000 });
    
    const renderTime = Date.now() - startTime;
    
    // Category grid should render quickly
    expect(renderTime).toBeLessThan(1000);
    
    // All 20 categories should be present
    const categoryCount = await page.locator('.category-btn').count();
    expect(categoryCount).toBe(20);
  });

  test('should handle rapid interactions without lag', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    // Test rapid category selections
    const categoryButtons = page.locator('.category-btn');
    const numpadButtons = page.locator('.num-btn');
    
    const interactionTimes = [];
    
    // Measure response time for rapid clicks
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      await categoryButtons.nth(i).click();
      await numpadButtons.nth(i % 3).click();
      
      const endTime = Date.now();
      interactionTimes.push(endTime - startTime);
    }
    
    // Average interaction time should be reasonable
    const avgTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
    expect(avgTime).toBeLessThan(100); // Under 100ms per interaction
  });

  test('should maintain performance during extended use', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    const performanceData = [];
    
    // Simulate extended use session
    for (let round = 0; round < 10; round++) {
      const startTime = performance.now();
      
      // Simulate typical user interactions
      await page.locator('.category-btn').nth(round % 5).click();
      await page.locator('.num-btn').filter({ hasText: (round % 10).toString() }).click();
      
      const endTime = performance.now();
      performanceData.push(endTime - startTime);
      
      // Small delay between rounds
      await page.waitForTimeout(50);
    }
    
    // Performance should not degrade significantly over time
    const firstHalf = performanceData.slice(0, 5);
    const secondHalf = performanceData.slice(5, 10);
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Second half should not be significantly slower
    expect(avgSecond).toBeLessThan(avgFirst * 2);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    // Get initial memory usage
    const initialMetrics = await page.evaluate(() => {
      return {
        heapUsed: performance.memory?.usedJSHeapSize || 0,
        heapTotal: performance.memory?.totalJSHeapSize || 0,
        heapLimit: performance.memory?.jsHeapSizeLimit || 0
      };
    });
    
    // Perform many interactions to test for memory leaks
    for (let i = 0; i < 50; i++) {
      await page.locator('.category-btn').nth(i % 20).click();
      await page.locator('.num-btn').nth(i % 10).click();
      
      if (i % 10 === 0) {
        // Force garbage collection if available
        await page.evaluate(() => {
          if (window.gc) {
            window.gc();
          }
        });
      }
    }
    
    // Check final memory usage
    const finalMetrics = await page.evaluate(() => {
      return {
        heapUsed: performance.memory?.usedJSHeapSize || 0,
        heapTotal: performance.memory?.totalJSHeapSize || 0,
        heapLimit: performance.memory?.jsHeapSizeLimit || 0
      };
    });
    
    // Memory usage should not grow excessively
    if (initialMetrics.heapUsed > 0 && finalMetrics.heapUsed > 0) {
      const memoryGrowth = finalMetrics.heapUsed / initialMetrics.heapUsed;
      expect(memoryGrowth).toBeLessThan(3); // No more than 3x growth
    }
  });

  test('should optimize CSS rendering performance', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    // Measure paint and layout times
    const paintMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime
      }));
    });
    
    // First contentful paint should be quick
    const fcp = paintMetrics.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      expect(fcp.startTime).toBeLessThan(2000); // Under 2 seconds
    }
    
    // Test layout thrashing with rapid style changes
    const startTime = performance.now();
    
    await page.evaluate(() => {
      // Force multiple reflows to test performance
      for (let i = 0; i < 10; i++) {
        const element = document.querySelector('.categories-panel');
        if (element) {
          element.style.width = `${600 + i}px`;
          element.offsetHeight; // Force reflow
        }
      }
    });
    
    const layoutTime = performance.now() - startTime;
    expect(layoutTime).toBeLessThan(100); // Layout should be fast
  });

  test('should efficiently handle touch events', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    const touchPerformance = [];
    
    // Test touch event handling performance
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      const categoryBtn = page.locator('.category-btn').nth(i % 5);
      await categoryBtn.tap();
      
      const endTime = performance.now();
      touchPerformance.push(endTime - startTime);
    }
    
    // Touch events should be processed quickly
    const avgTouchTime = touchPerformance.reduce((a, b) => a + b, 0) / touchPerformance.length;
    expect(avgTouchTime).toBeLessThan(50); // Under 50ms per touch
    
    // No touch event should be extremely slow
    const maxTouchTime = Math.max(...touchPerformance);
    expect(maxTouchTime).toBeLessThan(200);
  });

  test('should optimize scroll performance', async ({ page }) => {
    await page.waitForSelector('.categories-panel');
    
    // Test scrolling performance in categories grid
    const categoriesPanel = page.locator('.categories-panel');
    
    const startTime = performance.now();
    
    // Simulate scroll events
    for (let i = 0; i < 5; i++) {
      await categoriesPanel.evaluate((element, offset) => {
        element.scrollTop = offset * 100;
      }, i);
      
      await page.waitForTimeout(10);
    }
    
    const scrollTime = performance.now() - startTime;
    expect(scrollTime).toBeLessThan(500); // Scrolling should be smooth
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    const startTime = performance.now();
    
    // Perform multiple concurrent operations
    const operations = [
      page.locator('.category-btn').first().click(),
      page.locator('.num-btn').filter({ hasText: '5' }).click(),
      page.locator('.payment-btn.cash').click(),
      page.locator('.tab-btn').first().click()
    ];
    
    await Promise.all(operations);
    
    const totalTime = performance.now() - startTime;
    expect(totalTime).toBeLessThan(500); // Concurrent operations should complete quickly
    
    // UI should remain responsive
    await expect(page.locator('.pos-layout')).toBeVisible();
  });

  test('should optimize network resource loading', async ({ page }) => {
    // Test with network throttling
    await page.route('**/*', async route => {
      // Add small delay to simulate slower network
      await new Promise(resolve => setTimeout(resolve, 10));
      await route.continue();
    });
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('.pos-layout');
    
    const loadTimeWithThrottling = Date.now() - startTime;
    
    // Should still load reasonably quickly even with network delays
    expect(loadTimeWithThrottling).toBeLessThan(5000);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    // Monitor frame rate during interactions
    const frameData = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const frames = [];
        let lastTime = performance.now();
        let frameCount = 0;
        
        function measureFrame(currentTime) {
          const delta = currentTime - lastTime;
          frames.push(delta);
          lastTime = currentTime;
          frameCount++;
          
          if (frameCount < 30) { // Measure 30 frames
            requestAnimationFrame(measureFrame);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(measureFrame);
        
        // Trigger some interactions during measurement
        setTimeout(() => {
          const btn = document.querySelector('.category-btn');
          if (btn) btn.click();
        }, 100);
      });
    });
    
    // Calculate average FPS
    const avgFrameTime = frameData.reduce((a, b) => a + b, 0) / frameData.length;
    const avgFPS = 1000 / avgFrameTime;
    
    // Should maintain close to 60fps
    expect(avgFPS).toBeGreaterThan(30); // At least 30fps
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.waitForSelector('.pos-layout');
    
    // Test performance with larger category dataset
    const startTime = performance.now();
    
    await page.evaluate(() => {
      // Simulate adding more categories dynamically
      const grid = document.querySelector('#categories-grid');
      if (grid) {
        for (let i = 20; i < 50; i++) {
          const btn = document.createElement('button');
          btn.className = 'category-btn';
          btn.textContent = `Category ${i}`;
          grid.appendChild(btn);
        }
      }
    });
    
    const additionTime = performance.now() - startTime;
    expect(additionTime).toBeLessThan(500); // Should add elements quickly
    
    // Grid should still be responsive
    const newCategoryCount = await page.locator('.category-btn').count();
    expect(newCategoryCount).toBeGreaterThan(20);
    
    // First category should still be clickable
    await page.locator('.category-btn').first().click();
    await expect(page.locator('.category-btn').first()).toBeVisible();
  });
});