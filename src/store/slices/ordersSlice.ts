import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderItem, Cart, OrderFilters } from '../../types';

interface OrdersState {
  orders: Order[];
  filteredOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
}

// Mock data - replace with real API calls
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    items: [
      {
        id: '1',
        productId: '1',
        product: {
          id: '1',
          name: 'Coffee Beans Premium',
          description: 'High quality arabica coffee beans',
          sku: 'COFFEE001',
          barcode: '1234567890123',
          price: 15.99,
          cost: 8.50,
          categoryId: '1',
          stock: 50,
          minStock: 10,
          imageUrl: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98,
      },
    ],
    subtotal: 31.98,
    tax: 2.56,
    discount: 0,
    total: 34.54,
    paymentMethod: 'card',
    paymentStatus: 'completed',
    cashierId: '1',
    customerId: '1',
    customerName: 'John Doe',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    cart: Cart;
    paymentMethod: 'cash' | 'card' | 'digital';
    customerId?: string;
    customerName?: string;
    notes?: string;
    cashierId: string;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderItems: OrderItem[] = orderData.cart.items.map((cartItem, index) => ({
      id: (index + 1).toString(),
      productId: cartItem.product.id,
      product: cartItem.product,
      quantity: cartItem.quantity,
      unitPrice: cartItem.unitPrice,
      totalPrice: cartItem.totalPrice,
    }));
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      items: orderItems,
      subtotal: orderData.cart.subtotal,
      tax: orderData.cart.tax,
      discount: orderData.cart.discount,
      total: orderData.cart.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'completed',
      cashierId: orderData.cashierId,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newOrder;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: 'pending' | 'completed' | 'refunded' }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, status };
  }
);

const initialState: OrdersState = {
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  filters: {},
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
      // Apply filters
      state.filteredOrders = state.orders.filter(order => {
        const matchesDateFrom = !action.payload.dateFrom || 
          new Date(order.createdAt) >= new Date(action.payload.dateFrom);
        const matchesDateTo = !action.payload.dateTo || 
          new Date(order.createdAt) <= new Date(action.payload.dateTo);
        const matchesPaymentMethod = !action.payload.paymentMethod || 
          order.paymentMethod === action.payload.paymentMethod;
        const matchesPaymentStatus = !action.payload.paymentStatus || 
          order.paymentStatus === action.payload.paymentStatus;
        const matchesCashier = !action.payload.cashierId || 
          order.cashierId === action.payload.cashierId;

        return matchesDateFrom && matchesDateTo && matchesPaymentMethod && 
               matchesPaymentStatus && matchesCashier;
      });
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredOrders = state.orders;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload); // Add to beginning
        state.filteredOrders = state.orders;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index].paymentStatus = action.payload.status;
          state.orders[index].updatedAt = new Date().toISOString();
        }
        state.filteredOrders = state.orders;
      });
  },
});

export const { setSelectedOrder, setFilters, clearFilters } = ordersSlice.actions;
export default ordersSlice.reducer;