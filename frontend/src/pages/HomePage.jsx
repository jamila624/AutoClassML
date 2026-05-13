import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from '../components/ui';
import { useApp } from '../context/AppContext';
import { loadDataset } from '../services/api';
import { Car, Settings, BarChart, Bike, Truck, ChevronRight, CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { 
    setIsDatasetLoaded, 
    setDatasetPreview, 
    isLoading, 
    setIsLoading, 
    error, 
    setError, 
    successMessage, 
    setSuccessMessage 
  } = useApp();

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage("Chargement du dataset en cours...");
    
    try {
      const response = await loadDataset();
      setIsDatasetLoaded(true);
      setDatasetPreview(response.data);
      setSuccessMessage("Dataset chargé avec succès ✅");
      
      // Petit délai pour laisser l'utilisateur voir le message de succès
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(null);
        navigate('/models');
      }, 1500);
      
    } catch (err) {
      setIsLoading(false);
      setSuccessMessage(null);
      setError(err.detail || "Erreur lors du chargement du dataset ❌");
    }
  };

  return (
    <div className="flex flex-col gap-16 py-12 animate-in fade-in duration-700">
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-brand-blue tracking-tighter">
            Classification de Véhicules
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Plongez dans l'intelligence artificielle. Notre plateforme automatise l'analyse technique pour classifier instantanément vos véhicules.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-blue-50 border border-blue-100 animate-pulse">
              <Spinner size={40} className="text-brand-blue" />
              <p className="font-bold text-brand-blue">{successMessage || "Traitement..."}</p>
            </div>
          ) : (
            <div className="space-y-6 w-full max-w-md">
              <Button 
                size="lg" 
                onClick={handleStart}
                className="w-full text-xl px-12 py-8 rounded-full bg-brand-blue hover:bg-blue-700 shadow-2xl hover:shadow-blue-500/20 transform transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
              >
                Commencer la classification
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {successMessage && !isLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-600 animate-in slide-in-from-top-2">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 bg-white dark:bg-neutral-950 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-neutral-900 transition-all hover:border-brand-blue/30 group">
             <div className="p-5 bg-brand-beige/50 rounded-3xl group-hover:bg-brand-blue group-hover:text-white transition-colors duration-500">
               <Bike size={48} />
             </div>
             <span className="font-bold text-2xl text-slate-800 dark:text-neutral-200">Moto</span>
          </div>
          <div className="p-10 bg-white dark:bg-neutral-950 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-neutral-900 transition-all hover:border-brand-blue/30 group">
             <div className="p-5 bg-brand-beige/50 rounded-3xl group-hover:bg-brand-blue group-hover:text-white transition-colors duration-500">
               <Car size={48} />
             </div>
             <span className="font-bold text-2xl text-slate-800 dark:text-neutral-200">Voiture</span>
          </div>
          <div className="p-10 bg-white dark:bg-neutral-950 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-neutral-900 transition-all hover:border-brand-blue/30 group">
             <div className="p-5 bg-brand-beige/50 rounded-3xl group-hover:bg-brand-blue group-hover:text-white transition-colors duration-500">
               <Truck size={48} />
             </div>
             <span className="font-bold text-2xl text-slate-800 dark:text-neutral-200">Camion</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full pt-12">
        <h2 className="text-3xl font-black text-center mb-20 text-slate-900 dark:text-white flex items-center justify-center gap-4">
          <div className="h-1 w-12 bg-brand-blue rounded-full"></div>
          Workflow Intelligent
          <div className="h-1 w-12 bg-brand-blue rounded-full"></div>
        </h2>
        <div className="grid md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center text-center space-y-6 group">
            <div className="h-24 w-24 rounded-3xl bg-brand-beige/80 text-brand-blue flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 rotate-6 group-hover:rotate-0 transition-transform duration-500 scale-110">
              <Settings size={44} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">1. Chargement Auto</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Nous générons et préparons dynamiquement votre dataset technique dès le lancement.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6 group">
            <div className="h-24 w-24 rounded-3xl bg-brand-beige/80 text-brand-blue flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 -rotate-3 group-hover:rotate-0 transition-transform duration-500 scale-110">
              <BrainCircuit size={44} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">2. Choix du Modèle</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Sélectionnez les algorithmes ML que vous souhaitez solliciter pour la prédiction.</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-6 group">
            <div className="h-24 w-24 rounded-3xl bg-brand-beige/80 text-brand-blue flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 rotate-3 group-hover:rotate-0 transition-transform duration-500 scale-110">
              <BarChart size={44} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">3. Inférence & Analyse</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Obtenez vos classifications avec des métriques de précision détaillées en temps réel.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
