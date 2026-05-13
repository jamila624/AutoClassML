import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '../ui';
import { Play, Settings2, Loader2 } from 'lucide-react';

const HyperparameterForm = ({ selectedModels, hyperparameters, setHyperparameters, handleAutoTune }) => {
  const [isTuning, setIsTuning] = useState(false);

  const handleParamChange = (modelId, paramName, value) => {
    setHyperparameters(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [paramName]: value
      }
    }));
  };

  const startTuning = async () => {
    setIsTuning(true);
    await handleAutoTune(); // Simulated async function passed from parent
    setIsTuning(false);
  };

  if (selectedModels.length === 0) {
    return (
      <Card className="border-dashed border-2 border-brand-gray bg-brand-beige/20 shadow-none">
        <CardContent className="p-8 text-center text-gray-500">
          <Settings2 className="mx-auto mb-2 opacity-50" size={32} />
          Sélectionnez au moins un modèle pour configurer ses hyperparamètres.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-gray/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 size={20} className="text-brand-blue"/> Paramétrage des modèles
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={startTuning} 
          disabled={isTuning}
          className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
        >
          {isTuning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Auto Tune Model
        </Button>
      </CardHeader>
      <CardContent className="divide-y divide-brand-gray/50">
        
        {selectedModels.includes('knn') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">KNN (K-Nearest Neighbors)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Nombre de voisins (k)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={hyperparameters.knn?.k || 5} 
                  onChange={(e) => handleParamChange('knn', 'k', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Poids (weights)</label>
                <select 
                  value={hyperparameters.knn?.weights || 'uniform'} 
                  onChange={(e) => handleParamChange('knn', 'weights', e.target.value)}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none"
                >
                  <option value="uniform">Uniform</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedModels.includes('svm') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">SVM</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Noyau (kernel)</label>
                <select 
                  value={hyperparameters.svm?.kernel || 'rbf'} 
                  onChange={(e) => handleParamChange('svm', 'kernel', e.target.value)}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none"
                >
                  <option value="rbf">RBF</option>
                  <option value="linear">Linéaire</option>
                  <option value="poly">Polynomial</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Régularisation (C)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={hyperparameters.svm?.C || 1.0} 
                  onChange={(e) => handleParamChange('svm', 'C', parseFloat(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Gamma</label>
                <select 
                  value={hyperparameters.svm?.gamma || 'scale'} 
                  onChange={(e) => handleParamChange('svm', 'gamma', e.target.value)}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none"
                >
                  <option value="scale">Scale</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedModels.includes('rf') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">Random Forest</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Nombre d'arbres (n_estimators)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={hyperparameters.rf?.n_estimators || 100} 
                  onChange={(e) => handleParamChange('rf', 'n_estimators', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Profondeur Max (max_depth)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  placeholder="None"
                  value={hyperparameters.rf?.max_depth || ''} 
                  onChange={(e) => handleParamChange('rf', 'max_depth', parseInt(e.target.value) || '')}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {selectedModels.includes('lr') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">Logistic Regression</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Max Itérations (max_iter)</label>
                <input 
                  type="number" 
                  min="10" 
                  value={hyperparameters.lr?.max_iter || 100} 
                  onChange={(e) => handleParamChange('lr', 'max_iter', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
            </div>
          </div>
        )}
        
        {selectedModels.includes('adaboost') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">AdaBoost</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Estimateurs (n_estimators)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={hyperparameters.adaboost?.n_estimators || 50} 
                  onChange={(e) => handleParamChange('adaboost', 'n_estimators', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Learning Rate</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0.01"
                  max="2.0"
                  value={hyperparameters.adaboost?.learning_rate || 1.0} 
                  onChange={(e) => handleParamChange('adaboost', 'learning_rate', parseFloat(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {selectedModels.includes('xgboost') && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold text-brand-blue flex items-center gap-2">XGBoost</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Estimateurs (n_estimators)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={hyperparameters.xgboost?.n_estimators || 100} 
                  onChange={(e) => handleParamChange('xgboost', 'n_estimators', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Profondeur Max (max_depth)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20"
                  value={hyperparameters.xgboost?.max_depth || 6} 
                  onChange={(e) => handleParamChange('xgboost', 'max_depth', parseInt(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Learning Rate</label>
                <input 
                  type="number" 
                  step="0.05"
                  min="0.01"
                  max="1.0"
                  value={hyperparameters.xgboost?.learning_rate || 0.1} 
                  onChange={(e) => handleParamChange('xgboost', 'learning_rate', parseFloat(e.target.value))}
                  className="w-full p-2 text-sm rounded border border-brand-gray focus:ring-1 focus:ring-brand-blue outline-none" 
                />
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default HyperparameterForm;
