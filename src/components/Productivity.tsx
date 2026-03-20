import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Plus, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
  Star,
  TrendingUp,
  History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, subDays, addDays, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isToday as isTodayFn, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Habit {
  id: string;
  title: string;
  icon: string;
  streak: number;
  completedDates: string[]; // Array of ISO strings (yyyy-MM-dd)
}

export const Productivity = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Méditation', icon: '🧘', streak: 12, completedDates: [format(new Date(), 'yyyy-MM-dd')] },
    { id: '2', title: 'Lecture (20 min)', icon: '📚', streak: 5, completedDates: [] },
    { id: '3', title: 'Sport', icon: '💪', streak: 3, completedDates: [format(new Date(), 'yyyy-MM-dd')] },
    { id: '4', title: 'Coder LifeOS', icon: '💻', streak: 21, completedDates: [format(new Date(), 'yyyy-MM-dd')] },
  ]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Mock history for the last 30 days for the chart
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Calculate completion for this date
      let completion = 0;
      if (dateStr === format(today, 'yyyy-MM-dd')) {
        completion = Math.round((habits.filter(h => h.completedDates.includes(dateStr)).length / habits.length) * 100);
      } else {
        // Random mock data for past days
        completion = 40 + Math.floor(Math.random() * 60);
      }
      
      data.push({
        date: format(date, 'dd/MM'),
        fullDate: dateStr,
        completion
      });
    }
    return data;
  }, [habits]);

  const history = useMemo(() => {
    const data: Record<string, number> = {};
    chartData.forEach(d => {
      data[d.fullDate] = d.completion;
    });
    return data;
  }, [chartData]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(selectedDateStr);
        const newCompletedDates = isCompleted 
          ? h.completedDates.filter(d => d !== selectedDateStr)
          : [...h.completedDates, selectedDateStr];
        
        return { 
          ...h, 
          completedDates: newCompletedDates,
          streak: isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1 
        };
      }
      return h;
    }));
  };

  const completedCount = habits.filter(h => h.completedDates.includes(selectedDateStr)).length;
  const totalXP = habits.reduce((acc, h) => acc + (h.streak * 10), 0) + (habits.filter(h => h.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))).length * 50);
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const progressPercent = (xpInLevel / 500) * 100;

  const currentMonthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Productivité</h2>
          <p className="text-white/50">Suivez vos habitudes et restez régulier.</p>
        </div>
        
        {/* Gamified Progress Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-6 min-w-[300px]">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 flex items-center justify-center bg-purple-500/10">
              <span className="text-xl font-black text-purple-400">{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 shadow-lg">
              <Star size={12} className="text-white fill-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Niveau {level}</span>
              <span className="text-[10px] font-mono text-purple-400">{xpInLevel} / 500 XP</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">Habitudes</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                  {isTodayFn(selectedDate) ? `+${completedCount * 50} XP aujourd'hui` : format(selectedDate, 'd MMMM', { locale: fr })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-4 flex items-center gap-2 min-w-[140px] justify-center">
                  <Calendar size={14} className="text-purple-400" />
                  <span className="text-sm font-bold">
                    {isTodayFn(selectedDate) ? "Aujourd'hui" : format(selectedDate, 'dd/MM/yyyy')}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  disabled={isTodayFn(selectedDate)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isTodayFn(selectedDate) ? "opacity-20 cursor-not-allowed" : "hover:bg-white/10 text-white/60 hover:text-white"
                  )}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {habits.map((habit) => {
                const isCompleted = habit.completedDates.includes(selectedDateStr);
                return (
                  <div 
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group",
                      isCompleted 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl group-hover:scale-110 transition-transform">{habit.icon}</div>
                      <div>
                        <p className={cn("font-bold", isCompleted ? "text-emerald-400" : "text-white")}>
                          {habit.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                          <Flame size={12} className={cn(habit.streak > 10 && "animate-pulse")} />
                          <span>Streak: {habit.streak} jours</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCompleted ? '-50 XP' : '+50 XP'}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="text-emerald-400" size={28} />
                      ) : (
                        <Circle className="text-white/20 group-hover:text-white/40" size={28} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Évolution</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Taux de complétion (30 jours)</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <TrendingUp size={18} />
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completion" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCompletion)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Régularité</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                  {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-3 h-3 bg-white/5 rounded-sm" /> 0%
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> 100%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-7 gap-3">
              {currentMonthDays.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const percentage = history[dateStr] || 0;
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                
                return (
                  <div key={i} className="space-y-1">
                    <div 
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center relative group transition-all duration-300 border",
                        isToday ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-transparent",
                        percentage === 0 ? "bg-white/5" :
                        percentage < 30 ? "bg-emerald-900/20" :
                        percentage < 60 ? "bg-emerald-700/40" :
                        percentage < 90 ? "bg-emerald-600/60" :
                        "bg-emerald-500"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold",
                        percentage > 50 ? "text-white" : "text-white/40"
                      )}>
                        {percentage}%
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 border border-white/10">
                        {format(day, 'd MMMM', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-[8px] text-center text-white/20 font-bold uppercase">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                  </div>
                );
              })}
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
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 text-xl shadow-inner">🔥</div>
                <div>
                  <p className="font-bold">Maître des Streaks</p>
                  <p className="text-xs text-white/40">21 jours consécutifs de code</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-xl shadow-inner">🧘</div>
                <div>
                  <p className="font-bold">Zen total</p>
                  <p className="text-xs text-white/40">10 séances de méditation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={64} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" />
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-2xl font-black text-purple-400">{totalXP}</p>
                <p className="text-[10px] text-white/30 uppercase font-bold">XP Total</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-2xl font-black text-emerald-400">{Math.round(Object.values(history).reduce((a, b) => a + b, 0) / 30)}%</p>
                <p className="text-[10px] text-white/30 uppercase font-bold">Moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
