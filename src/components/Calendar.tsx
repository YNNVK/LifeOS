import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Wallet,
  Utensils,
  CheckSquare,
  Heart,
  Brain,
  Search,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'finance' | 'nutrition' | 'productivity' | 'health' | 'learning';
  amount?: number;
  calories?: number;
  status?: string;
  category?: string;
}

const eventTypeConfig = {
  finance: { icon: Wallet, color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  nutrition: { icon: Utensils, color: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/20' },
  productivity: { icon: CheckSquare, color: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/20' },
  health: { icon: Heart, color: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20' },
  learning: { icon: Brain, color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20' },
};

export const Calendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for now, in a real app we would fetch from multiple collections
  useEffect(() => {
    if (!user) return;

    // Simulate fetching from multiple collections
    const mockEvents: CalendarEvent[] = [
      { id: '1', title: 'Loyer', date: new Date(2026, 2, 1), type: 'finance', amount: -1200 },
      { id: '2', title: 'Courses', date: new Date(2026, 2, 5), type: 'finance', amount: -85 },
      { id: '3', title: 'Poulet Quinoa', date: new Date(2026, 2, 5), type: 'nutrition', calories: 520 },
      { id: '4', title: 'Séance Jambes', date: new Date(2026, 2, 6), type: 'health' },
      { id: '5', title: 'Apprendre React', date: new Date(2026, 2, 7), type: 'learning' },
      { id: '6', title: 'Projet LifeOS', date: new Date(2026, 2, 10), type: 'productivity', status: 'pending' },
    ];

    setEvents(mockEvents);

    // Real implementation would look like this for each module:
    /*
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().description,
        date: doc.data().date.toDate(),
        type: 'finance',
        amount: doc.data().amount
      }));
      setEvents(prev => [...prev, ...transEvents]);
    });
    return () => unsubscribe();
    */
  }, [user]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Calendrier</h2>
          <p className="text-white/50">Vue d'ensemble de votre vie.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all">
            <Plus size={20} />
            Ajouter
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="xl:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-bold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium">
                Aujourd'hui
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-white/10">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="py-4 text-center text-xs font-bold text-white/30 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDay = isToday(day);

              return (
                <div 
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.02]",
                    !isCurrentMonth && "opacity-20",
                    isSelected && "bg-purple-500/5"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isTodayDay && "bg-purple-500 text-white",
                      !isTodayDay && isSelected && "border border-purple-500/50"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const config = eventTypeConfig[event.type];
                      return (
                        <div 
                          key={event.id}
                          className={cn(
                            "text-[10px] p-1 rounded border flex items-center gap-1 truncate",
                            config.color,
                            "bg-opacity-10",
                            config.border,
                            config.text
                          )}
                        >
                          <config.icon size={10} />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-white/30 pl-1">
                        + {dayEvents.length - 3} de plus
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </h3>
            <div className="space-y-4">
              {getEventsForDay(selectedDate).length > 0 ? (
                getEventsForDay(selectedDate).map(event => {
                  const config = eventTypeConfig[event.type];
                  return (
                    <div key={event.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                      <div className={cn("p-3 rounded-xl", config.color)}>
                        <config.icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold truncate">{event.title}</p>
                        <p className="text-xs text-white/50 capitalize">{event.type}</p>
                      </div>
                      {event.amount !== undefined && (
                        <span className={cn(
                          "font-bold",
                          event.amount < 0 ? "text-rose-400" : "text-emerald-400"
                        )}>
                          {event.amount > 0 ? '+' : ''}{event.amount}€
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                    <CalendarIcon size={24} />
                  </div>
                  <p className="text-sm text-white/30">Aucun événement ce jour</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Résumé IA
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Cette semaine s'annonce chargée. Vous avez {events.filter(e => e.type === 'finance' && e.amount && e.amount < 0).length} dépenses prévues et {events.filter(e => e.type === 'productivity').length} tâches importantes. N'oubliez pas votre séance de sport demain !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
