import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack, AttachFile, Person, Schedule, Category } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';

const ComplaintDetails = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

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
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getComplaint(id);
      setComplaint(response.complaint);
    } catch (error) {
      setError('Failed to fetch complaint details');
      console.error('Fetch complaint error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Complaint not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {complaint.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={complaint.status}
                color={statusColors[complaint.status]}
              />
              <Chip
                label={complaint.priority}
                color={priorityColors[complaint.priority]}
              />
              <Chip
                label={complaint.category}
                variant="outlined"
              />
              {complaint.sentimentAnalysis?.sentiment && (
                <Chip
                  label={`${complaint.sentimentAnalysis.sentiment} sentiment`}
                  color={getSentimentColor(complaint.sentimentAnalysis.sentiment)}
                  size="small"
                />
              )}
            </Box>
          </Box>

          {/* Main Content */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {complaint.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom startIcon={<AttachFile />}>
                      Attachments
                    </Typography>
                    <List dense>
                      {complaint.attachments.map((attachment, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <AttachFile fontSize="small" sx={{ mr: 1 }} />
                          <ListItemText primary={attachment.filename} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {complaint.adminNotes && complaint.adminNotes.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Admin Updates
                    </Typography>
                    {complaint.adminNotes.map((note, index) => (
                      <Box key={index}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(note.addedAt)} - {note.addedBy?.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                          {note.note}
                        </Typography>
                        {index < complaint.adminNotes.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Complaint Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person fontSize="small" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Submitted by
                      </Typography>
                      <Typography variant="body1">
                        {complaint.submittedBy?.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule fontSize="small" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Submitted on
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(complaint.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Category fontSize="small" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1">
                        {complaint.category}
                      </Typography>
                    </Box>
                  </Box>

                  {complaint.assignedTo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Assigned to
                        </Typography>
                        <Typography variant="body1">
                          {complaint.assignedTo.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {complaint.resolvedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Schedule fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Resolved on
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(complaint.resolvedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {complaint.sentimentAnalysis && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI Analysis
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Sentiment
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {complaint.sentimentAnalysis.sentiment} 
                      {complaint.sentimentAnalysis.confidence && 
                        ` (${Math.round(complaint.sentimentAnalysis.confidence * 100)}% confidence)`
                      }
                    </Typography>

                    {complaint.sentimentAnalysis.urgencyKeywords && 
                     complaint.sentimentAnalysis.urgencyKeywords.length > 0 && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Urgency Keywords
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {complaint.sentimentAnalysis.urgencyKeywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintDetails;