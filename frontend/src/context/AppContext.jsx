import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false);
  const [datasetPreview, setDatasetPreview] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const value = {
    isDatasetLoaded,
    setIsDatasetLoaded,
    datasetPreview,
    setDatasetPreview,
    selectedModels,
    setSelectedModels,
    isLoading,
    setIsLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
