class ExpressHomeScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.currentOrder = [];
        this.currentTotal = 0.00;
        this.selectedCategory = 'popular';
        this.selectedPaymentMethod = 'card';
        this.expressStats = {
            todaySales: 247,
            avgOrderTime: '1:23',
            currentQueue: 3
        };
    }

    async render() {
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return `
            <div class="pos-layout express-theme">
                <!-- Theme Switcher -->
                <div class="theme-switcher">
                    <button class="theme-btn" data-theme="evolution">EVOLUTION</button>
                    <button class="theme-btn" data-theme="restaurant">RESTAURANT</button>
                    <button class="theme-btn active" data-theme="express">EXPRESS</button>
                    <button class="theme-btn" data-theme="oblivion">OBLIVION</button>
                </div>

                <!-- Terminal Header -->
                <div class="terminal-header">
                    <div class="terminal-prompt">
                        ./express_pos --execute
                    </div>
                    
                    <div class="system-status">
                        <div class="status-indicator online">ONLINE</div>
                        <div class="status-indicator warning">HIGH_LOAD</div>
                        <div class="status-indicator">CONN: ${this.expressStats.currentQueue}</div>
                    </div>
                    
                    <div class="terminal-time">[${currentTime}]</div>
                </div>

                <!-- Data Matrix Panel -->
                <div class="data-matrix-panel">
                    <!-- Terminal Categories -->
                    <div class="terminal-categories">
                        ${this.renderTerminalCategories()}
                    </div>
                    
                    <!-- Hacker Product Grid -->
                    <div class="hacker-grid" id="express-products">
                        ${this.renderHackerGrid()}
                    </div>
                </div>

                <!-- Order Queue Panel -->
                <div class="order-queue-panel">
                    <div class="queue-items" id="express-order-items">
                        ${this.renderQueueItems()}
                    </div>
                    
                    <div class="order-total-display">
                        ${this.renderOrderTotal()}
                    </div>
                </div>

                <!-- Command Zone Panel -->
                <div class="command-zone-panel">
                    <!-- Payment Methods -->
                    <div class="payment-methods">
                        ${this.renderPaymentMethods()}
                    </div>
                    
                    <!-- Terminal Numpad -->
                    <div class="terminal-numpad">
                        ${this.renderTerminalNumpad()}
                    </div>
                    
                    <!-- Command Buttons -->
                    <div class="command-buttons">
                        <button class="terminal-btn execute" data-action="express-checkout">
                            > EXECUTE_PAYMENT
                        </button>
                        
                        <button class="terminal-btn warning" data-action="split-payment">
                            > SPLIT_TRANS
                        </button>
                        
                        <button class="terminal-btn danger" data-action="clear-order">
                            > CLEAR_BUFFER
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTerminalCategories() {
        const categories = [
            { id: 'all', name: 'ALL_ITEMS', code: 'FF00' },
            { id: 'drinks', name: 'LIQUID_FUEL', code: 'LQ01' },
            { id: 'food', name: 'NUTRIENT_BLOCKS', code: 'NT02' },
            { id: 'snacks', name: 'QUICK_ENERGY', code: 'QE03' },
            { id: 'fresh', name: 'ORGANIC_MATTER', code: 'OM04' },
            { id: 'sweet', name: 'SUGAR_COMPOUNDS', code: 'SC05' },
            { id: 'express', name: 'PRIORITY_QUEUE', code: 'PQ99' }
        ];

        return categories.map(category => `
            <button class="terminal-category ${category.id === this.selectedCategory ? 'active' : ''}" 
                    data-category="${category.id}">
                [${category.code}] ${category.name}
            </button>
        `).join('');
    }

    renderHackerGrid() {
        const productsByCategory = {
            all: [
                { id: 1, name: 'CAFFEINE_BOOST', price: 4.50, code: 'CAF001', status: 'ACTIVE' },
                { id: 2, name: 'PROTEIN_SALAD', price: 12.99, code: 'PRT002', status: 'ACTIVE' },
                { id: 3, name: 'CARB_UNIT', price: 3.25, code: 'CRB003', status: 'ACTIVE' },
                { id: 4, name: 'VITAMIN_LIQUID', price: 5.99, code: 'VIT004', status: 'LOW_STOCK' },
                { id: 5, name: 'SANDWICH_MODULE', price: 8.99, code: 'SDW005', status: 'ACTIVE' },
                { id: 6, name: 'SUGAR_CAKE', price: 4.25, code: 'SGR006', status: 'ACTIVE' },
                { id: 7, name: 'LIQUID_BLEND', price: 6.50, code: 'LBL007', status: 'ACTIVE' },
                { id: 8, name: 'BREAD_CIRCLE', price: 3.99, code: 'BRC008', status: 'ACTIVE' }
            ],
            drinks: [
                { id: 9, name: 'ESPRESSO_SHOT', price: 3.00, code: 'ESP009', status: 'ACTIVE' },
                { id: 10, name: 'TEA_MODULE', price: 2.75, code: 'TEA010', status: 'ACTIVE' },
                { id: 11, name: 'COLA_FUEL', price: 2.50, code: 'COL011', status: 'ACTIVE' },
                { id: 12, name: 'H2O_PURE', price: 1.99, code: 'H2O012', status: 'ACTIVE' }
            ],
            food: [
                { id: 15, name: 'PIZZA_SEGMENT', price: 4.99, code: 'PIZ015', status: 'ACTIVE' },
                { id: 16, name: 'MEAT_STACK', price: 11.99, code: 'MST016', status: 'ACTIVE' },
                { id: 17, name: 'PROTEIN_TUBE', price: 5.99, code: 'PTU017', status: 'ACTIVE' },
                { id: 18, name: 'NOODLE_BASE', price: 13.99, code: 'NOO018', status: 'ACTIVE' }
            ],
            snacks: [
                { id: 21, name: 'CHIP_ARRAY', price: 2.99, code: 'CHP021', status: 'ACTIVE' },
                { id: 22, name: 'SWEET_DISK', price: 3.50, code: 'SWD022', status: 'ACTIVE' },
                { id: 23, name: 'NUT_CLUSTER', price: 4.99, code: 'NUT023', status: 'ACTIVE' },
                { id: 24, name: 'POP_CORN', price: 3.99, code: 'POP024', status: 'ACTIVE' }
            ],
            fresh: [
                { id: 27, name: 'RED_FRUIT', price: 1.50, code: 'RFR027', status: 'ACTIVE' },
                { id: 28, name: 'YELLOW_CURVE', price: 1.25, code: 'YCR028', status: 'ACTIVE' },
                { id: 29, name: 'ORANGE_SPHERE', price: 1.75, code: 'OSP029', status: 'ACTIVE' },
                { id: 30, name: 'PURPLE_CLUSTER', price: 4.99, code: 'PCL030', status: 'LOW_STOCK' }
            ],
            sweet: [
                { id: 33, name: 'SUGAR_RING', price: 2.99, code: 'SGR033', status: 'ACTIVE' },
                { id: 34, name: 'FROZEN_CREAM', price: 4.50, code: 'FRC034', status: 'ACTIVE' },
                { id: 35, name: 'BIRTHDAY_BLOCK', price: 5.99, code: 'BBL035', status: 'ACTIVE' },
                { id: 36, name: 'COCOA_BAR', price: 3.99, code: 'COB036', status: 'ACTIVE' }
            ],
            express: [
                { id: 39, name: 'PRIORITY_COMBO', price: 9.99, code: 'PRC039', status: 'EXPRESS' },
                { id: 40, name: 'QUICK_BITE', price: 5.99, code: 'QBT040', status: 'EXPRESS' },
                { id: 41, name: 'FAST_FUEL', price: 3.99, code: 'FFU041', status: 'EXPRESS' },
                { id: 42, name: 'INSTANT_ENERGY', price: 4.50, code: 'INE042', status: 'EXPRESS' }
            ]
        };

        const products = productsByCategory[this.selectedCategory] || productsByCategory.all;
        
        return products.map(product => `
            <div class="terminal-product" 
                 data-product-id="${product.id}" 
                 data-product-name="${product.name}"
                 data-product-price="${product.price}">
                <div class="product-code">${product.code}</div>
                <div class="product-name-term">${product.name}</div>
                <div class="product-price-term">$${product.price.toFixed(2)}</div>
                <div class="product-status">[${product.status}]</div>
            </div>
        `).join('');
    }

    renderQueueItems() {
        if (this.currentOrder.length === 0) {
            return `
                <div style="text-align: center; color: #808080; padding: 40px 16px;">
                    <div style="font-size: 24px; margin-bottom: 8px; color: #ff0080;">[BUFFER_EMPTY]</div>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">AWAITING_INPUT</div>
                </div>
            `;
        }

        return this.currentOrder.map((item, index) => `
            <div class="queue-item" data-item-index="${index}">
                <div class="queue-item-name">${item.name}</div>
                <div class="queue-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="queue-remove" data-item-index="${index}">×</button>
            </div>
        `).join('');
    }

    renderOrderTotal() {
        const subtotal = this.currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        return `
            <div class="total-line">
                <span>SUBTOTAL:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>TAX_RATE:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="total-line final">
                <span>TOTAL_SUM:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    }

    renderPaymentMethods() {
        const methods = [
            { id: 'card', name: 'CREDIT_CARD', icon: '■' },
            { id: 'cash', name: 'CASH_STACK', icon: '▲' },
            { id: 'contactless', name: 'NFC_MODULE', icon: '●' },
            { id: 'crypto', name: 'BLOCKCHAIN', icon: '◆' }
        ];

        return methods.map(method => `
            <div class="payment-method ${method.id === this.selectedPaymentMethod ? 'selected' : ''}" 
                 data-payment-method="${method.id}">
                <div class="payment-icon">${method.icon}</div>
                <div class="payment-text">${method.name}</div>
            </div>
        `).join('');
    }

    renderTerminalNumpad() {
        const numbers = [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['DEL', '0', 'ENT']
        ];

        return numbers.flat().map(num => `
            <button class="numpad-key" data-number="${num}">${num}</button>
        `).join('');
    }

    async afterRender() {
        this.setupEventListeners();
        this.startStatsUpdater();
    }

    setupEventListeners() {
        // Theme switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                this.handleThemeSwitch(e.target.dataset.theme, e.target);
            }
        });

        // Terminal category switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('terminal-category')) {
                this.handleCategorySwitch(e.target.dataset.category);
            }
        });

        // Terminal product selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.terminal-product')) {
                const card = e.target.closest('.terminal-product');
                this.handleProductSelection({
                    id: parseInt(card.dataset.productId),
                    name: card.dataset.productName,
                    price: parseFloat(card.dataset.productPrice)
                });
            }
        });

        // Queue management
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('queue-remove')) {
                const index = parseInt(e.target.dataset.itemIndex);
                this.removeOrderItem(index);
            }
        });

        // Payment methods
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-method')) {
                const method = e.target.closest('.payment-method').dataset.paymentMethod;
                this.selectPaymentMethod(method);
            }
        });

        // Fast actions
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                this.handleAction(e.target.dataset.action);
            }
        });

        // Terminal numpad
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('numpad-key')) {
                this.handleNumberInput(e.target.dataset.number);
            }
        });
    }

    handleThemeSwitch(theme, button) {
        // Update active state
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (theme === 'evolution') {
            this.app.loadEvolutionTheme();
        } else if (theme === 'restaurant') {
            this.app.loadRestaurantTheme();
        } else if (theme === 'oblivion') {
            this.app.loadOblivionTheme();
        }
        // Keep current express theme if theme === 'express'
    }

    handleCategorySwitch(categoryId) {
        this.selectedCategory = categoryId;
        
        // Update active terminal category
        document.querySelectorAll('.terminal-category').forEach(category => {
            category.classList.toggle('active', category.dataset.category === categoryId);
        });
        
        // Update hacker grid
        document.getElementById('express-products').innerHTML = this.renderHackerGrid();
        
        // Add glitch animation
        document.getElementById('express-products').style.animation = 'none';
        setTimeout(() => {
            document.getElementById('express-products').style.animation = 'dataStream 0.3s ease-out';
        }, 10);
    }

    handleProductSelection(product) {
        // Add glitch effect
        const card = document.querySelector(`[data-product-id="${product.id}"]`);
        card.style.animation = 'glitchEffect 0.3s ease-out';
        
        // Add to order
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
        this.updateStats();
    }

    removeOrderItem(index) {
        this.currentOrder.splice(index, 1);
        this.updateOrderDisplay();
        this.updateStats();
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        // Update UI
        document.querySelectorAll('.payment-method').forEach(elem => {
            elem.classList.toggle('selected', elem.dataset.paymentMethod === method);
        });
    }

    handleAction(action) {
        switch (action) {
            case 'clear-order':
                this.currentOrder = [];
                this.updateOrderDisplay();
                this.updateStats();
                break;
                
            case 'hold-order':
                this.showMessage('Order held for later', 'success');
                break;
                
            case 'discount':
                this.showMessage('Discount applied', 'success');
                break;
                
            case 'express-checkout':
                this.processExpressCheckout();
                break;
                
            case 'split-payment':
                this.showMessage('Split payment mode activated', 'info');
                break;
        }
    }

    handleNumberInput(number) {
        // Handle number pad input
        console.log('Number input:', number);
        
        // Add visual feedback
        const btn = document.querySelector(`[data-number="${number}"]`);
        btn.style.animation = 'expressPulse 0.2s ease-out';
    }

    processExpressCheckout() {
        if (this.currentOrder.length === 0) {
            this.showMessage('Add items to checkout', 'warning');
            return;
        }
        
        // Add checkout animation
        const checkoutBtn = document.querySelector('[data-action="express-checkout"]');
        checkoutBtn.classList.add('loading');
        checkoutBtn.textContent = '⚡ PROCESSING...';
        
        setTimeout(() => {
            this.currentOrder = [];
            this.updateOrderDisplay();
            this.updateStats();
            checkoutBtn.classList.remove('loading');
            checkoutBtn.innerHTML = '⚡ EXPRESS CHECKOUT';
            this.showMessage('Payment successful!', 'success');
            
            // Update stats
            this.expressStats.todaySales += 1;
            this.expressStats.currentQueue = Math.max(0, this.expressStats.currentQueue - 1);
            document.querySelector('.express-stats').innerHTML = this.renderStats();
        }, 2000);
    }

    updateOrderDisplay() {
        document.getElementById('express-order-items').innerHTML = this.renderQueueItems();
        document.querySelector('.order-total-display').innerHTML = this.renderOrderTotal();
    }

    updateStats() {
        // Update real-time stats
        this.expressStats.currentQueue = Math.min(10, this.currentOrder.length);
        
        // Update avg order time based on items
        const itemCount = this.currentOrder.reduce((sum, item) => sum + item.quantity, 0);
        const estimatedTime = Math.max(30, itemCount * 15); // 15 seconds per item, min 30 seconds
        this.expressStats.avgOrderTime = `${Math.floor(estimatedTime / 60)}:${(estimatedTime % 60).toString().padStart(2, '0')}`;
    }

    renderStats() {
        return `
            <div class="stat-item">
                <div class="stat-value">${this.expressStats.todaySales}</div>
                <div class="stat-label">Sales Today</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${this.expressStats.avgOrderTime}</div>
                <div class="stat-label">Avg Time</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${this.expressStats.currentQueue}</div>
                <div class="stat-label">In Queue</div>
            </div>
        `;
    }

    startStatsUpdater() {
        // Update time every minute
        setInterval(() => {
            const currentTime = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            document.querySelector('.express-time').textContent = currentTime;
        }, 60000);
    }

    showMessage(text, type = 'info') {
        // Create temporary message display
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--express-primary);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: expressSlide 0.3s ease-out;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        `;
        message.textContent = text;
        
        if (type === 'success') {
            message.style.background = 'var(--express-success)';
        } else if (type === 'warning') {
            message.style.background = 'var(--express-warning)';
        } else if (type === 'error') {
            message.style.background = 'var(--express-error)';
        }
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'expressSlide 0.3s ease-out reverse';
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }
}

export default ExpressHomeScreen;