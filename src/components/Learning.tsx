import React, { useState } from 'react';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Trophy,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: string;
}

export const Learning = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', question: "Qu'est-ce qu'un Server Component dans Next.js ?", answer: "Un composant rendu sur le serveur, permettant de réduire le JavaScript envoyé au client.", nextReview: '2026-03-20' },
    { id: '2', question: "Comment fonctionne l'algorithme SM-2 ?", answer: "Il calcule l'intervalle de révision basé sur la difficulté perçue pour optimiser la mémorisation.", nextReview: '2026-03-20' },
  ]);

  const handleReview = (quality: number) => {
    // Simple mock of SRS logic
    setShowAnswer(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsReviewing(false);
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
                <h3 className="text-xl font-bold">Statistiques</h3>
                <div className="flex items-center gap-2 text-purple-400">
                  <Trophy size={20} />
                  <span className="font-bold">Niveau 12</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold mb-1">À réviser</p>
                  <p className="text-3xl font-bold text-purple-400">{flashcards.length}</p>
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
              <h3 className="text-xl font-bold mb-6">Derniers documents importés</h3>
              <div className="space-y-4">
                {[
                  { title: 'Next.js 15 Deep Dive', cards: 12, date: '2026-03-18' },
                  { title: 'Principes de Nutrition', cards: 8, date: '2026-03-15' },
                  { title: 'Vocabulaire Anglais', cards: 25, date: '2026-03-10' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <Brain size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{doc.title}</p>
                        <p className="text-xs text-white/40">{doc.date} • {doc.cards} flashcards</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
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
            <span className="text-sm font-bold text-white/50">Carte {currentIndex + 1} sur {flashcards.length}</span>
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
                {flashcards[currentIndex].question}
              </h3>
              <p className="mt-8 text-white/30 text-sm animate-pulse">Cliquez pour voir la réponse</p>
            </div>
            <div className={cn("transition-all duration-500", showAnswer ? "block" : "hidden")}>
              <p className="text-xl text-purple-400 font-medium leading-relaxed">
                {flashcards[currentIndex].answer}
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
