import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  Wallet,
  Heart,
  CheckSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Insight {
  id: string;
  type: 'warning' | 'suggestion' | 'correlation' | 'achievement';
  title: string;
  content: string;
  impactScore: number;
  modules: string[];
}

const InsightCard = ({ insight }: { insight: Insight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'warning': return <AlertTriangle className="text-red-400" />;
      case 'suggestion': return <Lightbulb className="text-blue-400" />;
      case 'correlation': return <TrendingUp className="text-purple-400" />;
      case 'achievement': return <Sparkles className="text-emerald-400" />;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'finance': return <Wallet size={12} />;
      case 'health': return <Heart size={12} />;
      case 'productivity': return <CheckSquare size={12} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "p-3 rounded-2xl",
          insight.type === 'warning' ? "bg-red-500/20" :
          insight.type === 'suggestion' ? "bg-blue-500/20" :
          insight.type === 'correlation' ? "bg-purple-500/20" :
          "bg-emerald-500/20"
        )}>
          {getIcon()}
        </div>
        <div className="flex gap-2">
          {insight.modules.map((m, i) => (
            <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[10px] text-white/50 uppercase font-bold">
              {getModuleIcon(m)}
              {m}
            </div>
          ))}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{insight.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-6">{insight.content}</p>
      
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/30 uppercase">Impact</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-3 rounded-full",
                  i < insight.impactScore ? "bg-purple-500" : "bg-white/10"
                )} 
              />
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors">
          Agir
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const Insights = () => {
  const insights: Insight[] = [
    {
      id: '1',
      type: 'correlation',
      title: 'Sommeil vs Dépenses',
      content: 'Vos dépenses en "Alimentation" augmentent de 40% les semaines où vous dormez moins de 6h en moyenne.',
      impactScore: 8,
      modules: ['finance', 'health']
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Loisirs',
      content: 'Vous avez déjà consommé 85% de votre budget "Loisirs" alors que nous sommes le 15 du mois.',
      impactScore: 6,
      modules: ['finance']
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Optimisation Récupération',
      content: 'Votre VRC est plus élevée les jours où vous terminez votre dernière séance de sport avant 19h.',
      impactScore: 7,
      modules: ['health', 'productivity']
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Régularité Record',
      content: 'Félicitations ! Vous avez complété 100% de vos habitudes sur les 7 derniers jours.',
      impactScore: 9,
      modules: ['productivity']
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3 text-purple-400 mb-2">
          <Sparkles size={24} />
          <span className="text-sm font-bold uppercase tracking-widest">Le Cerveau LifeOS</span>
        </div>
        <h2 className="text-4xl font-bold mb-2">Insights IA</h2>
        <p className="text-white/50 text-lg">Analyses croisées et recommandations proactives basées sur vos données.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Comment ça fonctionne ?</h3>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
          Chaque nuit, le cerveau LifeOS analyse les corrélations entre vos finances, votre santé et votre productivité pour identifier des schémas invisibles et vous aider à optimiser votre quotidien.
        </p>
      </div>
    </div>
  );
};
