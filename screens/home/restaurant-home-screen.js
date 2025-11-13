class RestaurantHomeScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.currentOrder = [];
        this.currentTotal = 0.00;
    }

    async render() {
        const currentDate = new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        const currentTime = new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return `
            <div class="pos-layout restaurant-theme">
                <!-- Theme Switcher -->
                <div class="theme-switcher">
                    <button class="theme-btn" data-theme="evolution">Evolution</button>
                    <button class="theme-btn active" data-theme="restaurant">Restaurant</button>
                    <button class="theme-btn" data-theme="express">Express</button>
                </div>

                <!-- Header -->
                <div class="pos-header">
                    <div class="header-left">
                        <div class="date-display">${currentDate}</div>
                        <div class="quick-actions">
                            <button class="quick-btn">Sign On</button>
                            <button class="quick-btn">VIEW OPEN CHECKS</button>
                        </div>
                    </div>
                    <div class="header-center">
                        <div class="current-item">Lemonade</div>
                        <div class="item-price">£2.20</div>
                    </div>
                    <div class="header-right">
                        <div class="register-info">
                            <div>Bytes</div>
                            <div>REG</div>
                            <div>Std Prices</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="pos-main">
                    <!-- Left Panel - Categories -->
                    <div class="menu-panel">
                        ${this.renderCategoryMenu()}
                    </div>

                    <!-- Center Panel - Menu Items -->
                    <div class="menu-grid-panel">
                        <div class="menu-grid" id="restaurant-menu-grid">
                            ${this.renderMenuItems()}
                        </div>
                    </div>

                    <!-- Right Panel - Order & Payment -->
                    <div class="order-payment-panel">
                        <!-- Order Display -->
                        <div class="order-display">
                            <div class="order-header">Current Order:</div>
                            <div id="order-items">
                                ${this.renderOrderItems()}
                            </div>
                        </div>

                        <!-- Total Display -->
                        <div class="total-display">
                            <div class="total-label">TOTAL</div>
                            <div class="total-amount">£${this.currentTotal.toFixed(2)}</div>
                        </div>

                        <!-- Numeric Keypad -->
                        <div class="keypad-section">
                            <div class="keypad-grid">
                                <button class="keypad-btn" data-key="7">7</button>
                                <button class="keypad-btn" data-key="8">8</button>
                                <button class="keypad-btn" data-key="9">9</button>
                                <button class="keypad-btn" data-key="4">4</button>
                                <button class="keypad-btn" data-key="5">5</button>
                                <button class="keypad-btn" data-key="6">6</button>
                                <button class="keypad-btn" data-key="1">1</button>
                                <button class="keypad-btn" data-key="2">2</button>
                                <button class="keypad-btn" data-key="3">3</button>
                                <button class="keypad-btn keypad-btn-wide" data-key="0">0</button>
                                <button class="keypad-btn" data-key="00">00</button>
                            </div>

                            <!-- Function Buttons -->
                            <div class="function-buttons">
                                <button class="function-btn error-correct">Error Corr</button>
                                <button class="function-btn cancel">CANCEL</button>
                                <button class="function-btn plu">PLU</button>
                                <button class="function-btn no-sale">NO SALE</button>
                            </div>

                            <!-- Special Buttons -->
                            <div class="special-buttons">
                                <button class="special-btn new-balance">New Balance</button>
                                <button class="special-btn subtotal">SUBTOTAL</button>
                                <button class="special-btn account">Account</button>
                            </div>

                            <!-- Payment Buttons -->
                            <div class="payment-buttons">
                                <button class="payment-btn credit-card">CREDIT CARD</button>
                                <button class="payment-btn cash">CASH</button>
                                <button class="payment-btn cheque">CHEQUE</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="pos-footer">
                    <div class="device-selector">
                        <button class="device-btn active">Device 1</button>
                        <button class="device-btn">Device 2</button>
                        <button class="device-btn">Device 3</button>
                    </div>
                    <div class="time-display">${currentTime}</div>
                </div>
            </div>
        `;
    }

    renderCategoryMenu() {
        const categories = [
            { name: 'DRINKS', items: ['Fortwaker', 'Rüngwood Best', 'Jungle Or Dore', 'Ale Or Might'] },
            { name: 'STARTERS', items: ['Festers', 'Guinness'] },
            { name: 'MAINS', items: ['Becks', 'Budweiser', 'Corona', 'Sol'] },
            { name: 'DESSERTS', items: ['Red Stripe'] },
            { name: 'SPECIALS', items: ['Coke', 'Diet Coke', 'Lemonade', '120', 'Fruit Shoot'] },
            { name: 'Useful Features', items: ['Whisky', 'Vodka', 'Gin', 'White Rum', 'Rum'] },
            { name: 'HALF PINT', items: ['Nessie Jessie', 'Beam Me Up Scotty', 'Cocktail Voucher', 'Three Course Meal'] }
        ];

        return categories.map(category => `
            <div class="category-section">
                <div class="category-header">${category.name}</div>
                <div class="category-items">
                    ${category.items.map(item => `
                        <button class="category-item" data-item="${item}">${item}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderMenuItems() {
        const menuItems = [
            // Drinks (Green)
            { name: 'Fortwaker', category: 'drinks', price: 3.50 },
            { name: 'Rüngwood Best', category: 'drinks', price: 3.20 },
            { name: 'Jungle Or Dore', category: 'drinks', price: 3.80 },
            { name: 'Ale Or Might', category: 'drinks', price: 3.60 },
            
            // Starters (Green)
            { name: 'Festers', category: 'starters', price: 4.50 },
            { name: 'Guinness', category: 'starters', price: 4.20 },
            { name: 'Calamari', category: 'starters', price: 5.50 },
            { name: 'Bruschetta', category: 'starters', price: 4.80 },
            
            // Mains (Orange/Yellow)
            { name: 'Becks', category: 'mains', price: 8.50 },
            { name: 'Budweiser', category: 'mains', price: 7.80 },
            { name: 'Corona', category: 'mains', price: 8.20 },
            { name: 'Sol', category: 'mains', price: 7.90 },
            
            // Desserts (Orange/Yellow)
            { name: 'Red Stripe', category: 'desserts', price: 4.50 },
            { name: 'Tiramisu', category: 'desserts', price: 5.20 },
            { name: 'Ice Cream', category: 'desserts', price: 3.80 },
            { name: 'Chocolate Cake', category: 'desserts', price: 5.50 },
            
            // Specials (Light Gray)
            { name: 'Coke', category: 'specials', price: 2.20 },
            { name: 'Diet Coke', category: 'specials', price: 2.20 },
            { name: 'Lemonade', category: 'specials', price: 2.20 },
            { name: 'Fruit Shoot', category: 'specials', price: 1.80 },
            
            // Alcohol (Pink)
            { name: 'Whisky', category: 'alcohol', price: 4.50 },
            { name: 'Vodka', category: 'alcohol', price: 4.20 },
            { name: 'Gin', category: 'alcohol', price: 4.30 },
            { name: 'White Rum', category: 'alcohol', price: 4.40 },
            
            // Useful Features (Orange)
            { name: 'Nessie Jessie', category: 'useful', price: 6.50 },
            { name: 'Beam Me Up Scotty', category: 'useful', price: 7.20 },
            { name: 'Special Mix', category: 'useful', price: 5.80 },
            { name: 'House Special', category: 'useful', price: 8.50 },
            
            // Half Pint (Blue)
            { name: 'Cocktail Voucher', category: 'half-pint', price: 12.50 },
            { name: 'Three Course Meal', category: 'half-pint', price: 18.90 },
            { name: 'Wine Tasting', category: 'half-pint', price: 15.20 },
            { name: 'Chef Special', category: 'half-pint', price: 22.50 }
        ];

        return menuItems.map(item => `
            <button class="menu-item ${item.category}" data-item='${JSON.stringify(item)}'>
                ${item.name}
            </button>
        `).join('');
    }

    renderOrderItems() {
        if (this.currentOrder.length === 0) {
            return '<div class="empty-order">No items selected</div>';
        }

        return this.currentOrder.map((item, index) => `
            <div class="order-item">
                <div class="item-quantity">1</div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">£${item.price.toFixed(2)}</div>
            </div>
        `).join('');
    }

    async afterRender() {
        this.setupEventListeners();
        this.setupThemeSwitcher();
        this.updateOrderDisplay();
    }

    setupEventListeners() {
        // Menu item clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                const itemData = JSON.parse(e.target.dataset.item);
                this.addItemToOrder(itemData);
            }
        });

        // Keypad clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('keypad-btn')) {
                const key = e.target.dataset.key;
                this.handleKeypadInput(key);
            }
        });

        // Function button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('function-btn')) {
                this.handleFunctionButton(e.target.textContent);
            }
        });

        // Payment button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('payment-btn')) {
                this.handlePayment(e.target.textContent);
            }
        });

        // Device selector
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('device-btn')) {
                document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });

        // Category filter (left panel)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-item')) {
                this.filterMenuByCategory(e.target.dataset.item);
            }
        });
    }

    setupThemeSwitcher() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
                
                // Update active state
                document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    switchTheme(theme) {
        const posLayout = document.querySelector('.pos-layout');
        
        if (theme === 'evolution') {
            // Switch back to Evolution theme
            this.app.loadEvolutionTheme();
        } else if (theme === 'express') {
            // Switch to Express theme
            this.app.loadExpressTheme();
        } else if (theme === 'restaurant') {
            posLayout.className = 'pos-layout restaurant-theme';
        }
    }

    addItemToOrder(item) {
        this.currentOrder.push(item);
        this.currentTotal += item.price;
        this.updateOrderDisplay();
        this.updateHeaderDisplay(item);
        
        // Add visual feedback
        this.showItemAddedFeedback(item);
    }

    updateOrderDisplay() {
        const orderItemsContainer = document.getElementById('order-items');
        if (orderItemsContainer) {
            orderItemsContainer.innerHTML = this.renderOrderItems();
        }

        const totalDisplay = document.querySelector('.total-amount');
        if (totalDisplay) {
            totalDisplay.textContent = `£${this.currentTotal.toFixed(2)}`;
        }
    }

    updateHeaderDisplay(item) {
        const currentItem = document.querySelector('.current-item');
        const itemPrice = document.querySelector('.item-price');
        
        if (currentItem) currentItem.textContent = item.name;
        if (itemPrice) itemPrice.textContent = `£${item.price.toFixed(2)}`;
    }

    showItemAddedFeedback(item) {
        // Add visual feedback when item is added
        const notification = document.createElement('div');
        notification.className = 'item-added-notification';
        notification.textContent = `${item.name} added to order`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    handleKeypadInput(key) {
        console.log('Keypad input:', key);
        // Handle numeric input for quantities, prices, etc.
    }

    handleFunctionButton(action) {
        console.log('Function button:', action);
        
        switch(action) {
            case 'Error Corr':
                // Remove last item
                if (this.currentOrder.length > 0) {
                    const removedItem = this.currentOrder.pop();
                    this.currentTotal -= removedItem.price;
                    this.updateOrderDisplay();
                }
                break;
            case 'CANCEL':
                // Clear entire order
                this.currentOrder = [];
                this.currentTotal = 0;
                this.updateOrderDisplay();
                break;
        }
    }

    handlePayment(method) {
        console.log('Payment method:', method);
        
        if (this.currentOrder.length === 0) {
            alert('No items in order');
            return;
        }
        
        // Process payment
        alert(`Processing payment of £${this.currentTotal.toFixed(2)} via ${method}`);
        
        // Clear order after payment
        this.currentOrder = [];
        this.currentTotal = 0;
        this.updateOrderDisplay();
    }

    filterMenuByCategory(categoryName) {
        // Filter menu items by category
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const itemData = JSON.parse(item.dataset.item);
            if (categoryName.toLowerCase().includes(itemData.name.toLowerCase()) || 
                itemData.category === categoryName.toLowerCase()) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

export default RestaurantHomeScreen;