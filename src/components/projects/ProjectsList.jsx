// WritingInterface.jsx - Cleaned up version
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Paper, Typography, IconButton, 
  Drawer, List, ListItem, ListItemText, Divider, 
  AppBar, Toolbar, Menu, MenuItem,
  Tooltip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl,
  InputLabel, Select, ListItemIcon, ListItemButton
} from '@mui/material';

import {
  MenuBook as MenuBookIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatQuote as FormatQuoteIcon,
  InsertPhoto as InsertPhotoIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  ImportExport as ImportExportIcon,
  Description
} from '@mui/icons-material';

// Rich text editor component import
import { Editor, EditorState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';

const WritingInterface = () => {
  const { projectId, chapterId } = useParams();
  const { setAlert } = useAlert();
  
  // State management
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(true);
  const [isCodexDrawerOpen, setIsCodexDrawerOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  
  const editorRef = useRef(null);

  // Load project and chapter data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project details
        const projectRes = await api.get(`/api/projects/${projectId}`);
        setCurrentProject(projectRes.data.data);
        
        // Fetch chapters list
        const chaptersRes = await api.get(`/api/projects/${projectId}/chapters`);
        setChapters(chaptersRes.data.data);
        
        // Fetch current chapter
        if (chapterId) {
          const chapterRes = await api.get(`/api/chapters/${chapterId}`);
          const chapterData = chapterRes.data.data;
          setCurrentChapter(chapterData);
          
          // Initialize editor with content if available
          if (chapterData.content) {
            const contentState = convertFromRaw(
              typeof chapterData.content === 'string' 
                ? JSON.parse(chapterData.content) 
                : chapterData.content
            );
            setEditorState(EditorState.createWithContent(contentState));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert('Failed to load chapter data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, chapterId, setAlert]);

  // Calculate word count
  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const rawText = contentState.getPlainText('');
    const wordArray = rawText.match(/\S+/g) || [];
    setWordCount(wordArray.length);
  }, [editorState]);
  
  // Auto-save functionality
  useEffect(() => {
    if (currentChapter && !loading) {
      const autoSaveInterval = setTimeout(() => {
        handleSave(true);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(autoSaveInterval);
    }
  }, [editorState, currentChapter, loading]);

  // Handle editor changes
  const handleEditorChange = (newState) => {
    setEditorState(newState);
  };

  // Handle keyboard shortcuts
  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Handle text formatting
  const handleFormatClick = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Handle menu open/close
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle dialog open
  const handleDialogOpen = (type) => {
    setDialogType(type);
    setIsDialogOpen(true);
  };
  
  // Handle save
  const handleSave = async (isAutoSave = false) => {
    if (!currentChapter) return;
    
    try {
      if (isAutoSave) setAutoSaving(true);
      
      const contentState = editorState.getCurrentContent();
      const contentRaw = JSON.stringify(convertToRaw(contentState));
      
      await api.put(`/api/chapters/${currentChapter._id}`, {
        content: contentRaw,
        wordCount: wordCount
      });
      
      if (!isAutoSave) {
        setAlert('Chapter saved successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving chapter:', error);
      if (!isAutoSave) {
        setAlert('Failed to save chapter', 'error');
      }
    } finally {
      if (isAutoSave) setAutoSaving(false);
    }
  };

  // Handle chapter selection
  const handleChapterSelect = (chapterId) => {
    window.location.href = `/editor/${projectId}/${chapterId}`;
  };
  
  // Create new chapter
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      setAlert('Please enter a chapter title', 'error');
      return;
    }
    
    try {
      const response = await api.post(`/api/projects/${projectId}/chapters`, {
        title: newChapterTitle.trim()
      });
      
      const newChapter = response.data.data;
      setChapters([...chapters, newChapter]);
      setIsDialogOpen(false);
      setNewChapterTitle('');
      setAlert('Chapter created successfully', 'success');
      
      // Navigate to new chapter
      window.location.href = `/editor/${projectId}/${newChapter._id}`;
    } catch (error) {
      console.error('Error creating chapter:', error);
      setAlert('Failed to create chapter', 'error');
    }
  };

  // Focus the editor when clicking on the writing area
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <AppBar position="fixed" color="default" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit"
            onClick={() => setIsProjectDrawerOpen(!isProjectDrawerOpen)}
          >
            <MenuBookIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, ml: 2 }}>
            {currentProject?.title} - {currentChapter?.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 3 }}>
              {wordCount} / {currentProject?.wordCountGoal} words
            </Typography>
            
            <Tooltip title={autoSaving ? "Auto-saving..." : "Save"}>
              <IconButton color="inherit" onClick={() => handleSave()}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Version History">
              <IconButton color="inherit">
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export">
              <IconButton 
                color="inherit"
                onClick={handleMenuClick}
              >
                <ImportExportIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Export as DOCX</MenuItem>
              <MenuItem onClick={handleMenuClose}>Export as PDF</MenuItem>
              <MenuItem onClick={handleMenuClose}>Export as EPUB</MenuItem>
            </Menu>
            
            <Tooltip title="Settings">
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Full Screen">
              <IconButton color="inherit">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Project Structure Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={isProjectDrawerOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Project Structure</Typography>
          <IconButton size="small" onClick={() => handleDialogOpen('chapter')}>
            <AddIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List>
          {chapters.map((chapter) => (
            <ListItem 
              key={chapter._id}
              disablePadding
              sx={{
                bgcolor: currentChapter?._id === chapter._id ? 'action.selected' : 'transparent'
              }}
            >
              <ListItemButton onClick={() => handleChapterSelect(chapter._id)}>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText 
                  primary={chapter.title} 
                  secondary={`${chapter.wordCount} words`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Writing Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          overflowY: 'auto',
          backgroundColor: '#f8f9fa',
          transition: 'margin 0.2s ease-in-out',
          ml: isProjectDrawerOpen ? '280px' : 0,
          mr: isCodexDrawerOpen ? '320px' : 0
        }}
      >
        {/* Formatting Toolbar */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <Typography variant="h6" sx={{ mr: 3 }}>
            {currentChapter?.title}
          </Typography>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Tooltip title="Bold">
            <IconButton onClick={() => handleFormatClick('BOLD')}>
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Italic">
            <IconButton onClick={() => handleFormatClick('ITALIC')}>
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Underline">
            <IconButton onClick={() => handleFormatClick('UNDERLINE')}>
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Tooltip title="Quote">
            <IconButton>
              <FormatQuoteIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Insert Image">
            <IconButton>
              <InsertPhotoIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            variant="outlined" 
            endIcon={<ExpandMoreIcon />}
            onClick={() => setIsCodexDrawerOpen(!isCodexDrawerOpen)}
          >
            Codex
          </Button>
        </Paper>
        
        {/* Editor */}
        <Paper 
          elevation={2}
          onClick={focusEditor}
          sx={{ 
            p: 4, 
            minHeight: 'calc(100vh - 200px)',
            maxWidth: 800,
            mx: 'auto',
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={handleEditorChange}
              handleKeyCommand={handleKeyCommand}
              placeholder="Start writing..."
            />
          </Box>
        </Paper>
      </Box>
      
      {/* Codex Reference Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={isCodexDrawerOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Codex Reference</Typography>
          <IconButton size="small" onClick={() => setIsCodexDrawerOpen(false)}>
            <ImportExportIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box p={2}>
          <TextField
            placeholder="Search codex..."
            size="small"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Characters
          </Typography>
          <List dense>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Eleanor Blackwood" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Marcus Rivera" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Violet Chen" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Locations
          </Typography>
          <List dense>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Ravenwood City" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Blackwood Manor" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      {/* Dialogs */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {dialogType === 'chapter' ? 'Add New Chapter' : 'Add New Scene'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          {dialogType === 'scene' && (
            <FormControl fullWidth variant="outlined">
              <InputLabel>Chapter</InputLabel>
              <Select
                label="Chapter"
                value=""
              >
                {chapters.map(chapter => (
                  <MenuItem key={chapter._id} value={chapter._id}>
                    {chapter.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateChapter}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WritingInterface;