import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Paper, Typography, Button, Grid, 
  Card, CardContent, CardActionArea, Divider, 
  IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  Chip, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  Archive as ArchiveIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

const ProjectsList = () => {
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
    wordCountGoal: 50000
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
  
  // Filters and sorting
  const [filterValue, setFilterValue] = useState('all');
  const [sortValue, setSortValue] = useState('updated');
  
  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Apply filters and sorting when projects or filter/sort values change
  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, filterValue, sortValue]);
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAlert('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters and sorting to projects
  const applyFiltersAndSort = () => {
    let result = [...projects];
    
    // Apply filter
    if (filterValue === 'archived') {
      result = result.filter(project => project.isArchived);
    } else if (filterValue === 'active') {
      result = result.filter(project => !project.isArchived);
    }
    
    // Apply sorting
    if (sortValue === 'updated') {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (sortValue === 'created') {
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
    if (!newProject.title.trim()) {
      setAlert('Project title is required', 'error');
      return;
    }
    
    try {
      const response = await api.post('/api/projects', newProject);
      setProjects([...projects, response.data.data]);
      setCreateDialogOpen(false);
      setNewProject({
        title: '',
        description: '',
        genre: '',
        wordCountGoal: 50000
      });
      setAlert('Project created successfully', 'success');
      
      // Navigate to the new project
      navigate(`/projects/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setAlert('Failed to create project', 'error');
    }
  };
  
  // Update a project
  const handleUpdateProject = async () => {
    if (!editProject?.title.trim()) {
      setAlert('Project title is required', 'error');
      return;
    }
    
    try {
      const response = await api.put(`/api/projects/${editProject._id}`, editProject);
      
      // Update projects list
      setProjects(projects.map(p => 
        p._id === editProject._id ? response.data.data : p
      ));
      
      setEditDialogOpen(false);
      setEditProject(null);
      setAlert('Project updated successfully', 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      setAlert('Failed to update project', 'error');
    }
  };
  
  // Delete a project
  const handleDeleteProject = async () => {
    try {
      await api.delete(`/api/projects/${selectedProject._id}`);
      
      // Update projects list
      setProjects(projects.filter(p => p._id !== selectedProject._id));
      
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      setAlert('Project deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      setAlert('Failed to delete project', 'error');
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
      
      const response = await api.put(`/api/projects/${project._id}`, updatedProject);
      
      // Update projects list
      setProjects(projects.map(p => 
        p._id === project._id ? response.data.data : p
      ));
      
      setActionMenuAnchor(null);
      setActionMenuProject(null);
      setAlert(`Project ${updatedProject.isArchived ? 'archived' : 'unarchived'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      setAlert('Failed to update project', 'error');
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
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, pl: { sm: 0, md: '240px' } }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Projects</Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Project
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              label="Filter"
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="updated">Last Updated</MenuItem>
              <MenuItem value="created">Date Created</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
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
                ? "You don't have any projects yet"
                : "No projects match your current filters"}
            </Typography>
            
            {projects.length === 0 && (
              <>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Start your writing journey by creating your first project
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Create First Project
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
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionMenuAnchor(e.currentTarget);
                      setActionMenuProject(project);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  
                  {project.isArchived && (
                    <Chip 
                      label="Archived"
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        zIndex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white'
                      }}
                    />
                  )}
                  
                  <CardActionArea 
                    sx={{ height: '100%' }}
                    onClick={() => handleOpenProject(project._id)}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {project.title}
                      </Typography>
                      
                      {project.genre && (
                        <Chip 
                          label={project.genre} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mb: 2 }} 
                        />
                      )}
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2, 
                          height: 60, 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {project.description || 'No description provided.'}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        Created: {formatDate(project.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last updated: {formatDate(project.updatedAt)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
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
            label="Word Count Goal"
            type="number"
            fullWidth
            value={newProject.wordCountGoal}
            onChange={(e) => setNewProject({...newProject, wordCountGoal: parseInt(e.target.value) || 0})}
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
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {editProject && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Project Title"
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
                label="Word Count Goal"
                type="number"
                fullWidth
                value={editProject.wordCountGoal || 50000}
                onChange={(e) => setEditProject({...editProject, wordCountGoal: parseInt(e.target.value) || 0})}
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
    </Container>
  );
};

export default ProjectsList;