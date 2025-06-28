import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const version = '1.0.0';

  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 2,
        mt: 'auto',
        zIndex: 1000
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Narratopia © 2025
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Build version v{version} | Released {currentDate}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;