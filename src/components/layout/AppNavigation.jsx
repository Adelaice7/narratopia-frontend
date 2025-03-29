import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, Divider, Box, Tooltip,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  Create as CreateIcon,
  AutoStories as AutoStoriesIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExitToApp as ExitToAppIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AppNavigation = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle user menu open
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  // Handle create menu open
  const handleCreateMenuOpen = (event) => {
    setCreateMenuAnchor(event.currentTarget);
  };
  
  // Handle create menu close
  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };
  
  // Handle create new item
  const handleCreateNew = (type) => {
    handleCreateMenuClose();
    navigate(`/create/${type}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };
  
  // Check if route is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  const mainMenuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      active: isActive('/dashboard')
    },
    { 
      text: 'Projects', 
      icon: <MenuBookIcon />, 
      path: '/projects',
      active: isActive('/projects')
    },
    { 
      text: 'Editor', 
      icon: <CreateIcon />, 
      path: '/editor',
      active: isActive('/editor') 
    },
    { 
      text: 'Library', 
      icon: <AutoStoriesIcon />, 
      path: '/library',
      active: isActive('/library')
    }
  ];
  
  const secondaryMenuItems = [
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      active: isActive('/settings')
    },
    { 
      text: 'Help', 
      icon: <HelpIcon />, 
      path: '/help',
      active: isActive('/help')
    }
  ];
  
  // Format user name and initials
  const userName = currentUser?.username || 'User';
  const userEmail = currentUser?.email || '';
  const userInitials = userName.substring(0, 2).toUpperCase();
  
  const drawer = (
    <Box sx={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Typography variant="h6" component="div">
          Narratopia
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={item.active}
            sx={{ 
              borderRadius: '0 20px 20px 0', 
              mr: 2,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText'
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: item.active ? 'primary.contrastText' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {secondaryMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={item.active}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Narratopia v1.0.0
        </Typography>
      </Box>
    </Box>
  );
  
  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'flex', md: !drawerOpen ? 'flex' : 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isMobile ? 'Narratopia' : ''}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleCreateMenuOpen}
              sx={{ mx: 1 }}
            >
              Create
            </Button>
            
            <Menu
              anchorEl={createMenuAnchor}
              open={Boolean(createMenuAnchor)}
              onClose={handleCreateMenuClose}
            >
              <MenuItem onClick={() => handleCreateNew('project')}>New Project</MenuItem>
              <MenuItem onClick={() => handleCreateNew('character')}>New Character</MenuItem>
              <MenuItem onClick={() => handleCreateNew('location')}>New Location</MenuItem>
              <MenuItem onClick={() => handleCreateNew('item')}>New Item</MenuItem>
              <MenuItem onClick={() => handleCreateNew('event')}>New Event</MenuItem>
              <MenuItem onClick={() => handleCreateNew('concept')}>New Concept</MenuItem>
            </Menu>
            
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar>{userInitials}</Avatar>
            </IconButton>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{userName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userEmail}
                </Typography>
              </Box>
              <Divider />
              <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>My Profile</MenuItem>
              <MenuItem component={Link} to="/settings" onClick={handleUserMenuClose}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: '64px', // Added to fix positioning with AppBar
            height: 'calc(100% - 64px)', // Changed to account for AppBar height
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default AppNavigation;