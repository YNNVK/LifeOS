import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

interface Exercise {
  id: string;
  name: string;
  imageUrl?: string;
  url?: string;
  notes?: string;
}

interface WorkoutSession {
  id: string;
  date: any;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
  metrics: {
    value: number;
    unit: string;
  };
}

interface SportActivity {
  id: string;
  name: string;
  icon: string;
  color: string;
  exercises: Exercise[];
  sessions: WorkoutSession[];
}

const sportIcons: Record<string, any> = {
  Running: Activity,
  Muscu: Dumbbell,
  Trail: TrendingUp,
  Natation: Zap,
};

const sportColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-violet-500',
];

export const Sport = () => {
  const { user } = useAuth();
  const [sports, setSports] = useState<SportActivity[]>([]);
  const [activeSportId, setActiveSportId] = useState<string | null>(null);
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', imageUrl: '', url: '' });
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({ duration: '', intensity: 'medium' as any, metricValue: 0, metricUnit: 'kg' });

  const activeSport = sports.find(s => s.id === activeSportId);

  useEffect(() => {
    if (!user) return;

    // Mock initial sports if none exist
    const initialSports: SportActivity[] = [
      {
        id: '1',
        name: 'Muscu',
        icon: 'Muscu',
        color: sportColors[1],
        exercises: [
          { id: 'e1', name: 'Développé Couché', imageUrl: 'https://picsum.photos/seed/bench/400/300', url: 'https://youtube.com' },
          { id: 'e2', name: 'Squat', imageUrl: 'https://picsum.photos/seed/squat/400/300', url: 'https://youtube.com' },
        ],
        sessions: [
          { id: 's1', date: new Date(2026, 2, 10), duration: '1h 15m', intensity: 'high', metrics: { value: 85, unit: 'kg' } },
          { id: 's2', date: new Date(2026, 2, 12), duration: '1h 00m', intensity: 'medium', metrics: { value: 87.5, unit: 'kg' } },
          { id: 's3', date: new Date(2026, 2, 15), duration: '1h 30m', intensity: 'high', metrics: { value: 90, unit: 'kg' } },
          { id: 's4', date: new Date(2026, 2, 18), duration: '1h 10m', intensity: 'medium', metrics: { value: 92.5, unit: 'kg' } },
        ]
      },
      {
        id: '2',
        name: 'Running',
        icon: 'Running',
        color: sportColors[0],
        exercises: [
          { id: 'e3', name: 'Fractionné', imageUrl: 'https://picsum.photos/seed/run/400/300' },
        ],
        sessions: [
          { id: 's5', date: new Date(2026, 2, 11), duration: '45m', intensity: 'medium', metrics: { value: 5.2, unit: 'km' } },
          { id: 's6', date: new Date(2026, 2, 14), duration: '55m', intensity: 'high', metrics: { value: 7.5, unit: 'km' } },
          { id: 's7', date: new Date(2026, 2, 17), duration: '1h 05m', intensity: 'medium', metrics: { value: 10.1, unit: 'km' } },
        ]
      }
    ];

    setSports(initialSports);
    if (initialSports.length > 0) setActiveSportId(initialSports[0].id);
  }, [user]);

  const handleAddSport = () => {
    if (!newSportName.trim()) return;
    const newSport: SportActivity = {
      id: Date.now().toString(),
      name: newSportName,
      icon: 'Muscu', // Default
      color: sportColors[sports.length % sportColors.length],
      exercises: [],
      sessions: []
    };
    setSports([...sports, newSport]);
    setActiveSportId(newSport.id);
    setNewSportName('');
    setIsAddingSport(false);
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim() || !activeSportId) return;
    const updatedSports = sports.map(s => {
      if (s.id === activeSportId) {
        return {
          ...s,
          exercises: [...s.exercises, { ...newExercise, id: Date.now().toString() }]
        };
      }
      return s;
    });
    setSports(updatedSports);
    setNewExercise({ name: '', imageUrl: '', url: '' });
    setIsAddingExercise(false);
  };

  const handleAddSession = () => {
    if (!activeSportId) return;
    const updatedSports = sports.map(s => {
      if (s.id === activeSportId) {
        return {
          ...s,
          sessions: [
            ...s.sessions,
            {
              id: Date.now().toString(),
              date: new Date(),
              duration: newSession.duration,
              intensity: newSession.intensity,
              metrics: { value: newSession.metricValue, unit: newSession.metricUnit }
            }
          ]
        };
      }
      return s;
    });
    setSports(updatedSports);
    setNewSession({ duration: '', intensity: 'medium', metricValue: 0, metricUnit: activeSport?.sessions[0]?.metrics.unit || 'kg' });
    setIsAddingSession(false);
  };

  const chartData = activeSport?.sessions.map(s => ({
    date: s.date instanceof Date ? s.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : 'N/A',
    value: s.metrics.value
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Sport</h2>
          <p className="text-white/50">Gérez vos activités physiques et suivez vos progrès.</p>
        </div>
        <button 
          onClick={() => setIsAddingSport(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10"
        >
          <Plus size={20} />
          Ajouter une activité
        </button>
      </header>

      {/* Sport Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {sports.map(sport => {
          const Icon = sportIcons[sport.name] || Dumbbell;
          const isActive = activeSportId === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => setActiveSportId(sport.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap border",
                isActive 
                  ? cn("bg-gradient-to-r text-white border-transparent shadow-lg", sport.color)
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span className="font-bold">{sport.name}</span>
            </button>
          );
        })}
      </div>

      {activeSport ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Progress Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Suivi de progression</h3>
                  <p className="text-sm text-white/40">Évolution de votre performance ({activeSport.sessions[0]?.metrics.unit || 'kg'})</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-emerald-400">
                  <TrendingUp size={24} />
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff40" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#ffffff40" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Exercises Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Exercices & Bibliothèque</h3>
                <button 
                  onClick={() => setIsAddingExercise(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/70"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSport.exercises.map(exercise => (
                  <div key={exercise.id} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    {exercise.imageUrl && (
                      <img 
                        src={exercise.imageUrl} 
                        alt={exercise.name} 
                        className="w-full h-32 object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">{exercise.name}</h4>
                        <div className="flex gap-2">
                          {exercise.url && (
                            <a href={exercise.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                              <LinkIcon size={14} />
                            </a>
                          )}
                          <button className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Recent Sessions */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Séances Récentes</h3>
                <button 
                  onClick={() => setIsAddingSession(true)}
                  className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                {activeSport.sessions.length > 0 ? (
                  activeSport.sessions.slice().reverse().map(session => (
                    <div key={session.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <CalendarIcon size={12} />
                          <span>{session.date instanceof Date ? session.date.toLocaleDateString('fr-FR') : 'N/A'}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          session.intensity === 'high' ? "bg-rose-500/20 text-rose-400" :
                          session.intensity === 'medium' ? "bg-amber-500/20 text-amber-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {session.intensity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-white/70">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{session.duration}</p>
                            <p className="text-[10px] text-white/30 uppercase">Durée</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-purple-400">{session.metrics.value} {session.metrics.unit}</p>
                          <p className="text-[10px] text-white/30 uppercase">Performance</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-white/20">
                    <Activity size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aucune séance enregistrée</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target size={18} className="text-blue-400" />
                Objectif Hebdo
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold">3 / 5</span>
                  <span className="text-xs text-white/40 uppercase font-bold">Séances</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[60%]" />
                </div>
                <p className="text-xs text-white/50 italic">
                  "Encore 2 séances pour atteindre votre objectif de la semaine. Lâchez rien !"
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
          <Dumbbell size={48} className="text-white/10 mb-4" />
          <h3 className="text-xl font-bold text-white/40">Commencez par ajouter une activité</h3>
          <button 
            onClick={() => setIsAddingSport(true)}
            className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all"
          >
            Ajouter ma première activité
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isAddingSport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Nouvelle Activité</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Nom du sport</label>
                  <input 
                    type="text" 
                    value={newSportName}
                    onChange={(e) => setNewSportName(e.target.value)}
                    placeholder="ex: Running, Muscu, Trail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAddingSport(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddSport}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Ajouter un exercice</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Nom de l'exercice</label>
                  <input 
                    type="text" 
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Image URL (optionnel)</label>
                  <input 
                    type="text" 
                    value={newExercise.imageUrl}
                    onChange={(e) => setNewExercise({...newExercise, imageUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Lien Vidéo/Web (optionnel)</label>
                  <input 
                    type="text" 
                    value={newExercise.url}
                    onChange={(e) => setNewExercise({...newExercise, url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsAddingExercise(false)} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold">Annuler</button>
                  <button onClick={handleAddExercise} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold">Ajouter</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Enregistrer une séance</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Durée</label>
                    <input 
                      type="text" 
                      placeholder="ex: 1h 15m"
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Intensité</label>
                    <select 
                      value={newSession.intensity}
                      onChange={(e) => setNewSession({...newSession, intensity: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Valeur (Progrès)</label>
                    <input 
                      type="number" 
                      value={newSession.metricValue}
                      onChange={(e) => setNewSession({...newSession, metricValue: parseFloat(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Unité</label>
                    <input 
                      type="text" 
                      value={newSession.metricUnit}
                      onChange={(e) => setNewSession({...newSession, metricUnit: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsAddingSession(false)} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold">Annuler</button>
                  <button onClick={handleAddSession} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold">Enregistrer</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
