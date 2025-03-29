import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export const AlertProvider = ({ children }) => {
  const [alert, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });

  const setAlert = (message, severity = 'info') => {
    setAlertState({
      open: true,
      message,
      severity
    });
  };

  const closeAlert = () => {
    setAlertState({
      ...alert,
      open: false
    });
  };

  const value = {
    alert,
    setAlert,
    closeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;