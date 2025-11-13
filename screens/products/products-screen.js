class ProductsScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.currentCategory = data.category || null;
        this.searchQuery = data.search || '';
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
    }

    async render() {
        this.loadProducts();
        this.loadCategories();
        this.filterProducts();

        return `
            <div class="products-screen">
                <div class="products-header">
                    <div class="header-top">
                        <button class="back-btn touch-button touch-btn-secondary" data-action="back">
                            <span class="touch-btn-icon">←</span>
                            <span class="touch-btn-text">Back</span>
                        </button>
                        <h1 class="products-title">
                            ${this.currentCategory ? this.currentCategory : 'All Products'}
                        </h1>
                        <div class="cart-mini-indicator">
                            <span class="cart-icon">🛒</span>
                            <span class="cart-count">${this.cartManager.getItemCount()}</span>
                        </div>
                    </div>
                    
                    <div class="header-controls">
                        <div class="search-container">
                            <input 
                                type="text" 
                                class="search-input touch-input" 
                                placeholder="Search products..."
                                value="${this.searchQuery}"
                            />
                            <button class="search-btn touch-button touch-btn-primary">
                                <span class="touch-btn-icon">🔍</span>
                            </button>
                        </div>
                        <button class="categories-btn touch-button touch-btn-secondary" data-action="toggle-categories">
                            <span class="touch-btn-icon">📂</span>
                            <span class="touch-btn-text">Categories</span>
                        </button>
                    </div>
                </div>

                <div class="products-content">
                    <div class="categories-sidebar ${this.shouldShowCategories() ? 'visible' : 'hidden'}" id="categories-sidebar">
                        <div class="categories-list">
                            ${this.renderCategoriesList()}
                        </div>
                    </div>
                    
                    <div class="products-main">
                        <div class="products-info">
                            <span class="products-count">${this.filteredProducts.length} products</span>
                            ${this.currentCategory ? `
                                <button class="clear-filter-btn touch-button touch-btn-small" data-action="clear-category">
                                    <span class="touch-btn-text">Show All</span>
                                    <span class="touch-btn-icon">×</span>
                                </button>
                            ` : ''}
                        </div>
                        
                        <div class="products-grid-container" id="products-grid">
                            ${this.renderProductsGrid()}
                        </div>
                    </div>
                </div>

                <div class="products-footer">
                    <button class="footer-btn touch-button touch-btn-large touch-btn-secondary" data-action="home">
                        <span class="touch-btn-icon">🏠</span>
                        <span class="touch-btn-text">Home</span>
                    </button>
                    <button class="footer-btn touch-button touch-btn-large ${this.cartManager.isEmpty() ? 'touch-btn-secondary' : 'touch-btn-success'}" 
                            data-action="cart">
                        <span class="touch-btn-icon">🛒</span>
                        <span class="touch-btn-text">Cart (${this.cartManager.getItemCount()})</span>
                    </button>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.setupEventListeners();
        this.setupCartListener();
        this.setupSearch();
        this.renderProductTiles();
    }

    loadProducts() {
        this.products = this.storageManager.getProducts();
    }

    loadCategories() {
        this.categories = this.storageManager.getCategories();
    }

    filterProducts() {
        let filtered = [...this.products];

        // Filter by category
        if (this.currentCategory) {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(query) ||
                (product.category && product.category.toLowerCase().includes(query)) ||
                (product.barcode && product.barcode.includes(query))
            );
        }

        this.filteredProducts = filtered;
    }

    shouldShowCategories() {
        return this.categories.length > 1;
    }

    renderCategoriesList() {
        if (this.categories.length === 0) {
            return '<div class="no-categories">No categories found</div>';
        }

        const allCategoryHtml = `
            <div class="category-item ${!this.currentCategory ? 'active' : ''}" data-category="">
                <span class="category-name">All Products</span>
                <span class="category-count">${this.products.length}</span>
            </div>
        `;

        const categoriesHtml = this.categories.map(category => {
            const count = this.products.filter(p => p.category === category).length;
            const isActive = this.currentCategory === category;

            return `
                <div class="category-item ${isActive ? 'active' : ''}" data-category="${category}">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('');

        return allCategoryHtml + categoriesHtml;
    }

    renderProductsGrid() {
        if (this.filteredProducts.length === 0) {
            return `
                <div class="no-products">
                    <div class="no-products-icon">📦</div>
                    <div class="no-products-text">
                        ${this.searchQuery ? 'No products found' : 'No products in this category'}
                    </div>
                    ${this.searchQuery ? `
                        <button class="clear-search-btn touch-button touch-btn-primary" data-action="clear-search">
                            <span class="touch-btn-text">Clear Search</span>
                        </button>
                    ` : ''}
                </div>
            `;
        }

        return '<div class="products-grid"></div>';
    }

    renderProductTiles() {
        const gridContainer = document.querySelector('.products-grid');
        if (!gridContainer) return;

        // Clear container
        gridContainer.innerHTML = '';

        // Create product tiles
        this.filteredProducts.forEach(product => {
            const tile = ProductTile.create(product, {
                size: 'large',
                showPrice: true,
                showImage: true,
                showCategory: false,
                onTileClick: this.handleProductClick.bind(this),
                onAddToCart: this.handleAddToCart.bind(this)
            });

            gridContainer.appendChild(tile);
        });
    }

    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            this.handleAction(action, e);
        });

        // Category clicks
        document.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (!categoryItem) return;

            const category = categoryItem.dataset.category;
            this.selectCategory(category || null);
        });

        // Search button
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // Search on input (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value.trim();
                this.updateProducts();
            }, 300);
        });

        // Search on Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Focus on search field for touch devices
        searchInput.addEventListener('touchstart', () => {
            setTimeout(() => searchInput.focus(), 100);
        });
    }

    setupCartListener() {
        this.cartManager.addListener((cartData) => {
            this.updateCartIndicators(cartData);
        });
    }

    handleAction(action, event) {
        switch (action) {
            case 'back':
                this.app.navigateTo('home');
                break;
            case 'home':
                this.app.navigateTo('home');
                break;
            case 'cart':
                this.app.navigateTo('cart');
                break;
            case 'toggle-categories':
                this.toggleCategories();
                break;
            case 'clear-category':
                this.selectCategory(null);
                break;
            case 'clear-search':
                this.clearSearch();
                break;
        }

        // Button feedback
        this.addButtonFeedback(event.target.closest('.touch-button'));
    }

    handleProductClick(product, event) {
        // Show product details or add to cart
        console.log('Product clicked:', product);
    }

    handleAddToCart(product, event) {
        this.cartManager.addItem(product);
        this.showAddedFeedback(event.target);
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.updateProducts();
        this.updateCategorySelection();
        this.updateTitle();
    }

    performSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.updateProducts();
        }
    }

    clearSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.updateProducts();
        }
    }

    toggleCategories() {
        const sidebar = document.getElementById('categories-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('visible');
            sidebar.classList.toggle('hidden');
        }
    }

    updateProducts() {
        this.filterProducts();
        this.renderProductTiles();
        this.updateProductsCount();
    }

    updateProductsCount() {
        const countElement = document.querySelector('.products-count');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} products`;
        }
    }

    updateCategorySelection() {
        document.querySelectorAll('.category-item').forEach(item => {
            const category = item.dataset.category;
            if (category === (this.currentCategory || '')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    updateTitle() {
        const titleElement = document.querySelector('.products-title');
        if (titleElement) {
            titleElement.textContent = this.currentCategory || 'All Products';
        }
    }

    updateCartIndicators(cartData) {
        // Update counter in mini-indicator
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cartData.itemCount;
        }

        // Update cart button in footer
        const cartBtn = document.querySelector('[data-action="cart"]');
        if (cartBtn) {
            const text = cartBtn.querySelector('.touch-btn-text');
            if (text) {
                text.textContent = `Cart (${cartData.itemCount})`;
            }

            // Change button style depending on presence of items
            if (cartData.itemCount > 0) {
                cartBtn.classList.remove('touch-btn-secondary');
                cartBtn.classList.add('touch-btn-success');
            } else {
                cartBtn.classList.remove('touch-btn-success');
                cartBtn.classList.add('touch-btn-secondary');
            }
        }
    }

    showAddedFeedback(button) {
        if (!button) return;

        const originalContent = button.innerHTML;
        
        button.innerHTML = `
            <span class="touch-btn-icon">✓</span>
            <span class="touch-btn-text">Added</span>
        `;
        
        button.classList.add('btn-success-feedback');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('btn-success-feedback');
        }, 1000);
    }

    addButtonFeedback(button) {
        if (!button) return;

        button.classList.add('btn-clicked');
        
        setTimeout(() => {
            button.classList.remove('btn-clicked');
        }, 150);
    }
}

export default ProductsScreen;