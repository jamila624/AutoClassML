import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '../components/ui';
import { Weight, Zap, Fuel, DoorOpen, Send, Info, CheckCircle2, AlertCircle, Cpu, BarChart4, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { predictVehicle } from '../services/api';

// ── Constantes de validation (mirror du backend) ──────────────────
const VALIDATION = {
  poids: { min: 100, max: 35000, unit: 'kg' },
  puissance: { min: 10, max: 1000, unit: 'ch' },
  portes: {
    options: [
      { value: '0', label: '0' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
    ]
  }
};

// ── Validation temps réel côté client ─────────────────────────────
function getFieldErrors(formData) {
  const errors = {};
  const p = parseFloat(formData.poids);
  const pu = parseFloat(formData.puissance);

  if (formData.poids !== '' && (isNaN(p) || p < VALIDATION.poids.min || p > VALIDATION.poids.max)) {
    errors.poids = `Le poids doit être entre ${VALIDATION.poids.min} et ${VALIDATION.poids.max.toLocaleString()} kg.`;
  }
  if (formData.puissance !== '' && (isNaN(pu) || pu < VALIDATION.puissance.min || pu > VALIDATION.puissance.max)) {
    errors.puissance = `La puissance doit être entre ${VALIDATION.puissance.min} et ${VALIDATION.puissance.max.toLocaleString()} ch.`;
  }
  return errors;
}

// ── Avertissements de cohérence croisée (mirror du backend) ───────
function getCoherenceWarnings(formData) {
  const warnings = [];
  const poids = parseFloat(formData.poids);
  const puissance = parseFloat(formData.puissance);
  const portes = parseInt(formData.portes);
  const carburant = formData.carburant;

  if (isNaN(poids) || isNaN(puissance) || isNaN(portes)) return warnings;

  if (portes === 0 && poids > 800) {
    warnings.push('Un véhicule sans porte (moto) pèse rarement plus de 800 kg.');
  }
  if (portes >= 3 && poids < 400) {
    warnings.push(`Un véhicule à ${portes} portes pèse généralement plus de 400 kg.`);
  }
  if (poids > 3500 && portes > 3) {
    warnings.push(`Un véhicule de ${poids} kg (camion) a rarement plus de 3 portes.`);
  }
  if (poids > 0 && puissance / poids > 2.0) {
    warnings.push(`Ratio puissance/poids anormalement élevé (${(puissance / poids).toFixed(2)} ch/kg).`);
  }
  if (poids > 5000 && puissance < 100) {
    warnings.push(`Un véhicule de ${poids} kg avec ${puissance} ch semble peu réaliste.`);
  }
  if (portes === 0 && carburant === 'diesel') {
    warnings.push('Les motos ne sont généralement pas diesel.');
  }
  return warnings;
}

const CONFIDENCE_CONFIG = {
  haute: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, label: 'Fiabilité haute' },
  moyenne: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: TriangleAlert, label: 'Fiabilité moyenne' },
  faible: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert, label: 'Fiabilité faible' },
};

const PredictionPage = () => {
  const { selectedModels } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedPredictModel, setSelectedPredictModel] = useState('best');
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    poids: '',
    puissance: '',
    carburant: 'essence',
    portes: ''
  });

  // ── Validation réactive ──
  const fieldErrors = useMemo(() => getFieldErrors(formData), [formData]);
  const coherenceWarnings = useMemo(() => getCoherenceWarnings(formData), [formData]);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const isFormComplete = formData.poids !== '' && formData.puissance !== '' && formData.portes !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (predictionResult) setPredictionResult(null);
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ poids: true, puissance: true, portes: true, carburant: true });

    if (hasErrors || !isFormComplete) return;

    setLoading(true);
    setError(null);
    setPredictionResult(null);

    const apiPayload = {
      poids: parseFloat(formData.poids),
      puissance: parseFloat(formData.puissance),
      carburant: formData.carburant,
      portes: parseInt(formData.portes),
      model_override: selectedPredictModel === 'best' ? null : selectedPredictModel
    };

    try {
      const result = await predictVehicle(apiPayload);
      setLoading(false);
      setPredictionResult(result);
    } catch (err) {
      console.error("Erreur API:", err);
      // Pydantic 422 errors — extract readable messages
      let errorMsg = err.detail || "Erreur lors de la prédiction. Vérifiez le backend.";
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        errorMsg = err.response.data.detail.map(d => d.msg).join(' | ');
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  const FieldError = ({ field }) => {
    if (!touched[field] || !fieldErrors[field]) return null;
    return (
      <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
        <AlertCircle size={12} /> {fieldErrors[field]}
      </p>
    );
  };

  const inputClass = (field) =>
    `w-full p-3.5 rounded-xl border transition-all font-medium ${touched[field] && fieldErrors[field]
      ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-200'
      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-brand-blue/20'
    }`;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-brand-blue tracking-tight">Prédiction IA</h1>
        <p className="text-gray-500">Configurez les caractéristiques du véhicule pour une identification instantanée.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* Form Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg border-brand-gray/50 overflow-hidden border-t-4 border-t-brand-blue">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu size={20} className="text-brand-blue" /> Paramètres d'entrée
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Model Selection Override */}
                <div className="space-y-2 pb-4 border-b border-slate-100">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    Cerveau Décisionnel
                  </label>
                  <select
                    value={selectedPredictModel}
                    onChange={(e) => setSelectedPredictModel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-semibold text-slate-700"
                  >
                    <option value="best">Meilleur Modèle (automatique)</option>
                    {selectedModels.map(modelId => (
                      <option key={modelId} value={modelId}>
                        Utiliser {modelId.toUpperCase()} uniquement
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Poids */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Weight size={16} className="text-brand-blue" /> Poids (kg)
                    </label>
                    <input
                      type="number"
                      name="poids"
                      required
                      min={VALIDATION.poids.min}
                      max={VALIDATION.poids.max}
                      step="1"
                      placeholder="Ex: 1200 (100 — 35 000)"
                      value={formData.poids}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass('poids')}
                    />
                    <FieldError field="poids" />
                    <p className="text-[10px] text-slate-400 font-medium">Min: 100 kg · Max: 35 000 kg</p>
                  </div>

                  {/* Puissance */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Zap size={16} className="text-brand-blue" /> Puissance (ch)
                    </label>
                    <input
                      type="number"
                      name="puissance"
                      required
                      min={VALIDATION.puissance.min}
                      max={VALIDATION.puissance.max}
                      step="1"
                      placeholder="Ex: 90 (10 — 1 000)"
                      value={formData.puissance}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass('puissance')}
                    />
                    <FieldError field="puissance" />
                    <p className="text-[10px] text-slate-400 font-medium">Min: 10 ch · Max: 1 000 ch</p>
                  </div>

                  {/* Carburant */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Fuel size={16} className="text-brand-blue" /> Carburant
                    </label>
                    <select
                      name="carburant"
                      value={formData.carburant}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium"
                    >
                      <option value="essence">Essence</option>
                      <option value="diesel">Diesel</option>
                      <option value="electrique">Électrique</option>
                    </select>
                  </div>

                  {/* Portes — maintenant un select avec labels descriptifs */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <DoorOpen size={16} className="text-brand-blue" /> Portes
                    </label>
                    <select
                      name="portes"
                      required
                      value={formData.portes}
                      onChange={handleChange}
                      className={`w-full p-3.5 rounded-xl border transition-all font-medium ${formData.portes === ''
                          ? 'border-slate-200 bg-slate-50/30 text-slate-400'
                          : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-brand-blue/20'
                        }`}
                    >
                      <option value="" disabled>Sélectionnez le nombre de portes</option>
                      {VALIDATION.portes.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Avertissements de cohérence croisée ── */}
                {coherenceWarnings.length > 0 && isFormComplete && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <TriangleAlert size={16} />
                      <span>Avertissements de cohérence ({coherenceWarnings.length})</span>
                    </div>
                    <ul className="text-xs text-amber-600 space-y-1 pl-6 list-disc">
                      {coherenceWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-amber-500 italic mt-1">
                      Ces avertissements n'empêchent pas la prédiction mais indiquent des valeurs atypiques.
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || (hasErrors && Object.keys(touched).length > 0)}
                    className={`w-full py-7 text-lg font-bold rounded-2xl shadow-lg group transition-all ${hasErrors && Object.keys(touched).length > 0
                        ? 'opacity-50 cursor-not-allowed shadow-none'
                        : 'shadow-brand-blue/20 hover:shadow-brand-blue/30'
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3"><Spinner size={24} className="text-white" /> Analyse des données...</span>
                    ) : (
                      <span className="flex items-center gap-3"><Send size={20} className="group-hover:translate-x-1 transition-transform" /> Lancer la Prédiction</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full shadow-lg border-brand-gray/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {!predictionResult && !error && !loading && (
              <div className="space-y-6 animate-pulse">
                <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <BarChart4 size={48} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-400">En attente de données</h3>
                  <p className="text-slate-300 text-sm mt-1">Remplissez le formulaire et cliquez sur "Lancer"</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                <Spinner size={64} className="text-brand-blue mx-auto" />
                <p className="font-bold text-brand-blue animate-bounce">Consultation de l'IA...</p>
              </div>
            )}

            {error && (
              <div className="space-y-4 text-red-500 animate-in zoom-in-95">
                <AlertCircle size={64} className="mx-auto" />
                <h3 className="text-xl font-bold">Erreur de validation</h3>
                <p className="text-sm opacity-80">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2 border-red-200 text-red-500 hover:bg-red-50">Réessayer</Button>
              </div>
            )}

            {predictionResult && !loading && (
              <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Résultat Identifié</span>
                  <div className="text-6xl font-black text-brand-blue tracking-tighter mt-1">
                    {predictionResult.prediction_class.toUpperCase()}
                  </div>
                </div>

                {/* ── Indicateur de confiance ── */}
                {predictionResult.confidence && (() => {
                  const conf = CONFIDENCE_CONFIG[predictionResult.confidence] || CONFIDENCE_CONFIG.haute;
                  const Icon = conf.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${conf.bg} ${conf.color} ${conf.border} border`}>
                      <Icon size={16} />
                      {conf.label}
                    </div>
                  );
                })()}

                <div className="bg-brand-beige/50 p-6 rounded-[2rem] border border-brand-gray/50 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-brand-gray pb-3">
                    <span>RÉSULTAT</span>
                    <span className="text-brand-blue">#{predictionResult.prediction_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">ID Classe</p>
                      <p className="text-lg font-black text-slate-700">#{predictionResult.prediction_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Source</p>
                      <p className="text-lg font-black text-slate-700">MLflow Run</p>
                    </div>
                  </div>
                </div>

                {/* ── Avertissements retournés par l'API ── */}
                {predictionResult.warnings && predictionResult.warnings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <TriangleAlert size={16} />
                      <span>Avertissements ({predictionResult.warnings.length})</span>
                    </div>
                    <ul className="text-xs text-amber-600 space-y-1.5">
                      {predictionResult.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="shrink-0 mt-0.5">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-slate-400 italic">
                    Classification basée sur l'analyse multidimensionnelle <br />du modèle {selectedPredictModel === 'best' ? 'optimal' : selectedPredictModel.toUpperCase()}.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PredictionPage;
