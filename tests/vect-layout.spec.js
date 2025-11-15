import { test, expect } from '@playwright/test';

test.describe('Vect Theme Layout Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Switch to Vect theme
        await page.click('[data-theme="vect"]');
        await page.waitForSelector('.pos-layout.vect-theme', { timeout: 5000 });
    });

    test('should have correct 3-column layout structure', async ({ page }) => {
        // Check that all main layout areas exist
        await expect(page.locator('.vect-sidebar')).toBeVisible();
        await expect(page.locator('.vect-controls')).toBeVisible();
        await expect(page.locator('.vect-main')).toBeVisible();
        
        // Verify grid layout structure
        const layout = page.locator('.pos-layout.vect-theme');
        await expect(layout).toHaveCSS('display', 'grid');
        
        // Check that sidebar is on the left
        const sidebar = page.locator('.vect-sidebar');
        const sidebarBox = await sidebar.boundingBox();
        
        const controls = page.locator('.vect-controls');
        const controlsBox = await controls.boundingBox();
        
        const main = page.locator('.vect-main');
        const mainBox = await main.boundingBox();
        
        // Verify left-to-right order
        expect(sidebarBox.x).toBeLessThan(controlsBox.x);
        expect(controlsBox.x).toBeLessThan(mainBox.x);
    });

    test('should display cart and numpad in left sidebar', async ({ page }) => {
        const sidebar = page.locator('.vect-sidebar');
        
        // Check cart components
        await expect(sidebar.locator('.vect-cart-header')).toBeVisible();
        await expect(sidebar.locator('.vect-cart-items')).toBeVisible();
        await expect(sidebar.locator('.vect-cart-summary')).toBeVisible();
        
        // Check numpad
        await expect(sidebar.locator('.vect-numpad')).toBeVisible();
        await expect(sidebar.locator('.vect-numpad-grid')).toBeVisible();
        
        // Check checkout actions
        await expect(sidebar.locator('.vect-checkout-actions')).toBeVisible();
        await expect(sidebar.locator('[data-action="checkout"]')).toBeVisible();
    });

    test('should display order tabs in controls panel', async ({ page }) => {
        const controls = page.locator('.vect-controls');
        
        // Check order tabs section
        await expect(controls.locator('.vect-order-tabs')).toBeVisible();
        
        // Check individual tabs
        await expect(controls.locator('.vect-order-tab[data-tab="current"]')).toBeVisible();
        await expect(controls.locator('.vect-order-tab[data-tab="orders"]')).toBeVisible();
        await expect(controls.locator('.vect-order-tab[data-tab="receipts"]')).toBeVisible();
        
        // Check that Current Order tab is active by default
        const currentTab = controls.locator('.vect-order-tab[data-tab="current"]');
        await expect(currentTab).toHaveClass(/active/);
        
        // Check tab badges
        const currentBadge = currentTab.locator('.vect-order-tab-badge');
        await expect(currentBadge).toBeVisible();
        await expect(currentBadge).toContainText('0'); // Empty cart initially
    });

    test('should display horizontal categories in controls panel', async ({ page }) => {
        const controls = page.locator('.vect-controls');
        
        // Check categories section
        await expect(controls.locator('.vect-categories-section')).toBeVisible();
        await expect(controls.locator('.vect-categories-title')).toContainText('Categories');
        
        // Check category list is in grid layout (horizontal)
        const categoryList = controls.locator('.vect-category-list');
        await expect(categoryList).toBeVisible();
        await expect(categoryList).toHaveCSS('display', 'grid');
        
        // Check that categories exist
        const categories = categoryList.locator('.vect-category-item');
        await expect(categories).not.toHaveCount(0);
        
        // Check first category is active
        const firstCategory = categories.first();
        await expect(firstCategory).toHaveClass(/active/);
    });

    test('should display search section in controls panel', async ({ page }) => {
        const controls = page.locator('.vect-controls');
        
        // Check search section
        await expect(controls.locator('.vect-search-section')).toBeVisible();
        await expect(controls.locator('.vect-search-title')).toContainText('Search Products');
        
        // Check search input
        const searchInput = controls.locator('.vect-search-input');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Search products...');
        
        // Check search icon
        await expect(controls.locator('.vect-search-icon')).toBeVisible();
    });

    test('should display products grid in main area', async ({ page }) => {
        const main = page.locator('.vect-main');
        
        // Check main area structure
        await expect(main.locator('.vect-products-header')).toBeVisible();
        await expect(main.locator('.vect-category-title')).toBeVisible();
        await expect(main.locator('.vect-products-stats')).toBeVisible();
        
        // Check products grid
        const productsGrid = main.locator('.vect-products-grid');
        await expect(productsGrid).toBeVisible();
        
        // Check that products are displayed
        const products = productsGrid.locator('.vect-product-card');
        await expect(products).not.toHaveCount(0);
    });

    test('should handle order tab switching', async ({ page }) => {
        // Click on Orders tab
        await page.click('.vect-order-tab[data-tab="orders"]');
        
        // Check that Orders tab is now active
        const ordersTab = page.locator('.vect-order-tab[data-tab="orders"]');
        await expect(ordersTab).toHaveClass(/active/);
        
        // Check that Current Order tab is no longer active
        const currentTab = page.locator('.vect-order-tab[data-tab="current"]');
        await expect(currentTab).not.toHaveClass(/active/);
    });

    test('should handle category switching in controls panel', async ({ page }) => {
        // Get initial active category
        const categories = page.locator('.vect-category-item');
        
        // Click on a different category (fruits)
        const fruitsCategory = page.locator('[data-category="fruits"]');
        await fruitsCategory.click();
        
        // Check that fruits category is now active
        await expect(fruitsCategory).toHaveClass(/active/);
        
        // Check that category title updated
        await expect(page.locator('.vect-category-title')).toContainText('Fresh Fruits');
        
        // Check that products stats updated
        await expect(page.locator('.vect-products-stats')).toContainText('products found');
    });

    test('should handle product selection and cart update', async ({ page }) => {
        // Add a product to cart
        const firstProduct = page.locator('.vect-product-card').first();
        await firstProduct.click();
        
        // Check cart count updated
        const cartCount = page.locator('.vect-cart-count');
        await expect(cartCount).toContainText('1');
        
        // Check cart item appears
        await expect(page.locator('.vect-cart-item')).toBeVisible();
        
        // Check order tab badge updated
        const currentTab = page.locator('.vect-order-tab[data-tab="current"]');
        const badge = currentTab.locator('.vect-order-tab-badge');
        await expect(badge).toContainText('1');
    });

    test('should handle search functionality in controls panel', async ({ page }) => {
        // Type in search input
        const searchInput = page.locator('.vect-search-input');
        await searchInput.fill('apple');
        
        // Wait for search to process
        await page.waitForTimeout(500);
        
        // Check that products stats updated
        const productsStats = page.locator('.vect-products-stats');
        await expect(productsStats).toContainText('products found');
        
        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);
        
        // Check that all products are shown again
        const products = page.locator('.vect-product-card');
        const productCount = await products.count();
        expect(productCount).toBeGreaterThan(0);
    });

    test('should handle numpad interactions in sidebar', async ({ page }) => {
        // Click numpad buttons
        await page.click('.vect-numpad-btn[data-number="1"]');
        await page.click('.vect-numpad-btn[data-number="2"]');
        await page.click('.vect-numpad-btn[data-number="3"]');
        
        // Check that buttons are responsive
        const numpadButtons = page.locator('.vect-numpad-btn');
        await expect(numpadButtons.first()).toBeVisible();
        
        // Test action buttons
        await page.click('.vect-numpad-btn[data-number="+/-"]');
        await page.click('.vect-numpad-btn[data-number="."]');
    });

    test('should maintain layout proportions', async ({ page }) => {
        const layout = page.locator('.pos-layout.vect-theme');
        const layoutBox = await layout.boundingBox();
        
        const sidebar = page.locator('.vect-sidebar');
        const sidebarBox = await sidebar.boundingBox();
        
        const controls = page.locator('.vect-controls');
        const controlsBox = await controls.boundingBox();
        
        const main = page.locator('.vect-main');
        const mainBox = await main.boundingBox();
        
        // Check that sidebar takes approximately 320px
        expect(sidebarBox.width).toBeCloseTo(320, 20);
        
        // Check that controls takes approximately 400px
        expect(controlsBox.width).toBeCloseTo(400, 20);
        
        // Check that main takes the remaining space
        expect(mainBox.width).toBeGreaterThan(400);
        
        // Check that all components have full height
        expect(sidebarBox.height).toBeGreaterThan(500);
        expect(controlsBox.height).toBeGreaterThan(500);
        expect(mainBox.height).toBeGreaterThan(500);
    });

    test('should have proper visual hierarchy', async ({ page }) => {
        // Check header is at the top
        const header = page.locator('.vect-header');
        const headerBox = await header.boundingBox();
        expect(headerBox.y).toBeLessThan(100);
        
        // Check that controls sections are properly separated
        const orderTabs = page.locator('.vect-order-tabs');
        const categoriesSection = page.locator('.vect-categories-section');
        const searchSection = page.locator('.vect-search-section');
        
        const tabsBox = await orderTabs.boundingBox();
        const categoriesBox = await categoriesSection.boundingBox();
        const searchBox = await searchSection.boundingBox();
        
        // Check vertical order: tabs -> categories -> search
        expect(tabsBox.y).toBeLessThan(categoriesBox.y);
        expect(categoriesBox.y).toBeLessThan(searchBox.y);
        
        // Check that sidebar sections are properly ordered
        const cartHeader = page.locator('.vect-cart-header');
        const cartItems = page.locator('.vect-cart-items');
        const cartSummary = page.locator('.vect-cart-summary');
        const numpad = page.locator('.vect-numpad');
        const checkoutActions = page.locator('.vect-checkout-actions');
        
        const cartHeaderBox = await cartHeader.boundingBox();
        const cartItemsBox = await cartItems.boundingBox();
        const cartSummaryBox = await cartSummary.boundingBox();
        const numpadBox = await numpad.boundingBox();
        const checkoutBox = await checkoutActions.boundingBox();
        
        // Check vertical order in sidebar
        expect(cartHeaderBox.y).toBeLessThan(cartItemsBox.y);
        expect(cartItemsBox.y).toBeLessThan(cartSummaryBox.y);
        expect(cartSummaryBox.y).toBeLessThan(numpadBox.y);
        expect(numpadBox.y).toBeLessThan(checkoutBox.y);
    });
});