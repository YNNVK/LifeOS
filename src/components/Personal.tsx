import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Layout, 
  Search, 
  ChevronRight, 
  Hash, 
  Link as LinkIcon, 
  FileText, 
  Trash2,
  PlusCircle,
  GripVertical,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, Reorder } from 'framer-motion';

interface KanbanCard {
  id: string;
  content: string;
  type: 'note' | 'link';
  url?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface PersonalPage {
  id: string;
  title: string;
  icon: string;
  columns: KanbanColumn[];
}

export const Personal = () => {
  const [pages, setPages] = useState<PersonalPage[]>([
    {
      id: '1',
      title: 'Voyage Japon',
      icon: '🇯🇵',
      columns: [
        {
          id: 'c1',
          title: 'À voir',
          cards: [
            { id: 'card1', content: 'Temple Kinkaku-ji', type: 'note' },
            { id: 'card2', content: 'Guide Kyoto', type: 'link', url: 'https://example.com/kyoto' }
          ]
        },
        {
          id: 'c2',
          title: 'Hébergement',
          cards: [
            { id: 'card3', content: 'Ryokan Gion', type: 'note' }
          ]
        },
        {
          id: 'c3',
          title: 'Budget',
          cards: []
        }
      ]
    },
    {
      id: '2',
      title: 'Liste Achat',
      icon: '🛒',
      columns: [
        {
          id: 'c4',
          title: 'Tech',
          cards: [
            { id: 'card4', content: 'Clavier mécanique', type: 'note' }
          ]
        },
        {
          id: 'c5',
          title: 'Maison',
          cards: []
        }
      ]
    }
  ]);

  const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || '');
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const activePage = pages.find(p => p.id === activePageId);

  const addPage = () => {
    if (!newPageTitle.trim()) return;
    const newPage: PersonalPage = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPageTitle,
      icon: '📄',
      columns: [
        { id: 'col1', title: 'À faire', cards: [] },
        { id: 'col2', title: 'En cours', cards: [] },
        { id: 'col3', title: 'Terminé', cards: [] }
      ]
    };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
    setNewPageTitle('');
    setIsAddingPage(false);
  };

  const addCard = (columnId: string) => {
    const content = prompt('Contenu de la carte :');
    if (!content) return;

    const isLink = content.startsWith('http');
    const newCard: KanbanCard = {
      id: Math.random().toString(36).substr(2, 9),
      content: isLink ? content : content,
      type: isLink ? 'link' : 'note',
      url: isLink ? content : undefined
    };

    setPages(pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          columns: p.columns.map(col => {
            if (col.id === columnId) {
              return { ...col, cards: [...col.cards, newCard] };
            }
            return col;
          })
        };
      }
      return p;
    }));
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          columns: p.columns.map(col => {
            if (col.id === columnId) {
              return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
            }
            return col;
          })
        };
      }
      return p;
    }));
  };

  const deletePage = (id: string) => {
    const updatedPages = pages.filter(p => p.id !== id);
    setPages(updatedPages);
    if (activePageId === id) {
      setActivePageId(updatedPages[0]?.id || '');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-8 animate-in fade-in duration-500">
      {/* Sidebar Pages */}
      <div className="w-64 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layout size={20} className="text-purple-400" />
            Espace Perso
          </h3>
          <button 
            onClick={() => setIsAddingPage(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-purple-400"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {pages.map(page => (
            <div 
              key={page.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                activePageId === page.id ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => setActivePageId(page.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-lg">{page.icon}</span>
                <span className="font-medium truncate">{page.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content (Kanban) */}
      <div className="flex-1 flex flex-col gap-8 overflow-hidden">
        {activePage ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{activePage.icon}</span>
                <h2 className="text-3xl font-bold">{activePage.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text" 
                    placeholder="Rechercher..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 w-64"
                  />
                </div>
                <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
              {activePage.columns.map(column => (
                <div key={column.id} className="w-80 flex-shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-white/40">{column.title}</h4>
                      <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-bold text-white/30">
                        {column.cards.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => addCard(column.id)}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/30 hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {column.cards.map(card => (
                      <motion.div 
                        layout
                        key={card.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-purple-500/30 transition-all group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {card.type === 'link' ? (
                                <LinkIcon size={14} className="text-blue-400" />
                              ) : (
                                <FileText size={14} className="text-purple-400" />
                              )}
                              <p className="text-sm font-medium leading-relaxed">
                                {card.content}
                              </p>
                            </div>
                            {card.url && (
                              <a 
                                href={card.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                              >
                                {card.url}
                              </a>
                            )}
                          </div>
                          <button 
                            onClick={() => deleteCard(column.id, card.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    <button 
                      onClick={() => addCard(column.id)}
                      className="w-full py-3 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/20 hover:border-purple-500/20 hover:text-purple-400 transition-all text-sm font-medium"
                    >
                      <PlusCircle size={16} />
                      Ajouter une carte
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-80 flex-shrink-0 h-12 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/20 hover:border-white/10 hover:text-white transition-all text-sm font-medium">
                <Plus size={18} />
                Ajouter une colonne
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-6">
              <Layout size={40} className="text-white/20" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Bienvenue dans votre Espace Perso</h3>
            <p className="text-white/40 max-w-md">
              Créez des pages pour organiser vos projets, vos voyages ou vos listes de courses avec une vue Kanban intuitive.
            </p>
            <button 
              onClick={() => setIsAddingPage(true)}
              className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
            >
              Créer ma première page
            </button>
          </div>
        )}
      </div>

      {/* Add Page Modal */}
      {isAddingPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Nouvelle Page</h3>
              <button onClick={() => setIsAddingPage(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase">Titre de la page</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPage()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-purple-500/50" 
                  placeholder="Ex: Voyage Japon, Liste Achat..."
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAddingPage(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={addPage}
                  className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                >
                  Créer la page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
