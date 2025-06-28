import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, Grid, 
  Card, CardContent, CardActionArea, Divider, 
  IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  Chip, Menu, ListItemIcon, ListItemText,
  Popover, MenuList
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizIcon,
  Bookmark as BookmarkIcon,
  Archive as ArchiveIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

const ProjectsView = ({ 
  title = "Projects",
  apiEndpoint = "/api/projects",
  createButtonText = "Create",
  importButtonText = "Import",
  onCreateClick,
  onImportClick,
  entityType = "project"
}) => {
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // Create project dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    genre: '',
    targetBooks: 1
  });
  
  // Edit project dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuProject, setActionMenuProject] = useState(null);
  
  // Filter menu
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  
  // Filters and sorting
  const [filterValue, setFilterValue] = useState('all');
  const [sortValue, setSortValue] = useState('created');
  const [groupByValue, setGroupByValue] = useState('none');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Apply filters and sorting when projects or filter/sort values change
  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, filterValue, sortValue, searchQuery]);
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get(apiEndpoint);
      setProjects(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${entityType}s:`, error);
      setAlert(`Failed to load ${entityType}s`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters and sorting to projects
  const applyFiltersAndSort = () => {
    let result = [...projects];
    
    // Apply search
    if (searchQuery.trim()) {
      result = result.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.genre && project.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply filter
    if (filterValue === 'archived') {
      result = result.filter(project => project.isArchived);
    } else if (filterValue === 'active') {
      result = result.filter(project => !project.isArchived);
    }
    
    // Apply sorting
    if (sortValue === 'created') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredProjects(result);
  };
  
  // Open project detail
  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };
  
  // Create new project
  const handleCreateProject = async () => {
    if (onCreateClick) {
      onCreateClick();
      return;
    }
    
    if (!newProject.title.trim()) {
      setAlert(`${entityType} title is required`, 'error');
      return;
    }
    
    try {
      const response = await api.post(apiEndpoint, newProject);
      setProjects([...projects, response.data.data]);
      setCreateDialogOpen(false);
      setNewProject({
        title: '',
        description: '',
        genre: '',
        targetBooks: 1
      });
      setAlert(`${entityType} created successfully`, 'success');
      
      // Navigate to the new project
      navigate(`/projects/${response.data.data._id}`);
    } catch (error) {
      console.error(`Error creating ${entityType}:`, error);
      setAlert(`Failed to create ${entityType}`, 'error');
    }
  };
  
  // Update a project
  const handleUpdateProject = async () => {
    if (!editProject?.title.trim()) {
      setAlert(`${entityType} title is required`, 'error');
      return;
    }
    
    try {
      const response = await api.put(`${apiEndpoint}/${editProject._id}`, editProject);
      
      // Update projects list
      setProjects(projects.map(p => 
        p._id === editProject._id ? response.data.data : p
      ));
      
      setEditDialogOpen(false);
      setEditProject(null);
      setAlert(`${entityType} updated successfully`, 'success');
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      setAlert(`Failed to update ${entityType}`, 'error');
    }
  };
  
  // Delete a project
  const handleDeleteProject = async () => {
    try {
      await api.delete(`${apiEndpoint}/${selectedProject._id}`);
      
      // Update projects list
      setProjects(projects.filter(p => p._id !== selectedProject._id));
      
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      setAlert(`${entityType} deleted successfully`, 'success');
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      setAlert(`Failed to delete ${entityType}`, 'error');
    }
  };
  
  // Toggle project archived status
  const handleToggleArchive = async () => {
    try {
      const project = actionMenuProject;
      const updatedProject = {
        ...project,
        isArchived: !project.isArchived
      };
      
      const response = await api.put(`${apiEndpoint}/${project._id}`, updatedProject);
      
      // Update projects list
      setProjects(projects.map(p => 
        p._id === project._id ? response.data.data : p
      ));
      
      setActionMenuAnchor(null);
      setActionMenuProject(null);
      setAlert(`${entityType} ${updatedProject.isArchived ? 'archived' : 'unarchived'} successfully`, 'success');
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      setAlert(`Failed to update ${entityType}`, 'error');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleImportClick = () => {
    if (onImportClick) {
      onImportClick();
    } else {
      // Default import functionality
      setAlert('Import functionality not yet implemented', 'info');
    }
  };
  
  return (
    <>
      <Paper sx={{ p: 0, borderRadius: 2, width: '100%', boxShadow: 3 }}>
        {/* Horizontal Menu Bar */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          p: 3,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          {/* Left Side - Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              data-testid="new-project-button"
              sx={{ 
                fontWeight: 'bold',
                borderRadius: '8px'
              }}
            >
              {createButtonText}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleImportClick}
              sx={{ borderRadius: '8px' }}
            >
              {importButtonText}
            </Button>
          </Box>

          {/* Right Side - Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Bar with Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px 0 0 8px'
                  }
                }}
              />
              <IconButton 
                size="small" 
                sx={{ 
                  bgcolor: 'action.hover',
                  borderRadius: '0 8px 8px 0',
                  border: 1,
                  borderColor: 'divider',
                  borderLeft: 0,
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              >
                <FilterIcon />
              </IconButton>
            </Box>

            {/* View Toggle */}
            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{
                  bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                  color: viewMode === 'grid' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: '6px 0 0 6px',
                  '&:hover': {
                    bgcolor: viewMode === 'grid' ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                <ViewModuleIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                sx={{
                  bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                  color: viewMode === 'list' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: '0 6px 6px 0',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Content Area */}
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredProjects.length === 0 ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {projects.length === 0
                  ? `You don't have any ${entityType}s yet`
                  : `No ${entityType}s match your current filters`}
              </Typography>
              
              {projects.length === 0 && (
                <>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Start your writing journey by creating your first {entityType}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Create First {entityType}
                  </Button>
                </>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProjects.map(project => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      opacity: project.isArchived ? 0.8 : 1,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    {project.isArchived && (
                      <Chip 
                        label="Archived"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12, 
                          zIndex: 1,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white'
                        }}
                      />
                    )}
                    
                    <CardActionArea 
                      sx={{ height: '100%', position: 'relative' }}
                      onClick={() => handleOpenProject(project._id)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Title and Menu Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                              fontWeight: 'bold',
                              flexGrow: 1,
                              mr: 1,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {project.title}
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{ 
                              ml: 1,
                              opacity: 0.7,
                              '&:hover': { opacity: 1 }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuAnchor(e.currentTarget);
                              setActionMenuProject(project);
                            }}
                          >
                            <MoreHorizIcon />
                          </IconButton>
                        </Box>
                        
                        {/* Separator line */}
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Keywords */}
                        <Box sx={{ mb: 2, minHeight: 32, display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.5 }}>
                          {project.genre && (
                            <Chip 
                              label={project.genre} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          {project.targetBooks && (
                            <Chip 
                              label={`${project.targetBooks} book${project.targetBooks !== 1 ? 's' : ''}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                        
                        {/* Description */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2, 
                            height: 48,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5
                          }}
                        >
                          {project.description && project.description.length > 80 
                            ? `${project.description.substring(0, 80)}...` 
                            : project.description || 'No description provided.'}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Date */}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDate(project.createdAt)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Filter Menu Popover */}
      <Popover
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor}
        onClose={() => setFilterMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuList sx={{ minWidth: 200, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Sort by:
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              displayEmpty
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="created">Date Created</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Group by:
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={groupByValue}
              onChange={(e) => setGroupByValue(e.target.value)}
              displayEmpty
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="genre">Genre</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="date">Date Created</MenuItem>
            </Select>
          </FormControl>
        </MenuList>
      </Popover>
      
      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New {entityType}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`${entityType} Title`}
            fullWidth
            required
            value={newProject.title}
            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Genre"
            fullWidth
            value={newProject.genre}
            onChange={(e) => setNewProject({...newProject, genre: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Target Books/Novels"
            type="number"
            fullWidth
            value={newProject.targetBooks || 1}
            onChange={(e) => setNewProject({...newProject, targetBooks: parseInt(e.target.value) || 1})}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProject.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit {entityType}</DialogTitle>
        <DialogContent>
          {editProject && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label={`${entityType} Title`}
                fullWidth
                required
                value={editProject.title}
                onChange={(e) => setEditProject({...editProject, title: e.target.value})}
                sx={{ mb: 2, mt: 1 }}
              />
              
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editProject.description || ''}
                onChange={(e) => setEditProject({...editProject, description: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Genre"
                fullWidth
                value={editProject.genre || ''}
                onChange={(e) => setEditProject({...editProject, genre: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Target Books/Novels"
                type="number"
                fullWidth
                value={editProject.targetBooks || 1}
                onChange={(e) => setEditProject({...editProject, targetBooks: parseInt(e.target.value) || 1})}
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateProject} 
            variant="contained"
            disabled={!editProject?.title?.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{selectedProject?.title}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone. All chapters, codex entries, and other associated data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteProject} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => {
          setActionMenuAnchor(null);
          setActionMenuProject(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setEditProject(actionMenuProject);
            setEditDialogOpen(true);
            setActionMenuAnchor(null);
            setActionMenuProject(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleArchive}>
          <ListItemIcon>
            {actionMenuProject?.isArchived ? (
              <BookmarkIcon fontSize="small" />
            ) : (
              <ArchiveIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {actionMenuProject?.isArchived ? 'Unarchive' : 'Archive'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedProject(actionMenuProject);
            setDeleteDialogOpen(true);
            setActionMenuAnchor(null);
            setActionMenuProject(null);
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProjectsView;