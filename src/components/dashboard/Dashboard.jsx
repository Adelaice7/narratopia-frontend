import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Grid, Paper, Button, 
  Card, CardContent, CardActionArea, Divider, LinearProgress,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  CircularProgress, Chip
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  EmojiObjects as EmojiObjectsIcon,
  Event as EventIcon,
  Public as PublicIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalWordCount: 0,
    totalWritingSessions: 0,
    averageWordsPerDay: 0
  });
  const [recentActivityData, setRecentActivityData] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch recent projects
      const projectsRes = await api.get('/api/projects');
      const projects = projectsRes.data.data;
      
      // Sort by lastOpenedAt and take top 3
      const sortedProjects = [...projects].sort(
        (a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt)
      ).slice(0, 3);
      
      setRecentProjects(sortedProjects);
      
      // Set basic stats
      setStats({
        totalProjects: projects.length,
        totalWordCount: 0, // This would come from a dedicated stats endpoint
        totalWritingSessions: 0,
        averageWordsPerDay: 0
      });
      
      // Create mock activity data for demonstration
      const mockActivity = [
        {
          id: 1,
          type: 'writing',
          project: sortedProjects[0] || { title: 'Sample Project' },
          date: new Date(),
          details: '1,250 words written'
        },
        {
          id: 2,
          type: 'codex',
          project: sortedProjects[0] || { title: 'Sample Project' },
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          details: 'Added character "Eleanor Blackwood"'
        },
        {
          id: 3,
          type: 'writing',
          project: sortedProjects[1] || { title: 'Sample Project' },
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          details: '850 words written'
        },
        {
          id: 4,
          type: 'codex',
          project: sortedProjects[0] || { title: 'Sample Project' },
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          details: 'Added location "Ravenwood City"'
        },
        {
          id: 5,
          type: 'writing',
          project: sortedProjects[1] || { title: 'Sample Project' },
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          details: '1,500 words written'
        }
      ];
      
      setRecentActivityData(mockActivity);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setAlert('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to project
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Navigate to create new project
  const handleCreateProject = () => {
    navigate('/projects');
  };

  // Format date for activity feed
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Older
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get activity icon based on type
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'writing':
        return <EditIcon />;
      case 'codex':
        if (activity.details.includes('character')) {
          return <PersonIcon />;
        } else if (activity.details.includes('location')) {
          return <LocationOnIcon />;
        } else if (activity.details.includes('concept')) {
          return <EmojiObjectsIcon />;
        } else if (activity.details.includes('event')) {
          return <EventIcon />;
        } else {
          return <PublicIcon />;
        }
      default:
        return <MenuBookIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.username || 'Writer'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Stats Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Writing Overview
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.totalProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Projects
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.totalWordCount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Words Written
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.totalWritingSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Writing Sessions
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.averageWordsPerDay}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Words/Day
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Projects */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Projects
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/projects')}
                >
                  View All
                </Button>
              </Box>
              
              {recentProjects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    You don't have any projects yet
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<MenuBookIcon />}
                    onClick={handleCreateProject}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Project
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {recentProjects.map(project => (
                    <Grid item xs={12} sm={6} md={4} key={project._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardActionArea 
                          onClick={() => handleProjectClick(project._id)}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                        >
                          <CardContent sx={{ width: '100%' }}>
                            <Typography variant="h6" component="div" noWrap>
                              {project.title}
                            </Typography>
                            
                            {project.genre && (
                              <Chip 
                                size="small" 
                                label={project.genre} 
                                sx={{ mb: 1, mt: 0.5 }} 
                              />
                            )}
                            
                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Progress:
                                </Typography>
                                <Typography variant="body2">
                                  {Math.floor(Math.random() * 100)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.floor(Math.random() * 100)} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Last opened: {new Date(project.lastOpenedAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <List sx={{ width: '100%' }}>
                {recentActivityData.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: activity.type === 'writing' ? 'primary.main' : 'secondary.main' }}>
                          {getActivityIcon(activity)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.project.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block' }}
                            >
                              {activity.details}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(activity.date)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Weekly Writing Stats */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Weekly Writing Stats
                </Typography>
                
                <Button 
                  startIcon={<BarChartIcon />}
                  variant="text"
                  size="small"
                >
                  Full Stats
                </Button>
              </Box>
              
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Statistics will appear as you write
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;