import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAnalytics, refreshAnalytics } from '../store/slices/analyticsSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { analytics, isLoading } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(refreshAnalytics());
  };

  // Chart configurations
  const salesByDayData = {
    labels: analytics?.salesByDay.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Sales ($)',
        data: analytics?.salesByDay.map(day => day.sales) || [],
        borderColor: 'rgb(25, 118, 210)',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const ordersAndSalesData = {
    labels: analytics?.salesByDay.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Sales ($)',
        data: analytics?.salesByDay.map(day => day.sales) || [],
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: analytics?.salesByDay.map(day => day.orders) || [],
        backgroundColor: 'rgba(220, 0, 78, 0.8)',
        yAxisID: 'y1',
      },
    ],
  };

  const topProductsData = {
    labels: analytics?.topProducts.map(item => item.product.name) || [],
    datasets: [
      {
        data: analytics?.topProducts.map(item => item.revenue) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (isLoading && !analytics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {analytics && (
        <Grid container spacing={3}>
          {/* Key Metrics Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Today's Sales
                    </Typography>
                    <Typography variant="h5">
                      ${analytics.todaySales.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Week Sales
                    </Typography>
                    <Typography variant="h5">
                      ${analytics.weekSales.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <OrdersIcon />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Today's Orders
                    </Typography>
                    <Typography variant="h5">
                      {analytics.todayOrders}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Month Sales
                    </Typography>
                    <Typography variant="h5">
                      ${analytics.monthSales.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Trend Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sales Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={salesByDayData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Top Products Chart */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Products by Revenue
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut data={topProductsData} options={doughnutOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Orders vs Sales Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Daily Orders vs Sales
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={ordersAndSalesData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Top Products List */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Best Selling Products
              </Typography>
              <List>
                {analytics.topProducts.map((item, index) => (
                  <ListItem key={item.product.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `hsl(${index * 120}, 70%, 50%)` }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sold: {item.quantity} units
                          </Typography>
                          <Chip
                            label={`$${item.revenue.toFixed(2)}`}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analytics.weekOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orders This Week
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {analytics.monthOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orders This Month
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      ${(analytics.todaySales / analytics.todayOrders || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Order Value
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {analytics.topProducts.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items Sold Today
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;