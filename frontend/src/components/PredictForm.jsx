import React, { useState } from 'react';
import { predictVehicle } from '../services/api';
import './PredictForm.css';

const PredictForm = ({ onPredictionResult, onError }) => {
    const [loading, setLoading] = useState(false);

    // Initialiser l'état pour les 18 features (vide par défaut)
    const initialFeatures = {};
    for (let i = 1; i <= 18; i++) {
        initialFeatures[`feature_${i}`] = '';
    }

    const [features, setFeatures] = useState(initialFeatures);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeatures({
            ...features,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError(null);
        onPredictionResult(null);

        try {
            // Conversion des valeurs en float
            const numericFeatures = {};
            for (const key in features) {
                numericFeatures[key] = parseFloat(features[key]);
                if (isNaN(numericFeatures[key])) {
                    throw new Error(`La valeur pour ${key} doit être un nombre valide.`);
                }
            }

            const result = await predictVehicle(numericFeatures);
            onPredictionResult(result);
        } catch (err) {
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Grouper les features par 3 pour un bel affichage en grille
    const featureKeys = Object.keys(features);

    return (
        <div className="form-container">
            <h2>Saisir les caractéristiques du véhicule</h2>
            <p className="subtitle">Entrez les 18 features géométriques pour classifier le véhicule (Van, Saab, Bus, Opel)</p>

            <form onSubmit={handleSubmit} className="predict-form">
                <div className="features-grid">
                    {featureKeys.map((key, index) => (
                        <div className="input-group" key={key}>
                            <label htmlFor={key}>
                                Feature {index + 1}
                            </label>
                            <input
                                type="number"
                                step="any"
                                id={key}
                                name={key}
                                value={features[key]}
                                onChange={handleChange}
                                placeholder={`F${index + 1}`}
                                required
                                className="feature-input"
                            />
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setFeatures(initialFeatures)}
                    >
                        Réinitialiser
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Analyse en cours...' : 'Prédire la classe'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PredictForm;
