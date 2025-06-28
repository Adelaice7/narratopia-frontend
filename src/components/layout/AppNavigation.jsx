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
  AutoStories as AutoStoriesIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExitToApp as ExitToAppIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
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
      text: 'Novels', 
      icon: <AutoStoriesIcon />, 
      path: '/novels',
      active: isActive('/novels')
    },
    { 
      text: 'Series', 
      icon: <CollectionsBookmarkIcon />, 
      path: '/series',
      active: isActive('/series')
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
      {isMobile && (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2
          }}>
            <Typography variant="h6" component="div">
              Narratopia
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
        </>
      )}
      
      <List sx={{ flexGrow: 1, pt: isMobile ? 0 : 2 }}>
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
          
          {/* Logo */}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/dashboard"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              mr: 4,
              fontWeight: 'bold'
            }}
          >
            Narratopia
          </Typography>
          
          {/* Horizontal Menu - Hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/projects"
              sx={{ mx: 1, color: isActive('/projects') ? 'primary.light' : 'inherit' }}
            >
              Projects
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/novels"
              sx={{ mx: 1, color: isActive('/novels') ? 'primary.light' : 'inherit' }}
            >
              Novels
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/series"
              sx={{ mx: 1, color: isActive('/series') ? 'primary.light' : 'inherit' }}
            >
              Series
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/help"
              sx={{ mx: 1, color: isActive('/help') ? 'primary.light' : 'inherit' }}
            >
              Help
            </Button>
          </Box>
          
          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
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