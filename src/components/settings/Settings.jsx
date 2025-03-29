import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Divider, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Slider, Grid,
  Switch, FormControlLabel, CircularProgress, Alert, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  ColorLens as ColorLensIcon,
  Timer as TimerIcon,
  TextFields as TextFieldsIcon,
  ImportExport as ImportExportIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

const Settings = () => {
  const { currentUser, updateSettings, changePassword } = useAuth();
  const { setAlert } = useAlert();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Loading states
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: 'light',
    fontFamily: 'Georgia',
    fontSize: 16,
    autoSaveInterval: 30
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password change errors
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Danger zone
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Load current settings
  useEffect(() => {
    if (currentUser && currentUser.settings) {
      setSettings(currentUser.settings);
    }
  }, [currentUser]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle settings change
  const handleSettingsChange = (name, value) => {
    setSettings({
      ...settings,
      [name]: value
    });
  };
  
  // Handle password field change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error when typing
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const result = await updateSettings(settings);
      if (result.success) {
        setAlert('Settings updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setAlert('Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };
  
  // Change password
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setSavingPassword(true);
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setAlert('Password changed successfully', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Show field-specific error if available
      if (error.response && error.response.data && error.response.data.field) {
        setPasswordErrors({
          ...passwordErrors,
          [error.response.data.field]: error.response.data.message
        });
      } else {
        setAlert('Failed to change password', 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    // This would normally call an API to delete the account
    setAlert('Account deletion is not implemented in this demo', 'info');
    setDeleteDialogOpen(false);
    setDeleteConfirmText('');
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4, pl: { sm: 0, md: '240px' } }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Interface" icon={<ColorLensIcon />} iconPosition="start" />
          <Tab label="Security" icon={<LockIcon />} iconPosition="start" />
          <Tab label="Data" icon={<ImportExportIcon />} iconPosition="start" />
        </Tabs>
        
        {/* Interface Settings */}
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="sepia">Sepia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingsChange('fontFamily', e.target.value)}
                  label="Font Family"
                >
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Font Size: {settings.fontSize}px
              </Typography>
              <Slider
                value={settings.fontSize}
                onChange={(e, value) => handleSettingsChange('fontSize', value)}
                min={8}
                max={36}
                step={1}
                marks={[
                  { value: 8, label: '8px' },
                  { value: 16, label: '16px' },
                  { value: 24, label: '24px' },
                  { value: 36, label: '36px' },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Auto-Save Interval: {settings.autoSaveInterval} seconds
              </Typography>
              <Slider
                value={settings.autoSaveInterval}
                onChange={(e, value) => handleSettingsChange('autoSaveInterval', value)}
                min={5}
                max={300}
                step={5}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 60, label: '1m' },
                  { value: 300, label: '5m' },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.focusMode || false}
                    onChange={(e) => handleSettingsChange('focusMode', e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Focus Mode (hide UI elements while writing)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? <CircularProgress size={24} /> : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Security Settings */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ pb: 2 }}>
          <Typography variant="h6" gutterBottom>Change Password</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? <CircularProgress size={24} /> : 'Change Password'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" sx={{ color: 'error.main' }}>Danger Zone</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            The following actions are irreversible and should be used with caution.
          </Typography>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </Box>
        
        {/* Data Management Settings */}
        <Box role="tabpanel" hidden={tabValue !== 2} sx={{ pb: 2 }}>
          <Typography variant="h6" gutterBottom>Data Export & Import</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Export Data</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Export all your projects, chapters, and codex entries as a JSON file.
                </Typography>
                <Button variant="contained">
                  Export All Data
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Import Data</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Import projects, chapters, and codex entries from a backup file.
                </Typography>
                <Button variant="contained" component="label">
                  Import Data
                  <input type="file" hidden />
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Data import and export functionality is for demonstration purposes only in this demo.
              </Alert>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" gutterBottom>Backup Settings</Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoBackup || false}
                onChange={(e) => handleSettingsChange('autoBackup', e.target.checked)}
                color="primary"
              />
            }
            label="Enable automatic backups"
          />
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled={!settings.autoBackup}>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency || 'daily'}
                  onChange={(e) => handleSettingsChange('backupFrequency', e.target.value)}
                  label="Backup Frequency"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled={!settings.autoBackup}>
                <InputLabel>Keep Backups For</InputLabel>
                <Select
                  value={settings.backupRetention || '30days'}
                  onChange={(e) => handleSettingsChange('backupRetention', e.target.value)}
                  label="Keep Backups For"
                >
                  <MenuItem value="7days">7 Days</MenuItem>
                  <MenuItem value="30days">30 Days</MenuItem>
                  <MenuItem value="90days">90 Days</MenuItem>
                  <MenuItem value="1year">1 Year</MenuItem>
                  <MenuItem value="forever">Forever</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? <CircularProgress size={24} /> : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Text Appearance Preview */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Text Appearance Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            p: 2, 
            backgroundColor: 
              settings.theme === 'light' ? '#ffffff' : 
              settings.theme === 'dark' ? '#121212' : 
              '#f5f2e9', // Sepia
            color: 
              settings.theme === 'light' ? '#000000' : 
              settings.theme === 'dark' ? '#e0e0e0' : 
              '#5f4b32', // Sepia text
            borderRadius: 1,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize
          }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ fontFamily: 'inherit', fontSize: 'calc(inherit + 4px)' }}
            >
              The Mysterious Island
            </Typography>
            
            <Typography paragraph sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
              The sun was setting over the distant horizon, casting long shadows across the sandy beach. 
              Captain Nemo stood at the edge of the water, his eyes fixed on the point where the sky met the sea.
            </Typography>
            
            <Typography paragraph sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
              "We must leave before nightfall," he said, his voice barely audible above the crashing waves. 
              "This island holds secrets best left undisturbed."
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and all your projects, chapters, and codex entries will be permanently deleted.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Type 'DELETE' to confirm"
            fullWidth
            variant="outlined"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={deleteConfirmText !== 'DELETE'}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;