import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Paper, Typography, Button, Grid, 
  Tabs, Tab, TextField, IconButton, Card, CardContent,
  CircularProgress, Menu, MenuItem, ListItemIcon,
  Divider, Chip, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  EmojiObjects as EmojiObjectsIcon,
  Event as EventIcon,
  MenuBook as MenuBookIcon,
  FilterList as FilterListIcon,
  Link as LinkIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

const CodexManager = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [project, setProject] = useState(null);
  
  // Filters
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState([]);
  
  // New entity dialog
  const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
  const [newEntityType, setNewEntityType] = useState('');
  const [newEntityData, setNewEntityData] = useState({
    name: '',
    description: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  
  // Add menu
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  
  // Load entities
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project details
        const projectResponse = await api.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data.data);
        
        // Fetch all entities
        const response = await api.get(`/api/projects/${projectId}/codex`);
        setEntities(response.data.data);
      } catch (error) {
        console.error('Error fetching codex data:', error);
        setAlert('Failed to load codex data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, setAlert]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Open add menu
  const handleAddMenuOpen = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };
  
  // Close add menu
  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };
  
  // Open new entity dialog
  const handleNewEntityClick = (type) => {
    setNewEntityType(type);
    setNewEntityDialogOpen(true);
    handleAddMenuClose();
  };
  
  // Handle new entity dialog close
  const handleCloseNewEntityDialog = () => {
    setNewEntityDialogOpen(false);
    setNewEntityData({
      name: '',
      description: '',
      tags: []
    });
    setNewTag('');
  };
  
  // Handle new entity data change
  const handleNewEntityChange = (e) => {
    const { name, value } = e.target;
    setNewEntityData({
      ...newEntityData,
      [name]: value
    });
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !newEntityData.tags.includes(newTag.trim())) {
      setNewEntityData({
        ...newEntityData,
        tags: [...newEntityData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  // Remove a tag
  const handleDeleteTag = (tagToDelete) => {
    setNewEntityData({
      ...newEntityData,
      tags: newEntityData.tags.filter(tag => tag !== tagToDelete)
    });
  };
  
  // Create a new entity
  const handleCreateEntity = async () => {
    if (!newEntityData.name.trim()) {
      setAlert('Entity name is required', 'error');
      return;
    }
    
    try {
      const response = await api.post(`/api/projects/${projectId}/codex`, {
        type: newEntityType,
        name: newEntityData.name,
        description: newEntityData.description,
        tags: newEntityData.tags
      });
      
      // Add to entities list
      setEntities([...entities, response.data.data]);
      handleCloseNewEntityDialog();
      setAlert(`${newEntityType.charAt(0).toUpperCase() + newEntityType.slice(1)} created successfully`, 'success');
      
      // Navigate to new entity
      navigate(`/codex/${projectId}/entity/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating entity:', error);
      setAlert('Failed to create entity', 'error');
    }
  };
  
  // Navigate to entity detail
  const handleViewEntity = (entityId) => {
    navigate(`/codex/${projectId}/entity/${entityId}`);
  };
  
  // Navigate to relationships view
  const handleViewRelationships = () => {
    navigate(`/codex/${projectId}/relationships`);
  };
  
  // Get all tags from entities
  const getAllTags = () => {
    const tags = new Set();
    entities.forEach(entity => {
      if (entity.tags && Array.isArray(entity.tags)) {
        entity.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };
  
  // Toggle tag filter
  const handleTagFilterToggle = (tag) => {
    if (tagFilter.includes(tag)) {
      setTagFilter(tagFilter.filter(t => t !== tag));
    } else {
      setTagFilter([...tagFilter, tag]);
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setTagFilter([]);
  };
  
  // Get icon by entity type
  const getEntityIcon = (type) => {
    switch (type) {
      case 'character':
        return <PersonIcon />;
      case 'location':
        return <LocationIcon />;
      case 'item':
        return <MenuBookIcon />;
      case 'event':
        return <EventIcon />;
      case 'concept':
        return <EmojiObjectsIcon />;
      default:
        return <MenuBookIcon />;
    }
  };
  
  // Filter entities
  const filterEntities = () => {
    return entities.filter(entity => {
      // Filter by type tab
      if (activeTab !== 'all' && entity.type !== activeTab) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !entity.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          (!entity.description || !entity.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Filter by tags
      if (tagFilter.length > 0) {
        if (!entity.tags || !Array.isArray(entity.tags)) return false;
        
        // Check if entity has at least one of the selected tags
        return tagFilter.some(tag => entity.tags.includes(tag));
      }
      
      return true;
    });
  };
  
  const filteredEntities = filterEntities();
  
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Codex</Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={handleViewRelationships}
              sx={{ mr: 2 }}
            >
              Relationships
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMenuOpen}
            >
              New Entry
            </Button>
          </Box>
        </Box>
        
        {project && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {project.title} - World Encyclopedia
          </Typography>
        )}
        
        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name or description"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getAllTags().map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    color={tagFilter.includes(tag) ? "primary" : "default"}
                    onClick={() => handleTagFilterToggle(tag)}
                    variant={tagFilter.includes(tag) ? "filled" : "outlined"}
                    size="small"
                  />
                ))}
                
                {(tagFilter.length > 0 || searchQuery || activeTab !== 'all') && (
                  <Chip
                    label="Clear Filters"
                    icon={<ClearIcon />}
                    onClick={handleClearFilters}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Entity Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab 
              label="Characters" 
              value="character" 
              icon={<PersonIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Locations" 
              value="location" 
              icon={<LocationIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Items" 
              value="item" 
              icon={<MenuBookIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Events" 
              value="event" 
              icon={<EventIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Concepts" 
              value="concept" 
              icon={<EmojiObjectsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Filtered Results */}
        <Box sx={{ mt: 3 }}>
          {filteredEntities.length === 0 ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No entities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entities.length === 0
                  ? "Your codex is empty. Create your first entry by clicking the 'New Entry' button."
                  : "No entities match your current filters. Try adjusting your search or filters."}
              </Typography>
              
              {entities.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddMenuOpen}
                  sx={{ mt: 2 }}
                >
                  Create First Entry
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredEntities.map(entity => (
                <Grid item xs={12} sm={6} md={4} key={entity._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleViewEntity(entity._id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          mr: 1
                        }}>
                          {getEntityIcon(entity.type)}
                        </Box>
                        <Typography variant="h6" noWrap>
                          {entity.name}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mb: 1 }}
                      />
                      
                      {entity.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {entity.description}
                        </Typography>
                      )}
                      
                      {entity.tags && entity.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {entity.tags.slice(0, 3).map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ))}
                          {entity.tags.length > 3 && (
                            <Chip 
                              label={`+${entity.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Add Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
      >
        <MenuItem onClick={() => handleNewEntityClick('character')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Character
        </MenuItem>
        <MenuItem onClick={() => handleNewEntityClick('location')}>
          <ListItemIcon>
            <LocationIcon fontSize="small" />
          </ListItemIcon>
          Location
        </MenuItem>
        <MenuItem onClick={() => handleNewEntityClick('item')}>
          <ListItemIcon>
            <MenuBookIcon fontSize="small" />
          </ListItemIcon>
          Item
        </MenuItem>
        <MenuItem onClick={() => handleNewEntityClick('event')}>
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          Event
        </MenuItem>
        <MenuItem onClick={() => handleNewEntityClick('concept')}>
          <ListItemIcon>
            <EmojiObjectsIcon fontSize="small" />
          </ListItemIcon>
          Concept
        </MenuItem>
      </Menu>
      
      {/* New Entity Dialog */}
      <Dialog
        open={newEntityDialogOpen}
        onClose={handleCloseNewEntityDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create New {newEntityType && newEntityType.charAt(0).toUpperCase() + newEntityType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={newEntityData.name}
            onChange={handleNewEntityChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newEntityData.description}
            onChange={handleNewEntityChange}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Tags
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {newEntityData.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                size="small"
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              sx={{ flexGrow: 1, mr: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewEntityDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateEntity} 
            variant="contained"
            disabled={!newEntityData.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodexManager;