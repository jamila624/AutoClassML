import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from 'recharts';
import { LayoutDashboard, Target, GitCompare, RefreshCw } from 'lucide-react';
import { getRuns } from '../../services/api';

const MetricsCharts = ({ selectedModels }) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

    const fetchRealData = async () => {
    setLoading(true);
    try {
      const data = await getRuns();
      
      const nameMap = {
        'knn': 'KNN',
        'svm': 'SVM',
        'rf': 'Random_Forest',
        'lr': 'Logistic_Regression'
      };

      // 1. Filtrer les runs valides
      const validRuns = data.filter(run => Object.values(nameMap).includes(run.run_name));

      // 2. Grouper par nom et ne garder que le plus récent (le premier dans la liste décroissante de MLflow)
      const latestMap = new Map();
      validRuns.forEach(run => {
        if (!latestMap.has(run.run_name)) {
          latestMap.set(run.run_name, {
            name: run.run_name,
            Accuracy: (run.metrics.accuracy * 100).toFixed(1),
            Precision: (run.metrics.precision * 100).toFixed(1),
            Recall: (run.metrics.recall * 100).toFixed(1),
            F1_Score: (run.metrics.f1_score * 100).toFixed(1),
            id: Object.keys(nameMap).find(key => nameMap[key] === run.run_name)
          });
        }
      });

      setRuns(Array.from(latestMap.values()));
    } catch (err) {
      console.error("Failed to fetch MLflow runs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Filter based on parent selection
  const displayData = runs.filter(run => selectedModels.includes(run.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-brand-blue mr-2" />
        <span className="text-gray-500 font-medium">Récupération des métriques réelles...</span>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">Aucune donnée trouvée pour les modèles sélectionnés. Lancez d'abord l'entraînement.</p>
      </div>
    );
  }

  // Find the best model based on F1 Score
  const bestModelNode = displayData.reduce((prev, current) => (parseFloat(prev.F1_Score) > parseFloat(current.F1_Score)) ? prev : current);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Évaluation Comparative Réelle */}
      <Card className="border-brand-gray/50 shadow-md">
        <CardHeader className="flex flex-row justify-between items-center pb-2 border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitCompare size={20} className="text-brand-blue" /> Évaluation Comparative Réelle (MLflow)
          </CardTitle>
          <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">
            Best: {bestModelNode.name} ({bestModelNode.F1_Score}%)
          </div>
        </CardHeader>
        <CardContent className="h-96 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight="bold" />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Accuracy" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1_Score" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Tableau Récapitulatif des Métriques */}
      <Card className="border-brand-gray/50 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
           <CardTitle className="text-lg flex items-center gap-2">
             <Target size={20} className="text-brand-blue" /> Détails Techniques des Runs
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-brand-gray/30">
                  <th className="p-4 font-bold">Modèle</th>
                  <th className="p-4 font-bold">Accuracy</th>
                  <th className="p-4 font-bold">Precision</th>
                  <th className="p-4 font-bold">Recall</th>
                  <th className="p-4 font-bold">F1-Score</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray/20">
                {displayData.map((model) => (
                  <tr key={model.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{model.name}</td>
                    <td className="p-4 text-slate-600 font-mono">{model.Accuracy}%</td>
                    <td className="p-4 text-slate-600 font-mono">{model.Precision}%</td>
                    <td className="p-4 text-slate-600 font-mono">{model.Recall}%</td>
                    <td className="p-4 text-brand-blue font-bold font-mono">{model.F1_Score}%</td>
                    <td className="p-4 text-center">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         Logged
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-slate-400 py-2">
         Données extraites dynamiquement depuis le serveur de tracking MLflow local sur le port 5000.
      </div>
    </div>
  );
};

export default MetricsCharts;
