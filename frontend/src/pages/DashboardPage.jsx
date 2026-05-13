import React, { useState, useEffect, useCallback } from 'react';
import ModelSelector from '../components/dashboard/ModelSelector';
import HyperparameterForm from '../components/dashboard/HyperparameterForm';
import MetricsCharts from '../components/dashboard/MetricsCharts';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '../components/ui';
import { Server, BrainCircuit, RotateCcw, Play, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { trainModels, getRuns } from '../services/api';
import { useApp } from '../context/AppContext';

const DashboardPage = () => {
  const { isDatasetLoaded } = useApp();
  const [selectedModels, setSelectedModels] = useState(['knn', 'svm', 'rf', 'lr', 'adaboost', 'xgboost']);
  const [hyperparameters, setHyperparameters] = useState({
    knn: { k: 5, weights: 'uniform' },
    svm: { kernel: 'rbf', C: 1.0, gamma: 'scale' },
    rf: { n_estimators: 100, max_depth: '' },
    lr: { max_iter: 100 },
    adaboost: { n_estimators: 50, learning_rate: 1.0 },
    xgboost: { n_estimators: 100, max_depth: 6, learning_rate: 0.1 }
  });
  
  const [trainingStatus, setTrainingStatus] = useState('idle'); // 'idle', 'running', 'success', 'error'
  const [refreshKey, setRefreshKey] = useState(0);

  const startTraining = async () => {
    setTrainingStatus('running');
    try {
      await trainModels({ selected_models: selectedModels, params: hyperparameters });
      // Since training is async in backend, we'll wait a bit then refresh
      setTimeout(() => {
        setTrainingStatus('success');
        setRefreshKey(prev => prev + 1); // Trigger charts refresh
      }, 5000);
    } catch (err) {
      console.error("Training initiation failed", err);
      setTrainingStatus('error');
    }
  };

  const resetConfiguration = () => {
    setSelectedModels(['knn', 'svm', 'rf', 'lr', 'adaboost', 'xgboost']);
    setTrainingStatus('idle');
  };

  const toggleModel = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-brand-gray pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2 text-slate-900">
             <Server className="text-brand-blue" /> Machine Learning Workspace
          </h1>
          <p className="text-gray-500">Comparez et optimisez les 4 algorithmes de pointe sur vos données techniques.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={resetConfiguration} className="gap-2 border-brand-gray text-slate-600">
             <RotateCcw size={16} /> Réinitialiser
           </Button>
           
           {trainingStatus === 'running' ? (
             <Button disabled className="gap-2 font-bold px-6 py-4 bg-brand-blue/50">
               <Spinner size={18} className="text-white" /> Apprentissage...
             </Button>
           ) : (
             <Button onClick={startTraining} className="gap-2 font-bold px-6 py-4 bg-brand-blue shadow-lg hover:shadow-xl transition-all">
               <Play size={18} fill="currentColor" /> Lancer l'Apprentissage Global
             </Button>
           )}
        </div>
      </div>

      {trainingStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
           <CheckCircle2 size={24} />
           <p className="font-semibold">Entraînement lancé avec succès ! Les résultats apparaîtront dans quelques instants ci-dessous.</p>
        </div>
      )}

      {trainingStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
           <AlertCircle size={24} />
           <p className="font-semibold">Erreur lors du lancement de l'entraînement. Vérifiez la connexion backend.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Data & Configuration */}
        <div className="lg:col-span-1 space-y-8">
          
          <Card className="border-brand-gray/50 shadow-sm border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                 <Database size={20} className="text-green-500" /> État du Dataset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-green-700 border border-green-100">
                 <CheckCircle2 size={18} />
                 <span className="font-bold text-sm">Prêt pour l'analyse</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Le backend utilise un dataset technique de classification automobile généré automatiquement (650 échantillons).
               </p>
            </CardContent>
          </Card>

          <Card className="border-brand-gray/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                 <BrainCircuit size={20} className="text-brand-blue" /> Stratégie & Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                 <p className="text-xs text-brand-blue leading-relaxed font-medium">
                   Le pipeline actuel lance 4 simulations MLflow en parallèle (KNN, SVM, RF, LR) pour une comparaison exhaustive des métriques.
                 </p>
               </div>
            </CardContent>
          </Card>

          <HyperparameterForm 
             selectedModels={selectedModels} 
             hyperparameters={hyperparameters} 
             setHyperparameters={setHyperparameters}
          />
        </div>

        {/* Right Column: Model Selection & Results */}
        <div className="lg:col-span-2 space-y-8">
          <ModelSelector 
             selectedModels={selectedModels} 
             onToggleModel={toggleModel} 
          />

          <div className="pt-4 border-t border-brand-gray/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Évaluation Globale des Métriques</h3>
                <span className="text-[10px] uppercase font-bold text-slate-400">Temps réel depuis mlflow</span>
              </div>
              <MetricsCharts key={refreshKey} selectedModels={selectedModels} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
