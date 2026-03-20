import React, { useState } from 'react';
import { 
  Utensils, 
  Camera, 
  Plus, 
  Loader2,
  ChevronRight,
  Flame,
  Dna,
  Wheat,
  Droplets,
  ShoppingCart,
  Calendar as CalendarIcon,
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  X,
  ChevronLeft,
  Search,
  ExternalLink,
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import { analyzeImage, cleanJsonResponse, generateText } from '../lib/gemini';
import { cn } from '../lib/utils';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Ingredient {
  name: string;
  quantity: string;
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day: number; // 0-6 (Mon-Sun)
  ingredients: Ingredient[];
  kcal: number;
  image?: string;
  url?: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  kcal: number;
  image?: string;
  url?: string;
  category?: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

const MacroProgress = ({ label, value, target, color, icon: Icon }: any) => {
  const percentage = Math.min((value / target) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", color.replace('bg-', 'bg-opacity-20 text-'))}>
            <Icon size={16} className={color.replace('bg-', 'text-')} />
          </div>
          <span className="text-sm font-medium text-white/70">{label}</span>
        </div>
        <span className="text-sm font-bold">{value} / {target}g</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Nutrition = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'planner' | 'shopping' | 'recipes'>('tracker');
  
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Omelette Épinards', type: 'breakfast', day: 0, kcal: 350, ingredients: [{ name: 'Œufs', quantity: '3' }, { name: 'Épinards', quantity: '100g' }] },
    { id: '2', name: 'Poulet Quinoa', type: 'lunch', day: 0, kcal: 550, ingredients: [{ name: 'Poulet', quantity: '150g' }, { name: 'Quinoa', quantity: '80g' }] },
    { id: '3', name: 'Salade Saumon', type: 'dinner', day: 1, kcal: 450, ingredients: [{ name: 'Saumon', quantity: '120g' }, { name: 'Salade', quantity: '1' }] },
  ]);

  const [recipes, setRecipes] = useState<Recipe[]>([
    { 
      id: 'r1', 
      name: 'Pasta Pesto Maison', 
      kcal: 600, 
      image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80',
      url: 'https://www.marmiton.org/recettes/recette_pates-au-pesto_15732.aspx',
      ingredients: [
        { name: 'Pâtes', quantity: '100g' },
        { name: 'Basilic', quantity: '1 bouquet' },
        { name: 'Pignons de pin', quantity: '30g' },
        { name: 'Parmesan', quantity: '50g' }
      ]
    },
    { 
      id: 'r2', 
      name: 'Bowl de Bouddha', 
      kcal: 450, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      url: 'https://www.cuisineaz.com/recettes/buddha-bowl-101415.aspx',
      ingredients: [
        { name: 'Pois chiches', quantity: '200g' },
        { name: 'Avocat', quantity: '1/2' },
        { name: 'Patate douce', quantity: '100g' },
        { name: 'Chou kale', quantity: '50g' }
      ]
    }
  ]);

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: '1', name: 'Poulet', checked: false },
    { id: '2', name: 'Quinoa', checked: true },
    { id: '3', name: 'Œufs', checked: false },
    { id: '4', name: 'Épinards', checked: false },
  ]);

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: '',
    type: 'lunch',
    day: 0,
    ingredients: [],
    kcal: 0,
    image: '',
    url: ''
  });

  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    ingredients: [],
    kcal: 0,
    image: '',
    url: '',
    category: ''
  });

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const mealTypes = [
    { id: 'breakfast', label: 'Petit-déj' },
    { id: 'lunch', label: 'Déjeuner' },
    { id: 'dinner', label: 'Dîner' },
    { id: 'snack', label: 'En-cas' }
  ];

  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    try {
      const currentShoppingList = shoppingList.map(i => i.name).join(', ');
      const prompt = `Génère un plan de repas équilibré pour une semaine (7 jours, du Lundi au Dimanche). 
      ${generationPrompt ? `Prends en compte ces préférences : ${generationPrompt}.` : ''}
      ${currentShoppingList ? `Si possible, utilise ces ingrédients déjà présents dans ma liste de courses : ${currentShoppingList}.` : ''}
      Pour chaque jour, propose un petit-déjeuner, un déjeuner et un dîner.
      Retourne UNIQUEMENT un JSON valide au format suivant :
      [
        { "day": 0, "type": "breakfast", "name": "...", "kcal": 400, "ingredients": [{ "name": "...", "quantity": "..." }] },
        ...
      ]
      Utilise les jours de 0 (Lundi) à 6 (Dimanche).`;
      
      const result = await generateText(prompt);
      const cleaned = cleanJsonResponse(result || '[]');
      const parsed = JSON.parse(cleaned);
      
      const newMeals = parsed.map((m: any) => ({
        ...m,
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      setMeals(newMeals);
      syncShoppingList(newMeals);

    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const syncShoppingList = (targetMeals = meals) => {
    const allIngredients = targetMeals.flatMap((m: any) => m.ingredients.map((i: any) => i.name));
    const uniqueIngredients = Array.from(new Set(allIngredients));
    
    // Keep existing items that are already checked
    const existingChecked = shoppingList.filter(i => i.checked).map(i => i.name);
    
    const newList = uniqueIngredients.map((name: any, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      checked: existingChecked.includes(name)
    }));
    
    setShoppingList(newList);
  };

  const addIngredient = () => {
    setNewMeal({
      ...newMeal,
      ingredients: [...(newMeal.ingredients || []), { name: '', quantity: '' }]
    });
  };

  const addRecipeIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), { name: '', quantity: '' }]
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...(newMeal.ingredients || [])];
    updated[index] = { ...updated[index], [field]: value };
    setNewMeal({ ...newMeal, ingredients: updated });
  };

  const updateRecipeIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...(newRecipe.ingredients || [])];
    updated[index] = { ...updated[index], [field]: value };
    setNewRecipe({ ...newRecipe, ingredients: updated });
  };

  const saveMeal = () => {
    if (!newMeal.name) return;
    
    if (editingMealId) {
      setMeals(meals.map(m => m.id === editingMealId ? { ...m, ...newMeal as Meal, id: editingMealId } : m));
    } else {
      const meal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        name: newMeal.name,
        type: newMeal.type as any,
        day: newMeal.day || 0,
        ingredients: newMeal.ingredients || [],
        kcal: newMeal.kcal || 0,
        image: newMeal.image,
        url: newMeal.url
      };
      setMeals([...meals, meal]);
    }
    
    setIsAddingMeal(false);
    setEditingMealId(null);
    setNewMeal({ name: '', type: 'lunch', day: 0, ingredients: [], kcal: 0, image: '', url: '' });
  };

  const editMeal = (meal: Meal) => {
    setNewMeal(meal);
    setEditingMealId(meal.id);
    setIsAddingMeal(true);
  };

  const saveRecipe = () => {
    if (!newRecipe.name) return;
    
    if (editingRecipeId) {
      setRecipes(recipes.map(r => r.id === editingRecipeId ? { ...r, ...newRecipe as Recipe, id: editingRecipeId } : r));
    } else {
      const recipe: Recipe = {
        id: Math.random().toString(36).substr(2, 9),
        name: newRecipe.name,
        ingredients: newRecipe.ingredients || [],
        kcal: newRecipe.kcal || 0,
        image: newRecipe.image,
        url: newRecipe.url,
        category: newRecipe.category
      };
      setRecipes([...recipes, recipe]);
    }
    
    setIsAddingRecipe(false);
    setEditingRecipeId(null);
    setNewRecipe({ name: '', ingredients: [], kcal: 0, image: '', url: '', category: '' });
  };

  const editRecipe = (recipe: Recipe) => {
    setNewRecipe(recipe);
    setEditingRecipeId(recipe.id);
    setIsAddingRecipe(true);
  };

  const deleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addShoppingItem = (name: string) => {
    if (!name.trim()) return;
    setShoppingList([
      ...shoppingList,
      { id: Math.random().toString(36).substr(2, 9), name: name.trim(), checked: false }
    ]);
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const clearCheckedItems = () => {
    setShoppingList(shoppingList.filter(item => !item.checked));
  };

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Analyse cette photo de repas et retourne les informations nutritionnelles.";
        const result = await analyzeImage(base64Data, file.type, prompt);
        try {
          const cleaned = cleanJsonResponse(result || '{}');
          const parsed = JSON.parse(cleaned);
          setMealResult(parsed);
        } catch (e) {
          console.error('Failed to parse nutrition result', e, result);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Nutrition analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentDayIdx = (new Date().getDay() + 6) % 7;
  const todayMeals = meals.filter(m => m.day === currentDayIdx);
  const todayKcal = todayMeals.reduce((acc, m) => acc + m.kcal, 0);
  
  // Estimate macros if not present (simple estimation for demo)
  const todayMacros = todayMeals.reduce((acc, m) => ({
    p: acc.p + (m.kcal * 0.3 / 4), // 30% protein
    c: acc.c + (m.kcal * 0.4 / 4), // 40% carbs
    f: acc.f + (m.kcal * 0.3 / 9), // 30% fats
  }), { p: 0, c: 0, f: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Nutrition</h2>
          <p className="text-white/50">Analysez vos repas et planifiez votre semaine.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('tracker')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'tracker' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Tracker
            </button>
            <button 
              onClick={() => setActiveTab('planner')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'planner' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Planning
            </button>
            <button 
              onClick={() => setActiveTab('shopping')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'shopping' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Courses
            </button>
            <button 
              onClick={() => setActiveTab('recipes')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'recipes' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Repas
            </button>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            onChange={handleMealUpload}
            className="hidden" 
            id="meal-upload" 
          />
          <label 
            htmlFor="meal-upload"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all cursor-pointer"
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            <span className="text-sm">Analyser</span>
          </label>
        </div>
      </header>

      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Objectifs du jour ({days[currentDayIdx]})</h3>
                <div className="flex items-center gap-2 text-orange-400">
                  <Flame size={20} />
                  <span className="font-bold">{Math.round(todayKcal)} / 2,400 kcal</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MacroProgress label="Protéines" value={Math.round(todayMacros.p)} target={160} color="bg-blue-500" icon={Dna} />
                <MacroProgress label="Glucides" value={Math.round(todayMacros.c)} target={250} color="bg-amber-500" icon={Wheat} />
                <MacroProgress label="Lipides" value={Math.round(todayMacros.f)} target={80} color="bg-rose-500" icon={Droplets} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">Repas du jour</h3>
              <div className="space-y-4">
                {todayMeals.length > 0 ? todayMeals.map((meal, i) => (
                  <div key={meal.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                        <Utensils size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{meal.name}</p>
                        <p className="text-xs text-white/40">{mealTypes.find(t => t.id === meal.type)?.label} • {meal.kcal} kcal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-white/30">Aucun repas planifié pour aujourd'hui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {mealResult && (
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-bold mb-4">Dernière Analyse</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/50 uppercase font-bold mb-1">Plat détecté</p>
                    <p className="text-lg font-bold text-emerald-400">{mealResult.meal_name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Prot</p>
                      <p className="font-bold">{mealResult.macros.p}g</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Gluc</p>
                      <p className="font-bold">{mealResult.macros.c}g</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Lip</p>
                      <p className="font-bold">{mealResult.macros.f}g</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white/50 uppercase">Suggestions IA</p>
                    <ul className="space-y-2">
                      {mealResult.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-white/80 flex gap-2">
                          <span className="text-emerald-400">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">Conseil Nutrition</h3>
              <p className="text-white/60 text-sm leading-relaxed italic">
                "Privilégiez les glucides complexes le matin pour une énergie stable tout au long de la journée. Votre consommation de protéines est excellente aujourd'hui."
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  Préférences pour la génération (IA)
                </label>
                <input 
                  type="text" 
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="Ex: Végétarien, riche en protéines, pas de poisson..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={generateWeeklyPlan}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Générer la semaine
                </button>
                <button 
                  onClick={() => setMeals([])}
                  className="p-3 bg-white/5 border border-white/10 text-white/40 rounded-xl hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Vider le planning"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon size={20} className="text-emerald-400" />
              Planning de la semaine
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={() => syncShoppingList()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600/30 transition-all"
              >
                <ShoppingCart size={16} />
                Sync Liste Courses
              </button>
              <button 
                onClick={() => setIsAddingMeal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all"
              >
                <Plus size={16} />
                Ajouter un repas
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-6 gap-4 snap-x scroll-smooth custom-scrollbar">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="min-w-[280px] flex-1 flex flex-col gap-4 snap-start">
                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">{day}</p>
                </div>
                <div className="space-y-3 flex-1">
                  {meals.filter(m => m.day === dayIdx).map(meal => (
                    <div 
                      key={meal.id} 
                      onClick={() => editMeal(meal)}
                      className="bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/30 transition-all group relative cursor-pointer hover:bg-white/10 overflow-hidden"
                    >
                      {meal.image && (
                        <div className="h-24 w-full overflow-hidden">
                          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white/10 rounded-full text-white/50">
                            {mealTypes.find(t => t.id === meal.type)?.label}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteMeal(meal.id); }}
                              className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                const recipe: Recipe = {
                                  id: Math.random().toString(36).substr(2, 9),
                                  name: meal.name,
                                  ingredients: meal.ingredients,
                                  kcal: meal.kcal,
                                  image: meal.image,
                                  url: meal.url
                                };
                                setRecipes([...recipes, recipe]);
                              }}
                              className="text-white/20 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Sauvegarder comme repas"
                            >
                              <BookOpen size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-sm mb-1">{meal.name}</p>
                        <p className="text-[10px] text-white/40 mb-2">{meal.kcal} kcal</p>
                        <div className="space-y-1">
                          {meal.ingredients.slice(0, 2).map((ing, i) => (
                            <p key={i} className="text-[10px] text-white/30 flex justify-between">
                              <span>{ing.name}</span>
                              <span>{ing.quantity}</span>
                            </p>
                          ))}
                          {meal.ingredients.length > 2 && (
                            <p className="text-[10px] text-emerald-400/50">+{meal.ingredients.length - 2} autres</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {meals.filter(m => m.day === dayIdx).length === 0 && (
                    <div className="h-24 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center bg-white/2">
                      <p className="text-[10px] text-white/20 font-bold uppercase">Vide</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shopping' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-400" />
              Liste de Courses
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => syncShoppingList()}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
              >
                <Sparkles size={16} className="text-emerald-400" />
                Synchroniser
              </button>
              <button 
                onClick={clearCheckedItems}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={16} />
                Nettoyer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Ajouter un article..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addShoppingItem((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Ajouter un article..."]') as HTMLInputElement;
                      addShoppingItem(input.value);
                      input.value = '';
                    }}
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:scale-105 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {shoppingList.map(item => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                        item.checked 
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-50" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => toggleShoppingItem(item.id)}
                      >
                        {item.checked ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <CheckSquare size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                            <Square size={16} className="text-transparent" />
                          </div>
                        )}
                        <span className={cn(
                          "font-medium transition-all",
                          item.checked ? "line-through text-white/40" : "text-white"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteShoppingItem(item.id)}
                        className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {shoppingList.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart size={24} className="text-white/20" />
                      </div>
                      <p className="text-white/40 font-medium">Votre liste est vide</p>
                      <p className="text-xs text-white/20 mt-1">Ajoutez des articles ou synchronisez avec votre planning</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  Astuce IA
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Votre liste contient {shoppingList.length} articles. 
                  {shoppingList.filter(i => i.checked).length} sont déjà cochés. 
                  N'oubliez pas de synchroniser après avoir modifié votre planning de repas !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-400" />
              Bibliothèque de Repas
            </h3>
            <div className="flex flex-1 max-w-md gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text"
                  placeholder="Rechercher un repas..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button 
                onClick={() => setIsAddingRecipe(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all whitespace-nowrap"
              >
                <Plus size={16} />
                Nouveau Repas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase())).map(recipe => (
              <div key={recipe.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="aspect-video relative overflow-hidden">
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {recipe.url && (
                      <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-emerald-500 transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button onClick={() => editRecipe(recipe)} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-blue-500 transition-colors">
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-lg">{recipe.name}</h4>
                      {recipe.category && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                          {recipe.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40">{recipe.kcal} kcal</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white/20 uppercase">Ingrédients</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ing, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-white/60 border border-white/10">
                          {ing.name} ({ing.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setNewMeal({ name: recipe.name, ingredients: recipe.ingredients, kcal: recipe.kcal });
                        setIsAddingMeal(true);
                      }}
                      className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Ajouter au planning
                    </button>
                    <button 
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {isAddingRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">{editingRecipeId ? 'Modifier la recette' : 'Nouvelle recette'}</h3>
              <button onClick={() => { setIsAddingRecipe(false); setEditingRecipeId(null); setNewRecipe({ name: '', ingredients: [], kcal: 0, image: '', url: '' }); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase">Nom de la recette</label>
                <input 
                  type="text" 
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                  placeholder="Ex: Pasta Pesto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Calories</label>
                  <input 
                    type="number" 
                    value={newRecipe.kcal}
                    onChange={(e) => setNewRecipe({ ...newRecipe, kcal: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Catégorie</label>
                  <input 
                    type="text" 
                    value={newRecipe.category}
                    onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="Ex: Petit-déjeuner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Image URL</label>
                  <input 
                    type="text" 
                    value={newRecipe.image}
                    onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Lien Recette (URL)</label>
                  <input 
                    type="text" 
                    value={newRecipe.url}
                    onChange={(e) => setNewRecipe({ ...newRecipe, url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/50 uppercase">Ingrédients</label>
                  <button 
                    onClick={addRecipeIngredient}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
                <div className="space-y-3">
                  {newRecipe.ingredients?.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Aliment"
                        value={ing.name}
                        onChange={(e) => updateRecipeIngredient(i, 'name', e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <input 
                        type="text"
                        placeholder="Qté"
                        value={ing.quantity}
                        onChange={(e) => updateRecipeIngredient(i, 'quantity', e.target.value)}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl p-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <button 
                        onClick={() => {
                          const updated = [...(newRecipe.ingredients || [])];
                          updated.splice(i, 1);
                          setNewRecipe({ ...newRecipe, ingredients: updated });
                        }}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={saveRecipe}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
              >
                {editingRecipeId ? 'Mettre à jour' : 'Créer la recette'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Meal Modal */}
      {isAddingMeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">{editingMealId ? 'Modifier le repas' : 'Nouveau repas'}</h3>
              <button onClick={() => { setIsAddingMeal(false); setEditingMealId(null); setNewMeal({ name: '', type: 'lunch', day: 0, ingredients: [], kcal: 0, image: '', url: '' }); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase">Nom du repas</label>
                <input 
                  type="text" 
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                  placeholder="Ex: Poulet au curry"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Type</label>
                  <select 
                    value={newMeal.type}
                    onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    {mealTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Jour</label>
                  <select 
                    value={newMeal.day}
                    onChange={(e) => setNewMeal({ ...newMeal, day: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/50 uppercase">Ingrédients</label>
                  <button 
                    onClick={addIngredient}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
                <div className="space-y-3">
                  {newMeal.ingredients?.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Aliment"
                        value={ing.name}
                        onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <input 
                        type="text"
                        placeholder="Qté"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl p-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <button 
                        onClick={() => {
                          const updated = [...(newMeal.ingredients || [])];
                          updated.splice(i, 1);
                          setNewMeal({ ...newMeal, ingredients: updated });
                        }}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Calories (est.)</label>
                  <input 
                    type="number" 
                    value={newMeal.kcal}
                    onChange={(e) => setNewMeal({ ...newMeal, kcal: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase">Image URL</label>
                  <input 
                    type="text" 
                    value={newMeal.image}
                    onChange={(e) => setNewMeal({ ...newMeal, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase">Lien Recette (URL)</label>
                <input 
                  type="text" 
                  value={newMeal.url}
                  onChange={(e) => setNewMeal({ ...newMeal, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50" 
                  placeholder="https://..."
                />
              </div>

              <button 
                onClick={saveMeal}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
              >
                {editingMealId ? 'Mettre à jour' : 'Enregistrer le repas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
