import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Database, Filter, Calendar, Clock, RotateCcw, Search, ChevronRight } from 'lucide-react';
import { getPredictionHistory } from '../services/api';

const COLORS = { 
  moto: '#3b82f6', 
  voiture: '#1d4ed8', 
  camion: '#1e40af' 
};

const RunsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Tous');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPredictionHistory();
      setHistory(data.reverse()); // Plus récents en premier
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredHistory = filterType === 'Tous' 
    ? history 
    : history.filter(item => item.prediction === filterType.toLowerCase());

  // Calculer la répartition pour le PieChart
  const distributionData = Object.keys(COLORS).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: history.filter(h => h.prediction === type).length
  })).filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-4 text-slate-900 dark:text-white">
             <div className="p-2 bg-brand-blue/10 rounded-xl"><Database className="text-brand-blue" size={32} /></div>
             Registre des Prédictions
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Consultez l'historique complet des classifications réalisées par l'IA.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={fetchData}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <div className="relative flex-1 md:w-64">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-blue transition-all cursor-pointer appearance-none"
             >
                <option value="Tous">Filtrer par type</option>
                <option value="Voiture">Voitures</option>
                <option value="Moto">Motos</option>
                <option value="Camion">Camions</option>
             </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">
           Chargement de l'historique...
        </div>
      ) : history.length === 0 ? (
        <div className="py-32 text-center bg-slate-100 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
           <div className="inline-flex p-6 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-6 text-slate-300">
             <Search size={48} />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Aucune prédiction enregistrée</h3>
           <p className="text-slate-500 mt-2">Commencez une classification pour voir les résultats apparaître ici.</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 shadow-xl dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-lg font-bold">Répartition Réelle</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex flex-col items-center justify-center pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white' }}
                       itemStyle={{ color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4">
                   {distributionData.map(d => (
                     <div key={d.name} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name.toLowerCase()] }} />
                        {d.name} ({d.value})
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-xl dark:bg-slate-900 overflow-hidden">
               <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                 <CardTitle className="text-lg font-bold">Dernières Activités</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {filteredHistory.slice(0, 5).map((item) => (
                       <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
                               <Clock size={20} />
                             </div>
                             <div>
                               <h4 className="font-bold text-slate-900 dark:text-white capitalize">Classification: {item.prediction}</h4>
                               <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center gap-1"><Calendar size={12}/> {item.date}</span>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span>{item.poids}kg • {item.puissance}ch • {item.portes} portes</span>
                               </div>
                             </div>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-2xl dark:bg-slate-900 overflow-hidden">
             <CardHeader className="p-8 border-b dark:border-slate-800 flex flex-row justify-between items-center bg-white dark:bg-slate-900">
               <CardTitle className="text-xl font-black text-slate-800 dark:text-white">REGISTRE COMPLET</CardTitle>
               <div className="text-xs font-bold text-brand-blue dark:text-blue-400 tracking-widest uppercase bg-brand-blue/10 px-4 py-2 rounded-lg">
                  {filteredHistory.length} Prédictions Total
               </div>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                         <tr>
                            <th className="px-8 py-6">Timestamp</th>
                            <th className="px-8 py-6">Résultat IA</th>
                            <th className="px-8 py-6">Poids (kg)</th>
                            <th className="px-8 py-6">Puissance (ch)</th>
                            <th className="px-8 py-6">Carburant</th>
                            <th className="px-8 py-6">Portes</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filteredHistory.map((item) => (
                           <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group transition-colors">
                              <td className="px-8 py-6 text-sm text-slate-400 font-medium">{item.date}</td>
                              <td className="px-8 py-6">
                                 <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight shadow-sm ${
                                   item.prediction === 'moto' ? 'bg-blue-100 text-blue-700' : 
                                   item.prediction === 'camion' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                 }`}>
                                    {item.prediction}
                                 </span>
                              </td>
                              <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-300">{item.poids}</td>
                              <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-300">{item.puissance}</td>
                              <td className="px-8 py-6 text-slate-500 capitalize">{item.carburant}</td>
                              <td className="px-8 py-6 text-slate-500">{item.portes}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RunsPage;
