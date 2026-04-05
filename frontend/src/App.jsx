import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PredictionPage from './pages/PredictionPage';
import ModelSelectionPage from './pages/ModelSelectionPage';
import RunsPage from './pages/RunsPage';
import DashboardPage from './pages/DashboardPage';
import { AppProvider, useApp } from './context/AppContext';

// Route Guard Component
const ProtectedRoute = ({ children, requireModels = false }) => {
  const { isDatasetLoaded, selectedModels } = useApp();

  // Guard: Redirect to home if dataset not loaded
  if (!isDatasetLoaded) {
    return <Navigate to="/" replace />;
  }

  // Guard: Redirect to models if predicting without selected models
  if (requireModels && selectedModels.length === 0) {
    return <Navigate to="/models" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            
            <Route 
              path="models" 
              element={
                <ProtectedRoute>
                  <ModelSelectionPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="predict" 
              element={
                <ProtectedRoute requireModels={true}>
                  <PredictionPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="history" element={<RunsPage />} />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
