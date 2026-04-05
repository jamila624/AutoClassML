import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { BrainCircuit, CheckCircle2, ChevronRight, Info } from 'lucide-react';

const MODELS = [
  { id: 'knn', name: 'K-Nearest Neighbors', desc: 'Simple, basé sur la proximité des données.', icon: '🧠' },
  { id: 'svm', name: 'SVM', desc: 'Efficace pour les espaces de grande dimension.', icon: '🛡️' },
  { id: 'rf', name: 'Random Forest', desc: 'Forêt d\'arbres décisionnels, très robuste.', icon: '🌲' },
  { id: 'lr', name: 'Régression Logistique', desc: 'Idéal pour les classifications binaires et probabilistes.', icon: '📈' }
];

const ModelSelectionPage = () => {
  const { selectedModels, setSelectedModels } = useApp();
  const navigate = useNavigate();

  const toggleModel = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleContinue = () => {
    if (selectedModels.length > 0) {
      navigate('/predict');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-brand-blue tracking-tight">Sélection des Modèles</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Choisissez un ou plusieurs algorithmes pour effectuer la classification. 
          Vous pourrez comparer leurs performances plus tard dans le Dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <Card 
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] border-2 ${
                isSelected 
                  ? 'border-brand-blue bg-blue-50/50 shadow-md ring-1 ring-brand-blue/20' 
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <CardContent className="p-6 flex items-start gap-5">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                  isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {model.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-bold ${isSelected ? 'text-brand-blue' : 'text-slate-800'}`}>
                      {model.name}
                    </h3>
                    {isSelected && <CheckCircle2 className="text-brand-blue" size={24} />}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{model.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-brand-beige/40 p-6 rounded-2xl border border-brand-gray/50 flex items-start gap-4">
        <Info className="text-brand-blue shrink-0 mt-1" size={20} />
        <p className="text-sm text-slate-600">
          <strong>Note :</strong> La sélection multiple vous permet d'analyser comment différents cerveaux numériques interprètent vos données de véhicules.
        </p>
      </div>

      <div className="flex justify-center pt-6">
        <Button 
          size="lg" 
          onClick={handleContinue}
          disabled={selectedModels.length === 0}
          className={`px-12 py-7 rounded-full text-lg font-bold gap-3 transition-all ${
            selectedModels.length > 0 
              ? 'bg-brand-blue shadow-xl hover:shadow-2xl hover:-translate-y-1' 
              : 'bg-slate-300 cursor-not-allowed opacity-50'
          }`}
        >
          Continuer <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ModelSelectionPage;
