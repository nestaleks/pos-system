// @ts-check
const { test, expect } = require('@playwright/test');

// Page Object Model for POS System
class POSPage {
  constructor(page) {
    this.page = page;
    
    // Home screen selectors
    this.homeProductsButton = '[data-item-action="navigate"][data-item-id="products"]';
    this.homeCartButton = '[data-item-action="navigate"][data-item-id="cart"]';
    this.homePaymentButton = '[data-item-action="navigate"][data-item-id="payment"]';
    
    // Products screen selectors
    this.searchInput = 'input[placeholder*="Search"]';
    this.productTiles = '.product-tile';
    this.addToCartButton = '.add-to-cart-btn';
    this.backButton = '.back-btn';
    
    // Cart screen selectors
    this.cartItems = '.cart-item';
    this.checkoutButton = '.checkout-btn';
    this.clearCartButton = '.clear-cart-btn';
    
    // Payment screen selectors
    this.paymentMethodCash = '[data-method="cash"]';
    this.paymentMethodCard = '[data-method="card"]';
    this.numpadContainer = '#payment-numpad';
    this.numpadButtons = '.numpad-btn';
    this.numpadInput = '.numpad-display input';
    this.quickAmountButtons = '.quick-amount-btn';
    this.completePaymentButton = '[data-action="complete-payment"]';
    this.changeCalculation = '.change-calculation';
    
    // Touch interface selectors
    this.touchButtons = '.touch-button';
    this.gridItems = '.grid-item';
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async goToProducts() {
    await this.page.click(this.homeProductsButton);
    await this.page.waitForSelector(this.productTiles);
  }

  async goToCart() {
    await this.page.click(this.homeCartButton);
    await this.page.waitForLoadState('networkidle');
  }

  async goToPayment() {
    await this.page.click(this.homePaymentButton);
    await this.page.waitForLoadState('networkidle');
  }

  async addProductToCart(productIndex = 0) {
    await this.goToProducts();
    const products = await this.page.locator(this.productTiles);
    await products.nth(productIndex).locator(this.addToCartButton).click();
    await this.page.waitForTimeout(500); // Wait for animation
  }

  async searchProducts(searchTerm) {
    await this.page.fill(this.searchInput, searchTerm);
    await this.page.waitForTimeout(500); // Wait for search results
  }

  async selectPaymentMethod(method = 'cash') {
    await this.page.click(`[data-method="${method}"]`);
    await this.page.waitForTimeout(500);
  }

  async waitForNumPad() {
    await this.page.waitForSelector(this.numpadContainer);
    await this.page.waitForSelector(this.numpadButtons);
  }
}

test.describe('POS System Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    const posPage = new POSPage(page);
    await posPage.goto();
  });

  test('should load home screen correctly', async ({ page }) => {
    const posPage = new POSPage(page);
    
    // Check if main grid items are present
    await expect(page.locator(posPage.homeProductsButton)).toBeVisible();
    await expect(page.locator(posPage.homeCartButton)).toBeVisible();
    await expect(page.locator(posPage.homePaymentButton)).toBeVisible();
    
    // Check English text
    await expect(page.locator('text=Products')).toBeVisible();
    await expect(page.locator('text=Cart')).toBeVisible();
    await expect(page.locator('text=Payment')).toBeVisible();
  });

  test('should navigate to products screen and search', async ({ page }) => {
    const posPage = new POSPage(page);
    
    await posPage.goToProducts();
    
    // Check search input exists
    await expect(page.locator(posPage.searchInput)).toBeVisible();
    
    // Test search functionality
    await posPage.searchProducts('bread');
    
    // Products should be visible
    await expect(page.locator(posPage.productTiles).first()).toBeVisible();
  });

  test('should display virtual keyboard on search input focus (mobile)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Virtual keyboard test only for mobile devices');
    
    const posPage = new POSPage(page);
    await posPage.goToProducts();
    
    // Focus on search input
    await page.click(posPage.searchInput);
    
    // On mobile, focusing input should trigger virtual keyboard
    // We can check if the viewport changes or if input receives focus
    const searchInput = page.locator(posPage.searchInput);
    await expect(searchInput).toBeFocused();
    
    // Type text to verify keyboard works
    await page.type(posPage.searchInput, 'test');
    await expect(searchInput).toHaveValue('test');
  });

  test('should add products to cart and navigate to cart', async ({ page }) => {
    const posPage = new POSPage(page);
    
    // Add a product to cart
    await posPage.addProductToCart();
    
    // Go to cart
    await posPage.goToCart();
    
    // Cart should have items
    await expect(page.locator(posPage.cartItems)).toHaveCount(1);
  });

});