import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as DetailsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchOrders,
  setSelectedOrder,
  setFilters,
  clearFilters,
  updateOrderStatus,
} from '../store/slices/ordersSlice';
import { Order, OrderFilters } from '../types';

const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, filteredOrders, selectedOrder, isLoading, error } = useAppSelector((state) => state.orders);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const newFilters: OrderFilters = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      paymentMethod: paymentMethodFilter || undefined,
      paymentStatus: paymentStatusFilter || undefined,
    };
    dispatch(setFilters(newFilters));
  }, [dateFrom, dateTo, paymentMethodFilter, paymentStatusFilter, dispatch]);

  const handleOpenDetails = (order: Order) => {
    dispatch(setSelectedOrder(order));
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    dispatch(setSelectedOrder(null));
  };

  const handleExpandRow = (orderId: string) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handleRefresh = () => {
    dispatch(fetchOrders());
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPaymentMethodFilter('');
    setPaymentStatusFilter('');
    dispatch(clearFilters());
  };

  const handleUpdateStatus = async (orderId: string, status: 'pending' | 'completed' | 'refunded') => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'digital': return 'secondary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading && orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
            <FilterIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Collapse in={filtersOpen}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="digital">Digital</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size ={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size ={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandRow(order.id)}
                      >
                        {expandedRow === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      {order.orderNumber}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.customerName || 'Walk-in Customer'}</TableCell>
                  <TableCell align="right">{order.items.length}</TableCell>
                  <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentMethod.toUpperCase()}
                      color={getPaymentMethodColor(order.paymentMethod) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                        variant="outlined"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDetails(order)}
                      color="primary"
                    >
                      <DetailsIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedRow === order.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Order Items
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell>SKU</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.product.sku}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell align="right">${item.totalPrice.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Box sx={{ minWidth: 200 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography>Subtotal:</Typography>
                              <Typography>${order.subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography>Tax:</Typography>
                              <Typography>${order.tax.toFixed(2)}</Typography>
                            </Box>
                            {order.discount > 0 && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                                <Typography>Discount:</Typography>
                                <Typography>-${order.discount.toFixed(2)}</Typography>
                              </Box>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="h6">Total:</Typography>
                              <Typography variant="h6">${order.total.toFixed(2)}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {filteredOrders.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {orders.length === 0 ? 'No orders have been placed yet' : 'Try adjusting your filters'}
          </Typography>
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Order Details - {selectedOrder?.orderNumber}
            </Box>
            <Chip
              label={selectedOrder?.paymentStatus.toUpperCase()}
              color={getPaymentStatusColor(selectedOrder?.paymentStatus || '') as any}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid size ={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Information
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Order Number:
                      </Typography>
                      <Typography>{selectedOrder.orderNumber}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Date:
                      </Typography>
                      <Typography>{formatDate(selectedOrder.createdAt)}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Customer:
                      </Typography>
                      <Typography>{selectedOrder.customerName || 'Walk-in Customer'}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method:
                      </Typography>
                      <Chip
                        label={selectedOrder.paymentMethod.toUpperCase()}
                        color={getPaymentMethodColor(selectedOrder.paymentMethod) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size ={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Items:</Typography>
                      <Typography>{selectedOrder.items.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${selectedOrder.subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Tax:</Typography>
                      <Typography>${selectedOrder.tax.toFixed(2)}</Typography>
                    </Box>
                    {selectedOrder.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                        <Typography>Discount:</Typography>
                        <Typography>-${selectedOrder.discount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ${selectedOrder.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size ={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {selectedOrder.items.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`SKU: ${item.product.sku} | Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)}`}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ${item.totalPrice.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;