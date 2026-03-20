import React from 'react';
import { 
  Activity, 
  Moon, 
  Footprints, 
  Scale, 
  Heart as HeartIcon,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { day: 'Lun', steps: 8400, sleep: 7.2, vrc: 65 },
  { day: 'Mar', steps: 10200, sleep: 6.8, vrc: 62 },
  { day: 'Mer', steps: 9100, sleep: 7.5, vrc: 68 },
  { day: 'Jeu', steps: 12500, sleep: 6.5, vrc: 58 },
  { day: 'Ven', steps: 8800, sleep: 8.0, vrc: 72 },
  { day: 'Sam', steps: 15400, sleep: 7.8, vrc: 75 },
  { day: 'Dim', steps: 6200, sleep: 8.2, vrc: 80 },
];

const MetricCard = ({ title, value, unit, icon: Icon, trend, color }: any) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
        )}>
          {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-white/50 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-sm text-white/30 font-medium">{unit}</span>
    </div>
  </div>
);

export const Health = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Santé</h2>
          <p className="text-white/50">Suivez vos constantes vitales et votre récupération.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all">
          <Plus size={20} />
          Saisir une donnée
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Pas" 
          value="15,400" 
          unit="pas" 
          icon={Footprints} 
          trend={12} 
          color="bg-orange-500/20" 
        />
        <MetricCard 
          title="Sommeil" 
          value="7.8" 
          unit="h" 
          icon={Moon} 
          trend={-5} 
          color="bg-indigo-500/20" 
        />
        <MetricCard 
          title="VRC" 
          value="75" 
          unit="ms" 
          icon={Activity} 
          trend={8} 
          color="bg-purple-500/20" 
        />
        <MetricCard 
          title="Poids" 
          value="78.5" 
          unit="kg" 
          icon={Scale} 
          color="bg-blue-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8">Tendance des pas</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8">Récupération (VRC)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vrc" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
