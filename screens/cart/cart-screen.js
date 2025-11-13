class CartScreen {
    constructor(app, data = {}) {
        this.app = app;
        this.data = data;
        this.cartManager = app.getCartManager();
        this.storageManager = app.getStorageManager();
        this.settings = this.storageManager.getSettings();
    }

    async render() {
        const cartItems = this.cartManager.getItems();
        const isEmpty = this.cartManager.isEmpty();

        return `
            <div class="cart-screen">
                <div class="cart-header">
                    <div class="header-top">
                        <button class="back-btn touch-button touch-btn-secondary" data-action="back">
                            <span class="touch-btn-icon">←</span>
                            <span class="touch-btn-text">Back</span>
                        </button>
                        <h1 class="cart-title">Cart</h1>
                        <button class="clear-cart-btn touch-button touch-btn-danger ${isEmpty ? 'disabled' : ''}" 
                                data-action="clear-cart" ${isEmpty ? 'disabled' : ''}>
                            <span class="touch-btn-icon">🗑️</span>
                            <span class="touch-btn-text">Clear</span>
                        </button>
                    </div>
                </div>

                <div class="cart-content">
                    ${isEmpty ? this.renderEmptyCart() : this.renderCartWithItems(cartItems)}
                </div>

                <div class="cart-footer">
                    <button class="footer-btn touch-button touch-btn-large touch-btn-secondary" data-action="continue-shopping">
                        <span class="touch-btn-icon">🛍️</span>
                        <span class="touch-btn-text">Continue Shopping</span>
                    </button>
                    <button class="footer-btn touch-button touch-btn-large ${isEmpty ? 'touch-btn-secondary disabled' : 'touch-btn-success'}" 
                            data-action="checkout" ${isEmpty ? 'disabled' : ''}>
                        <span class="touch-btn-icon">💳</span>
                        <span class="touch-btn-text">Checkout</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyCart() {
        return `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-title">Cart is empty</div>
                <div class="empty-cart-subtitle">Add products to create an order</div>
                <button class="add-products-btn touch-button touch-btn-primary touch-btn-large" data-action="add-products">
                    <span class="touch-btn-icon">➕</span>
                    <span class="touch-btn-text">Add Products</span>
                </button>
            </div>
        `;
    }

    renderCartWithItems(cartItems) {
        return `
            <div class="cart-with-items">
                <div class="cart-items-section">
                    <div class="cart-items-header">
                        <span class="items-count">${cartItems.length} items</span>
                        <span class="total-quantity">${this.cartManager.getItemCount()} products</span>
                    </div>
                    <div class="cart-items-list" id="cart-items-list">
                        <!-- Products will be added via JavaScript -->
                    </div>
                </div>

                <div class="cart-summary-section">
                    <div class="cart-summary">
                        ${this.renderCartSummary()}
                    </div>
                    
                    <div class="cart-actions">
                        <button class="action-btn touch-button touch-btn-medium touch-btn-secondary" data-action="apply-discount">
                            <span class="touch-btn-icon">🏷️</span>
                            <span class="touch-btn-text">Discount</span>
                        </button>
                        <button class="action-btn touch-button touch-btn-medium touch-btn-secondary" data-action="add-note">
                            <span class="touch-btn-icon">📝</span>
                            <span class="touch-btn-text">Note</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCartSummary() {
        const subtotal = this.cartManager.getSubtotal();
        const taxRate = this.settings.taxRate || 0.1;
        const tax = this.cartManager.getTax(taxRate);
        const total = this.cartManager.getTotal(taxRate);
        const itemCount = this.cartManager.getItemCount();

        return `
            <div class="summary-lines">
                <div class="summary-line">
                    <span class="label">Items:</span>
                    <span class="value">${itemCount} pcs</span>
                </div>
                <div class="summary-line">
                    <span class="label">Subtotal:</span>
                    <span class="value">${this.formatPrice(subtotal)}</span>
                </div>
                <div class="summary-line">
                    <span class="label">VAT (${(taxRate * 100).toFixed(0)}%):</span>
                    <span class="value">${this.formatPrice(tax)}</span>
                </div>
                <div class="summary-line total-line">
                    <span class="label">TOTAL:</span>
                    <span class="value total-value">${this.formatPrice(total)}</span>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.renderCartItems();
        this.setupEventListeners();
        this.setupCartListener();
    }

    renderCartItems() {
        const container = document.getElementById('cart-items-list');
        if (!container) return;

        const cartItems = this.cartManager.getItems();
        container.innerHTML = '';

        cartItems.forEach(item => {
            const cartItemElement = CartItem.create(item, {
                showImage: true,
                showCategory: false,
                editable: true,
                removable: true,
                onQuantityChange: this.handleQuantityChange.bind(this),
                onRemove: this.handleItemRemove.bind(this),
                onItemClick: this.handleItemClick.bind(this)
            });

            container.appendChild(cartItemElement);
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            this.handleAction(action, e);
        });
    }

    setupCartListener() {
        this.cartManager.addListener((cartData) => {
            this.updateCartDisplay(cartData);
        });
    }

    handleAction(action, event) {
        switch (action) {
            case 'back':
                this.app.navigateTo('home');
                break;
            case 'clear-cart':
                this.confirmClearCart();
                break;
            case 'continue-shopping':
            case 'add-products':
                this.app.navigateTo('products');
                break;
            case 'checkout':
                if (!this.cartManager.isEmpty()) {
                    this.app.navigateTo('payment');
                }
                break;
            case 'apply-discount':
                this.showDiscountDialog();
                break;
            case 'add-note':
                this.showNoteDialog();
                break;
        }

        this.addButtonFeedback(event.target.closest('.touch-button'));
    }

    handleQuantityChange(itemId, newQuantity, item) {
        this.cartManager.updateQuantity(itemId, newQuantity);
    }

    handleItemRemove(itemId, item) {
        this.confirmItemRemove(item);
    }

    handleItemClick(item, event) {
        console.log('Cart item clicked:', item);
        // Can show product details or other actions
    }

    confirmClearCart() {
        if (this.cartManager.isEmpty()) return;

        const confirmed = confirm('Clear cart? All items will be removed.');
        if (confirmed) {
            this.cartManager.clear();
            this.showMessage('Cart cleared', 'success');
        }
    }

    confirmItemRemove(item) {
        const confirmed = confirm(`Remove "${item.name}" from cart?`);
        if (confirmed) {
            this.cartManager.removeItem(item.id);
            this.showMessage('Item removed', 'success');
        }
    }

    showDiscountDialog() {
        const discount = prompt('Enter discount percentage (example: 10):');
        const discountValue = parseFloat(discount);
        
        if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
            this.applyDiscount(discountValue);
        } else if (discount !== null) {
            this.showMessage('Invalid discount value', 'error');
        }
    }

    showNoteDialog() {
        const note = prompt('Add note to order:');
        if (note && note.trim()) {
            this.addOrderNote(note.trim());
        }
    }

    applyDiscount(percentage) {
        // Save discount in cart (can extend functionality)
        const discountAmount = this.cartManager.getSubtotal() * (percentage / 100);
        
        // Temporary solution - show discount information
        this.showMessage(`Applied discount ${percentage}% (${this.formatPrice(discountAmount)})`, 'success');
        
        // TODO: Implement discount saving in cart
        console.log('Discount applied:', { percentage, amount: discountAmount });
    }

    addOrderNote(note) {
        // Temporary solution - save note to localStorage
        this.storageManager.setLocal('orderNote', note);
        this.showMessage('Note added', 'success');
        
        console.log('Order note added:', note);
    }

    updateCartDisplay(cartData) {
        // If cart became empty, re-render all content
        if (cartData.itemCount === 0) {
            const contentContainer = document.querySelector('.cart-content');
            if (contentContainer) {
                contentContainer.innerHTML = this.renderEmptyCart();
            }
        }

        // Update header
        this.updateCartHeader(cartData);
        
        // Update summary
        this.updateCartSummary(cartData);
        
        // Update buttons
        this.updateCartButtons(cartData);
    }

    updateCartHeader(cartData) {
        const clearBtn = document.querySelector('.clear-cart-btn');
        if (clearBtn) {
            if (cartData.itemCount === 0) {
                clearBtn.disabled = true;
                clearBtn.classList.add('disabled');
            } else {
                clearBtn.disabled = false;
                clearBtn.classList.remove('disabled');
            }
        }

        const itemsCount = document.querySelector('.items-count');
        const totalQuantity = document.querySelector('.total-quantity');
        
        if (itemsCount) {
            itemsCount.textContent = `${cartData.items.length} items`;
        }
        
        if (totalQuantity) {
            totalQuantity.textContent = `${cartData.itemCount} products`;
        }
    }

    updateCartSummary(cartData) {
        const summaryContainer = document.querySelector('.summary-lines');
        if (summaryContainer && cartData.itemCount > 0) {
            summaryContainer.innerHTML = this.renderCartSummary().replace('<div class="summary-lines">', '').replace('</div>', '');
        }
    }

    updateCartButtons(cartData) {
        const checkoutBtn = document.querySelector('[data-action="checkout"]');
        if (checkoutBtn) {
            if (cartData.itemCount === 0) {
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('disabled');
                checkoutBtn.classList.remove('touch-btn-success');
                checkoutBtn.classList.add('touch-btn-secondary');
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('disabled');
                checkoutBtn.classList.remove('touch-btn-secondary');
                checkoutBtn.classList.add('touch-btn-success');
            }
        }
    }

    addButtonFeedback(button) {
        if (!button || button.disabled) return;

        button.classList.add('btn-clicked');
        
        setTimeout(() => {
            button.classList.remove('btn-clicked');
        }, 150);
    }

    showMessage(text, type = 'info') {
        console.log(`${type.toUpperCase()}: ${text}`);
        // TODO: Replace with toast notifications
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

export default CartScreen;