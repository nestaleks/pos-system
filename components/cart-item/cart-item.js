class CartItem {
    constructor(item, options = {}) {
        this.item = item;
        this.showImage = options.showImage !== false;
        this.showCategory = options.showCategory || false;
        this.editable = options.editable !== false;
        this.removable = options.removable !== false;
        this.className = options.className || '';
        this.onQuantityChange = options.onQuantityChange || (() => {});
        this.onRemove = options.onRemove || (() => {});
        this.onItemClick = options.onItemClick || (() => {});
    }

    render() {
        const classes = [
            'cart-item',
            this.editable ? 'cart-item-editable' : '',
            this.className
        ].filter(Boolean).join(' ');

        const imageHtml = this.showImage ? `
            <div class="cart-item-image">
                <img 
                    src="${this.item.image || 'assets/icons/no-image.svg'}" 
                    alt="${this.item.name}"
                    onerror="this.src='assets/icons/no-image.svg'"
                />
            </div>
        ` : '';

        const categoryHtml = this.showCategory && this.item.category ? `
            <div class="cart-item-category">${this.item.category}</div>
        ` : '';

        const quantityControlsHtml = this.editable ? `
            <div class="cart-item-quantity-controls">
                <button class="quantity-btn quantity-btn-decrease touch-button" data-action="decrease">
                    <span class="touch-btn-icon">−</span>
                </button>
                <div class="quantity-display">${this.item.quantity}</div>
                <button class="quantity-btn quantity-btn-increase touch-button" data-action="increase">
                    <span class="touch-btn-icon">+</span>
                </button>
            </div>
        ` : `
            <div class="cart-item-quantity-display">
                <span class="quantity-label">Qty:</span>
                <span class="quantity-value">${this.item.quantity}</span>
            </div>
        `;

        const removeButtonHtml = this.removable ? `
            <button class="cart-item-remove touch-button touch-btn-danger" data-action="remove">
                <span class="touch-btn-icon">🗑️</span>
            </button>
        ` : '';

        return `
            <div class="${classes}" data-item-id="${this.item.id}">
                ${imageHtml}
                <div class="cart-item-details">
                    ${categoryHtml}
                    <div class="cart-item-name">${this.item.name}</div>
                    <div class="cart-item-price">${this.formatPrice(this.item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    ${quantityControlsHtml}
                    <div class="cart-item-total">
                        ${this.formatPrice(this.item.price * this.item.quantity)}
                    </div>
                </div>
                ${removeButtonHtml}
            </div>
        `;
    }

    bindEvents(element) {
        if (!element) return;

        // Click on cart item
        element.addEventListener('click', (e) => {
            // Ignore clicks on buttons
            if (e.target.closest('.quantity-btn, .cart-item-remove')) return;
            
            this.onItemClick(this.item, e);
        });

        // Quantity buttons
        const decreaseBtn = element.querySelector('.quantity-btn-decrease');
        const increaseBtn = element.querySelector('.quantity-btn-increase');
        const removeBtn = element.querySelector('.cart-item-remove');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeQuantity(-1);
                this.addButtonFeedback(decreaseBtn);
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeQuantity(1);
                this.addButtonFeedback(increaseBtn);
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem();
                this.addButtonFeedback(removeBtn);
            });
        }

        // Touch feedback
        element.addEventListener('touchstart', () => {
            element.classList.add('cart-item-touched');
        });

        element.addEventListener('touchend', () => {
            element.classList.remove('cart-item-touched');
        });
    }

    changeQuantity(delta) {
        const newQuantity = this.item.quantity + delta;
        
        if (newQuantity <= 0) {
            this.removeItem();
            return;
        }

        this.item.quantity = newQuantity;
        this.updateQuantityDisplay();
        this.updateTotalDisplay();
        this.onQuantityChange(this.item.id, newQuantity, this.item);
    }

    removeItem() {
        this.onRemove(this.item.id, this.item);
    }

    updateQuantityDisplay() {
        const element = document.querySelector(`[data-item-id="${this.item.id}"] .quantity-display`);
        if (element) {
            element.textContent = this.item.quantity;
        }

        const valueElement = document.querySelector(`[data-item-id="${this.item.id}"] .quantity-value`);
        if (valueElement) {
            valueElement.textContent = this.item.quantity;
        }
    }

    updateTotalDisplay() {
        const element = document.querySelector(`[data-item-id="${this.item.id}"] .cart-item-total`);
        if (element) {
            element.textContent = this.formatPrice(this.item.price * this.item.quantity);
        }
    }

    addButtonFeedback(button) {
        button.classList.add('btn-clicked');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        setTimeout(() => {
            button.classList.remove('btn-clicked');
        }, 100);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }

    static create(item, options = {}) {
        const cartItem = new CartItem(item, options);
        const element = document.createElement('div');
        element.innerHTML = cartItem.render();
        const itemElement = element.firstElementChild;
        cartItem.bindEvents(itemElement);
        
        // Save reference to object for method access
        itemElement._cartItemInstance = cartItem;
        
        return itemElement;
    }

    static createList(items, options = {}) {
        const listContainer = document.createElement('div');
        listContainer.className = 'cart-items-list';
        
        items.forEach(item => {
            const cartItemElement = CartItem.create(item, options);
            listContainer.appendChild(cartItemElement);
        });
        
        return listContainer;
    }

    static updateItem(itemElement, updatedItem) {
        const instance = itemElement._cartItemInstance;
        if (instance) {
            instance.item = updatedItem;
            instance.updateQuantityDisplay();
            instance.updateTotalDisplay();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartItem;
}