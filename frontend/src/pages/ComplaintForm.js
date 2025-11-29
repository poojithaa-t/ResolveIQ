import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const categories = [
    { value: 'hostel', label: 'Hostel' },
    { value: 'academic', label: 'Academic' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transport' },
    { value: 'wifi', label: 'WiFi & Internet' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size (5MB max per file)
    const maxSize = 5 * 1024 * 1024;
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      files.forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await complaintsAPI.submitComplaint(submitData);
      
      setSuccess('Complaint submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Submit New Complaint
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Complaint Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  select
                  fullWidth
                  id="category"
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  helperText="Select the category that best describes your complaint"
                >
                  {categories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  id="description"
                  label="Detailed Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please provide detailed information about your complaint, including when it occurred, location, and any other relevant details..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attachments (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload images, documents, or other files related to your complaint (Max 5MB per file)
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ mt: 2 }}
                    >
                      Choose Files
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Button>
                    
                    {files.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Files:
                        </Typography>
                        {files.map((file, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeFile(index)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ flexGrow: 1 }}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintForm;