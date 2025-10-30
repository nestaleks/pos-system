import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SalesAnalytics } from '../../types';

interface AnalyticsState {
  analytics: SalesAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

// Mock analytics data - replace with real API calls
const generateMockAnalytics = (): SalesAnalytics => {
  const today = new Date();
  
  // Generate sales data for the last 7 days
  const salesByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    salesByDay.push({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 1000) + 200,
      orders: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return {
    todaySales: 847.50,
    weekSales: 5234.80,
    monthSales: 23456.70,
    todayOrders: 23,
    weekOrders: 156,
    monthOrders: 678,
    topProducts: [
      {
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
        quantity: 45,
        revenue: 719.55,
      },
      {
        product: {
          id: '2',
          name: 'Croissant',
          description: 'Fresh baked croissant',
          sku: 'BAKERY001',
          barcode: '1234567890124',
          price: 3.50,
          cost: 1.20,
          categoryId: '2',
          stock: 25,
          minStock: 5,
          imageUrl: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        quantity: 78,
        revenue: 273.00,
      },
      {
        product: {
          id: '3',
          name: 'Orange Juice',
          description: 'Fresh squeezed orange juice',
          sku: 'DRINK001',
          barcode: '1234567890125',
          price: 4.99,
          cost: 2.00,
          categoryId: '3',
          stock: 30,
          minStock: 8,
          imageUrl: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        quantity: 34,
        revenue: 169.66,
      },
    ],
    salesByDay,
  };
};

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockAnalytics();
  }
);

export const refreshAnalytics = createAsyncThunk(
  'analytics/refreshAnalytics',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockAnalytics();
  }
);

const initialState: AnalyticsState = {
  analytics: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      // Refresh analytics
      .addCase(refreshAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(refreshAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to refresh analytics';
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;