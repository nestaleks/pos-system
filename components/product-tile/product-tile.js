class ProductTile {
    constructor(product, options = {}) {
        this.product = product;
        this.size = options.size || 'medium'; // small, medium, large
        this.showPrice = options.showPrice !== false;
        this.showImage = options.showImage !== false;
        this.showCategory = options.showCategory || false;
        this.clickable = options.clickable !== false;
        this.className = options.className || '';
        this.onTileClick = options.onTileClick || this.defaultTileClick.bind(this);
        this.onAddToCart = options.onAddToCart || this.defaultAddToCart.bind(this);
    }

    render() {
        const sizeClasses = {
            small: 'product-tile-small',
            medium: 'product-tile-medium',
            large: 'product-tile-large'
        };

        const classes = [
            'product-tile',
            sizeClasses[this.size],
            this.clickable ? 'product-tile-clickable' : '',
            this.className
        ].filter(Boolean).join(' ');

        const imageUrl = this.product.image || 'assets/icons/no-image.svg';
        const categoryHtml = this.showCategory ? `
            <div class="product-category">${this.product.category || ''}</div>
        ` : '';

        const priceHtml = this.showPrice ? `
            <div class="product-price">${this.formatPrice(this.product.price)}</div>
        ` : '';

        const imageHtml = this.showImage ? `
            <div class="product-image-container">
                <img 
                    src="${imageUrl}" 
                    alt="${this.product.name}"
                    class="product-image"
                    onerror="this.src='assets/icons/no-image.svg'"
                />
            </div>
        ` : '';

        return `
            <div class="${classes}" data-product-id="${this.product.id}">
                ${imageHtml}
                <div class="product-info">
                    ${categoryHtml}
                    <div class="product-name">${this.product.name}</div>
                    ${priceHtml}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn touch-button touch-btn-primary touch-btn-medium">
                        <span class="touch-btn-icon">+</span>
                        <span class="touch-btn-text">Add to Cart</span>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents(element) {
        if (!element) return;

        // Click on product tile
        if (this.clickable) {
            element.addEventListener('click', (e) => {
                // Check that click is not on add to cart button
                if (!e.target.closest('.add-to-cart-btn')) {
                    this.onTileClick(this.product, e);
                }
            });
        }

        // Add to cart button
        const addToCartBtn = element.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onAddToCart(this.product, e);
                this.showAddedFeedback(addToCartBtn);
            });
        }

        // Touch feedback
        element.addEventListener('touchstart', () => {
            element.classList.add('product-tile-touched');
        });

        element.addEventListener('touchend', () => {
            element.classList.remove('product-tile-touched');
        });
    }

    showAddedFeedback(button) {
        const originalText = button.innerHTML;
        
        button.innerHTML = `
            <span class="touch-btn-icon">✓</span>
            <span class="touch-btn-text">Added</span>
        `;
        
        button.classList.add('btn-success-feedback');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success-feedback');
        }, 1000);
    }

    defaultTileClick(product) {
        // Can show product details
        const event = new CustomEvent('pos:product:view', {
            detail: { product },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    defaultAddToCart(product) {
        const event = new CustomEvent('pos:addToCart', {
            detail: { product },
            bubbles: true
        });
        document.dispatchEvent(event);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    formatPrice(price) {
        if (typeof price !== 'number') return '';
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }

    static create(product, options = {}) {
        const tile = new ProductTile(product, options);
        const element = document.createElement('div');
        element.innerHTML = tile.render();
        const tileElement = element.firstElementChild;
        tile.bindEvents(tileElement);
        return tileElement;
    }

    static createGrid(products, options = {}) {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'products-grid';
        
        products.forEach(product => {
            const tile = ProductTile.create(product, options);
            gridContainer.appendChild(tile);
        });
        
        return gridContainer;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductTile;
}