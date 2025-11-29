import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Edit, Visibility } from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    complaint: null,
    status: '',
    adminNote: '',
  });

  const navigate = useNavigate();

  const statusOptions = ['pending', 'in-progress', 'resolved', 'closed'];
  const categoryOptions = ['hostel', 'academic', 'infrastructure', 'food', 'transport', 'wifi', 'other'];
  const priorityOptions = ['low', 'medium', 'high'];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    fetchAnalytics();
    fetchComplaints();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllComplaints({
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
      page: 1,
    });
  };

  const handlePageChange = (event, value) => {
    setFilters({
      ...filters,
      page: value,
    });
  };

  const handleEditClick = (complaint) => {
    setEditDialog({
      open: true,
      complaint,
      status: complaint.status,
      adminNote: '',
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      complaint: null,
      status: '',
      adminNote: '',
    });
  };

  const handleStatusUpdate = async () => {
    try {
      await adminAPI.updateComplaintStatus(editDialog.complaint._id, {
        status: editDialog.status,
        adminNote: editDialog.adminNote,
      });
      
      fetchComplaints();
      fetchAnalytics();
      handleEditClose();
    } catch (error) {
      setError('Failed to update complaint status');
      console.error('Update status error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 4 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Complaints
                  </Typography>
                  <Typography variant="h4">
                    {analytics.summary.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {analytics.summary.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {analytics.summary.inProgress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {analytics.summary.resolved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Complaints by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.charts.category}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ _id, count }) => `${_id}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {analytics.charts.category.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Priority Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.charts.priority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.charts.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id.month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

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
                {statusOptions.map((status) => (
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
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priorities</MenuItem>
                {priorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Complaints
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint._id}>
                    <TableCell>
                      {complaint.title.length > 30
                        ? `${complaint.title.substring(0, 30)}...`
                        : complaint.title
                      }
                    </TableCell>
                    <TableCell>
                      <Chip label={complaint.category} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.priority} 
                        color={priorityColors[complaint.priority]}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.status} 
                        color={statusColors[complaint.status]}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{complaint.submittedBy?.name}</TableCell>
                    <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/complaint/${complaint._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditClick(complaint)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Complaint Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={editDialog.status}
              onChange={(e) => setEditDialog({ ...editDialog, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Admin Note (Optional)"
              value={editDialog.adminNote}
              onChange={(e) => setEditDialog({ ...editDialog, adminNote: e.target.value })}
              placeholder="Add a note about this status update..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;