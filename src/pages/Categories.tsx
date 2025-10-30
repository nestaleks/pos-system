import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setSelectedCategory,
} from '../store/slices/categoriesSlice';
import { Category, CategoryFormData } from '../types';

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, selectedCategory, isLoading, error } = useAppSelector((state) => state.categories);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#1976d2',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#1976d2',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#1976d2',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, data: formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      try {
        await dispatch(deleteCategory(selectedCategory.id)).unwrap();
        setDeleteDialogOpen(false);
        dispatch(setSelectedCategory(null));
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleOpenDeleteDialog = (category: Category) => {
    dispatch(setSelectedCategory(category));
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    dispatch(fetchCategories());
  };

  if (isLoading && categories.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Categories Management
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ ml: 1 }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={category.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: category.color || '#1976d2',
                      borderRadius: '50%',
                      mr: 1,
                    }}
                  />
                  <Typography variant="h6" component="div">
                    {category.name}
                  </Typography>
                </Box>
                
                {category.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {category.description}
                  </Typography>
                )}
                
                <Chip 
                  label={category.isActive ? 'Active' : 'Inactive'} 
                  color={category.isActive ? 'success' : 'default'}
                  size="small"
                />
              </CardContent>
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog(category)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDeleteDialog(category)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first category to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Color:</Typography>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={{
                width: 50,
                height: 40,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim() || isLoading}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
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

export default Categories;