import { test, expect } from '@playwright/test';

test.describe('Vect Theme Responsive Design Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Switch to Vect theme
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.pos-layout.vect-theme', { timeout: 5000 });
    });

    test('should display correctly on desktop (1920x1080)', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(300);
        
        // Check that all three columns are visible
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        await expect(page.locator('.vect-controls')).toBeVisible();
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Check grid template columns
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('grid-template-columns', '320px 400px 1fr');
        
        // Check that category list is in 2-column grid
        const categoryList = page.locator('.vect-category-list');
        await expect(categoryList).toHaveCSS('grid-template-columns', 'repeat(2, 1fr)');
        
        // Check product grid has multiple columns
        const productsGrid = page.locator('.vect-products-grid');
        const products = productsGrid.locator('.vect-product-card');
        const productCount = await products.count();
        
        if (productCount >= 4) {
            // Check that products are arranged in multiple columns
            const firstProduct = products.nth(0);
            const secondProduct = products.nth(1);
            
            const firstBox = await firstProduct.boundingBox();
            const secondBox = await secondProduct.boundingBox();
            
            // Products should be side by side
            expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
        }
    });

    test('should adapt layout on medium screens (1200x768)', async ({ page }) => {
        // Set medium viewport
        await page.setViewportSize({ width: 1200, height: 768 });
        await page.waitForTimeout(300);
        
        // Check that all three columns are still visible but smaller
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        await expect(page.locator('.vect-controls')).toBeVisible();
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Check adjusted grid template columns (280px 350px 1fr)
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('grid-template-columns', '280px 350px 1fr');
        
        // Check that category list becomes single column
        const categoryList = page.locator('.vect-category-list');
        await expect(categoryList).toHaveCSS('grid-template-columns', '1fr');
    });

    test('should adapt layout on small tablets (1024x768)', async ({ page }) => {
        // Set small tablet viewport
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(300);
        
        // Check that all three columns are still visible but further reduced
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        await expect(page.locator('.vect-controls')).toBeVisible();
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Check adjusted grid template columns (260px 320px 1fr)
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('grid-template-columns', '260px 320px 1fr');
        
        // Products grid should still be functional
        const productsGrid = page.locator('.vect-products-grid');
        await expect(productsGrid).toBeVisible();
        
        const products = productsGrid.locator('.vect-product-card');
        const productCount = await products.count();
        expect(productCount).toBeGreaterThan(0);
    });

    test('should collapse controls panel on tablets (768x1024)', async ({ page }) => {
        // Set tablet viewport (portrait)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        
        // Check that layout changes to 2-column
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('grid-template-areas', '"header header" "sidebar main"');
        await expect(layout).toHaveCSS('grid-template-columns', '280px 1fr');
        
        // Check that sidebar is still visible
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        
        // Check that controls panel is hidden
        const controls = page.locator('.vect-controls');
        const isHidden = await controls.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display === 'none';
        });
        expect(isHidden).toBeTruthy();
        
        // Check that main area is visible and takes remaining space
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Product grid should adapt to smaller columns
        const productsGrid = page.locator('.vect-products-grid');
        await expect(productsGrid).toHaveCSS('grid-template-columns', 'repeat(auto-fill, minmax(160px, 1fr))');
    });

    test('should stack vertically on mobile (640x480)', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 640, height: 480 });
        await page.waitForTimeout(300);
        
        // Check that layout becomes single column
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('grid-template-areas', '"header" "main" "sidebar"');
        await expect(layout).toHaveCSS('grid-template-columns', '1fr');
        
        // Check that controls panel is hidden
        const controls = page.locator('.vect-controls');
        const isHidden = await controls.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display === 'none';
        });
        expect(isHidden).toBeTruthy();
        
        // Check that sidebar has limited height
        const sidebar = page.locator('.vect-sidebar');
        await expect(sidebar).toBeVisible();
        await expect(sidebar).toHaveCSS('max-height', '50vh');
        
        // Check that main area is visible
        await expect(page.locator('.vect-main')).toBeVisible();
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        
        // Test product selection via touch
        const firstProduct = page.locator('.vect-product-card').first();
        await firstProduct.tap();
        
        // Check that product was added to cart
        const cartCount = page.locator('.vect-cart-count');
        await expect(cartCount).toContainText('1');
        
        // Test cart quantity controls
        const increaseBtn = page.locator('.vect-quantity-btn[data-action="increase"]');
        if (await increaseBtn.isVisible()) {
            await increaseBtn.tap();
            await expect(cartCount).toContainText('2');
        }
        
        // Test numpad on mobile
        const numpadBtn = page.locator('.vect-numpad-btn[data-number="1"]');
        if (await numpadBtn.isVisible()) {
            await numpadBtn.tap();
            // Button should be responsive to touch
            await expect(numpadBtn).toBeVisible();
        }
    });

    test('should maintain usability across all breakpoints', async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop Large' },
            { width: 1440, height: 900, name: 'Desktop' },
            { width: 1200, height: 768, name: 'Laptop' },
            { width: 1024, height: 768, name: 'Tablet Landscape' },
            { width: 768, height: 1024, name: 'Tablet Portrait' },
            { width: 640, height: 480, name: 'Mobile Landscape' },
            { width: 375, height: 667, name: 'Mobile Portrait' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(300);
            
            // Check that essential elements are always visible
            await expect(page.locator('.vect-header')).toBeVisible();
            await expect(page.locator('.vect-main')).toBeVisible();
            await expect(page.locator('.vect-products-grid')).toBeVisible();
            
            // Check that at least one product is visible
            const products = page.locator('.vect-product-card');
            await expect(products.first()).toBeVisible();
            
            // Check that cart functionality is accessible
            await expect(page.locator('.vect-cart-header')).toBeVisible();
            
            // Test product addition
            const cartCountBefore = await page.locator('.vect-cart-count').textContent();
            await products.first().click();
            const cartCountAfter = await page.locator('.vect-cart-count').textContent();
            
            expect(parseInt(cartCountAfter)).toBeGreaterThan(parseInt(cartCountBefore));
            
            // Reset cart for next test
            const clearBtn = page.locator('[data-action="checkout"]');
            if (await clearBtn.isVisible()) {
                await clearBtn.click();
                await page.waitForTimeout(1000); // Wait for checkout animation
            }
        }
    });

    test('should handle overflow content properly', async ({ page }) => {
        // Set small viewport
        await page.setViewportSize({ width: 1024, height: 600 });
        await page.waitForTimeout(300);
        
        // Add multiple products to cart to test scrolling
        const products = page.locator('.vect-product-card');
        const productCount = Math.min(await products.count(), 5);
        
        for (let i = 0; i < productCount; i++) {
            await products.nth(i).click();
            await page.waitForTimeout(100);
        }
        
        // Check that cart items are scrollable if needed
        const cartItems = page.locator('.vect-cart-items');
        await expect(cartItems).toBeVisible();
        
        // Check that products grid is scrollable
        const productsGrid = page.locator('.vect-products-grid');
        const productsGridStyle = await productsGrid.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
                overflowY: style.overflowY,
                maxHeight: style.maxHeight
            };
        });
        
        expect(productsGridStyle.overflowY).toBe('auto');
    });

    test('should maintain text readability at all sizes', async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 768, height: 1024 },
            { width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(300);
            
            // Check that product names are readable
            const productName = page.locator('.vect-product-name').first();
            const fontSize = await productName.evaluate(el => {
                return window.getComputedStyle(el).fontSize;
            });
            
            // Font size should be at least 14px for readability
            const fontSizeNum = parseFloat(fontSize);
            expect(fontSizeNum).toBeGreaterThanOrEqual(14);
            
            // Check that prices are visible
            const productPrice = page.locator('.vect-product-price').first();
            await expect(productPrice).toBeVisible();
            
            // Check cart text readability
            if (await page.locator('.vect-cart-title').isVisible()) {
                const cartTitle = page.locator('.vect-cart-title');
                await expect(cartTitle).toBeVisible();
            }
        }
    });

    test('should handle orientation changes gracefully', async ({ page }) => {
        // Start in portrait
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        
        // Check initial state
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Rotate to landscape
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(300);
        
        // Check that layout adapts
        await expect(page.locator('.vect-main')).toBeVisible();
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        
        // Test functionality still works
        const firstProduct = page.locator('.vect-product-card').first();
        await firstProduct.click();
        
        const cartCount = page.locator('.vect-cart-count');
        await expect(cartCount).toContainText('1');
    });
});