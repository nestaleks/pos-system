import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, Product } from '../../types';

interface CartState extends Cart {
  isProcessing: boolean;
  error: string | null;
}

const TAX_RATE = 0.08; // 8% tax rate

const calculateCartTotals = (items: CartItem[]): Pick<Cart, 'subtotal' | 'tax' | 'total'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  isProcessing: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update existing item
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        // Add new item
        const newItem: CartItem = {
          product,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        };
        state.items.push(newItem);
      }
      
      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total - state.discount;
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      
      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total - state.discount;
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item.product.id !== productId);
        } else {
          item.quantity = quantity;
          item.totalPrice = item.quantity * item.unitPrice;
        }
        
        // Recalculate totals
        const totals = calculateCartTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total - state.discount;
      }
    },
    
    applyDiscount: (state, action: PayloadAction<number>) => {
      state.discount = Math.max(0, action.payload);
      state.total = state.subtotal + state.tax - state.discount;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.discount = 0;
      state.total = 0;
      state.error = null;
    },
    
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyDiscount,
  clearCart,
  setProcessing,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;