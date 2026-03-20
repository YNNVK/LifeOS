import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Camera,
  Loader2,
  X
} from 'lucide-react';
import { analyzeImage } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'income';
}

export const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', merchant: 'Starbucks', amount: 4.50, date: '2026-03-19', category: 'Alimentation', type: 'expense' },
    { id: '2', merchant: 'Salaire', amount: 3200.00, date: '2026-03-01', category: 'Revenus', type: 'income' },
    { id: '3', merchant: 'Loyer', amount: 850.00, date: '2026-03-05', category: 'Logement', type: 'expense' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Analyse ce reçu et retourne UNIQUEMENT un JSON valide : { \"merchant\": \"nom du marchand\", \"amount\": 45.80, \"date\": \"2026-03-15\", \"currency\": \"EUR\", \"category\": \"Alimentation\" }";
        const result = await analyzeImage(base64Data, file.type, prompt);
        try {
          const parsed = JSON.parse(result || '{}');
          setOcrResult(parsed);
        } catch (e) {
          console.error('Failed to parse OCR result', e);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Finances</h2>
          <p className="text-white/50">Gérez vos comptes et analysez vos dépenses.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus size={20} />
          Nouvelle Transaction
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <p className="text-white/50 text-sm mb-1">Solde Total</p>
          <p className="text-3xl font-bold">12,450.80 €</p>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-2xl">
          <p className="text-emerald-400/70 text-sm mb-1">Revenus (Mois)</p>
          <p className="text-3xl font-bold text-emerald-400">+3,200.00 €</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6 rounded-2xl">
          <p className="text-red-400/70 text-sm mb-1">Dépenses (Mois)</p>
          <p className="text-3xl font-bold text-red-400">-1,154.50 €</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold">Transactions Récentes</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Marchand</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'income' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </div>
                      <span className="font-medium">{t.merchant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-white/50 text-sm">{t.date}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold",
                    t.type === 'income' ? "text-emerald-400" : "text-white"
                  )}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Nouvelle Transaction</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="receipt-upload" 
                />
                <label 
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-all group"
                >
                  {isAnalyzing ? (
                    <Loader2 size={32} className="text-purple-400 animate-spin" />
                  ) : (
                    <Camera size={32} className="text-white/30 group-hover:text-purple-400 transition-colors" />
                  )}
                  <div className="text-center">
                    <p className="font-bold">Scanner un reçu</p>
                    <p className="text-xs text-white/40">L'IA remplira les champs automatiquement</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Montant</label>
                  <input 
                    type="number" 
                    defaultValue={ocrResult?.amount}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50" 
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Marchand</label>
                  <input 
                    type="text" 
                    defaultValue={ocrResult?.merchant}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50" 
                    placeholder="Nom..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase">Catégorie</label>
                <select 
                  defaultValue={ocrResult?.category}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50 appearance-none"
                >
                  <option value="Alimentation">Alimentation</option>
                  <option value="Transport">Transport</option>
                  <option value="Logement">Logement</option>
                  <option value="Santé">Santé</option>
                  <option value="Loisirs">Loisirs</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Revenus">Revenus</option>
                </select>
              </div>

              <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl shadow-white/10">
                Ajouter la transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
