class POSApp {
    constructor() {
        this.screenManager = new ScreenManager();
        this.cartManager = new CartManager();
        this.storageManager = new StorageManager();
        this.currentScreen = 'home';
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing POS Application...');
            
            await this.storageManager.init();
            await this.cartManager.init(this.storageManager);
            this.screenManager.init(this);
            
            this.setupEventListeners();
            await this.loadInitialScreen();
            
            this.isInitialized = true;
            console.log('POS Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize POS Application:', error);
        }
    }

    setupEventListeners() {
        document.addEventListener('pos:navigate', (e) => {
            this.navigateTo(e.detail.screen, e.detail.data);
        });

        document.addEventListener('pos:addToCart', (e) => {
            this.cartManager.addItem(e.detail.product);
        });

        document.addEventListener('pos:updateCart', (e) => {
            const { itemId, quantity } = e.detail;
            this.cartManager.updateQuantity(itemId, quantity);
        });

        document.addEventListener('pos:removeFromCart', (e) => {
            this.cartManager.removeItem(e.detail.itemId);
        });

        document.addEventListener('pos:clearCart', () => {
            this.cartManager.clear();
        });
    }

    async navigateTo(screenName, data = {}) {
        try {
            console.log(`Navigating to: ${screenName}`);
            this.currentScreen = screenName;
            await this.screenManager.showScreen(screenName, data);
        } catch (error) {
            console.error(`Failed to navigate to ${screenName}:`, error);
        }
    }

    async loadInitialScreen() {
        await this.navigateTo('home');
    }

    getCartManager() {
        return this.cartManager;
    }

    getStorageManager() {
        return this.storageManager;
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    async loadRestaurantTheme() {
        try {
            console.log('Loading restaurant theme...');
            
            // Dynamically import restaurant screen
            const { default: RestaurantHomeScreen } = await import('../screens/home/restaurant-home-screen.js');
            
            // Create and render restaurant screen
            const restaurantScreen = new RestaurantHomeScreen(this);
            const screenHTML = await restaurantScreen.render();
            
            // Replace content
            const appContainer = document.getElementById('pos-app');
            appContainer.innerHTML = screenHTML;
            
            // Initialize restaurant screen
            await restaurantScreen.afterRender();
            
            console.log('Restaurant theme loaded successfully');
            
        } catch (error) {
            console.error('Failed to load restaurant theme:', error);
        }
    }


    async loadEvolutionTheme() {
        try {
            console.log('Loading evolution theme...');
            
            // Load default evolution theme (home screen)
            await this.navigateTo('home');
            
            console.log('Evolution theme loaded successfully');
            
        } catch (error) {
            console.error('Failed to load evolution theme:', error);
        }
    }


    async loadOblivionTheme() {
        try {
            console.log('Loading oblivion theme...');
            
            // Dynamically import oblivion screen
            const { default: OblivionHomeScreen } = await import('../screens/home/oblivion-home-screen.js');
            
            // Create and render oblivion screen
            const oblivionScreen = new OblivionHomeScreen(this);
            const screenHTML = await oblivionScreen.render();
            
            // Replace content
            const appContainer = document.getElementById('pos-app');
            appContainer.innerHTML = screenHTML;
            
            // Initialize oblivion screen
            await oblivionScreen.afterRender();
            
            console.log('Oblivion theme loaded successfully');
            
        } catch (error) {
            console.error('Failed to load oblivion theme:', error);
        }
    }
}