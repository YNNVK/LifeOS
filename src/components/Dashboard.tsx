import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-white/50 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-4xl font-bold mb-2">Bonjour, {profile?.fullName?.split(' ')[0] || 'Yann'}</h2>
        <p className="text-white/50">Voici l'état de votre système aujourd'hui.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Solde Total" 
          value="12,450.80 €" 
          icon={TrendingUp} 
          trend="+2.4%" 
          color="bg-purple-500/20" 
        />
        <StatCard 
          title="Santé (VRC)" 
          value="68 ms" 
          icon={Activity} 
          trend="Stable" 
          color="bg-blue-500/20" 
        />
        <StatCard 
          title="Habitudes" 
          value="85%" 
          icon={CheckCircle2} 
          trend="+5%" 
          color="bg-emerald-500/20" 
        />
        <StatCard 
          title="Apprentissage" 
          value="12 Cartes" 
          icon={BookOpen} 
          color="bg-orange-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Aperçu de la semaine</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors">Finance</button>
              <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm">Santé</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {[45, 60, 40, 80, 55, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-blue-400 rounded-lg transition-all duration-500 hover:scale-105" 
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-white/30 font-medium">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Sparkles size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Insight IA</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 leading-tight">
              "Vos dépenses en Fast Food augmentent de 40% les semaines où vous dormez moins de 6h."
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Une corrélation forte a été détectée entre votre manque de sommeil et vos habitudes alimentaires impulsives.
            </p>
          </div>
          <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all mt-8">
            Voir tous les insights
          </button>
        </div>
      </div>
    </div>
  );
};
