import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Plus, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Habit {
  id: string;
  title: string;
  icon: string;
  streak: number;
  completedToday: boolean;
}

export const Productivity = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Méditation', icon: '🧘', streak: 12, completedToday: true },
    { id: '2', title: 'Lecture (20 min)', icon: '📚', streak: 5, completedToday: false },
    { id: '3', title: 'Sport', icon: '💪', streak: 3, completedToday: true },
    { id: '4', title: 'Coder LifeOS', icon: '💻', streak: 21, completedToday: true },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? h.streak - 1 : h.streak + 1 } : h
    ));
  };

  const completedCount = habits.filter(h => h.completedToday).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Productivité</h2>
          <p className="text-white/50">Suivez vos habitudes et restez régulier.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          Nouvelle Habitude
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Habitudes du jour</h3>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="font-bold">{completedCount} / {habits.length} complétées</span>
              </div>
            </div>
            <div className="space-y-4">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group",
                    habit.completedToday 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{habit.icon}</div>
                    <div>
                      <p className={cn("font-bold", habit.completedToday ? "text-emerald-400" : "text-white")}>
                        {habit.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                        <Flame size={12} />
                        <span>Streak: {habit.streak} jours</span>
                      </div>
                    </div>
                  </div>
                  {habit.completedToday ? (
                    <CheckCircle2 className="text-emerald-400" size={28} />
                  ) : (
                    <Circle className="text-white/20 group-hover:text-white/40" size={28} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Régularité (90 jours)</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(13,1fr)] gap-2">
              {Array.from({ length: 91 }).map((_, i) => {
                const intensity = Math.floor(Math.random() * 4);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "aspect-square rounded-sm",
                      intensity === 0 ? "bg-white/5" :
                      intensity === 1 ? "bg-emerald-900/40" :
                      intensity === 2 ? "bg-emerald-700/60" :
                      "bg-emerald-500"
                    )}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-white/30 uppercase font-bold">
              <span>Moins</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-white/5 rounded-sm" />
                <div className="w-3 h-3 bg-emerald-900/40 rounded-sm" />
                <div className="w-3 h-3 bg-emerald-700/60 rounded-sm" />
                <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              </div>
              <span>Plus</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-orange-600/20 to-rose-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 text-orange-400 mb-6">
              <Trophy size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Succès</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 text-xl">🔥</div>
                <div>
                  <p className="font-bold">Maître des Streaks</p>
                  <p className="text-xs text-white/40">21 jours consécutifs de code</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-xl">🧘</div>
                <div>
                  <p className="font-bold">Zen total</p>
                  <p className="text-xs text-white/40">10 séances de méditation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-4">Conseil Productivité</h3>
            <p className="text-white/60 text-sm leading-relaxed italic">
              "La régularité bat l'intensité. Il vaut mieux méditer 5 minutes chaque jour que 1 heure une fois par semaine."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
