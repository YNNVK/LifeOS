import React, { useState } from 'react';
import { 
  Utensils, 
  Camera, 
  Plus, 
  Loader2,
  ChevronRight,
  Flame,
  Dna,
  Wheat,
  Droplets
} from 'lucide-react';
import { analyzeImage, cleanJsonResponse } from '../lib/gemini';
import { cn } from '../lib/utils';

const MacroProgress = ({ label, value, target, color, icon: Icon }: any) => {
  const percentage = Math.min((value / target) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", color.replace('bg-', 'bg-opacity-20 text-'))}>
            <Icon size={16} className={color.replace('bg-', 'text-')} />
          </div>
          <span className="text-sm font-medium text-white/70">{label}</span>
        </div>
        <span className="text-sm font-bold">{value} / {target}g</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Nutrition = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Analyse cette photo de repas et retourne les informations nutritionnelles.";
        const result = await analyzeImage(base64Data, file.type, prompt);
        try {
          const cleaned = cleanJsonResponse(result || '{}');
          const parsed = JSON.parse(cleaned);
          setMealResult(parsed);
        } catch (e) {
          console.error('Failed to parse nutrition result', e, result);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Nutrition analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Nutrition</h2>
          <p className="text-white/50">Analysez vos repas et suivez vos macros.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleMealUpload}
            className="hidden" 
            id="meal-upload" 
          />
          <label 
            htmlFor="meal-upload"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold hover:scale-105 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            Analyser un repas
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Objectifs du jour</h3>
              <div className="flex items-center gap-2 text-orange-400">
                <Flame size={20} />
                <span className="font-bold">1,850 / 2,400 kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MacroProgress label="Protéines" value={120} target={160} color="bg-blue-500" icon={Dna} />
              <MacroProgress label="Glucides" value={180} target={250} color="bg-amber-500" icon={Wheat} />
              <MacroProgress label="Lipides" value={55} target={80} color="bg-rose-500" icon={Droplets} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6">Repas récents</h3>
            <div className="space-y-4">
              {[
                { name: 'Poulet Grillé & Quinoa', time: '13:30', kcal: 520, score: 8 },
                { name: 'Smoothie Protéiné', time: '10:00', kcal: 350, score: 9 },
                { name: 'Omelette aux épinards', time: '08:00', kcal: 420, score: 7 },
              ].map((meal, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <p className="font-bold">{meal.name}</p>
                      <p className="text-xs text-white/40">{meal.time} • {meal.kcal} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">Score: {meal.score}/10</p>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {mealResult && (
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold mb-4">Dernière Analyse</h3>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold mb-1">Plat détecté</p>
                  <p className="text-lg font-bold text-emerald-400">{mealResult.meal_name}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Prot</p>
                    <p className="font-bold">{mealResult.macros.p}g</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Gluc</p>
                    <p className="font-bold">{mealResult.macros.c}g</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Lip</p>
                    <p className="font-bold">{mealResult.macros.f}g</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/50 uppercase">Suggestions IA</p>
                  <ul className="space-y-2">
                    {mealResult.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-white/80 flex gap-2">
                        <span className="text-emerald-400">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-4">Conseil Nutrition</h3>
            <p className="text-white/60 text-sm leading-relaxed italic">
              "Privilégiez les glucides complexes le matin pour une énergie stable tout au long de la journée. Votre consommation de protéines est excellente aujourd'hui."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
