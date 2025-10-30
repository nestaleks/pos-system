import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryFormData } from '../../types';

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

// Mock data - replace with real API calls
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Beverages',
    description: 'Hot and cold drinks',
    color: '#FF5722',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bakery',
    description: 'Fresh baked goods',
    color: '#FF9800',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Drinks',
    description: 'Juices and soft drinks',
    color: '#2196F3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Snacks',
    description: 'Quick snacks and treats',
    color: '#4CAF50',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CategoryFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCategory: Category = {
      id: Date.now().toString(),
      ...categoryData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newCategory;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { id, data };
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return id;
  }
);

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { 
            ...state.categories[index], 
            ...action.payload.data, 
            updatedAt: new Date().toISOString() 
          };
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;