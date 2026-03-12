import React, { useState } from 'react';
import PredictForm from './components/PredictForm';
import './App.css';

function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredictionResult = (result) => {
    if (result) {
      setPredictionResult(result);
    } else {
      setPredictionResult(null);
    }
  };

  const handleError = (err) => {
    setError(err);
  };

  // Helper function to get a nice color for the classes
  const getClassColor = (predClass) => {
    const colors = {
      'van': '#3498db',    // Blue
      'saab': '#e74c3c',   // Red
      'bus': '#2ecc71',    // Green
      'opel': '#f39c12'    // Orange
    };
    return colors[predClass.toLowerCase()] || '#95a5a6';
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚗 Modèle de Classification de Véhicules</h1>
        <p>API FastAPI & MLflow Backend | React Frontend</p>
      </header>

      <main className="app-main">
        <div className="content-wrapper">

          <section className="form-section">
            <PredictForm
              onPredictionResult={handlePredictionResult}
              onError={handleError}
            />
          </section>

          <section className="result-section">
            {error && (
              <div className="error-panel">
                <h3>Erreur</h3>
                <p>{error}</p>
                <small>Assurez-vous que le backend FastAPI (localhost:8000) fonctionne.</small>
              </div>
            )}

            {!error && !predictionResult && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>En attente de prédiction</h3>
                <p>Remplissez les caractéristiques à gauche et cliquez sur Prédire.</p>
              </div>
            )}

            {predictionResult && !error && (
              <div className="result-panel">
                <h3>Résultat de la Classification</h3>
                <div
                  className="prediction-badge"
                  style={{ backgroundColor: getClassColor(predictionResult.prediction_class) }}
                >
                  {predictionResult.prediction_class.toUpperCase()}
                </div>

                <div className="details-card">
                  <h4>Détails</h4>
                  <p><strong>ID Classe :</strong> {predictionResult.prediction_id}</p>
                  <p><strong>Modèle actif :</strong> Le meilleur modèle MLflow (ex: Random Forest, SVM...)</p>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;
