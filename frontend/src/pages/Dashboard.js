import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Box,
  TextField,
  MenuItem,
  Alert,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'hostel', 'academic', 'infrastructure', 'food', 'transport', 'wifi', 'other'
  ];
  
  const statuses = ['pending', 'in-progress', 'resolved', 'closed'];

  const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'success',
  };

  const statusColors = {
    pending: 'default',
    'in-progress': 'info',
    resolved: 'success',
    closed: 'secondary',
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getComplaints({
        ...filters,
        limit: 10,
      });
      setComplaints(response.complaints);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      });
    } catch (error) {
      setError('Failed to fetch complaints');
      console.error('Fetch complaints error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
      page: 1, // Reset to first page when filtering
    });
  };

  const handlePageChange = (event, value) => {
    setFilters({
      ...filters,
      page: value,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && complaints.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your complaints and track their progress
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/submit-complaint"
        >
          Submit New Complaint
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Complaints
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No complaints found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start by submitting your first complaint
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/submit-complaint"
              sx={{ mt: 2 }}
            >
              Submit Complaint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {complaints.map((complaint) => (
              <Grid item xs={12} key={complaint._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {complaint.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {complaint.description.length > 150
                            ? `${complaint.description.substring(0, 150)}...`
                            : complaint.description
                          }
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/complaint/${complaint._id}`)}
                      >
                        View
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        label={complaint.status}
                        color={statusColors[complaint.status]}
                        size="small"
                      />
                      <Chip
                        label={complaint.priority}
                        color={priorityColors[complaint.priority]}
                        size="small"
                      />
                      <Chip
                        label={complaint.category}
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {formatDate(complaint.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Dashboard;