class ScreenManager {
    constructor() {
        this.app = null;
        this.currentScreen = null;
        this.screens = new Map();
        this.appContainer = null;
    }

    init(app) {
        this.app = app;
        this.appContainer = document.getElementById('pos-app');
        
        if (!this.appContainer) {
            throw new Error('POS app container not found');
        }

        this.registerScreens();
    }

    registerScreens() {
        this.screens.set('home', {
            component: () => import('../screens/home/home-screen.js'),
            title: 'Home'
        });
        
        this.screens.set('products', {
            component: () => import('../screens/products/products-screen.js'),
            title: 'Products'
        });
        
        this.screens.set('cart', {
            component: () => import('../screens/cart/cart-screen.js'),
            title: 'Cart'
        });
        
        this.screens.set('payment', {
            component: () => import('../screens/payment/payment-screen.js'),
            title: 'Payment'
        });
    }

    async showScreen(screenName, data = {}) {
        try {
            const screenConfig = this.screens.get(screenName);
            
            if (!screenConfig) {
                throw new Error(`Screen not found: ${screenName}`);
            }

            this.showLoading();

            const screenModule = await screenConfig.component();
            const ScreenClass = screenModule.default || screenModule[Object.keys(screenModule)[0]];
            
            if (!ScreenClass) {
                throw new Error(`Screen class not found for: ${screenName}`);
            }

            this.currentScreen = new ScreenClass(this.app, data);
            
            const screenContent = await this.currentScreen.render();
            
            this.appContainer.innerHTML = screenContent;
            
            if (this.currentScreen.afterRender) {
                await this.currentScreen.afterRender();
            }

            this.updateTitle(screenConfig.title);

        } catch (error) {
            console.error(`Failed to show screen ${screenName}:`, error);
            this.showError(`Screen loading error: ${screenName}`);
        }
    }

    showLoading() {
        this.appContainer.innerHTML = `
            <div class="loading-screen">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
    }

    showError(message) {
        this.appContainer.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="touch-button error-retry" onclick="location.reload()">
                    Reload
                </button>
            </div>
        `;
    }

    updateTitle(title) {
        document.title = `${title} - POS System`;
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}