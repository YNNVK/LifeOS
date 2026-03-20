import React from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon,
  Wallet, 
  Heart, 
  Utensils, 
  CheckSquare, 
  Brain, 
  FileText, 
  Layout,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendrier', icon: CalendarIcon },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'sport', label: 'Sport', icon: Dumbbell },
  { id: 'health', label: 'Santé', icon: Heart },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'productivity', label: 'Productivité', icon: CheckSquare },
  { id: 'learning', label: 'Apprentissage', icon: Brain },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'perso', label: 'Perso', icon: Layout },
  { id: 'insights', label: 'Insights IA', icon: Sparkles },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { signOut, profile } = useAuth();

  return (
    <div 
      className={cn(
        "h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            LifeOS
          </h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center p-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-white/10 border-l-2 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon 
              size={22} 
              className={cn(
                "transition-colors",
                activeTab === item.id ? "text-purple-400" : "group-hover:text-white"
              )} 
            />
            {!isCollapsed && (
              <span className="ml-4 font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        {!isCollapsed && profile && (
          <div className="flex items-center gap-3 px-2">
            <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{profile.fullName}</p>
              <p className="text-[10px] text-white/30 truncate uppercase tracking-widest">{profile.plan}</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center p-3 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="ml-4 font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};
