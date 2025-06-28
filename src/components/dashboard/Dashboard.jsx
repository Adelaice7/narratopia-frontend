import React from 'react';
import { 
  Container, Box, Typography, Grid
} from '@mui/material';
import MyProjects from '../projects/MyProjects';

const Dashboard = () => {

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Continue your writing journey with your existing projects or start something new
        </Typography>
      </Box>

      {/* My Projects Section */}
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} lg={10}>
          <MyProjects />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;