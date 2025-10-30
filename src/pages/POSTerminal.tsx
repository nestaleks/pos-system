import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyDiscount,
  setProcessing,
} from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/ordersSlice';
import { Product } from '../types';

const POSTerminal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { items, subtotal, tax, discount, total, isProcessing } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      dispatch(addToCart(product));
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && quantity <= product.stock) {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleApplyDiscount = () => {
    dispatch(applyDiscount(discountAmount));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = async () => {
    if (items.length === 0 || !user) return;

    dispatch(setProcessing(true));
    
    try {
      const orderData = {
        cart: { items, subtotal, tax, discount, total },
        paymentMethod,
        customerName: customerName || undefined,
        cashierId: user.id,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      setLastOrderNumber(result.orderNumber);
      setCheckoutDialogOpen(false);
      setReceiptDialogOpen(true);
      dispatch(clearCart());
      setCustomerName('');
      setDiscountAmount(0);
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#1976d2';
  };

  const getItemQuantityInCart = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const canAddToCart = (product: Product) => {
    const currentQuantity = getItemQuantityInCart(product.id);
    return currentQuantity < product.stock;
  };

  if (productsLoading && products.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        POS Terminal
      </Typography>

      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid size ={{ xs: 12, md: 8 }}>
          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size ={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search products by name or SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size ={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size ={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  sx={{ height: '56px' }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Products Grid */}
          <Grid container spacing={2}>
            {filteredProducts.map((product) => (
              <Grid size ={{ xs: 6, sm: 4, md: 3 }} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    '&:hover': { 
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    },
                    opacity: product.stock === 0 ? 0.6 : 1
                  }}
                  onClick={() => canAddToCart(product) && handleAddToCart(product)}
                >
                  <CardMedia
                    component="img"
                    height="100"
                    image={product.imageUrl || 'https://via.placeholder.com/150x100?text=No+Image'}
                    alt={product.name}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle2" noWrap title={product.name}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {product.sku}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={getCategoryName(product.categoryId)}
                        size="small"
                        sx={{ 
                          backgroundColor: getCategoryColor(product.categoryId),
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        color={product.stock > 0 ? 'success.main' : 'error.main'}
                      >
                        {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                      </Typography>
                    </Box>
                    {getItemQuantityInCart(product.id) > 0 && (
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Chip 
                          label={`In cart: ${getItemQuantityInCart(product.id)}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Cart Section */}
        <Grid size ={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <CartIcon sx={{ mr: 1 }} />
                Shopping Cart
              </Typography>
              <Badge badgeContent={items.length} color="primary">
                <CartIcon />
              </Badge>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Cart is empty
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click on products to add them to cart
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {items.map((item) => (
                    <ListItem key={item.product.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`$${item.unitPrice.toFixed(2)} x ${item.quantity}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 1, minWidth: 60, textAlign: 'right' }}>
                        ${item.totalPrice.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Discount Section */}
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid size ={{ xs: 8 }}>
                      <TextField
                        size="small"
                        label="Discount ($)"
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        fullWidth
                      />
                    </Grid>
                    <Grid size ={{ xs: 4 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleApplyDiscount}
                        fullWidth
                      >
                        Apply
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Cart Totals */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tax (8%):</Typography>
                    <Typography>${tax.toFixed(2)}</Typography>
                  </Box>
                  {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                      <Typography>Discount:</Typography>
                      <Typography>-${discount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearCart}
                    sx={{ flex: 1 }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PaymentIcon />}
                    onClick={() => setCheckoutDialogOpen(true)}
                    sx={{ flex: 2 }}
                    disabled={items.length === 0}
                  >
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={() => setCheckoutDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Typography>Items: {items.length}</Typography>
            <Typography>Total: ${total.toFixed(2)}</Typography>
          </Box>

          <TextField
            fullWidth
            label="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'digital')}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="digital">Digital Payment</MenuItem>
            </Select>
          </FormControl>

          {ordersLoading && (
            <Alert severity="info">Processing order...</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCheckout} 
            variant="contained"
            disabled={items.length === 0 || isProcessing || ordersLoading}
          >
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            Order Completed
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Order {lastOrderNumber} has been successfully processed!
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Thank you for your purchase. A receipt has been generated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default POSTerminal;