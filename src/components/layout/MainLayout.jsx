import React from 'react';
import { Box } from '@mui/material';
import AppNavigation from './AppNavigation';
import Footer from './Footer';

const MainLayout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <AppNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex',
            flexDirection: 'column',
            mt: '64px', // Add top margin to account for AppBar height
            width: { sm: `calc(100% - 240px)` },
            overflow: 'hidden' // Prevent horizontal scrollbar
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;