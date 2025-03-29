import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Paper, Typography, TextField, Button, 
  Chip, IconButton, Grid, CircularProgress, Divider,
  Tab, Tabs, Card, CardContent, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

// Dynamic attributes based on entity type
const attributeFields = {
  character: [
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'occupation', label: 'Occupation', type: 'text' },
    { name: 'physicalDescription', label: 'Physical Description', type: 'textarea' },
    { name: 'personality', label: 'Personality', type: 'textarea' },
    { name: 'background', label: 'Background', type: 'textarea' },
    { name: 'goals', label: 'Goals', type: 'array' },
    { name: 'fears', label: 'Fears', type: 'array' }
  ],
  location: [
    { name: 'geography', label: 'Geography', type: 'textarea' },
    { name: 'climate', label: 'Climate', type: 'text' },
    { name: 'culture', label: 'Culture', type: 'textarea' },
    { name: 'history', label: 'History', type: 'textarea' }
  ],
  item: [
    { name: 'appearance', label: 'Appearance', type: 'textarea' },
    { name: 'history', label: 'History', type: 'textarea' },
    { name: 'powers', label: 'Powers/Properties', type: 'textarea' },
    { name: 'significance', label: 'Significance', type: 'textarea' }
  ],
  event: [
    { name: 'date', label: 'Date/Time', type: 'text' },
    { name: 'participants', label: 'Participants', type: 'array' },
    { name: 'outcome', label: 'Outcome', type: 'textarea' },
    { name: 'significance', label: 'Significance', type: 'textarea' }
  ],
  concept: [
    { name: 'rules', label: 'Rules/Mechanics', type: 'textarea' },
    { name: 'examples', label: 'Examples', type: 'array' },
    { name: 'implications', label: 'Implications', type: 'textarea' }
  ]
};

// Helper function to get entity type label
const getTypeLabel = (type) => {
  const labels = {
    character: 'Character',
    location: 'Location',
    item: 'Item',
    event: 'Event',
    concept: 'Concept'
  };
  return labels[type] || 'Entity';
};

const CodexEntityDetail = () => {
  const { projectId, entityId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    attributes: {},
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [relationships, setRelationships] = useState([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch entity data
  useEffect(() => {
    const fetchEntity = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/codex/${entityId}`);
        setEntity(response.data.data);
        
        // Initialize edit data
        setEditData({
          name: response.data.data.name,
          description: response.data.data.description || '',
          attributes: response.data.data.attributes || {},
          tags: response.data.data.tags || []
        });
        
        // Also fetch relationships
        fetchRelationships();
      } catch (error) {
        console.error('Error fetching entity:', error);
        setAlert('Failed to load entity details', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntity();
  }, [entityId, setAlert]);
  
  // Fetch entity relationships
  const fetchRelationships = async () => {
    setRelationshipsLoading(true);
    try {
      const response = await api.get(`/api/codex/${entityId}/relationships`);
      setRelationships(response.data.data);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setRelationshipsLoading(false);
    }
  };
  
  // Handle edit form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };
  
  // Handle attribute changes
  const handleAttributeChange = (name, value) => {
    setEditData({
      ...editData,
      attributes: {
        ...editData.attributes,
        [name]: value
      }
    });
  };
  
  // Handle array attribute changes
  const handleArrayAttributeChange = (name, index, value) => {
    const currentArray = Array.isArray(editData.attributes[name]) 
      ? [...editData.attributes[name]] 
      : [];
    
    currentArray[index] = value;
    
    handleAttributeChange(name, currentArray);
  };
  
  // Add item to array attribute
  const handleAddArrayItem = (name) => {
    const currentArray = Array.isArray(editData.attributes[name]) 
      ? [...editData.attributes[name]] 
      : [];
    
    currentArray.push('');
    
    handleAttributeChange(name, currentArray);
  };
  
  // Remove item from array attribute
  const handleRemoveArrayItem = (name, index) => {
    const currentArray = [...editData.attributes[name]];
    currentArray.splice(index, 1);
    
    handleAttributeChange(name, currentArray);
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData({
        ...editData,
        tags: [...editData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  // Remove a tag
  const handleDeleteTag = (tagToDelete) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(tag => tag !== tagToDelete)
    });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Start editing
  const handleStartEdit = () => {
    setEditing(true);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to original data
    setEditData({
      name: entity.name,
      description: entity.description || '',
      attributes: entity.attributes || {},
      tags: entity.tags || []
    });
    setEditing(false);
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      const response = await api.put(`/api/codex/${entityId}`, editData);
      setEntity(response.data.data);
      setEditing(false);
      setAlert('Entity updated successfully', 'success');
    } catch (error) {
      console.error('Error updating entity:', error);
      setAlert('Failed to update entity', 'error');
    }
  };
  
  // Delete entity
  const handleDelete = async () => {
    try {
      await api.delete(`/api/codex/${entityId}`);
      setAlert('Entity deleted successfully', 'success');
      navigate(`/codex/${projectId}`);
    } catch (error) {
      console.error('Error deleting entity:', error);
      setAlert('Failed to delete entity', 'error');
    }
  };
  
  // Navigate to manage relationships
  const handleManageRelationships = () => {
    navigate(`/codex/${projectId}/relationships?focus=${entityId}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!entity) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h5" color="error">Entity not found</Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, pl: { sm: 0, md: '240px' } }}>
      <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate(`/codex/${projectId}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {editing ? (
            <TextField
              fullWidth
              name="name"
              value={editData.name}
              onChange={handleChange}
              variant="outlined"
              label="Name"
            />
          ) : (
            <Typography variant="h4">
              {entity.name}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={getTypeLabel(entity.type)} 
            color="primary" 
            sx={{ mr: 1 }}
          />
          
          {!editing && entity.tags && entity.tags.map(tag => (
            <Chip 
              key={tag} 
              label={tag} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }}
            />
          ))}
          
          {editing && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              {editData.tags.map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  variant="outlined" 
                  onDelete={() => handleDeleteTag(tag)} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                  variant="outlined"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ width: 150 }}
                />
                <IconButton 
                  onClick={handleAddTag}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
        
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          {editing ? (
            <>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                color="primary"
                variant="contained"
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                color="secondary"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<EditIcon />}
                onClick={handleStartEdit}
                color="primary"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                color="error"
              >
                Delete
              </Button>
            </>
          )}
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="Relationships" />
          </Tabs>
          
          <Box role="tabpanel" hidden={tabValue !== 0} sx={{ mt: 2, px: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Description</Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1" paragraph>
                    {entity.description || 'No description available.'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Attributes</Typography>
                
                <Grid container spacing={3}>
                  {entity.type && attributeFields[entity.type] && 
                    attributeFields[entity.type].map((field) => (
                      <Grid item xs={12} md={field.type === 'textarea' ? 12 : 6} key={field.name}>
                        <Typography variant="subtitle1">{field.label}</Typography>
                        
                        {editing ? (
                          field.type === 'array' ? (
                            <Box>
                              {Array.isArray(editData.attributes[field.name]) && 
                                editData.attributes[field.name].map((item, index) => (
                                  <Box 
                                    key={index} 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      mb: 1
                                    }}
                                  >
                                    <TextField
                                      fullWidth
                                      value={item}
                                      onChange={(e) => 
                                        handleArrayAttributeChange(
                                          field.name, 
                                          index, 
                                          e.target.value
                                        )
                                      }
                                      variant="outlined"
                                      size="small"
                                    />
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => 
                                        handleRemoveArrayItem(field.name, index)
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ))}
                              
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => handleAddArrayItem(field.name)}
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                Add {field.label}
                              </Button>
                            </Box>
                          ) : (
                            <TextField
                              fullWidth
                              multiline={field.type === 'textarea'}
                              rows={field.type === 'textarea' ? 3 : 1}
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={editData.attributes[field.name] || ''}
                              onChange={(e) => 
                                handleAttributeChange(
                                  field.name, 
                                  field.type === 'number' 
                                    ? Number(e.target.value) 
                                    : e.target.value
                                )
                              }
                              variant="outlined"
                            />
                          )
                        ) : (
                          field.type === 'array' ? (
                            <Box>
                              {Array.isArray(entity.attributes[field.name]) && 
                              entity.attributes[field.name].length > 0 ? (
                                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                                  {entity.attributes[field.name].map((item, index) => (
                                    <li key={index}>
                                      <Typography variant="body2">{item}</Typography>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No {field.label.toLowerCase()} specified.
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body1">
                              {entity.attributes[field.name] || 
                                <span style={{ color: 'rgba(0,0,0,0.38)' }}>
                                  No {field.label.toLowerCase()} specified.
                                </span>
                              }
                            </Typography>
                          )
                        )}
                      </Grid>
                    ))
                  }
                </Grid>
              </Grid>
            </Grid>
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 1} sx={{ mt: 2, px: 1 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={handleManageRelationships}
              >
                Manage Relationships
              </Button>
            </Box>
            
            {relationshipsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : relationships.length === 0 ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: 'background.default'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No relationships found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This entity is not connected to any other entities.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {relationships.map((rel) => (
                  <Grid item xs={12} md={6} key={rel.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          {rel.direction === 'outgoing' ? 'Is' : 'Has'}
                          {' '}
                          <strong>{rel.type}</strong>
                          {' '}
                          {rel.direction === 'outgoing' ? 'to' : 'from'}:
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              {rel.entity.name}
                            </Typography>
                            <Chip 
                              label={getTypeLabel(rel.entity.type)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          
                          <IconButton
                            onClick={() => 
                              navigate(`/codex/${projectId}/entity/${rel.entity.id}`)
                            }
                          >
                            <ArrowBackIcon 
                              sx={{ 
                                transform: rel.direction === 'outgoing' 
                                  ? 'rotate(180deg)' 
                                  : 'none' 
                              }} 
                            />
                          </IconButton>
                        </Box>
                        
                        {rel.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rel.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{entity.name}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Warning: This will also delete all relationships involving this entity.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodexEntityDetail;