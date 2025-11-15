class HomeScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
    }

    async render() {
        const cartItems = this.cartManager.getItems();
        const cartTotal = this.cartManager.getTotal();
        const subtotal = this.cartManager.getSubtotal();
        const tax = this.cartManager.getTax();

        return `
            <div class="pos-layout">
                <!-- iPad Status Bar -->
                <div class="ipad-status-bar">
                    <div class="status-left">iPad</div>
                    <div class="status-center">10:16 AM</div>
                    <div class="status-right">91%</div>
                </div>

                <!-- Theme Switcher -->
                <div class="theme-switcher">
                    <button class="theme-btn active" data-theme="evolution">Evolution</button>
                    <button class="theme-btn" data-theme="restaurant">Restaurant</button>
                    <button class="theme-btn" data-theme="oblivion">Oblivion</button>
                    <button class="theme-btn" data-theme="vect">Vect</button>
                </div>

                <!-- Header with promotion banner -->
                <div class="pos-header">
                    <div class="promotion-banner">
                        <span class="promo-text">Buy 2 Valley milk packs, get 1 for free</span>
                        <div class="promo-nav">
                            <button class="nav-arrow prev">❮</button>
                            <button class="nav-arrow next">❯</button>
                        </div>
                    </div>
                    <div class="header-actions">
                        <div class="tab-buttons">
                            <button class="tab-btn">Categories</button>
                            <button class="tab-btn">One Click</button>
                            <button class="tab-btn active">Scale</button>
                        </div>
                        <button class="search-btn">🔍</button>
                    </div>
                </div>

                <!-- Main content area -->
                <div class="pos-main">
                    <!-- Left panel - Order list -->
                    <div class="order-panel">
                        <div class="order-items">
                            ${this.renderOrderItems(cartItems)}
                        </div>
                        
                        <div class="order-summary">
                            <div class="summary-row">
                                <span>Sub Total</span>
                                <span>$30.00</span>
                            </div>
                            <div class="summary-row discount">
                                <span>Discount / Savings</span>
                                <span>$0.43 / -$0.22</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax</span>
                                <span>$7.59</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span>$42.24</span>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button class="action-btn cancel">
                                <span class="btn-icon">⏰</span>
                                Cancel
                                <span class="btn-badge">3</span>
                            </button>
                            <button class="action-btn hold">
                                <span class="btn-icon">⏸</span>
                                Hold
                            </button>
                        </div>
                    </div>

                    <!-- Center panel - Categories -->
                    <div class="categories-panel">
                        <div id="categories-grid"></div>
                    </div>

                    <!-- Right panel - Numpad and payment -->
                    <div class="payment-panel">
                        <div class="price-display">
                            <button class="clear-price">✕</button>
                            <span class="current-price">$6.95</span>
                            <button class="nav-arrow">❮</button>
                            <button class="sku-btn">SKU</button>
                        </div>
                        
                        <div class="numpad-grid">
                            <button class="num-btn">7</button>
                            <button class="num-btn">8</button>
                            <button class="num-btn">9</button>
                            <button class="preset-btn dark">$50</button>
                            <button class="preset-btn dark">$100</button>
                            <button class="num-btn">4</button>
                            <button class="num-btn blue">5</button>
                            <button class="num-btn">6</button>
                            <button class="preset-btn dark">$43</button>
                            <button class="preset-btn dark">$42,24</button>
                            <button class="num-btn">1</button>
                            <button class="num-btn">2</button>
                            <button class="num-btn">3</button>
                            <button class="payment-btn credit">Credit</button>
                            <button class="payment-btn other">Other</button>
                            <button class="num-btn wide">00</button>
                            <button class="num-btn">0</button>
                            <button class="num-btn">@</button>
                            <button class="payment-btn refund">Refund</button>
                            <button class="payment-btn cash">Cash</button>
                        </div>
                    </div>
                </div>

                <!-- Bottom navigation -->
                <div class="bottom-nav">
                    <div class="nav-left">
                        <div class="user-info">
                            <div class="user-avatar">👤</div>
                            <div class="user-details">
                                <div class="user-name">Johny Wallenstein</div>
                                <button class="logout-btn">Logout</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="nav-center">
                        <button class="nav-btn">🏠<br>Home</button>
                        <button class="nav-btn">👤<br>Vendor Payout</button>
                        <button class="nav-btn">💰<br>Cash drop</button>
                        <button class="nav-btn">🚫<br>No Sale</button>
                        <button class="nav-btn">📊<br>Store Stats</button>
                    </div>
                    
                    <div class="nav-right">
                        <button class="brand-btn br-club">BR Club Account</button>
                        <button class="brand-btn pinless">Pinless Recharge</button>
                        <button class="brand-btn evolution-brand">EVOLUTION</button>
                    </div>
                </div>
                
                <div class="footer-message">
                    Ask the Customer for the their Evolution Account Number for Savings
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.setupCategoriesGrid();
        this.setupEventListeners();
        this.setupCartListener();
    }

    renderOrderItems(cartItems) {
        // Always show sample items to match pos.jpg design exactly
        const sampleItems = [
            { name: 'Tequila El Tesoro Platinum', price: 30.00 },
            { name: 'Canned', price: 7.59 },
            { name: 'Glade Clean Linen Solid Air Freshener', price: 4.00, quantity: 2, unitPrice: 2.00 },
            { name: 'Snacks', price: 0.65 },
            { name: 'Small Coffee', price: 2.67, quantity: 3, unitPrice: 0.89 }
        ];

        return sampleItems.map(item => `
            <div class="order-item">
                <div class="item-name">${item.name}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                ${item.quantity ? `<div class="item-details">${item.quantity} @ ${item.unitPrice.toFixed(2)}</div>` : ''}
            </div>
        `).join('');
    }

    setupCategoriesGrid() {
        const gridContainer = document.getElementById('categories-grid');
        if (!gridContainer) return;

        // Exact layout from pos.jpg - 6 columns x 4 rows
        const categories = [
            // Row 1
            { id: 'alcohol', name: 'Alcohol', selected: true, type: 'green' },
            { id: 'calling-card', name: 'Calling Card', selected: false },
            { id: 'canned', name: 'Canned', selected: false },
            { id: 'cleaning', name: 'Cleaning', selected: true, type: 'green' },
            { id: 'dairy', name: 'Dairy', selected: false },
            { id: 'dairy-2', name: 'Dairy', selected: false },
            // Row 2
            { id: 'drinks', name: 'Drinks', selected: false },
            { id: 'frozen', name: 'Frozen', selected: false },
            { id: 'general-food', name: 'General Food', selected: false, type: 'blue' },
            { id: 'household', name: 'Household', selected: false },
            { id: 'hygiene', name: 'Hygiene', selected: false },
            { id: 'hygiene-2', name: 'Hygiene', selected: false },
            // Row 3
            { id: 'miscellane', name: 'Miscellane', selected: false },
            { id: 'non-taxable', name: 'Non-Taxable', selected: false },
            { id: 'pasta-rice', name: 'Pasta / Rice', selected: false },
            { id: 'pet', name: 'Pet', selected: false },
            { id: 'produce', name: 'Produce', selected: false },
            { id: 'vitamins', name: 'Vitamins', selected: false },
            // Row 4
            { id: 'snacks', name: 'Snacks', selected: true, type: 'green' },
            { id: 'tobacco', name: 'Tobacco', selected: false },
            { id: 'empty-1', name: '', selected: false, empty: true },
            { id: 'empty-2', name: '', selected: false, empty: true },
            { id: 'empty-3', name: '', selected: false, empty: true },
            { id: 'empty-4', name: '', selected: false, empty: true }
        ];

        const categoryHTML = categories.map(category => {
            if (category.empty) {
                return '<div class="category-btn empty"></div>';
            }
            
            const selectedClass = category.selected ? 
                (category.type === 'blue' ? 'selected-blue' : 'selected') : '';
            
            return `
                <button class="category-btn ${selectedClass}" 
                        data-category="${category.id}">
                    ${category.name}
                    ${category.selected ? '<span class="check-mark">✓</span>' : ''}
                </button>
            `;
        }).join('');

        gridContainer.innerHTML = categoryHTML;
    }

    setupEventListeners() {
        // Theme switcher
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                this.handleThemeSwitch(e.target.dataset.theme, e.target);
            }
        });

        // Quick actions
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            this.handleQuickAction(action, e);
        });

        // POS system events
        document.addEventListener('pos:grid:navigate', (e) => {
            const screenName = e.detail.item.id;
            this.navigateToScreen(screenName);
        });

        document.addEventListener('pos:grid:search', () => {
            this.showSearchDialog();
        });

        document.addEventListener('pos:grid:categories', () => {
            this.showCategoriesDialog();
        });

        document.addEventListener('pos:grid:reports', () => {
            this.showReportsDialog();
        });

        document.addEventListener('pos:grid:settings', () => {
            this.showSettingsDialog();
        });

        document.addEventListener('pos:grid:help', () => {
            this.showHelpDialog();
        });
    }

    setupCartListener() {
        this.cartManager.addListener((cartData) => {
            this.updateCartIndicator(cartData);
            this.updateGridBadges(cartData);
            this.updateQuickActions(cartData);
        });
    }

    handleGridItemClick(item, event) {
        console.log('Grid item clicked:', item);
        
        // Add click animation
        const gridItem = event.target.closest('.grid-item');
        if (gridItem) {
            gridItem.classList.add('grid-item-clicked');
            setTimeout(() => {
                gridItem.classList.remove('grid-item-clicked');
            }, 200);
        }
    }

    handleQuickAction(action, event) {
        switch (action) {
            case 'scan-barcode':
                this.startBarcodeScanning();
                break;
            case 'quick-checkout':
                if (this.cartManager.getItemCount() > 0) {
                    this.navigateToScreen('payment');
                }
                break;
        }

        // Button feedback
        const button = event.target.closest('.quick-action-btn');
        if (button && !button.disabled) {
            button.classList.add('btn-clicked');
            setTimeout(() => {
                button.classList.remove('btn-clicked');
            }, 150);
        }
    }

    navigateToScreen(screenName) {
        // Check screen availability
        if (screenName === 'payment' && this.cartManager.isEmpty()) {
            this.showMessage('Cart is empty', 'warning');
            return;
        }

        this.app.navigateTo(screenName);
    }

    startBarcodeScanning() {
        // Placeholder for barcode scanning
        this.showMessage('Barcode scanning feature coming soon', 'info');
    }

    showSearchDialog() {
        // Simple search via prompt (can be replaced with modal window)
        const query = prompt('Enter product name to search:');
        if (query && query.trim()) {
            this.app.navigateTo('products', { search: query.trim() });
        }
    }

    showCategoriesDialog() {
        const categories = this.storageManager.getCategories();
        if (categories.length === 0) {
            this.showMessage('No categories found', 'info');
            return;
        }

        // Simple category selection (can be replaced with modal window)
        const categoryList = categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n');
        const choice = prompt(`Select category (enter number):\n${categoryList}`);
        
        const categoryIndex = parseInt(choice) - 1;
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
            const selectedCategory = categories[categoryIndex];
            this.app.navigateTo('products', { category: selectedCategory });
        }
    }

    showReportsDialog() {
        this.showMessage('Reports feature coming soon', 'info');
    }

    showSettingsDialog() {
        this.showMessage('Settings feature coming soon', 'info');
    }

    showHelpDialog() {
        const helpText = `POS System - Quick Guide:

1. Products - browse and add items to cart
2. Cart - manage selected items
3. Payment - process customer payment
4. Search - quick product search
5. Scan - barcode scanning

Use touch interface for operation.`;
        
        alert(helpText);
    }

    updateCartIndicator(cartData) {
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');

        if (cartCount) {
            cartCount.textContent = `${cartData.itemCount} items`;
        }

        if (cartTotal) {
            cartTotal.textContent = this.formatPrice(cartData.total);
        }
    }

    updateGridBadges(cartData) {
        const cartGridItem = document.querySelector('[data-item-id="cart"]');
        if (cartGridItem) {
            const badge = cartGridItem.querySelector('.grid-item-badge');
            const subtitle = cartGridItem.querySelector('.grid-item-subtitle');

            if (cartData.itemCount > 0) {
                if (badge) {
                    badge.textContent = cartData.itemCount;
                    badge.style.display = 'block';
                }
                if (subtitle) {
                    subtitle.textContent = `${cartData.itemCount} items`;
                }
                cartGridItem.classList.remove('grid-item-secondary');
                cartGridItem.classList.add('grid-item-success');
            } else {
                if (badge) {
                    badge.style.display = 'none';
                }
                if (subtitle) {
                    subtitle.textContent = 'Empty';
                }
                cartGridItem.classList.remove('grid-item-success');
                cartGridItem.classList.add('grid-item-secondary');
            }
        }
    }

    updateQuickActions(cartData) {
        const quickCheckoutBtn = document.querySelector('[data-action="quick-checkout"]');
        if (quickCheckoutBtn) {
            if (cartData.itemCount > 0) {
                quickCheckoutBtn.disabled = false;
                quickCheckoutBtn.classList.remove('disabled');
            } else {
                quickCheckoutBtn.disabled = true;
                quickCheckoutBtn.classList.add('disabled');
            }
        }
    }

    showMessage(text, type = 'info') {
        // Simple notification (can be replaced with toast)
        const message = `${type.toUpperCase()}: ${text}`;
        console.log(message);
        
        // Temporary solution via alert
        alert(text);
    }

    handleThemeSwitch(theme, button) {
        // Update active state
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (theme === 'restaurant') {
            // Switch to restaurant theme
            this.app.loadRestaurantTheme();
        } else if (theme === 'oblivion') {
            // Switch to oblivion theme
            this.app.loadOblivionTheme();
        } else if (theme === 'vect') {
            // Switch to vect theme
            this.app.loadVectTheme();
        } else {
            // Keep current evolution theme
            const posLayout = document.querySelector('.pos-layout');
            posLayout.className = 'pos-layout';
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }
}

export default HomeScreen;