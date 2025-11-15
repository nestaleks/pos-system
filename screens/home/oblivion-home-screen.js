class OblivionHomeScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.currentOrder = [];
        this.currentTotal = 0.00;
        this.selectedCategory = 'all';
    }

    async render() {
        const currentTime = new Date().toLocaleTimeString();
        const currentDate = new Date().toLocaleDateString();

        return `
            <div class="pos-layout oblivion-theme">
                <!-- Theme Switcher -->
                <div class="theme-switcher">
                    <button class="theme-btn" data-theme="evolution">Evolution</button>
                    <button class="theme-btn" data-theme="restaurant">Restaurant</button>
                    <button class="theme-btn active" data-theme="oblivion">Oblivion</button>
                </div>

                <!-- Header -->
                <div class="header">
                    <div class="header-left">
                        <h1>🛍️ Modern POS</h1>
                        <div class="store-info">
                            <span class="store-name">Store #001</span>
                            <span class="cashier">Cashier: Admin</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="datetime">
                            <div class="date">${currentDate}</div>
                            <div class="time">${currentTime}</div>
                        </div>
                        <div class="system-status">
                            <span class="status-indicator">●</span>
                            <span>System Online</span>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <!-- Left Panel - Categories & Products -->
                    <div class="products-section">
                        <div class="section-header">
                            <h2>🛒 Products</h2>
                            <div class="product-stats">
                                <span class="product-count">${this.getProductCount()} items</span>
                            </div>
                        </div>
                        
                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${this.renderCategoryTabs()}
                        </div>
                        
                        <!-- Products Grid -->
                        <div class="products-grid">
                            ${this.renderProducts()}
                        </div>
                    </div>

                    <!-- Center Panel - Order Summary -->
                    <div class="order-section">
                        <div class="section-header">
                            <h2>📋 Current Order</h2>
                            <div class="order-number">Order #${this.generateOrderNumber()}</div>
                        </div>
                        
                        <div class="order-display">
                            <div class="order-items">
                                ${this.renderOrderItems()}
                            </div>
                            
                            <div class="order-summary">
                                <div class="summary-line">
                                    <span>Subtotal:</span>
                                    <span>$${this.currentTotal.toFixed(2)}</span>
                                </div>
                                <div class="summary-line tax">
                                    <span>Tax (8.25%):</span>
                                    <span>$${(this.currentTotal * 0.0825).toFixed(2)}</span>
                                </div>
                                <div class="summary-line total">
                                    <span>Total:</span>
                                    <span>$${(this.currentTotal * 1.0825).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="order-actions">
                                <button class="action-btn clear-btn" data-action="clear">🗑️ Clear</button>
                                <button class="action-btn hold-btn" data-action="hold">⏸️ Hold</button>
                                <button class="action-btn discount-btn" data-action="discount">💰 Discount</button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Payment Terminal -->
                    <div class="payment-section">
                        <div class="section-header">
                            <h2>💳 Payment Terminal</h2>
                            <div class="tender-amount">$${(this.currentTotal * 1.0825).toFixed(2)}</div>
                        </div>
                        
                        <!-- Payment Methods -->
                        <div class="payment-methods">
                            <button class="payment-btn cash-btn" data-payment="cash">
                                <span class="payment-icon">💵</span>
                                <span class="payment-text">Cash</span>
                            </button>
                            <button class="payment-btn card-btn" data-payment="card">
                                <span class="payment-icon">💳</span>
                                <span class="payment-text">Card</span>
                            </button>
                            <button class="payment-btn digital-btn" data-payment="digital">
                                <span class="payment-icon">📱</span>
                                <span class="payment-text">Digital</span>
                            </button>
                            <button class="payment-btn check-btn" data-payment="check">
                                <span class="payment-icon">🏦</span>
                                <span class="payment-text">Check</span>
                            </button>
                        </div>
                        
                        <!-- Amount Input -->
                        <div class="amount-section">
                            <label for="payment-amount">💰 Amount Tendered</label>
                            <input type="number" id="payment-amount" value="0.00" step="0.01" readonly>
                            <div class="quick-amounts">
                                ${this.renderQuickAmounts()}
                            </div>
                        </div>
                        
                        <!-- Number Pad -->
                        <div class="numpad-section">
                            <h3>🔢 Number Pad</h3>
                            <div class="number-pad">
                                ${this.renderNumberPad()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <div class="footer-left">
                        <span class="transaction-info">Transaction: TXN-${Date.now().toString().slice(-6)}</span>
                        <span class="items-count">${this.currentOrder.length} items</span>
                    </div>
                    <div class="footer-center">
                        <div class="help-text">💡 Select products → Review order → Choose payment method</div>
                    </div>
                    <div class="footer-right">
                        <span class="register-info">Register #1</span>
                        <span class="version-info">v2.0</span>
                    </div>
                </div>
            </div>
        `;
    }

    getProductCount() {
        return this.getAllProducts().length;
    }

    generateOrderNumber() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }

    renderCategoryTabs() {
        const categories = [
            { id: 'all', name: '🌟 All', color: '#6366f1' },
            { id: 'beverages', name: '🥤 Drinks', color: '#3b82f6' },
            { id: 'food', name: '🍔 Food', color: '#f59e0b' },
            { id: 'desserts', name: '🍰 Desserts', color: '#ec4899' },
            { id: 'snacks', name: '🍿 Snacks', color: '#10b981' },
            { id: 'hot', name: '🔥 Hot Items', color: '#ef4444' }
        ];

        return categories.map(category => `
            <button class="category-tab ${this.selectedCategory === category.id ? 'active' : ''}" 
                    data-category="${category.id}"
                    style="border-color: ${category.color}; ${this.selectedCategory === category.id ? `background: ${category.color}; color: white;` : `color: ${category.color};`}">
                ${category.name}
            </button>
        `).join('');
    }

    getAllProducts() {
        return [
            { id: 1, name: 'Cola Classic', price: 1.25, category: 'beverages', emoji: '🥤' },
            { id: 2, name: 'Orange Juice', price: 2.50, category: 'beverages', emoji: '🍊' },
            { id: 3, name: 'Coffee Latte', price: 3.75, category: 'beverages', emoji: '☕' },
            { id: 4, name: 'Green Tea', price: 2.00, category: 'beverages', emoji: '🍵' },
            { id: 5, name: 'Energy Drink', price: 2.99, category: 'beverages', emoji: '⚡' },
            { id: 6, name: 'Mineral Water', price: 1.50, category: 'beverages', emoji: '💧' },
            
            { id: 10, name: 'Cheeseburger', price: 8.99, category: 'food', emoji: '🍔' },
            { id: 11, name: 'Caesar Salad', price: 7.50, category: 'food', emoji: '🥗' },
            { id: 12, name: 'Chicken Wings', price: 9.25, category: 'food', emoji: '🍗' },
            { id: 13, name: 'Fish Tacos', price: 10.50, category: 'food', emoji: '🌮' },
            { id: 14, name: 'Pasta Marinara', price: 12.00, category: 'food', emoji: '🍝' },
            { id: 15, name: 'Grilled Chicken', price: 13.75, category: 'food', emoji: '🍖' },
            
            { id: 20, name: 'Chocolate Cake', price: 4.50, category: 'desserts', emoji: '🍰' },
            { id: 21, name: 'Ice Cream Sundae', price: 3.75, category: 'desserts', emoji: '🍨' },
            { id: 22, name: 'Apple Pie', price: 3.25, category: 'desserts', emoji: '🥧' },
            { id: 23, name: 'Tiramisu', price: 5.50, category: 'desserts', emoji: '🍮' },
            { id: 24, name: 'Cookies & Cream', price: 2.75, category: 'desserts', emoji: '🍪' },
            
            { id: 30, name: 'Potato Chips', price: 1.99, category: 'snacks', emoji: '🍟' },
            { id: 31, name: 'Mixed Nuts', price: 3.50, category: 'snacks', emoji: '🥜' },
            { id: 32, name: 'Granola Bar', price: 2.25, category: 'snacks', emoji: '🍫' },
            { id: 33, name: 'Fruit Cup', price: 2.99, category: 'snacks', emoji: '🍎' },
            { id: 34, name: 'Yogurt Parfait', price: 3.75, category: 'snacks', emoji: '🥛' },
            
            { id: 40, name: 'Hot Pizza Slice', price: 4.25, category: 'hot', emoji: '🍕' },
            { id: 41, name: 'Grilled Panini', price: 6.75, category: 'hot', emoji: '🥪' },
            { id: 42, name: 'Hot Soup', price: 4.50, category: 'hot', emoji: '🍲' },
            { id: 43, name: 'Fresh Fries', price: 3.25, category: 'hot', emoji: '🍟' },
            { id: 44, name: 'Hot Dogs', price: 5.50, category: 'hot', emoji: '🌭' }
        ];
    }

    renderProducts() {
        const products = this.getAllProducts();
        const filteredProducts = this.selectedCategory === 'all' 
            ? products 
            : products.filter(p => p.category === this.selectedCategory);

        return filteredProducts.map(product => `
            <div class="product-item ${product.category}" 
                 data-product-id="${product.id}"
                 data-product-name="${product.name}"
                 data-product-price="${product.price}"
                 data-category="${product.category}">
                <div class="product-emoji">${product.emoji}</div>
                <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                </div>
                <div class="add-btn">+</div>
            </div>
        `).join('');
    }

    renderOrderItems() {
        if (this.currentOrder.length === 0) {
            return `
                <div class="empty-order">
                    <div class="empty-icon">🛒</div>
                    <div class="empty-text">No items in order</div>
                    <div class="empty-subtitle">Start by selecting products</div>
                </div>
            `;
        }

        return this.currentOrder.map((item, index) => {
            const product = this.getAllProducts().find(p => p.id === item.id);
            const emoji = product ? product.emoji : '🛍️';
            
            return `
                <div class="order-item" data-item-index="${index}">
                    <div class="item-emoji">${emoji}</div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-unit-price">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="item-quantity">
                        <button class="qty-btn minus" data-action="decrease" data-index="${index}">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn plus" data-action="increase" data-index="${index}">+</button>
                    </div>
                    <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" data-remove-index="${index}">×</button>
                </div>
            `;
        }).join('');
    }

    renderQuickAmounts() {
        const total = this.currentTotal * 1.0825;
        const amounts = [
            { label: 'Exact', value: total.toFixed(2) },
            { label: '$5', value: '5.00' },
            { label: '$10', value: '10.00' },
            { label: '$20', value: '20.00' },
            { label: '$50', value: '50.00' },
            { label: '$100', value: '100.00' }
        ];

        return amounts.map(amount => `
            <button class="quick-amount-btn" data-amount="${amount.value}">
                ${amount.label}
            </button>
        `).join('');
    }

    renderNumberPad() {
        const keys = [
            { value: '7', label: '7' },
            { value: '8', label: '8' },
            { value: '9', label: '9' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
            { value: '6', label: '6' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: 'clear', label: 'Clear', class: 'clear' },
            { value: '0', label: '0' },
            { value: '.', label: '.' },
        ];

        return keys.map(key => `
            <button class="num-btn ${key.class || ''}" data-number="${key.value}">
                ${key.label}
            </button>
        `).join('');
    }

    async afterRender() {
        this.setupEventListeners();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    setupEventListeners() {
        // Theme switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                this.handleThemeSwitch(e.target.dataset.theme, e.target);
            }
        });

        // Category switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.selectedCategory = e.target.dataset.category;
                this.updateProductDisplay();
            }
        });

        // Product selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('product-item') || e.target.closest('.product-item')) {
                const item = e.target.closest('.product-item') || e.target;
                const productData = {
                    id: parseInt(item.dataset.productId),
                    name: item.dataset.productName,
                    price: parseFloat(item.dataset.productPrice)
                };
                this.addProductToOrder(productData);
            }
        });

        // Quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const action = e.target.dataset.action;
                const index = parseInt(e.target.dataset.index);
                this.handleQuantityChange(action, index);
            }
        });

        // Remove item from order
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const index = parseInt(e.target.dataset.removeIndex);
                this.removeItemFromOrder(index);
            }
        });

        // Order actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const action = e.target.dataset.action;
                this.handleOrderAction(action);
            }
        });

        // Payment buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('payment-btn') || e.target.closest('.payment-btn')) {
                const btn = e.target.closest('.payment-btn') || e.target;
                const method = btn.dataset.payment;
                this.handlePayment(method);
            }
        });

        // Quick amount buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-amount-btn')) {
                const amount = e.target.dataset.amount;
                document.getElementById('payment-amount').value = amount;
            }
        });

        // Number pad
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('num-btn')) {
                const number = e.target.dataset.number;
                this.handleNumberInput(number);
            }
        });
    }

    handleThemeSwitch(theme, button) {
        // Update active state
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        switch(theme) {
            case 'evolution':
                this.app.loadEvolutionTheme();
                break;
            case 'restaurant':
                this.app.loadRestaurantTheme();
                break;
        }
    }

    updateProductDisplay() {
        const productGrid = document.querySelector('.products-grid');
        const categoryTabs = document.querySelectorAll('.category-tab');
        
        if (productGrid) {
            productGrid.innerHTML = this.renderProducts();
        }

        // Update active category tab
        categoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === this.selectedCategory);
        });
    }

    handleQuantityChange(action, index) {
        if (action === 'increase') {
            this.currentOrder[index].quantity += 1;
        } else if (action === 'decrease' && this.currentOrder[index].quantity > 1) {
            this.currentOrder[index].quantity -= 1;
        }
        
        this.updateOrderDisplay();
        this.calculateTotal();
    }

    addProductToOrder(product) {
        const existingItem = this.currentOrder.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.currentOrder.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateOrderDisplay();
        this.calculateTotal();
        this.showNotification(`Added ${product.name} to order`, 'success');
    }

    removeItemFromOrder(index) {
        const item = this.currentOrder[index];
        this.currentOrder.splice(index, 1);
        this.updateOrderDisplay();
        this.calculateTotal();
        this.showNotification(`Removed ${item.name} from order`, 'info');
    }

    handleOrderAction(action) {
        switch (action) {
            case 'clear':
                if (this.currentOrder.length > 0) {
                    this.currentOrder = [];
                    this.updateOrderDisplay();
                    this.calculateTotal();
                    this.showNotification('Order cleared', 'info');
                }
                break;
            case 'hold':
                if (this.currentOrder.length > 0) {
                    this.showNotification('Order held', 'success');
                }
                break;
            case 'discount':
                if (this.currentOrder.length > 0) {
                    this.showNotification('Discount applied', 'success');
                }
                break;
        }
    }

    handlePayment(method) {
        if (this.currentOrder.length === 0) {
            this.showNotification('No items to pay for', 'warning');
            return;
        }

        const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
        const total = this.currentTotal * 1.0825;
        
        if (amount < total) {
            this.showNotification('Payment amount is less than total', 'warning');
            return;
        }

        const change = amount - total;
        const paymentMethods = {
            cash: '💵 Cash',
            card: '💳 Card',
            digital: '📱 Digital',
            check: '🏦 Check'
        };
        
        if (confirm(`Process ${paymentMethods[method]} payment of $${amount.toFixed(2)}?\nTotal: $${total.toFixed(2)}\nChange: $${change.toFixed(2)}`)) {
            this.currentOrder = [];
            this.updateOrderDisplay();
            this.calculateTotal();
            document.getElementById('payment-amount').value = '0.00';
            this.showNotification('Payment completed successfully! 🎉', 'success');
        }
    }

    handleNumberInput(number) {
        const input = document.getElementById('payment-amount');
        
        if (number === 'clear') {
            input.value = '0.00';
        } else if (number === '.') {
            if (!input.value.includes('.')) {
                input.value += number;
            }
        } else {
            if (input.value === '0.00') {
                input.value = number;
            } else {
                input.value += number;
            }
        }
    }

    updateOrderDisplay() {
        const orderContainer = document.querySelector('.order-items');
        const itemsCountElement = document.querySelector('.items-count');
        
        if (orderContainer) {
            orderContainer.innerHTML = this.renderOrderItems();
        }

        if (itemsCountElement) {
            itemsCountElement.textContent = `${this.currentOrder.length} items`;
        }
    }

    calculateTotal() {
        this.currentTotal = this.currentOrder.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Update all total displays
        const summaryElements = document.querySelectorAll('.summary-line span:last-child');
        const tenderElement = document.querySelector('.tender-amount');
        const quickAmountsContainer = document.querySelector('.quick-amounts');

        if (summaryElements.length >= 3) {
            summaryElements[0].textContent = `$${this.currentTotal.toFixed(2)}`; // Subtotal
            summaryElements[1].textContent = `$${(this.currentTotal * 0.0825).toFixed(2)}`; // Tax
            summaryElements[2].textContent = `$${(this.currentTotal * 1.0825).toFixed(2)}`; // Total
        }

        if (tenderElement) {
            tenderElement.textContent = `$${(this.currentTotal * 1.0825).toFixed(2)}`;
        }

        if (quickAmountsContainer) {
            quickAmountsContainer.innerHTML = this.renderQuickAmounts();
        }

        // Update payment amount to match total
        const paymentInput = document.getElementById('payment-amount');
        if (paymentInput && this.currentTotal > 0) {
            paymentInput.value = (this.currentTotal * 1.0825).toFixed(2);
        }
    }

    updateTime() {
        const dateElement = document.querySelector('.date');
        const timeElement = document.querySelector('.time');
        
        if (dateElement && timeElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

export default OblivionHomeScreen;