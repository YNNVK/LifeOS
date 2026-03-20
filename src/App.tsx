import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { Login } from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { 
  Finance, 
  Health, 
  Nutrition, 
  Productivity, 
  Learning, 
  Documents, 
  Insights 
} from './components/Modules';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Chargement de LifeOS...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'finance': return <Finance />;
      case 'health': return <Health />;
      case 'nutrition': return <Nutrition />;
      case 'productivity': return <Productivity />;
      case 'learning': return <Learning />;
      case 'documents': return <Documents />;
      case 'insights': return <Insights />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000000_100%)]">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
