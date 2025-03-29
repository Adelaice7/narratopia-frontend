import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Paper, Typography, Button, Grid, 
  Select, MenuItem, FormControl, InputLabel, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip, IconButton, Autocomplete,
  Divider, Card, CardContent, FormHelperText, Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Link as LinkIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

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

// Common relationship types
const relationshipTypes = {
  character: [
    'friend of', 'enemy of', 'parent of', 'child of', 'sibling of',
    'mentor of', 'student of', 'ally of', 'rival of', 'lover of',
    'spouse of', 'acquaintance of', 'boss of', 'employee of'
  ],
  location: [
    'contains', 'is inside', 'is north of', 'is south of', 'is east of', 
    'is west of', 'borders', 'is connected to', 'is part of',
    'is capital of', 'is in region of'
  ],
  item: [
    'belongs to', 'is owned by', 'is used by', 'is made by', 
    'is component of', 'contains', 'is found in', 'is paired with'
  ],
  mixed: [
    'knows about', 'is related to', 'created', 'destroyed',
    'visited', 'lives in', 'works in', 'influences', 'is influenced by',
    'participated in', 'discovered', 'affected', 'is in possession of'
  ]
};

// Helper to get relationship suggestions based on entity types
const getRelationshipSuggestions = (sourceType, targetType) => {
  if (sourceType === targetType) {
    return relationshipTypes[sourceType] || relationshipTypes.mixed;
  }
  return relationshipTypes.mixed;
};

const CodexRelationships = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlert } = useAlert();
  const networkRef = useRef(null);
  
  // Extract focus entity from query string if available
  const queryParams = new URLSearchParams(location.search);
  const focusEntityId = queryParams.get('focus');
  
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState([]);
  const [entities, setEntities] = useState([]);
  const [networkData, setNetworkData] = useState(null);
  
  // New relationship dialog
  const [newRelationshipDialogOpen, setNewRelationshipDialogOpen] = useState(false);
  const [selectedSourceEntity, setSelectedSourceEntity] = useState(null);
  const [selectedTargetEntity, setSelectedTargetEntity] = useState(null);
  const [relationshipType, setRelationshipType] = useState('');
  const [customRelationshipType, setCustomRelationshipType] = useState('');
  const [relationshipDescription, setRelationshipDescription] = useState('');
  const [bidirectionalRelationship, setBidirectionalRelationship] = useState(true);
  const [inverseRelationshipType, setInverseRelationshipType] = useState('');
  const [customInverseRelationshipType, setCustomInverseRelationshipType] = useState('');
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  
  // Filtered entities
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all entities
        const entitiesResponse = await api.get(`/api/projects/${projectId}/codex`);
        setEntities(entitiesResponse.data.data);
        
        // Fetch all relationships
        const relationshipsResponse = await api.get(`/api/projects/${projectId}/relationships`);
        setRelationships(relationshipsResponse.data.data);
        
        // Fetch network data for visualization
        const networkResponse = await api.get(`/api/projects/${projectId}/relationships/network`);
        setNetworkData(networkResponse.data.data);
        
        // If a focus entity is provided, select it
        if (focusEntityId) {
          const focusEntity = entitiesResponse.data.data.find(e => e._id === focusEntityId);
          if (focusEntity) {
            setSelectedSourceEntity(focusEntity);
          }
        }
      } catch (error) {
        console.error('Error fetching relationships data:', error);
        setAlert('Failed to load relationships data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, focusEntityId, setAlert]);
  
  // Filter entities based on type and search query
  const filteredEntities = entities.filter(entity => {
    // Type filter
    if (entityTypeFilter !== 'all' && entity.type !== entityTypeFilter) {
      return false;
    }
    
    // Search query
    if (
      searchQuery && 
      !entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Open the relationship dialog with a specific source entity
  const handleCreateRelationshipClick = (sourceEntity = null) => {
    if (sourceEntity) {
      setSelectedSourceEntity(sourceEntity);
    }
    setNewRelationshipDialogOpen(true);
  };
  
  // Reset the relationship dialog
  const handleCloseRelationshipDialog = () => {
    setNewRelationshipDialogOpen(false);
    // Don't reset source entity if it came from URL parameter
    if (!focusEntityId) {
      setSelectedSourceEntity(null);
    }
    setSelectedTargetEntity(null);
    setRelationshipType('');
    setCustomRelationshipType('');
    setRelationshipDescription('');
    setBidirectionalRelationship(true);
    setInverseRelationshipType('');
    setCustomInverseRelationshipType('');
  };
  
  // Handle relationship type change
  const handleRelationshipTypeChange = (event) => {
    setRelationshipType(event.target.value);
  };
  
  // Handle inverse relationship type change
  const handleInverseRelationshipTypeChange = (event) => {
    setInverseRelationshipType(event.target.value);
  };
  
  // Create a new relationship
  const handleCreateRelationship = async () => {
    // Validation
    if (!selectedSourceEntity || !selectedTargetEntity) {
      setAlert('Please select both source and target entities', 'error');
      return;
    }
    
    const finalRelationshipType = relationshipType === 'custom' 
      ? customRelationshipType 
      : relationshipType;
      
    if (!finalRelationshipType) {
      setAlert('Please specify a relationship type', 'error');
      return;
    }
    
    let finalInverseType = null;
    if (bidirectionalRelationship) {
      finalInverseType = inverseRelationshipType === 'custom'
        ? customInverseRelationshipType
        : (inverseRelationshipType || finalRelationshipType);
        
      if (!finalInverseType) {
        setAlert('Please specify an inverse relationship type', 'error');
        return;
      }
    }
    
    try {
      const response = await api.post(`/api/projects/${projectId}/relationships`, {
        sourceId: selectedSourceEntity._id,
        targetId: selectedTargetEntity._id,
        type: finalRelationshipType,
        description: relationshipDescription,
        createInverse: bidirectionalRelationship,
        inverseType: finalInverseType
      });
      
      // Add new relationship(s) to state
      if (response.data.data.inverseRelationship) {
        setRelationships([
          ...relationships,
          response.data.data.relationship,
          response.data.data.inverseRelationship
        ]);
      } else {
        setRelationships([
          ...relationships,
          response.data.data.relationship
        ]);
      }
      
      // Refresh network data
      const networkResponse = await api.get(`/api/projects/${projectId}/relationships/network`);
      setNetworkData(networkResponse.data.data);
      
      // Close dialog and show success message
      handleCloseRelationshipDialog();
      setAlert('Relationship created successfully', 'success');
    } catch (error) {
      console.error('Error creating relationship:', error);
      setAlert('Failed to create relationship', 'error');
    }
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (relationship) => {
    setSelectedRelationship(relationship);
    setDeleteDialogOpen(true);
  };
  
  // Delete a relationship
  const handleDeleteRelationship = async () => {
    try {
      await api.delete(`/api/relationships/${selectedRelationship.id}`);
      
      // Remove from state
      setRelationships(relationships.filter(rel => rel.id !== selectedRelationship.id));
      
      // Refresh network data
      const networkResponse = await api.get(`/api/projects/${projectId}/relationships/network`);
      setNetworkData(networkResponse.data.data);
      
      // Close dialog and show success message
      setDeleteDialogOpen(false);
      setSelectedRelationship(null);
      setAlert('Relationship deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting relationship:', error);
      setAlert('Failed to delete relationship', 'error');
    }
  };
  
  // Initialize network visualization
  useEffect(() => {
    if (networkRef.current && networkData) {
      // This is where you would initialize a visualization library like vis-network
      // For this implementation, we'll just display a placeholder
      console.log('Network visualization would be initialized here');
    }
  }, [networkData, networkRef]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, pl: { sm: 0, md: '240px' } }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate(`/codex/${projectId}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Relationship Manager</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleCreateRelationshipClick()}
          >
            Create Relationship
          </Button>
        </Box>
        
        {/* Visualization Area (placeholder) */}
        <Paper 
          variant="outlined" 
          ref={networkRef}
          sx={{ 
            height: 400, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Relationship visualization would appear here.
            <br />
            This would require a graph visualization library like vis-network.
          </Typography>
        </Paper>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Relationship List */}
        <Typography variant="h5" gutterBottom>Relationships</Typography>
        
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Entity Type</InputLabel>
            <Select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              label="Entity Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="character">Characters</MenuItem>
              <MenuItem value="location">Locations</MenuItem>
              <MenuItem value="item">Items</MenuItem>
              <MenuItem value="event">Events</MenuItem>
              <MenuItem value="concept">Concepts</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>
        
        {relationships.length === 0 ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Relationships Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create connections between your entities to build a rich world.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleCreateRelationshipClick()}
            >
              Create First Relationship
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {relationships.map((relationship) => (
              <Grid item xs={12} md={6} key={relationship.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="primary">
                        {relationship.source.name}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(relationship)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Chip 
                      label={getTypeLabel(relationship.source.type)} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                    
                    <Box sx={{ 
                      my: 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Divider sx={{ flexGrow: 1 }} />
                      <Chip 
                        label={relationship.type}
                        color="primary"
                        size="small"
                        sx={{ mx: 1 }}
                      />
                      <Divider sx={{ flexGrow: 1 }} />
                    </Box>
                    
                    <Typography variant="h6" color="primary">
                      {relationship.target.name}
                    </Typography>
                    
                    <Chip 
                      label={getTypeLabel(relationship.target.type)} 
                      size="small" 
                      variant="outlined" 
                    />
                    
                    {relationship.description && (
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        "{relationship.description}"
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Entity List */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Entities</Typography>
        
        {filteredEntities.length === 0 ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No entities match your filter criteria.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredEntities.map((entity) => (
              <Grid item xs={12} sm={6} md={4} key={entity._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{entity.name}</Typography>
                    <Chip 
                      label={getTypeLabel(entity.type)} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/codex/${projectId}/entity/${entity._id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={() => handleCreateRelationshipClick(entity)}
                      >
                        Create Relationship
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Create Relationship Dialog */}
      <Dialog
        open={newRelationshipDialogOpen}
        onClose={handleCloseRelationshipDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Relationship</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Source Entity */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>Source Entity</Typography>
              <Autocomplete
                value={selectedSourceEntity}
                onChange={(event, newValue) => {
                  setSelectedSourceEntity(newValue);
                }}
                options={entities}
                getOptionLabel={(option) => option.name}
                groupBy={(option) => getTypeLabel(option.type)}
                renderInput={(params) => <TextField {...params} label="Select Source Entity" />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      {option.name}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({getTypeLabel(option.type)})
                      </Typography>
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>
            
            {/* Relationship Direction */}
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>is</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={relationshipType}
                    onChange={handleRelationshipTypeChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Select Type</em>
                    </MenuItem>
                    {selectedSourceEntity && selectedTargetEntity && 
                      getRelationshipSuggestions(
                        selectedSourceEntity.type, 
                        selectedTargetEntity.type
                      ).map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))
                    }
                    <MenuItem value="custom">custom...</MenuItem>
                  </Select>
                </FormControl>
                
                {relationshipType === 'custom' && (
                  <TextField
                    fullWidth
                    label="Custom Relationship"
                    variant="outlined"
                    value={customRelationshipType}
                    onChange={(e) => setCustomRelationshipType(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}
                
                <Typography variant="body1">of</Typography>
              </Box>
            </Grid>
            
            {/* Target Entity */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>Target Entity</Typography>
              <Autocomplete
                value={selectedTargetEntity}
                onChange={(event, newValue) => {
                  setSelectedTargetEntity(newValue);
                }}
                options={entities.filter(e => e._id !== (selectedSourceEntity?._id || ''))}
                getOptionLabel={(option) => option.name}
                groupBy={(option) => getTypeLabel(option.type)}
                renderInput={(params) => <TextField {...params} label="Select Target Entity" />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      {option.name}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({getTypeLabel(option.type)})
                      </Typography>
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                variant="outlined"
                multiline
                rows={2}
                value={relationshipDescription}
                onChange={(e) => setRelationshipDescription(e.target.value)}
                placeholder="Add additional details about this relationship"
              />
            </Grid>
            
            {/* Bidirectional Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bidirectionalRelationship}
                    onChange={(e) => setBidirectionalRelationship(e.target.checked)}
                  />
                }
                label="Create inverse relationship"
              />
              
              {bidirectionalRelationship && (
                <Box sx={{ mt: 2, ml: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    {selectedTargetEntity?.name || 'Target'} is
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <Select
                      value={inverseRelationshipType}
                      onChange={handleInverseRelationshipTypeChange}
                      displayEmpty
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Same as forward relationship</em>
                      </MenuItem>
                      {selectedSourceEntity && selectedTargetEntity && 
                        getRelationshipSuggestions(
                          selectedTargetEntity.type, 
                          selectedSourceEntity.type
                        ).map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))
                      }
                      <MenuItem value="custom">custom...</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {inverseRelationshipType === 'custom' && (
                    <TextField
                      fullWidth
                      label="Custom Inverse Relationship"
                      variant="outlined"
                      value={customInverseRelationshipType}
                      onChange={(e) => setCustomInverseRelationshipType(e.target.value)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  <Typography variant="body2">
                    of {selectedSourceEntity?.name || 'Source'}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelationshipDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateRelationship}
            disabled={!selectedSourceEntity || !selectedTargetEntity || (!relationshipType && !customRelationshipType)}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this relationship?
          </Typography>
          {selectedRelationship && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {selectedRelationship.source.name} <strong>{selectedRelationship.type}</strong> {selectedRelationship.target.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteRelationship} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodexRelationships;