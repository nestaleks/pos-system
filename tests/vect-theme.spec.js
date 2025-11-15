import { test, expect } from '@playwright/test';

test.describe('Vect Theme Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
    });

    test('should load Vect theme correctly', async ({ page }) => {
        // Click on Vect theme button
        await page.click('[data-theme="vect"]');
        
        // Wait for theme to load
        await page.waitForSelector('.pos-layout.vect-theme', { timeout: 5000 });
        
        // Verify theme is loaded
        const themeLayout = await page.locator('.pos-layout.vect-theme');
        await expect(themeLayout).toBeVisible();
        
        // Verify Vect theme button is active
        const vectButton = await page.locator('[data-theme="vect"]');
        await expect(vectButton).toHaveClass(/active/);
    });

    test('should display header correctly', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-header');
        
        // Check header elements
        await expect(page.locator('.vect-logo')).toContainText('POS System');
        await expect(page.locator('.vect-search-input')).toBeVisible();
        await expect(page.locator('.vect-search-input')).toHaveAttribute('placeholder', 'Search products...');
    });

    test('should display navigation categories', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-navigation');
        
        // Check category list
        const categories = await page.locator('.vect-category-item');
        await expect(categories).not.toHaveCount(0);
        
        // Check that first category is active by default
        const firstCategory = categories.first();
        await expect(firstCategory).toHaveClass(/active/);
    });

    test('should display products grid', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-products-grid');
        
        // Check products are displayed
        const products = await page.locator('.vect-product-card');
        await expect(products).not.toHaveCount(0);
        
        // Check product card structure
        const firstProduct = products.first();
        await expect(firstProduct.locator('.vect-product-image')).toBeVisible();
        await expect(firstProduct.locator('.vect-product-name')).toBeVisible();
        await expect(firstProduct.locator('.vect-product-price')).toBeVisible();
    });

    test('should display cart sidebar', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-sidebar');
        
        // Check cart elements
        await expect(page.locator('.vect-cart-title')).toContainText('Customer');
        await expect(page.locator('.vect-cart-count')).toContainText('0');
        await expect(page.locator('.vect-numpad')).toBeVisible();
    });

    test('should handle category switching', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-navigation');
        
        // Click on a different category
        const fruitCategory = await page.locator('[data-category="fruits"]');
        await fruitCategory.click();
        
        // Verify category is active
        await expect(fruitCategory).toHaveClass(/active/);
        
        // Verify title changed
        await expect(page.locator('.vect-category-title')).toContainText('Fresh Fruits');
    });

    test('should add products to cart', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-products-grid');
        
        // Click on first product
        const firstProduct = await page.locator('.vect-product-card').first();
        await firstProduct.click();
        
        // Verify cart count increased
        await expect(page.locator('.vect-cart-count')).toContainText('1');
        
        // Verify cart item appears
        await expect(page.locator('.vect-cart-item')).toBeVisible();
    });

    test('should handle quantity changes in cart', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-products-grid');
        
        // Add product to cart
        await page.locator('.vect-product-card').first().click();
        await page.waitForSelector('.vect-cart-item');
        
        // Increase quantity
        await page.locator('.vect-quantity-btn[data-action="increase"]').click();
        
        // Verify quantity changed
        await expect(page.locator('.vect-quantity-value')).toContainText('2');
        await expect(page.locator('.vect-cart-count')).toContainText('2');
    });

    test('should handle search functionality', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-search-input');
        
        // Type in search
        await page.fill('.vect-search-input', 'apple');
        
        // Wait for products to filter
        await page.waitForTimeout(500);
        
        // Check that only matching products are shown
        const products = await page.locator('.vect-product-card');
        const count = await products.count();
        
        if (count > 0) {
            // If products found, verify they contain search term
            const productNames = await products.locator('.vect-product-name').allTextContents();
            const hasMatchingProducts = productNames.some(name => 
                name.toLowerCase().includes('apple')
            );
            expect(hasMatchingProducts).toBeTruthy();
        } else {
            // If no products found, verify empty state is shown
            await expect(page.locator('.vect-empty-state')).toBeVisible();
        }
    });

    test('should handle numpad interactions', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-numpad');
        
        // Click numpad buttons
        await page.click('.vect-numpad-btn[data-number="1"]');
        await page.click('.vect-numpad-btn[data-number="2"]');
        await page.click('.vect-numpad-btn[data-number="3"]');
        
        // Buttons should be clickable and responsive
        const numpadButtons = await page.locator('.vect-numpad-btn');
        await expect(numpadButtons.first()).toBeVisible();
    });

    test('should handle checkout process', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-products-grid');
        
        // Add product to cart
        await page.locator('.vect-product-card').first().click();
        
        // Click checkout button
        await page.click('[data-action="checkout"]');
        
        // Should show processing message
        // Note: This tests the checkout initiation, actual payment processing is simulated
    });

    test('should switch between themes correctly', async ({ page }) => {
        // Start with Vect theme
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.pos-layout.vect-theme');
        
        // Switch to Evolution theme
        await page.click('[data-theme="evolution"]');
        await page.waitForSelector('.pos-layout:not(.vect-theme)');
        
        // Verify Evolution theme is active
        await expect(page.locator('[data-theme="evolution"]')).toHaveClass(/active/);
        
        // Switch back to Vect theme
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.pos-layout.vect-theme');
        
        // Verify Vect theme is active again
        await expect(page.locator('[data-theme="vect"]')).toHaveClass(/active/);
    });

    test('should be responsive on smaller screens', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 640, height: 480 });
        
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-theme');
        
        // Check that layout adapts
        const layout = await page.locator('.pos-layout.vect-theme');
        await expect(layout).toBeVisible();
        
        // Navigation should be hidden on mobile
        const navigation = await page.locator('.vect-navigation');
        const isHidden = await navigation.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display === 'none';
        });
        expect(isHidden).toBeTruthy();
    });

    test('should handle empty cart state', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-cart-items');
        
        // Verify empty cart message
        await expect(page.locator('.vect-empty-state')).toBeVisible();
        await expect(page.locator('.vect-empty-title')).toContainText('Cart is empty');
    });

    test('should validate CSS variables are set', async ({ page }) => {
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.vect-theme');
        
        // Check that CSS variables are properly set
        const primaryColor = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--vect-primary');
        });
        
        expect(primaryColor.trim()).toBeTruthy();
    });
});