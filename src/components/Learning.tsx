import React, { useState } from 'react';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Trophy,
  Sparkles,
  History,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
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

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
  date: string;
  lastScore?: number;
}

const MOCK_HISTORY = [
  { date: '10/03', score: 65 },
  { date: '12/03', score: 72 },
  { date: '14/03', score: 68 },
  { date: '15/03', score: 85 },
  { date: '18/03', score: 82 },
  { date: '20/03', score: 92 },
];

export const Learning = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
  
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([
    { 
      id: 's1', 
      title: 'Next.js 15 Deep Dive', 
      date: '2026-03-18',
      cards: [
        { id: '1', question: "Qu'est-ce qu'un Server Component dans Next.js ?", answer: "Un composant rendu sur le serveur, permettant de réduire le JavaScript envoyé au client.", nextReview: '2026-03-20' },
        { id: '2', question: "Comment fonctionne l'algorithme SM-2 ?", answer: "Il calcule l'intervalle de révision basé sur la difficulté perçue pour optimiser la mémorisation.", nextReview: '2026-03-20' },
      ]
    },
    { 
      id: 's2', 
      title: 'Principes de Nutrition', 
      date: '2026-03-15',
      cards: [
        { id: 'n1', question: "Quel est le rôle des protéines ?", answer: "La construction et la réparation des tissus musculaires.", nextReview: '2026-03-22' },
        { id: 'n2', question: "Combien de calories par gramme de lipides ?", answer: "9 kcal par gramme.", nextReview: '2026-03-22' },
      ]
    },
    { 
      id: 's3', 
      title: 'Vocabulaire Anglais', 
      date: '2026-03-10',
      cards: [
        { id: 'v1', question: "Traduire: 'To achieve'", answer: "Atteindre / Réaliser", nextReview: '2026-03-25' },
        { id: 'v2', question: "Traduire: 'Insight'", answer: "Aperçu / Compréhension profonde", nextReview: '2026-03-25' },
      ]
    },
  ]);

  const startReview = (set: FlashcardSet) => {
    setActiveSet(set);
    setIsReviewing(true);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleReview = (quality: number) => {
    if (!activeSet) return;
    
    setShowAnswer(false);
    if (currentIndex < activeSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsReviewing(false);
      setActiveSet(null);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Apprentissage</h2>
          <p className="text-white/50">Révisez vos connaissances avec l'IA.</p>
        </div>
        {!isReviewing && (
          <button 
            onClick={() => setIsReviewing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
          >
            <Play size={20} />
            Démarrer la révision
          </button>
        )}
      </header>

      {!isReviewing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" />
                  Progression
                </h3>
                <div className="flex items-center gap-2 text-purple-400">
                  <Trophy size={20} />
                  <span className="font-bold">Niveau 12</span>
                </div>
              </div>
              
              <div className="h-64 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_HISTORY}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#9333ea" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold mb-1">À réviser</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {flashcardSets.reduce((acc, set) => acc + set.cards.length, 0)}
                  </p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold mb-1">Apprises</p>
                  <p className="text-3xl font-bold text-emerald-400">142</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold mb-1">Précision</p>
                  <p className="text-3xl font-bold text-blue-400">92%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Vos Flashcards</h3>
                <button className="text-sm text-purple-400 font-bold hover:underline">Voir tout</button>
              </div>
              <div className="space-y-4">
                {flashcardSets.map((set) => (
                  <div 
                    key={set.id} 
                    onClick={() => startReview(set)}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <Brain size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{set.title}</p>
                        <p className="text-xs text-white/40">{set.date} • {set.cards.length} flashcards</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {set.lastScore && (
                        <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                          {set.lastScore}%
                        </span>
                      )}
                      <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 text-purple-400 mb-6">
              <Sparkles size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Génération IA</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              L'IA peut générer automatiquement des flashcards à partir de vos documents. Importez un PDF ou une image dans le module Documents pour commencer.
            </p>
            <button className="w-full py-4 bg-white/10 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
              Générer maintenant
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsReviewing(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h4 className="font-bold">{activeSet?.title}</h4>
                <span className="text-xs font-bold text-white/50">Carte {currentIndex + 1} sur {activeSet?.cards.length}</span>
              </div>
            </div>
            <button onClick={() => setIsReviewing(false)} className="text-sm font-bold text-red-400 hover:text-red-300">Quitter</button>
          </div>

          <div 
            onClick={() => setShowAnswer(true)}
            className={cn(
              "h-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 perspective-1000",
              showAnswer ? "rotate-y-180" : ""
            )}
          >
            <div className={cn("transition-all duration-500", showAnswer ? "hidden" : "block")}>
              <h3 className="text-2xl font-bold leading-relaxed">
                {activeSet?.cards[currentIndex].question}
              </h3>
              <p className="mt-8 text-white/30 text-sm animate-pulse">Cliquez pour voir la réponse</p>
            </div>
            <div className={cn("transition-all duration-500", showAnswer ? "block" : "hidden")}>
              <p className="text-xl text-purple-400 font-medium leading-relaxed">
                {activeSet?.cards[currentIndex].answer}
              </p>
            </div>
          </div>

          {showAnswer && (
            <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-300">
              <button 
                onClick={() => handleReview(1)}
                className="flex flex-col items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all text-red-400"
              >
                <XCircle size={24} />
                <span className="text-xs font-bold">Difficile</span>
              </button>
              <button 
                onClick={() => handleReview(3)}
                className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all text-blue-400"
              >
                <RotateCcw size={24} />
                <span className="text-xs font-bold">Moyen</span>
              </button>
              <button 
                onClick={() => handleReview(5)}
                className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all text-emerald-400"
              >
                <CheckCircle2 size={24} />
                <span className="text-xs font-bold">Facile</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
