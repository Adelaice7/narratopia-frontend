import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, Box, Paper, Typography, Button, Grid, 
  LinearProgress, Divider, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Card, CardContent,
  CircularProgress, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Menu,
  MenuItem, ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  MenuBook as MenuBookIcon,
  Create as CreateIcon,
  Public as PublicIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  EmojiObjects as EmojiObjectsIcon,
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../utils/api';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState({
    totalWordCount: 0,
    chapterCount: 0,
    codexCounts: {},
    progressPercentage: 0
  });
  const [chapters, setChapters] = useState([]);
  const [codexEntities, setCodexEntities] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Chapter actions
  const [chapterMenuAnchor, setChapterMenuAnchor] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [newChapterDialogOpen, setNewChapterDialogOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [deleteChapterDialogOpen, setDeleteChapterDialogOpen] = useState(false);
  
  // Codex actions
  const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
  const [newEntityType, setNewEntityType] = useState('');
  const [codexMenuAnchor, setCodexMenuAnchor] = useState(null);
  
  // Ref to prevent re-fetching during deletion
  const isDeletingRef = useRef(false);
  
  // Load project data
  const fetchProjectData = useCallback(async () => {
    // Don't fetch if we're currently deleting
    if (isDeletingRef.current) {
      console.log('Skipping fetch during deletion');
      return;
    }
    
    console.log('Fetching project data for project:', projectId);
    setLoading(true);
    try {
      // Fetch project details
      const projectRes = await api.get(`/api/projects/${projectId}`);
      setProject(projectRes.data.data);
      
      // Fetch project stats
      const statsRes = await api.get(`/api/projects/${projectId}/stats`);
      setStats(statsRes.data.data);
      
      // Fetch chapters
      const chaptersRes = await api.get(`/api/projects/${projectId}/chapters`);
      setChapters(chaptersRes.data.data);
      
      // Fetch codex entities
      const codexRes = await api.get(`/api/projects/${projectId}/codex`);
      setCodexEntities(codexRes.data.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setAlert('Failed to load project data', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectId, setAlert]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Chapter menu functions
  const handleChapterMenuOpen = (event, chapter) => {
    setChapterMenuAnchor(event.currentTarget);
    setSelectedChapter(chapter);
  };
  
  const handleChapterMenuClose = () => {
    setChapterMenuAnchor(null);
    setSelectedChapter(null);
  };
  
  // Create new chapter
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      setAlert('Chapter title is required', 'error');
      return;
    }
    
    try {
      const response = await api.post(`/api/projects/${projectId}/chapters`, {
        title: newChapterTitle.trim()
      });
      
      setChapters([...chapters, response.data.data]);
      setNewChapterDialogOpen(false);
      setNewChapterTitle('');
      setAlert('Chapter created successfully', 'success');
    } catch (error) {
      console.error('Error creating chapter:', error);
      setAlert('Failed to create chapter', 'error');
    }
  };
  
  // Open editor for a chapter
  const handleOpenEditor = (chapterId) => {
    navigate(`/editor/${projectId}/${chapterId}`);
  };
  
  // Edit chapter title
  const handleEditChapter = async () => {
    if (!editChapterTitle.trim()) {
      setAlert('Chapter title is required', 'error');
      return;
    }
    
    try {
      const response = await api.put(`/api/chapters/${selectedChapter._id}`, {
        title: editChapterTitle.trim()
      });
      
      // Update chapters list
      const updatedChapters = chapters.map(chapter => 
        chapter._id === selectedChapter._id ? response.data.data : chapter
      );
      
      setChapters(updatedChapters);
      setEditChapterDialogOpen(false);
      setEditChapterTitle('');
      setAlert('Chapter updated successfully', 'success');
    } catch (error) {
      console.error('Error updating chapter:', error);
      setAlert('Failed to update chapter', 'error');
    }
  };
  
  // Delete chapter
  const handleDeleteChapter = async () => {
    console.log('=== handleDeleteChapter CALLED ===');
    console.log('selectedChapter:', selectedChapter);
    
    if (!selectedChapter) {
      console.log('ERROR: No chapter selected for deletion');
      setAlert('No chapter selected for deletion', 'error');
      return;
    }

    console.log('Setting deletion flag to true');
    // Set flag to prevent re-fetching
    isDeletingRef.current = true;

    try {
      console.log('Attempting to delete chapter:', selectedChapter._id);
      console.log('DELETE request URL:', `/api/chapters/${selectedChapter._id}`);
      
      // Make the DELETE request with explicit config
      const response = await api.delete(`/api/chapters/${selectedChapter._id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data);
      
      // Only update UI if the deletion was successful
      if (response.data.success) {
        // Update chapters list locally
        const updatedChapters = chapters.filter(
          chapter => chapter._id !== selectedChapter._id
        );
        
        setChapters(updatedChapters);
        setDeleteChapterDialogOpen(false);
        setSelectedChapter(null); // Clear selected chapter
        setAlert('Chapter deleted successfully', 'success');
        
        // Update stats
        setStats({
          ...stats,
          chapterCount: Math.max(0, stats.chapterCount - 1)
        });
      } else {
        throw new Error(response.data.message || 'Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setAlert(`Failed to delete chapter: ${error.response?.data?.message || error.message}`, 'error');
      setDeleteChapterDialogOpen(false);
    } finally {
      // Reset flag after deletion attempt
      isDeletingRef.current = false;
    }
  };
  
  // Codex menu functions
  const handleCodexMenuOpen = (event) => {
    setCodexMenuAnchor(event.currentTarget);
  };
  
  const handleCodexMenuClose = () => {
    setCodexMenuAnchor(null);
  };
  
  // Open create entity dialog
  const handleNewEntityClick = (type) => {
    setNewEntityType(type);
    setNewEntityDialogOpen(true);
    handleCodexMenuClose();
  };
  
  // Navigate to codex manager
  const handleOpenCodex = () => {
    navigate(`/codex/${projectId}`);
  };
  
  // Navigate to entity detail
  const handleOpenEntity = (entityId) => {
    navigate(`/codex/${projectId}/entity/${entityId}`);
  };
  
  // Get icon for entity type
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
        return <PublicIcon />;
    }
  };
  
  // Create new entity
  const handleCreateEntity = async (name) => {
    if (!name.trim()) {
      setAlert('Entity name is required', 'error');
      return;
    }
    
    try {
      const response = await api.post(`/api/projects/${projectId}/codex`, {
        type: newEntityType,
        name: name.trim()
      });
      
      // Add to entities list
      setCodexEntities([...codexEntities, response.data.data]);
      setNewEntityDialogOpen(false);
      setAlert(`${newEntityType.charAt(0).toUpperCase() + newEntityType.slice(1)} created successfully`, 'success');
      
      // Navigate to the new entity
      handleOpenEntity(response.data.data._id);
    } catch (error) {
      console.error('Error creating entity:', error);
      setAlert('Failed to create entity', 'error');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h5" color="error">Project not found</Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, pl: { sm: 0, md: '240px' } }}>
      {/* Project Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton 
                onClick={() => navigate('/projects')}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4">{project.title}</Typography>
            </Box>
            
            {project.genre && (
              <Chip 
                label={project.genre} 
                variant="outlined" 
                sx={{ ml: 6 }} 
              />
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {/* TODO: Implement project edit */}}
          >
            Edit Project
          </Button>
        </Box>
        
        <Box sx={{ ml: 6, mt: 3 }}>
          <Typography variant="body1" paragraph>
            {project.description || 'No description provided.'}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(project.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {formatDate(project.updatedAt)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Project Stats */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Project Statistics</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {(stats.totalWordCount || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Words Written
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.chapterCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chapters
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {Object.values(stats.codexCounts || {}).reduce((a, b) => a + b, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Codex Entries
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.progressPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progress towards goal ({(stats.wordCountGoal || 0).toLocaleString()} words)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={stats.progressPercentage} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      </Paper>
      
      {/* Tabs for Chapters and Codex */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Chapters" />
          <Tab label="Codex" />
        </Tabs>
        
        {/* Chapters Tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewChapterDialogOpen(true)}
              data-testid="add-chapter-button"
            >
              New Chapter
            </Button>
          </Box>
          
          {chapters.length === 0 ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Chapters Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get started by creating your first chapter.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setNewChapterDialogOpen(true)}
              >
                Create First Chapter
              </Button>
            </Paper>
          ) : (
            <List>
              {chapters.map((chapter, index) => (
                <React.Fragment key={chapter._id}>
                  <ListItem
                    button
                    onClick={() => handleOpenEditor(chapter._id)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {chapter.orderIndex}. {chapter.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" component="span">
                            {chapter.wordCount} words
                          </Typography>
                          {chapter.isComplete && (
                            <Chip 
                              icon={<CheckIcon />} 
                              label="Complete" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleChapterMenuOpen(e, chapter)}
                        data-testid="chapter-menu-button"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < chapters.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        {/* Codex Tab */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleOpenCodex}
            >
              Open Full Codex
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCodexMenuOpen}
            >
              New Entity
            </Button>
          </Box>
          
          {codexEntities.length === 0 ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Codex is Empty
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Start building your world by adding characters, locations, and more.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCodexMenuOpen}
              >
                Add First Entity
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {codexEntities.slice(0, 6).map((entity) => (
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
                    onClick={() => handleOpenEntity(entity._id)}
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
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {codexEntities.length > 6 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button onClick={handleOpenCodex}>
                      View All {codexEntities.length} Entities
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* New Chapter Dialog */}
      <Dialog 
        open={newChapterDialogOpen}
        onClose={() => setNewChapterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Chapter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Chapter Title"
            fullWidth
            variant="outlined"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChapterDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateChapter}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Chapter Dialog */}
      <Dialog 
        open={editChapterDialogOpen}
        onClose={() => setEditChapterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Chapter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Chapter Title"
            fullWidth
            variant="outlined"
            value={editChapterTitle}
            onChange={(e) => setEditChapterTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditChapterDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditChapter}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Chapter Dialog */}
      <Dialog
        open={deleteChapterDialogOpen}
        onClose={() => {
          setDeleteChapterDialogOpen(false);
          setSelectedChapter(null); // Clear selection when dialog closes
        }}
        data-testid="delete-chapter-dialog"
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the chapter "{selectedChapter?.title}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Warning: All content and versions of this chapter will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteChapterDialogOpen(false);
            setSelectedChapter(null);
          }} data-testid="cancel-delete-chapter-button">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('DELETE BUTTON CLICKED');
              handleDeleteChapter();
            }} 
            color="error" 
            data-testid="confirm-delete-chapter-button"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Entity Dialog */}
      <Dialog
        open={newEntityDialogOpen}
        onClose={() => setNewEntityDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create New {newEntityType.charAt(0).toUpperCase() + newEntityType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            variant="outlined"
            sx={{ mt: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateEntity(e.target.value);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEntityDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={(e) => {
              const input = e.target.closest('form')?.querySelector('input') || 
                document.querySelector('[role="dialog"] input');
              handleCreateEntity(input?.value || '');
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Chapter Menu */}
      <Menu
        anchorEl={chapterMenuAnchor}
        open={Boolean(chapterMenuAnchor)}
        onClose={handleChapterMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleChapterMenuClose();
            handleOpenEditor(selectedChapter?._id);
          }}
        >
          <ListItemIcon>
            <CreateIcon fontSize="small" />
          </ListItemIcon>
          Open Editor
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setEditChapterTitle(selectedChapter?.title || '');
            setEditChapterDialogOpen(true);
            handleChapterMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Title
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setDeleteChapterDialogOpen(true);
            setChapterMenuAnchor(null); // Close menu but keep selectedChapter
          }}
          data-testid="delete-chapter-menu-item"
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      
      {/* Codex Menu */}
      <Menu
        anchorEl={codexMenuAnchor}
        open={Boolean(codexMenuAnchor)}
        onClose={handleCodexMenuClose}
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
    </Container>
  );
};

export default ProjectDetail;