class PaymentScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.settings = this.storageManager.getSettings();
        this.paymentMethod = 'cash';
        this.receivedAmount = 0;
        this.discount = 0;
        this.currentStep = 'method'; // method, amount, confirm, complete
    }

    async render() {
        if (this.cartManager.isEmpty()) {
            return this.renderEmptyCartMessage();
        }

        const total = this.getTotal();

        return `
            <div class="payment-screen">
                <div class="payment-header">
                    <button class="back-btn touch-button touch-btn-secondary" data-action="back">
                        <span class="touch-btn-icon">←</span>
                        <span class="touch-btn-text">Back</span>
                    </button>
                    <h1 class="payment-title">Order Payment</h1>
                    <div class="payment-total">
                        <span class="total-label">Total:</span>
                        <span class="total-amount">${this.formatPrice(total)}</span>
                    </div>
                </div>

                <div class="payment-content">
                    <div class="payment-left">
                        ${this.renderOrderSummary()}
                    </div>
                    
                    <div class="payment-right">
                        ${this.renderPaymentPanel()}
                    </div>
                </div>

                <div class="payment-footer">
                    <button class="footer-btn touch-button touch-btn-large touch-btn-secondary" data-action="cancel">
                        <span class="touch-btn-icon">✕</span>
                        <span class="touch-btn-text">Cancel</span>
                    </button>
                    <button class="footer-btn touch-button touch-btn-large touch-btn-success" 
                            data-action="complete-payment" 
                            ${!this.canCompletePayment() ? 'disabled' : ''}>
                        <span class="touch-btn-icon">✓</span>
                        <span class="touch-btn-text">Complete Payment</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyCartMessage() {
        return `
            <div class="payment-screen">
                <div class="empty-payment">
                    <div class="empty-icon">🛒</div>
                    <div class="empty-title">Cart is Empty</div>
                    <div class="empty-subtitle">Add products to proceed with payment</div>
                    <button class="add-products-btn touch-button touch-btn-primary touch-btn-large" data-action="products">
                        <span class="touch-btn-text">Go to Products</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderOrderSummary() {
        const items = this.cartManager.getItems();
        const subtotal = this.cartManager.getSubtotal();
        const tax = this.getTax();
        const total = this.getTotal();

        return `
            <div class="order-summary">
                <div class="summary-header">
                    <h3>Order</h3>
                    <span class="items-count">${items.length} items</span>
                </div>
                
                <div class="order-items">
                    ${items.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">${item.quantity} × ${this.formatPrice(item.price)}</div>
                            </div>
                            <div class="item-total">${this.formatPrice(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-totals">
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>${this.formatPrice(subtotal)}</span>
                    </div>
                    ${this.discount > 0 ? `
                        <div class="total-line discount">
                            <span>Discount:</span>
                            <span>-${this.formatPrice(this.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-line">
                        <span>VAT:</span>
                        <span>${this.formatPrice(tax)}</span>
                    </div>
                    <div class="total-line final">
                        <span>TOTAL:</span>
                        <span>${this.formatPrice(total)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderPaymentPanel() {
        return `
            <div class="payment-panel">
                ${this.renderPaymentMethods()}
                ${this.renderAmountInput()}
                ${this.renderChangeCalculation()}
            </div>
        `;
    }

    renderPaymentMethods() {
        const methods = [
            { id: 'cash', name: 'Cash', icon: '💵' },
            { id: 'card', name: 'Card', icon: '💳' },
            { id: 'contactless', name: 'Contactless', icon: '📱' },
            { id: 'mobile', name: 'Mobile Payment', icon: '📲' }
        ];

        return `
            <div class="payment-methods">
                <h4>Payment Method</h4>
                <div class="methods-grid">
                    ${methods.map(method => `
                        <button class="payment-method-btn touch-button ${this.paymentMethod === method.id ? 'active' : ''}"
                                data-method="${method.id}">
                            <span class="method-icon">${method.icon}</span>
                            <span class="method-name">${method.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAmountInput() {
        if (this.paymentMethod !== 'cash') {
            return `
                <div class="amount-input-section">
                    <div class="auto-amount-notice">
                        <span class="notice-icon">ℹ️</span>
                        <span class="notice-text">Amount will be charged automatically</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="amount-input-section">
                <div class="amount-header">
                    <h4>Cash Received</h4>
                    <div class="quick-amounts">
                        ${this.renderQuickAmountButtons()}
                    </div>
                </div>
                <div class="numpad-container" id="payment-numpad">
                    <!-- Numpad will be added via JavaScript -->
                </div>
            </div>
        `;
    }

    renderQuickAmountButtons() {
        const total = this.getTotal();
        const amounts = [
            Math.ceil(total),
            Math.ceil(total / 100) * 100, // Round to hundreds
            Math.ceil(total / 500) * 500, // Round to 500
            Math.ceil(total / 1000) * 1000 // Round to thousands
        ];

        const uniqueAmounts = [...new Set(amounts)].filter(amount => amount >= total);

        return uniqueAmounts.slice(0, 4).map(amount => `
            <button class="quick-amount-btn touch-button touch-btn-small" data-amount="${amount}">
                ${this.formatPrice(amount)}
            </button>
        `).join('');
    }

    renderChangeCalculation() {
        if (this.paymentMethod !== 'cash') return '';

        const total = this.getTotal();
        const change = this.receivedAmount - total;
        const isValidPayment = this.receivedAmount >= total;

        return `
            <div class="change-calculation">
                <div class="change-line">
                    <span>To Pay:</span>
                    <span>${this.formatPrice(total)}</span>
                </div>
                <div class="change-line">
                    <span>Received:</span>
                    <span class="received-amount">${this.formatPrice(this.receivedAmount)}</span>
                </div>
                <div class="change-line ${change < 0 ? 'insufficient' : 'change'}">
                    <span>${change < 0 ? 'Insufficient:' : 'Change:'}</span>
                    <span class="change-amount">${this.formatPrice(Math.abs(change))}</span>
                </div>
                ${!isValidPayment ? `
                    <div class="insufficient-notice">
                        <span class="notice-icon">⚠️</span>
                        <span>Insufficient funds</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async afterRender() {
        if (!this.cartManager.isEmpty()) {
            this.setupEventListeners();
            this.setupNumPad();
        }
    }

    setupEventListeners() {
        // Payment method selection
        document.addEventListener('click', (e) => {
            const methodBtn = e.target.closest('.payment-method-btn');
            if (methodBtn) {
                this.selectPaymentMethod(methodBtn.dataset.method);
                return;
            }

            const quickAmountBtn = e.target.closest('.quick-amount-btn');
            if (quickAmountBtn) {
                this.setQuickAmount(parseFloat(quickAmountBtn.dataset.amount));
                return;
            }

            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) {
                this.handleAction(action, e);
            }
        });
    }

    setupNumPad() {
        if (this.paymentMethod !== 'cash') return;

        const container = document.getElementById('payment-numpad');
        if (!container) return;

        const numpad = NumPad.create({
            value: this.receivedAmount.toString(),
            maxLength: 10,
            allowDecimal: true,
            currency: '€',
            size: 'large',
            showCurrency: true,
            onInput: (value, numericValue) => {
                this.receivedAmount = numericValue;
                this.updateChangeCalculation();
                this.updateCompleteButton();
            },
            onEnter: () => {
                if (this.canCompletePayment()) {
                    this.completePayment();
                }
            },
            onClear: () => {
                this.receivedAmount = 0;
                this.updateChangeCalculation();
                this.updateCompleteButton();
            }
        });

        container.appendChild(numpad);
    }

    selectPaymentMethod(method) {
        this.paymentMethod = method;
        
        // Update active buttons
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            if (btn.dataset.method === method) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // For non-cash payments, set exact amount
        if (method !== 'cash') {
            this.receivedAmount = this.getTotal();
        }

        // Re-render amount input panel
        this.updateAmountSection();
        this.updateCompleteButton();
    }

    setQuickAmount(amount) {
        this.receivedAmount = amount;
        
        // Update numpad
        const numpadElement = document.querySelector('#payment-numpad .numpad');
        if (numpadElement && numpadElement._numpadInstance) {
            numpadElement._numpadInstance.setValue(amount);
        }

        this.updateChangeCalculation();
        this.updateCompleteButton();
    }

    updateAmountSection() {
        const section = document.querySelector('.amount-input-section');
        if (section) {
            section.innerHTML = this.renderAmountInput().replace('<div class="amount-input-section">', '').replace('</div>', '');
            this.setupNumPad();
        }

        const changeSection = document.querySelector('.change-calculation');
        if (changeSection) {
            changeSection.outerHTML = this.renderChangeCalculation();
        }
    }

    updateChangeCalculation() {
        const changeSection = document.querySelector('.change-calculation');
        if (changeSection && this.paymentMethod === 'cash') {
            changeSection.outerHTML = this.renderChangeCalculation();
        }
    }

    updateCompleteButton() {
        const completeBtn = document.querySelector('[data-action="complete-payment"]');
        if (completeBtn) {
            if (this.canCompletePayment()) {
                completeBtn.disabled = false;
                completeBtn.classList.remove('disabled');
            } else {
                completeBtn.disabled = true;
                completeBtn.classList.add('disabled');
            }
        }
    }

    handleAction(action, event) {
        switch (action) {
            case 'back':
                this.app.navigateTo('cart');
                break;
            case 'cancel':
                this.confirmCancel();
                break;
            case 'complete-payment':
                this.completePayment();
                break;
            case 'products':
                this.app.navigateTo('products');
                break;
        }
    }

    confirmCancel() {
        const confirmed = confirm('Cancel payment and return to cart?');
        if (confirmed) {
            this.app.navigateTo('cart');
        }
    }

    async completePayment() {
        if (!this.canCompletePayment()) return;

        try {
            const receiptData = this.generateReceiptData();
            
            // Show receipt
            await this.showReceipt(receiptData);
            
            // Clear cart
            this.cartManager.clear();
            
            // Go to home
            this.app.navigateTo('home');
            
        } catch (error) {
            console.error('Payment completion failed:', error);
            alert('Error completing payment');
        }
    }

    generateReceiptData() {
        const cartData = this.cartManager.generateReceiptData();
        const total = this.getTotal();

        return {
            ...cartData,
            subtotal: this.cartManager.getSubtotal(),
            tax: this.getTax(),
            discount: this.discount,
            total: total,
            payment: {
                method: this.paymentMethod,
                amount: total,
                received: this.receivedAmount,
                change: this.paymentMethod === 'cash' ? this.receivedAmount - total : 0
            },
            timestamp: new Date().toISOString(),
            receiptNumber: this.generateReceiptNumber()
        };
    }

    async showReceipt(receiptData) {
        const confirmed = confirm(`Payment completed!\n\nPayment method: ${this.getPaymentMethodName()}\nTotal: ${this.formatPrice(receiptData.total)}\n${receiptData.payment.change > 0 ? `Change: ${this.formatPrice(receiptData.payment.change)}\n` : ''}\nPrint receipt?`);
        
        if (confirmed) {
            this.printReceipt(receiptData);
        }
    }

    printReceipt(receiptData) {
        const receipt = ReceiptView.create(receiptData);
        
        if (receipt._receiptInstance) {
            receipt._receiptInstance.print();
        }
    }

    canCompletePayment() {
        if (this.cartManager.isEmpty()) return false;
        
        if (this.paymentMethod === 'cash') {
            return this.receivedAmount >= this.getTotal();
        }
        
        return true; // For non-cash payments
    }

    getTotal() {
        const subtotal = this.cartManager.getSubtotal();
        const tax = this.getTax();
        return subtotal + tax - this.discount;
    }

    getTax() {
        const taxRate = this.settings.taxRate || 0.1;
        return this.cartManager.getTax(taxRate);
    }

    getPaymentMethodName() {
        const methods = {
            'cash': 'Cash',
            'card': 'Bank Card',
            'contactless': 'Contactless Payment',
            'mobile': 'Mobile Payment'
        };
        return methods[this.paymentMethod] || this.paymentMethod;
    }

    generateReceiptNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${timestamp}-${random}`;
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

export default PaymentScreen;