import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFormData, ProductFilters } from '../../types';

interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
}

// Mock data - replace with real API calls
const mockProducts: Product[] = [
  {
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
  {
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
  {
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
];

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: ProductFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newProduct;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { id, data };
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return id;
  }
);

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {},
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
      // Apply filters
      state.filteredProducts = state.products.filter(product => {
        const matchesCategory = !action.payload.categoryId || product.categoryId === action.payload.categoryId;
        const matchesSearch = !action.payload.search || 
          product.name.toLowerCase().includes(action.payload.search.toLowerCase()) ||
          product.sku.toLowerCase().includes(action.payload.search.toLowerCase());
        const matchesPrice = (!action.payload.minPrice || product.price >= action.payload.minPrice) &&
          (!action.payload.maxPrice || product.price <= action.payload.maxPrice);
        const matchesStock = action.payload.inStock === undefined || 
          (action.payload.inStock ? product.stock > 0 : true);

        return matchesCategory && matchesSearch && matchesPrice && matchesStock;
      });
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredProducts = state.products;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.filteredProducts = state.products;
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload.data, updatedAt: new Date().toISOString() };
        }
        state.filteredProducts = state.products;
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.filteredProducts = state.products;
      });
  },
});

export const { setSelectedProduct, setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;