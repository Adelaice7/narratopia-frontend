import React from 'react';
import { 
  Container, Box, Typography, Grid
} from '@mui/material';
import MyProjects from '../projects/MyProjects';

const Dashboard = () => {

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center', maxWidth: 'lg', mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Continue your writing journey with your existing projects or start something new
        </Typography>
      </Box>

      {/* My Projects Section */}
      <Box sx={{ width: '100%' }}>
        <MyProjects />
      </Box>
    </Container>
  );
};

export default Dashboard;