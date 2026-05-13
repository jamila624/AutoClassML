import React from 'react';
import { Card, CardContent } from '../ui';
import { Cpu, Network, Binary, TrendingUp, Zap, BarChart2 } from 'lucide-react';

const availableModels = [
  { id: 'knn',      name: 'KNN',                 type: 'K-Nearest Neighbors',     icon: Network    },
  { id: 'svm',      name: 'SVM',                 type: 'Support Vector Machine',  icon: Cpu        },
  { id: 'rf',       name: 'Random Forest',        type: 'Ensemble Learning',       icon: Binary     },
  { id: 'lr',       name: 'Logistic Regression', type: 'Linear Model',            icon: TrendingUp },
  { id: 'adaboost', name: 'AdaBoost',            type: 'Boosting Ensemble',       icon: Zap        },
  { id: 'xgboost',  name: 'XGBoost',             type: 'Gradient Boosting',       icon: BarChart2  },
];

const ModelSelector = ({ selectedModels, onToggleModel }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">1. Sélection des modèles</h3>
      <p className="text-sm text-gray-500">Sélectionnez un ou plusieurs modèles pour l'entraînement ou la comparaison.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const Icon = model.icon;
          
          return (
            <Card 
              key={model.id}
              onClick={() => onToggleModel(model.id)}
              className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                isSelected 
                  ? 'border-brand-blue bg-brand-blue/5' 
                  : 'border-brand-gray bg-brand-white hover:border-brand-blue/40'
              }`}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-brand-blue text-white' : 'bg-brand-beige text-brand-blue'}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{model.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{model.type}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
