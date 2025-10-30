// Core entity types for the POS system

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  categoryId: string;
  category?: Category;
  stock: number;
  minStock?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  paymentStatus: 'pending' | 'completed' | 'refunded';
  cashierId: string;
  cashier?: User;
  customerId?: string;
  customerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

// Cart types for POS terminal
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Analytics types
export interface SalesAnalytics {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

// Form types
export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  categoryId: string;
  stock: number;
  minStock?: number;
  imageUrl?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

// Filter and search types
export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface OrderFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  cashierId?: string;
}