import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  TableRows as TableViewIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setFilters,
  clearFilters,
} from '../store/slices/productsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { Product, ProductFormData, ProductFilters } from '../types';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, filteredProducts, selectedProduct, isLoading, error } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    categoryId: '',
    stock: 0,
    minStock: 0,
    imageUrl: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterInStock, setFilterInStock] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const newFilters: ProductFilters = {
      search: searchTerm || undefined,
      categoryId: filterCategoryId || undefined,
      inStock: filterInStock,
    };
    dispatch(setFilters(newFilters));
  }, [searchTerm, filterCategoryId, filterInStock, dispatch]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        price: product.price,
        cost: product.cost || 0,
        categoryId: product.categoryId,
        stock: product.stock,
        minStock: product.minStock || 0,
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        price: 0,
        cost: 0,
        categoryId: '',
        stock: 0,
        minStock: 0,
        imageUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) return;

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, data: formData })).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await dispatch(deleteProduct(selectedProduct.id)).unwrap();
        setDeleteDialogOpen(false);
        dispatch(setSelectedProduct(null));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    dispatch(setSelectedProduct(product));
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    dispatch(fetchProducts());
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategoryId('');
    setFilterInStock(undefined);
    dispatch(clearFilters());
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#1976d2';
  };

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading && products.length === 0) {
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
          Products Management
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
            {viewMode === 'grid' ? <TableViewIcon /> : <GridViewIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ ml: 1 }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size ={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search products"
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
          <Grid size ={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
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
          <Grid size ={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filterInStock || false}
                  onChange={(e) => setFilterInStock(e.target.checked ? true : undefined)}
                />
              }
              label="In Stock Only"
            />
          </Grid>
          <Grid size ={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => (
            <Grid size ={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.imageUrl || 'https://via.placeholder.com/300x140?text=No+Image'}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    SKU: {product.sku}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={getCategoryName(product.categoryId)}
                    size="small"
                    sx={{ 
                      backgroundColor: getCategoryColor(product.categoryId),
                      color: 'white',
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
                    Stock: {product.stock}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(product)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDeleteDialog(product)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getCategoryName(product.categoryId)}
                      size="small"
                      sx={{ 
                        backgroundColor: getCategoryColor(product.categoryId),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Typography color={product.stock > 0 ? 'success.main' : 'error.main'}>
                      {product.stock}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.isActive ? 'Active' : 'Inactive'} 
                      color={product.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(product)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDeleteDialog(product)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {filteredProducts.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {products.length === 0 ? 'Create your first product to get started' : 'Try adjusting your filters'}
          </Typography>
          {products.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size ={{ xs: 12, md: 6 }}>
              <TextField
                autoFocus
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </Grid>
            <Grid size ={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size ={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid size ={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Min Stock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size ={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim() || !formData.sku.trim() || !formData.categoryId || isLoading}
          >
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;