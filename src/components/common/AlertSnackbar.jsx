import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAlert } from '../../contexts/AlertContext';

const AlertSnackbar = () => {
  const { alert, closeAlert } = useAlert();

  return (
    <Snackbar
      open={alert.open}
      autoHideDuration={5000}
      onClose={closeAlert}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeAlert} 
        severity={alert.severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;