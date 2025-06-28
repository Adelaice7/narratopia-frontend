import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import ProjectsList from './components/projects/ProjectsList';
import ProjectDetail from './components/projects/ProjectDetail';
import Novels from './components/novels/Novels';
import NovelDetail from './components/novels/NovelDetail';
import WritingInterface from './components/writing/WritingInterface';
import CodexManager from './components/codex/CodexManager';
import CodexEntityDetail from './components/codex/CodexEntityDetail';
import CodexRelationships from './components/codex/CodexRelationships';
import Settings from './components/settings/Settings';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import AlertSnackbar from './components/common/AlertSnackbar';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Georgia", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Playfair Display", serif',
      },
      h2: {
        fontFamily: '"Playfair Display", serif',
      },
      h3: {
        fontFamily: '"Playfair Display", serif',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/projects"
                  element={<Navigate to="/dashboard" replace />}
                />
                
                <Route
                  path="/projects/:projectId"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <ProjectDetail />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/novels"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <Novels />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/novels/:novelId"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <NovelDetail />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/editor/:projectId/:chapterId"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <WritingInterface />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/codex/:projectId"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <CodexManager />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/codex/:projectId/entity/:entityId"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <CodexEntityDetail />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/codex/:projectId/relationships"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <CodexRelationships />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                        <Settings />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                
                {/* Redirect any unknown routes to Dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <AlertSnackbar />
            </div>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;