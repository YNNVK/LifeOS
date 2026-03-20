import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Plus, 
  Loader2, 
  File, 
  Tag, 
  Brain,
  ChevronRight
} from 'lucide-react';
import { analyzeImage } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Document {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  content: string;
}

export const Documents = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', title: 'Contrat de bail', category: 'Légal', tags: ['Logement', 'Contrat'], date: '2026-03-10', content: '...' },
    { id: '2', title: 'Analyse de sang', category: 'Santé', tags: ['Médical', 'Bilan'], date: '2026-03-15', content: '...' },
    { id: '3', title: 'Cours Next.js', category: 'Apprentissage', tags: ['Tech', 'React'], date: '2026-03-18', content: '...' },
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Tu es un assistant OCR expert. Analyse ce document et retourne UNIQUEMENT un JSON valide : { \"title\": \"titre du document\", \"category\": \"legal|medical|course|finance|other\", \"content\": \"texte extrait complet\", \"tags\": [\"tag1\", \"tag2\"] }";
        const result = await analyzeImage(base64Data, file.type, prompt);
        try {
          const parsed = JSON.parse(result || '{}');
          const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            title: parsed.title,
            category: parsed.category,
            tags: parsed.tags,
            date: new Date().toISOString().split('T')[0],
            content: parsed.content
          };
          setDocuments([newDoc, ...documents]);
        } catch (e) {
          console.error('Failed to parse document result', e);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Document analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Documents</h2>
          <p className="text-white/50">Stockez et analysez vos documents importants.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            onChange={handleFileUpload}
            className="hidden" 
            id="doc-upload" 
          />
          <label 
            htmlFor="doc-upload"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            Importer un document
          </label>
        </div>
      </header>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Recherche sémantique dans vos documents..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold">
            Filtres
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                  <FileText size={24} />
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/50 uppercase font-bold tracking-wider">
                  {doc.category}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">{doc.title}</h3>
              <p className="text-xs text-white/40 mb-4">{doc.date}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {doc.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/60">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                  <Brain size={14} />
                  Générer Flashcards
                </button>
                <ChevronRight size={18} className="text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
