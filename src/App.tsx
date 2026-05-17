"use client";
import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { getLists, createList as dbCreateList, deleteList as dbDeleteList, addItem as dbAddItem, toggleItemChecked as dbToggleItemChecked, updateItemQuantity as dbUpdateItemQuantity, updateItemName as dbUpdateItemName, deleteItem as dbDeleteItem, getRecipes, saveRecipe as dbSaveRecipe, deleteRecipe as dbDeleteRecipe, getActivities, logActivity, generateRecipeWithAI } from '@/app/actions';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  List, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  Mic, 
  Camera, 
  Plus, 
  ChevronRight, 
  Search,
  ShoppingCart,
  Check,
  MoreVertical,
  LogOut,
  Mail,
  Shield,
  Smartphone,
  Globe,
  Moon,
  ExternalLink,
  ChevronLeft,
  Flame,
  Dna,
  Trash2,
  Pencil,
  Minus,
  ChefHat,
  BookOpen,
  Zap,
  ChevronDown
} from 'lucide-react';
import { AppScreen, ShoppingList, FamilyMember, Activity, ShoppingItem, SavedRecipe } from './types.ts';
import { MOCK_LISTS, MOCK_FAMILY, MOCK_ACTIVITY, MOCK_ITEMS } from './constants.ts';

const THEMES = [
  { id: 'light', name: 'Light (Default)' },
  { id: 'dark-midnight', name: 'Midnight' },
  { id: 'dark-dracula', name: 'Dracula' },
  { id: 'dark-cyberpunk', name: 'Cyberpunk' },
  { id: 'dark-synthwave', name: 'Synthwave' },
  { id: 'dark-forest', name: 'Forest' },
  { id: 'dark-ocean', name: 'Ocean' },
  { id: 'dark-crimson', name: 'Crimson' },
  { id: 'dark-gold', name: 'Gold' },
  { id: 'dark-matrix', name: 'Matrix' },
  { id: 'dark-solarized', name: 'Solarized' },
];

// --- App Context ---
type AppContextType = {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  lists: ShoppingList[];
  setLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
  activeListId: string | null;
  setActiveListId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentScreen: React.Dispatch<React.SetStateAction<AppScreen>>;
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  recipes: SavedRecipe[];
  setRecipes: React.Dispatch<React.SetStateAction<SavedRecipe[]>>;
  activeRecipeId: string | null;
  setActiveRecipeId: React.Dispatch<React.SetStateAction<string | null>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
};
const AppContext = createContext<AppContextType | null>(null);
const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

// --- Sub-components ---

const NavBar = ({ activeScreen, onScreenChange, isSupermarketMode }: { activeScreen: AppScreen, onScreenChange: (s: AppScreen) => void, isSupermarketMode: boolean }) => {
  const tabs: { id: AppScreen, label: string, icon: any, activeColor: string, activeBg: string }[] = [
    { id: 'home', label: 'Início', icon: Home, activeColor: 'text-[#3b82f6]', activeBg: 'bg-[#3b82f6]/10' },
    { id: 'lists', label: 'Listas', icon: List, activeColor: 'text-[#10b981]', activeBg: 'bg-[#10b981]/10' },
    { id: 'recipes', label: 'Receitas', icon: ChefHat, activeColor: 'text-[#f59e0b]', activeBg: 'bg-[#f59e0b]/10' },
    { id: 'family', label: 'Família', icon: Users, activeColor: 'text-[#8b5cf6]', activeBg: 'bg-[#8b5cf6]/10' },
    { id: 'settings', label: 'Definições', icon: SettingsIcon, activeColor: 'text-[#ec4899]', activeBg: 'bg-[#ec4899]/10' },
  ];

  if (activeScreen === 'onboarding' || isSupermarketMode) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-6 pt-3 px-6 flex justify-between items-center z-50 bg-black border-t border-white/10 backdrop-blur-md">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeScreen === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => onScreenChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${tab.activeColor} ${isActive ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-80'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${isActive ? tab.activeBg : 'bg-transparent'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase tracking-wider transition-all ${isActive ? 'font-bold' : 'font-semibold'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

// --- Screens ---

const Onboarding = ({ onStart }: { onStart: () => void }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = () => {
    setIsAuthenticating(true);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 overflow-hidden relative"
    >
      <div className="absolute top-20 left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl opacity-50" />

      <div className="flex flex-col items-center text-center space-y-8 z-10 w-full max-w-sm">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-32 h-32 rounded-[32px] overflow-hidden shadow-2xl mb-4 flex items-center justify-center relative"
        >
          <img src="/icon.png?v=2" alt="Shopping List Logo" className="absolute inset-0 w-full h-full object-cover scale-[1.05]" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-on-surface">Shopping List</h1>
          <p className="text-lg text-outline">Organize as compras da sua família com estilo</p>
        </div>

        <div className="w-full space-y-3">
          <button className="w-full h-14 bg-[#2e3037] text-white rounded-full font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Smartphone size={20} /> Continuar com Apple
          </button>
          <button 
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="w-full h-14 bg-surface-container-low border border-outline-variant text-on-surface rounded-full font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAuthenticating ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continuar com Google
              </>
            )}
          </button>
        </div>

        <div className="flex items-center w-full gap-4">
          <div className="h-px bg-outline-variant/30 flex-grow" />
          <span className="text-sm text-outline font-medium">ou</span>
          <div className="h-px bg-outline-variant/30 flex-grow" />
        </div>

        <div className="w-full space-y-3">
          <input 
            type="email" 
            placeholder="Endereço de e-mail" 
            className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface"
          />
          <button 
            onClick={onStart}
            className="w-full h-14 bg-primary text-white rounded-full font-semibold active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Entrar com E-mail
          </button>
        </div>

        <p className="text-sm text-outline">
          Novo na família? <button className="text-primary font-bold hover:underline">Criar uma conta</button>
        </p>

        <div className="pt-8 flex gap-4 text-[10px] text-outline font-semibold uppercase tracking-widest">
           <button>Privacidade</button>
           <button>Termos</button>
           <button>Ajuda</button>
        </div>
      </div>
    </motion.div>
  );
};

const AiRecipeGenerator = () => {
  const { setItems, setLists, setRecipes } = useAppContext();
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);

  const generateRecipe = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await generateRecipeWithAI(prompt);
      if (response.error) {
        throw new Error(response.error);
      }
      setRecipe(response.data);
    } catch (e: any) {
      console.error('Gemini Error:', e);
      alert('Erro ao gerar receita: ' + (e.message || 'Erro desconhecido'));
    }
    setLoading(false);
  };

  const addIngredientsToList = () => {
    if (!recipe) return;
    const newListId = Math.random().toString(36).substr(2, 9);

    const newItems: ShoppingItem[] = recipe.ingredients.map((ing: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      listId: newListId,
      name: ing.name,
      quantity: ing.quantity,
      category: ing.category || 'Outros',
      checked: false
    }));
    
    setItems(prev => [...newItems, ...prev]);
    
    const newList: ShoppingList = {
      id: newListId,
      name: recipe.title,
      itemCount: newItems.length,
      lastEdited: 'agora mesmo',
      color: '#ff6b6b',
      icon: 'Flame'
    };
    
    setLists(prev => [newList, ...prev]);
    
    const savedRecipe: SavedRecipe = {
      id: Math.random().toString(36).substr(2, 9),
      title: recipe.title,
      description: recipe.description,
      emoji: recipe.emoji,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions || []
    };
    setRecipes(prev => [savedRecipe, ...prev]);
    
    // Save to DB in background
    Promise.all([
      dbCreateList(newList.name, newList.color, newList.icon).then(async dbList => {
        const promises = newItems.map(item => dbAddItem(dbList.id, item.name, item.category, item.quantity));
        await Promise.all(promises);
        setLists(prev => prev.map(l => l.id === newList.id ? { ...l, id: dbList.id } : l));
        setItems(prev => prev.map(i => i.listId === newList.id ? { ...i, listId: dbList.id } : i));
      }),
      dbSaveRecipe(savedRecipe.title, savedRecipe.description, savedRecipe.emoji, savedRecipe.ingredients, savedRecipe.instructions).then(dbRecipe => {
        setRecipes(prev => prev.map(r => r.id === savedRecipe.id ? { ...r, id: dbRecipe.id } : r));
      })
    ]).catch(() => console.error("Falha ao gravar receita na DB"));
    
    if (session?.user?.name) {
      logActivity('Criou Receita com IA', recipe.title, session.user.name).catch(console.error);
    }
    
    alert(`Ingredientes adicionados à nova lista "${recipe.title}" e receita guardada!`);
    setRecipe(null);
    setPrompt('');
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-4">Chef IA 🧑‍🍳</h3>
      {!recipe ? (
        <div className="bg-surface-container-low p-6 rounded-[32px] soft-shadow border border-outline-variant/10">
          <p className="text-on-surface font-medium mb-4">O que te apetece cozinhar hoje? Diz-me o que tens no frigorífico ou o tipo de prato.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ex: Jantar rápido com frango..."
              className="flex-grow bg-surface border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
              onKeyDown={e => e.key === 'Enter' && generateRecipe()}
            />
            <button 
              onClick={generateRecipe}
              disabled={loading}
              className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-2xl flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight />}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-[40px] overflow-hidden soft-shadow bg-surface-container-low border border-outline-variant/10">
          <div className="h-48 relative overflow-hidden bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
             <span className="text-8xl drop-shadow-2xl">{recipe.emoji}</span>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">Receita Gerada</span>
                <h4 className="text-2xl font-bold leading-tight drop-shadow-md">{recipe.title}</h4>
             </div>
          </div>
          <div className="p-6">
            <p className="text-outline text-sm mb-6">{recipe.description}</p>
            <h5 className="font-bold text-on-surface mb-3">Ingredientes:</h5>
            <ul className="space-y-2 mb-6">
              {recipe.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center text-sm bg-surface p-3 rounded-2xl border border-outline-variant/10">
                  <span className="text-on-surface font-medium">{ing.name}</span>
                  <span className="text-primary font-bold">{ing.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button 
                onClick={() => setRecipe(null)}
                className="h-14 px-6 bg-surface-container border border-outline-variant/20 text-on-surface rounded-full font-bold text-sm active:scale-95 transition-all"
              >
                Voltar
              </button>
              <button 
                onClick={addIngredientsToList}
                className="flex-grow h-14 bg-primary text-white rounded-full font-bold active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <ShoppingCart size={18} /> Adicionar à Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Dashboard = () => {
  const { lists, setActiveListId, setCurrentScreen, familyMembers } = useAppContext();
  const [quickAddText, setQuickAddText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("O teu browser não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuickAddText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAddText.trim()) {
      if (lists.length === 0) {
        alert("Cria primeiro uma Lista de Compras para adicionares produtos!");
        return;
      }
      const targetList = lists[0];
      setActiveListId(targetList.id);
      setCurrentScreen('list-detail');
      alert(`Em breve: Adição automática de "${quickAddText}" à lista "${targetList.name}"!`);
      setQuickAddText('');
    }
  };

  return (
    <div className="pb-32 px-6 pt-16">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white soft-shadow">
            <img src={familyMembers[0]?.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-outline">Bom dia,</p>
            <h2 className="text-xl font-bold text-on-surface">{familyMembers[0]?.name.split(' ')[0]}</h2>
          </div>
        </div>
      </header>

      <div className="relative mb-10">
        <div className="flex items-center bg-surface-container-low rounded-full h-16 px-6 soft-shadow border border-outline-variant/20">
          <Plus className="text-primary mr-4" size={24} />
          <input 
            type="text" 
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            onKeyDown={handleQuickAdd}
            placeholder="Adição rápida a qualquer lista..." 
            className="flex-grow bg-transparent outline-none text-on-surface placeholder:text-outline-variant font-medium"
          />
          <div className="flex gap-3 text-outline">
            <button onClick={startListening} className={`transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'hover:text-primary'}`}>
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold tracking-tight text-on-surface">Listas Ativas</h3>
          <button onClick={() => setCurrentScreen('lists')} className="text-sm font-bold text-primary active:opacity-70 transition-opacity">Ver Tudo</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {lists.length > 0 ? lists.map((list) => (
             <div 
              key={list.id} 
              onClick={() => { setActiveListId(list.id); setCurrentScreen('list-detail'); }}
              className="bg-surface-container-low p-6 rounded-[32px] soft-shadow border border-outline-variant/10 flex flex-col gap-4 group active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl`} style={{ backgroundColor: `${list.color}40`, color: list.color }}>
                   {list.icon === 'ShoppingCart' ? <ShoppingCart /> : list.icon === 'Flame' ? <Flame /> : <Dna />}
                </div>
                <span className="bg-surface-container-low px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                  {list.itemCount} itens
                </span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{list.name}</h4>
                <p className="text-sm text-outline">Última edição: {list.lastEdited}</p>
              </div>
            </div>
          )) : (
            <div className="bg-surface-container-low p-8 rounded-[32px] soft-shadow border border-outline-variant/10 text-center flex flex-col items-center gap-2">
              <ShoppingCart size={32} className="text-outline/50" />
              <p className="text-outline font-medium">Ainda não tens listas ativas.</p>
            </div>
          )}
        </div>
      </section>


      <AiRecipeGenerator />
    </div>
  );
};

const ListsOverview = () => {
  const { lists, setLists, setActiveListId, setCurrentScreen } = useAppContext();
  const { data: session } = useSession();
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const confirmCreateList = async () => {
    if (!newListName.trim()) {
      setIsCreatingList(false);
      return;
    }
    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    const newList: ShoppingList = {
      id: tempId,
      name: newListName.trim(),
      itemCount: 0,
      lastEdited: 'agora mesmo',
      color: '#ff6b6b',
      icon: 'List'
    };
    setLists(prev => [newList, ...prev]);
    setIsCreatingList(false);
    setNewListName('');
    
    try {
      if (session?.user?.name) {
        logActivity('Criou uma Lista', newList.name, session.user.name).catch(console.error);
      }
      const dbList = await dbCreateList(newList.name, newList.color, newList.icon);
      setLists(prev => prev.map(l => l.id === tempId ? { ...l, id: dbList.id } : l));
    } catch (e: any) {
      console.error("ERRO COMPLETO AO CRIAR LISTA:", e);
      setLists(prev => prev.filter(l => l.id !== tempId));
      alert('Erro ao criar lista. Vê a consola para mais detalhes.');
    }
  };

  const openList = (id: string) => {
    setActiveListId(id);
    setCurrentScreen('list-detail');
  };

  return (
    <div className="pb-32 pt-16 px-6">
      <header className="flex justify-between items-start mb-10">
        <div>
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <List size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">As tuas Listas</h2>
        </div>
        <button onClick={() => setIsCreatingList(true)} className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all mt-2">
          <Plus size={24} />
        </button>
      </header>
      
      <div className="grid grid-cols-1 gap-4">
        {isCreatingList && (
           <div className="bg-surface-container-low p-6 rounded-[32px] soft-shadow border border-primary/50 flex flex-col gap-4">
             <div className="flex justify-between items-start">
               <div className="p-4 rounded-2xl bg-surface-container text-primary">
                  <ShoppingCart />
               </div>
             </div>
             <div>
               <input 
                 autoFocus
                 type="text"
                 placeholder="Nome da lista..."
                 value={newListName}
                 onChange={e => setNewListName(e.target.value)}
                 onBlur={confirmCreateList}
                 onKeyDown={e => e.key === 'Enter' && confirmCreateList()}
                 className="text-xl font-bold bg-surface border-b-2 border-primary outline-none px-1 py-0.5 w-full text-on-surface"
               />
               <p className="text-sm text-outline mt-1">Pressiona Enter para guardar</p>
             </div>
           </div>
        )}
        {!isCreatingList && lists.length === 0 ? (
          <div className="bg-surface-container-low p-10 rounded-[32px] border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 rounded-full bg-surface-container text-primary flex items-center justify-center mb-2">
               <ShoppingCart size={32} />
             </div>
             <h3 className="text-xl font-bold text-on-surface">Nenhuma lista</h3>
             <p className="text-outline text-sm">Clica no botão '+' para criares a primeira lista de compras da família.</p>
          </div>
        ) : (
          lists.map(list => (
             <div 
               key={list.id} 
               onClick={() => openList(list.id)}
               className="bg-surface-container-low p-6 rounded-[32px] soft-shadow border border-outline-variant/10 flex flex-col gap-4 group active:scale-[0.98] transition-all cursor-pointer"
             >
               <div className="flex justify-between items-start">
                 <div className="p-4 rounded-2xl bg-surface-container text-primary">
                    {list.icon === 'ShoppingCart' ? <ShoppingCart /> : list.icon === 'Flame' ? <Flame /> : <Dna />}
                 </div>
                 <span className="bg-surface-container-low px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                   {list.itemCount} itens
                 </span>
               </div>
               <div>
                 <h4 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{list.name}</h4>
                 <p className="text-sm text-outline">Última edição: {list.lastEdited}</p>
               </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
};

const CORRECTIONS: Record<string, string> = {
  "pao": "pão",
  "maca": "maçã",
  "limao": "limão",
  "acucar": "açúcar",
  "feijao": "feijão",
  "cafe": "café",
  "cha": "chá",
  "hamburguer": "hambúrguer",
  "agua": "água",
  "grao": "grão",
  "pimentao": "pimentão",
  "salmao": "salmão",
  "carvao": "carvão",
  "acafrao": "açafrão",
  "hortela": "hortelã",
  "camarao": "camarão",
  "brocolos": "brócolos",
  "oleo": "óleo",
  "pao de forma": "pão de forma",
  "arroz": "arroz",
  "esparguete": "esparguete",
  "fuba": "fubá",
  "abobora": "abóbora",
  "amendoa": "amêndoa",
  "roma": "romã",
  "maracuja": "maracujá"
};

const formatProductName = (name: string) => {
  if (!name) return "";
  const lowerName = name.trim().toLowerCase();
  
  // First check if the entire string matches a dictionary entry (like "pao de forma")
  let formatted = CORRECTIONS[lowerName] || lowerName;
  
  // Then split and check word by word in case of multiple words
  if (formatted === lowerName) {
    formatted = lowerName.split(' ').map(word => CORRECTIONS[word] || word).join(' ');
  }
  
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const ListDetail = ({ isSupermarketMode, setIsSupermarketMode }: { isSupermarketMode: boolean, setIsSupermarketMode: (val: boolean) => void }) => {
  const { items, setItems, lists, setLists, activeListId, setActiveListId, setCurrentScreen, familyMembers } = useAppContext();
  const activeList = lists.find(l => l.id === activeListId);
  const listItems = items.filter(item => item.listId === activeListId);
  const categories = Array.from(new Set(listItems.map(item => item.category)));
  const [newItemName, setNewItemName] = useState('');

  const totalItemsCount = listItems.length;
  const checkedItemsCount = listItems.filter(i => i.checked).length;
  const progressPercentage = totalItemsCount > 0 ? Math.round((checkedItemsCount / totalItemsCount) * 100) : 0;
  
  const uncheckedItems = listItems.filter(item => !item.checked);
  const checkedItems = listItems.filter(item => item.checked);
  const uncheckedCategories = Array.from(new Set(uncheckedItems.map(item => item.category)));
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'item' | 'list'>('item');
  const [targetId, setTargetId] = useState<string | null>(null);

  const [showCheckedItems, setShowCheckedItems] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Screen Wake Lock active');
        }
      } catch (err: any) {
        console.warn(`Wake Lock request failed: ${err.message}`);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
          console.log('Screen Wake Lock released');
        });
      }
    };

    if (isSupermarketMode) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isSupermarketMode]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("A funcionalidade de voz não é suportada neste navegador.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText) {
        let processedText = speechToText
          .replace(/\b e também \b/gi, ',')
          .replace(/\b e também\b/gi, ',')
          .replace(/\b e \b/gi, ',')
          .replace(/\b mais \b/gi, ',');
          
        const rawItems = processedText.split(',');
        const itemsToAdd = rawItems
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0);

        if (itemsToAdd.length === 0) return;

        if (itemsToAdd.length === 1) {
          setNewItemName(formatProductName(itemsToAdd[0]));
        } else {
          for (const name of itemsToAdd) {
            const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
            const formattedName = formatProductName(name);
            const newItem: ShoppingItem = {
              id: tempId,
              listId: activeListId || '',
              name: formattedName,
              quantity: '1',
              category: 'Outros',
              checked: false
            };
            
            setItems(prev => [newItem, ...prev]);
            setLists(prev => prev.map(l => l.id === activeListId ? { ...l, itemCount: l.itemCount + 1, lastEdited: 'agora mesmo' } : l));
            
            try {
              if (activeListId) {
                const dbItem = await dbAddItem(activeListId, newItem.name, newItem.category, newItem.quantity);
                setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: dbItem.id } : i));
              }
            } catch (err) {
              setItems(prev => prev.filter(i => i.id !== tempId));
              setLists(prev => prev.map(l => l.id === activeListId ? { ...l, itemCount: Math.max(0, l.itemCount - 1), lastEdited: 'agora mesmo' } : l));
            }
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const toggleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    if (!id.startsWith('temp_')) {
      dbToggleItemChecked(id, !item.checked).catch(e => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, checked: item.checked } : i));
      });
    }
  };

  const deleteItem = (id: string) => {
    setTargetId(id);
    setDeleteType('item');
    setDeleteConfirmOpen(true);
  };

  const deleteList = () => {
    setDeleteType('list');
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    if (deleteType === 'item' && targetId) {
      const id = targetId;
      setItems(prev => prev.filter(item => item.id !== id));
      setLists(prev => prev.map(l => l.id === activeListId ? { ...l, itemCount: Math.max(0, l.itemCount - 1), lastEdited: 'agora mesmo' } : l));
      if (!id.startsWith('temp_')) {
        dbDeleteItem(id).catch(() => alert('Erro ao apagar produto.'));
      }
      setTargetId(null);
    } else if (deleteType === 'list') {
      setItems(prev => prev.filter(item => item.listId !== activeListId));
      setLists(prev => prev.filter(l => l.id !== activeListId));
      setCurrentScreen('lists');
      
      if (activeListId && !activeListId.startsWith('temp_')) {
        dbDeleteList(activeListId).catch(() => alert('Erro ao apagar lista.'));
      }
      setActiveListId(null);
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingItemId(id);
    setEditNameValue(currentName);
  };

  const saveEdit = (id: string) => {
    if (editNameValue.trim() !== '') {
      const newName = formatProductName(editNameValue);
      setItems(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
      if (!id.startsWith('temp_')) {
        dbUpdateItemName(id, newName).catch(() => alert('Erro ao atualizar nome.'));
      }
    }
    setEditingItemId(null);
  };

  const adjustQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const match = item.quantity.toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
      let newQuantity = item.quantity;
      if (match) {
        let num = parseFloat(match[1]);
        const suffix = match[2];
        num = Math.max(1, num + delta);
        newQuantity = `${num}${suffix}`;
      } else {
        const parsed = parseInt(item.quantity) || 1;
        newQuantity = String(Math.max(1, parsed + delta));
      }
      if (!id.startsWith('temp_')) {
        dbUpdateItemQuantity(id, newQuantity).catch(() => {});
      }
      return { ...item, quantity: newQuantity };
    }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeListId) return;
    
    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    const newItem: ShoppingItem = {
      id: tempId,
      listId: activeListId,
      name: formatProductName(newItemName),
      quantity: '1',
      category: 'Outros',
      checked: false
    };
    
    setItems(prev => [newItem, ...prev]);
    setLists(prev => prev.map(l => l.id === activeListId ? { ...l, itemCount: l.itemCount + 1, lastEdited: 'agora mesmo' } : l));
    setNewItemName('');
    
    try {
      const dbItem = await dbAddItem(activeListId, newItem.name, newItem.category, newItem.quantity);
      setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: dbItem.id } : i));
    } catch (err) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      setLists(prev => prev.map(l => l.id === activeListId ? { ...l, itemCount: Math.max(0, l.itemCount - 1), lastEdited: 'agora mesmo' } : l));
      alert('Erro ao adicionar produto.');
    }
  };

  if (!activeList) return null;

  return (
    <div className={`pb-32 pt-16 px-6 ${isSupermarketMode ? 'bg-surface transition-colors duration-300' : ''}`}>
      {isSupermarketMode ? (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-2 py-0.5 rounded-md border border-[#10b981]/25">
                🛒 Modo Supermercado
              </span>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mt-2">{activeList.name}</h2>
            </div>
            <button 
              onClick={() => setIsSupermarketMode(false)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-500 rounded-full font-bold text-xs transition-all border border-red-500/20 shadow-sm"
            >
              Sair
            </button>
          </div>
          
          {/* Modern Progress Bar */}
          <div className="bg-surface-container rounded-3xl p-4 border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
              <span>Progresso</span>
              <span className="text-on-surface">{checkedItemsCount}/{totalItemsCount} Itens ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#10b981] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentScreen('lists')} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface shadow-sm">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-on-surface">{activeList.name}</h2>
                <button 
                  onClick={() => setIsSupermarketMode(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95"
                >
                  <Zap size={10} className="fill-current" />
                  <span>Supermercado</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {familyMembers.slice(0, 3).map((f) => (
                <img key={f.id} src={f.avatar} className="w-10 h-10 rounded-full border-4 border-surface object-cover" />
              ))}
            </div>
            <button onClick={deleteList} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all shadow-sm">
              <Trash2 size={18} />
            </button>
          </div>
        </header>
      )}

      {!isSupermarketMode && (
        <form onSubmit={handleAddItem} className="relative mb-8">
          <div className="flex items-center bg-surface-container-low rounded-2xl h-14 px-5 border border-outline-variant/30 focus-within:border-primary focus-within:ring-2 ring-primary/20 transition-all">
            <Plus size={20} className="text-primary mr-3 flex-shrink-0" />
            <input 
              type="text" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="Adicionar produto à lista..." 
              className="flex-grow bg-transparent outline-none text-on-surface placeholder:text-outline-variant font-medium pr-2 min-w-0"
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent text-outline hover:text-primary active:scale-95'}`}
            >
              <Mic size={18} />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-10">
        {isSupermarketMode ? (
          <div className="space-y-8">
            {uncheckedItems.length > 0 ? (
              uncheckedCategories.map((cat) => (
                <section key={cat} className="bg-surface-container-low/60 p-5 rounded-[32px] border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-5 rounded-full ${cat === 'Frutas e Legumes' ? 'bg-green-500' : cat === 'Laticínios' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      <h3 className="font-bold text-on-surface/90 uppercase tracking-widest text-[10px]">{cat}</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {uncheckedItems.filter(item => item.category === cat).map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-high active:scale-[0.99] transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-8 h-8 rounded-full border-2 border-[#10b981]/40 flex-shrink-0 flex items-center justify-center text-transparent transition-all">
                            {/* Empty circle */}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-lg font-bold text-on-surface truncate">{item.name}</h4>
                            {item.notes && <p className="text-xs text-outline font-medium italic mt-1 truncate">{item.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-extrabold bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full border border-[#10b981]/25">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-16 bg-[#10b981]/5 border border-[#10b981]/15 rounded-[32px] p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center mb-4">
                  <Check size={36} strokeWidth={3} className="animate-bounce" />
                </div>
                <h4 className="text-xl font-bold text-on-surface">Tudo Comprado! 🥳</h4>
                <p className="text-sm text-outline mt-1 max-w-xs mx-auto text-center leading-relaxed">Parabéns! Compraste todos os produtos da tua lista.</p>
              </div>
            )}

            {/* Collapsed checked items at the bottom */}
            {checkedItems.length > 0 && (
              <section className="mt-10">
                <button 
                  onClick={() => setShowCheckedItems(!showCheckedItems)}
                  className="w-full flex justify-between items-center py-4 px-6 bg-surface-container rounded-2xl border border-outline-variant/10 text-outline hover:text-on-surface transition-all active:scale-[0.99]"
                >
                  <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Check size={14} className="text-[#10b981]" />
                    Comprados ({checkedItems.length})
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${showCheckedItems ? 'rotate-180' : ''}`} />
                </button>
                {showCheckedItems && (
                  <div className="space-y-3 mt-4">
                    {checkedItems.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="bg-surface-container-low/40 p-4 rounded-2xl border border-outline-variant/5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low opacity-60 transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#10b981] flex-shrink-0 flex items-center justify-center text-white border border-[#10b981]">
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <h4 className="text-lg font-bold text-on-surface line-through truncate">{item.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-outline">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          categories.length > 0 ? categories.map((cat) => (
            <section key={cat}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-6 rounded-full ${cat === 'Frutas e Legumes' ? 'bg-green-500' : cat === 'Laticínios' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                  <h3 className="font-bold text-on-surface/80 uppercase tracking-widest text-xs">{cat}</h3>
                </div>
                <span className="text-xs font-bold text-outline uppercase tracking-widest">{listItems.filter(i => i.category === cat).length} Itens</span>
              </div>
              <div className="space-y-4">
                {listItems.filter(item => item.category === cat).map((item) => (
                  <div 
                    key={item.id}
                    className={`bg-surface-container-low p-5 rounded-3xl soft-shadow border border-outline-variant/10 flex items-start gap-4 transition-all ${item.checked ? 'opacity-50' : ''}`}
                  >
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className={`w-8 h-8 rounded-full border-2 mt-1 transition-all flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-primary border-primary text-white' : 'border-outline-variant/40'}`}
                    >
                      {item.checked && <Check size={16} strokeWidth={3} />}
                    </button>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow mr-2">
                          {editingItemId === item.id ? (
                             <input 
                               type="text"
                               autoFocus
                               value={editNameValue}
                               onChange={e => setEditNameValue(e.target.value)}
                               onBlur={() => saveEdit(item.id)}
                               onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                               className="text-lg font-bold leading-none mb-1 bg-surface border-b-2 border-primary outline-none px-1 py-0.5 w-full text-on-surface"
                             />
                          ) : (
                             <h4 className={`text-lg font-bold leading-none mb-1 ${item.checked ? 'line-through' : ''}`}>{item.name}</h4>
                          )}
                          {item.isUrgent && <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">URGENTE</span>}
                          {item.notes && <p className="text-xs text-outline font-medium italic mt-1">{item.notes}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-surface-container rounded-full p-1 border border-outline-variant/20">
                            <button onClick={() => adjustQuantity(item.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-primary active:bg-outline-variant/20">
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="text-[10px] font-bold text-on-surface px-1 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button onClick={() => adjustQuantity(item.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-primary active:bg-outline-variant/20">
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                             {editingItemId === item.id ? (
                               <button onClick={() => saveEdit(item.id)} className="p-2 text-white bg-primary active:scale-90 transition-all rounded-full">
                                  <Check size={16} />
                               </button>
                             ) : (
                               <button onClick={() => startEdit(item.id, item.name)} className="p-2 text-green-500 bg-green-500/10 active:scale-90 transition-all rounded-full">
                                  <Pencil size={16} />
                               </button>
                             )}
                             <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 bg-red-500/10 active:scale-90 transition-all rounded-full">
                                <Trash2 size={16} />
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )) : (
            <div className="text-center py-20 text-outline flex flex-col items-center">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p>A tua lista está vazia. Adiciona o primeiro item!</p>
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-surface-container-low border border-outline-variant/30 rounded-[32px] p-6 max-w-sm w-full shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                {deleteType === 'item' ? 'Apagar Produto' : 'Apagar Lista'}
              </h3>
              <p className="text-sm text-outline mb-6 leading-relaxed">
                {deleteType === 'item' 
                  ? 'Tens a certeza que desejas apagar este produto da tua lista de compras?' 
                  : `Tens a certeza que desejas apagar a lista "${activeList?.name}" e todos os seus produtos? Esta ação não pode ser desfeita.`
                }
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold active:scale-95 transition-all text-sm border border-outline-variant/20"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold active:scale-95 transition-all text-sm shadow-md shadow-red-500/20"
                >
                  Apagar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Family = () => {
  const { familyMembers, activities } = useAppContext();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [shareSettings, setShareSettings] = useState([
    { id: 'realtime', label: 'Presença em tempo real', sub: 'Mostrar quando outros estão a editar listas', active: true },
    { id: 'smart', label: 'Sugestões Inteligentes', sub: 'Partilhar ideias de receitas baseadas no histórico', active: true },
    { id: 'strict', label: 'Permissões Estritas', sub: 'Apenas Admins podem eliminar listas partilhadas', active: false },
  ]);

  const toggleShareSetting = (id: string) => {
    setShareSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const confirmInvite = () => {
    setIsInviting(false);
    
    // Generate a random 6-character code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const magicLink = `${window.location.origin}/invite?code=${inviteCode}`;
    
    // Try to copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(magicLink).then(() => {
        alert(`Link Mágico Copiado!\n\nEnvia este link para a tua família pelo WhatsApp:\n${magicLink}`);
      }).catch(() => {
        alert(`Link de Convite Gerado:\n\n${magicLink}\n\n(Copia manualmente e envia)`);
      });
    } else {
      alert(`Link de Convite Gerado:\n\n${magicLink}\n\n(Copia manualmente e envia)`);
    }
    
    setInviteEmail('');
  };

  return (
    <div className="pb-32 pt-16 px-6">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30">
            <img src={familyMembers[0]?.avatar} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Família</h2>
        </div>
        <Bell size={24} className="text-primary" />
      </header>

      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter text-on-surface mb-2">A sua Família</h1>
        <p className="text-outline font-medium">Gerir membros e preferências domésticas partilhadas.</p>
      </section>

      <div className="space-y-4 mb-8">
        {familyMembers.length > 1 ? familyMembers.slice(1).map((member) => (
          <div key={member.id} className="bg-surface-container-low p-5 rounded-[32px] soft-shadow border border-outline-variant/10 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <img src={member.avatar} className="w-14 h-14 rounded-full border-2 border-surface" />
              <div>
                <h4 className="font-bold text-on-surface">{member.name}</h4>
                <p className={`text-sm font-bold ${member.role === 'Admin' ? 'text-primary' : 'text-outline'}`}>{member.role}</p>
              </div>
            </div>
            <button className="text-outline">
              <MoreVertical size={20} />
            </button>
          </div>
        )) : (
          <p className="text-outline text-sm text-center mb-6">Ainda não adicionaste nenhum membro à tua família.</p>
        )}
        
        {isInviting ? (
          <div className="bg-surface-container-low p-5 rounded-[32px] soft-shadow border border-primary flex items-center justify-between transition-all">
            <div className="flex items-center gap-4 w-full">
              <div className="w-14 h-14 rounded-full border-2 border-primary border-dashed flex items-center justify-center text-primary bg-primary/10">
                 <Mail size={20} />
              </div>
              <div className="flex-grow">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Nome do Familiar..."
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onBlur={confirmInvite}
                  onKeyDown={e => e.key === 'Enter' && confirmInvite()}
                  className="w-full bg-surface border-b-2 border-primary outline-none px-1 py-1 text-on-surface font-medium"
                />
                <p className="text-xs text-outline mt-1">Pressiona Enter para gerar Link</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsInviting(true)} className="w-full h-16 bg-primary text-white rounded-3xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
            <Users size={20} /> Convidar Membro
          </button>
        )}
      </div>

      <section className="mb-10">
        <h3 className="text-lg font-bold text-on-surface/80 mb-4 opacity-50">Atividade Recente</h3>
        <div className="space-y-4">
          {activities.length > 0 ? activities.map(act => (
            <div key={act.id} className="bg-surface-container-low p-5 rounded-[32px] border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <List size={22} />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{act.action}</h4>
                <p className="text-sm text-outline">{act.userName} • {act.target}</p>
              </div>
            </div>
          )) : (
            <p className="text-outline text-sm text-center mb-6">Ainda não há atividade recente.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-on-surface/80 mb-4 opacity-50">Definições de Partilha</h3>
        <div className="bg-surface-container-low rounded-[32px] soft-shadow border border-outline-variant/10 divide-y divide-outline-variant/10">
          {shareSettings.map((item) => (
             <div key={item.id} className="p-6 flex items-center justify-between cursor-pointer group" onClick={() => toggleShareSetting(item.id)}>
              <div>
                <h4 className="font-bold text-on-surface">{item.label}</h4>
                <p className="text-xs text-outline">{item.sub}</p>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-all ${item.active ? 'bg-primary' : 'bg-outline-variant group-hover:bg-outline'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-all ${item.active ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Settings = ({ theme, setTheme }: { theme: string, setTheme: (t: string) => void }) => {
  const { familyMembers, setFamilyMembers, setCurrentScreen } = useAppContext();
  const user = familyMembers[0];
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    setFamilyMembers(prev => prev.map((m, i) => i === 0 ? { ...m, name: tempName.trim() } : m));
    setIsEditingName(false);
  };

  return (
    <div className="pb-32 pt-16 px-6 bg-surface min-h-screen text-on-surface">
      <header className="flex justify-between items-center mb-10">
         <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex items-center justify-center">
            <img src={user?.avatar} className="w-full h-full object-cover opacity-80" />
         </div>
         <h2 className="text-xl font-bold">Definições</h2>
         <Bell size={24} className="text-primary" />
      </header>

      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-primary p-1 scale-110">
             <img src={user?.avatar} className="w-full h-full rounded-full object-cover" />
          </div>
          <button onClick={() => setIsEditingName(true)} className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-surface flex items-center justify-center text-white active:scale-90 transition-all">
            <Pencil size={16} />
          </button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-on-surface">{user?.name}</h1>
        <p className="text-outline font-medium mb-4">{user?.email}</p>
        <div className="bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-full flex items-center gap-2">
           <Shield size={14} className="text-primary" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Membro Premium</span>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-[0.2em] mb-4">Temas</h3>
          <div className="bg-surface-container-low rounded-[32px] border border-outline-variant/20 p-6 flex flex-col gap-4">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                   <Moon size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-on-surface">Escolher Tema</h4>
                   <p className="text-xs text-outline">Personaliza as cores da aplicação</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2 mt-2">
               {THEMES.map((t) => (
                 <button
                   key={t.id}
                   onClick={() => setTheme(t.id)}
                   className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${theme === t.id ? 'bg-primary text-white border-primary' : 'bg-surface-container border-outline-variant/20 text-on-surface hover:bg-surface-container-high'}`}
                 >
                   {t.name}
                 </button>
               ))}
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-[0.2em] mb-4">Conta</h3>
          <div className="bg-surface-container-low rounded-[32px] border border-outline-variant/20 divide-y divide-outline-variant/20">
             <div onClick={() => setIsEditingName(true)} className="p-6 flex items-center justify-between group active:bg-surface-container transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                      <Users size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-on-surface">Informação Pessoal</h4>
                      <p className="text-xs text-outline">Atualize os detalhes do seu perfil</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-outline-variant" />
             </div>
             <div onClick={() => setSecurityModalOpen(true)} className="p-6 flex items-center justify-between group active:bg-surface-container transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                      <Shield size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-on-surface">Palavra-passe e Segurança</h4>
                      <p className="text-xs text-outline">Segurança da sua conta Google</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-outline-variant" />
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-[0.2em] mb-4">Grupo Familiar</h3>
          <div className="bg-surface-container-low p-6 rounded-[32px] border border-outline-variant/20 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                   <Users size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-on-surface">Gerir Grupo Familiar</h4>
                   <p className="text-xs text-outline">{familyMembers.length} Membros Ativos</p>
                </div>
             </div>
             <button onClick={() => setCurrentScreen('family')} className="bg-surface-container border border-outline-variant/30 px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors">
                Gerir
             </button>
          </div>
        </section>

        <button onClick={() => signOut()} className="w-full h-16 bg-surface-container-low border border-outline-variant/20 rounded-3xl flex items-center justify-center gap-3 text-red-500 font-bold active:scale-[0.98] transition-all">
          <LogOut size={20} /> Sair
        </button>

        <p className="text-center text-[10px] font-bold text-outline-variant uppercase tracking-widest pb-10">
          Shopping List v2.4.1 (Versão Estável)
        </p>
      </div>

      {/* Modal Editar Nome */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-low border border-outline-variant/30 rounded-[32px] p-6 w-full max-w-md soft-shadow"
            >
              <h3 className="text-xl font-bold text-on-surface mb-2">Informação Pessoal</h3>
              <p className="text-sm text-outline mb-6">Altere o seu nome de exibição na Shopping List.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Nome do Perfil</label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary font-medium"
                    placeholder="O teu nome..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Email (Apenas leitura)</label>
                  <input 
                    type="text" 
                    value={user?.email} 
                    disabled
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-4 py-3 text-sm text-outline outline-none cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 h-12 bg-surface-container border border-outline-variant/20 text-on-surface rounded-full font-bold text-sm active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveName}
                  className="flex-1 h-12 bg-primary text-white rounded-full font-bold active:scale-95 transition-all text-sm shadow-lg shadow-primary/20"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Palavra-passe e Segurança */}
      <AnimatePresence>
        {securityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-low border border-outline-variant/30 rounded-[32px] p-6 w-full max-w-md soft-shadow"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Segurança da Conta</h3>
              <p className="text-sm text-outline mb-6">Esta aplicação utiliza autenticação segura via **Google Sign-In**.</p>
              
              <div className="bg-surface p-4 rounded-2xl border border-outline-variant/10 text-xs text-outline space-y-2 mb-8 leading-relaxed">
                <p>• A sua palavra-passe nunca é partilhada nem armazenada nos nossos servidores.</p>
                <p>• A segurança do acesso, 2FA (Verificação de dois passos) e alertas de login são totalmente assegurados pela infraestrutura de segurança da Google.</p>
                <p>• Para alterar a segurança ou a palavra-passe, deve aceder à sua conta Google.</p>
              </div>

              <button 
                onClick={() => setSecurityModalOpen(false)}
                className="w-full h-12 bg-primary text-white rounded-full font-bold active:scale-95 transition-all text-sm shadow-lg shadow-primary/20"
              >
                Compreendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RecipesOverview = () => {
  const { recipes, setActiveRecipeId, setCurrentScreen } = useAppContext();

  const openRecipe = (id: string) => {
    setActiveRecipeId(id);
    setCurrentScreen('recipe-detail');
  };

  return (
    <div className="pb-32 pt-16 px-6">
      <header className="flex justify-between items-start mb-10">
        <div>
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <ChefHat size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">As tuas Receitas</h2>
        </div>
      </header>

      {recipes.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-[32px] soft-shadow border border-outline-variant/10 text-center flex flex-col items-center">
          <BookOpen size={40} className="text-outline/50 mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">Sem Receitas</h3>
          <p className="text-outline font-medium">Usa o Chef IA para gerar receitas incríveis e elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {recipes.map(recipe => (
             <div 
               key={recipe.id} 
               onClick={() => openRecipe(recipe.id)}
               className="bg-surface-container-low p-4 rounded-3xl soft-shadow border border-outline-variant/10 flex items-center gap-4 group active:scale-[0.98] transition-all cursor-pointer"
             >
               <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-3xl flex-shrink-0">
                  {recipe.emoji}
               </div>
               <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors flex-grow truncate">{recipe.title}</h4>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RecipeDetail = () => {
  const { recipes, activeRecipeId, setCurrentScreen, setItems, setLists } = useAppContext();
  const { data: session } = useSession();
  const recipe = recipes.find(r => r.id === activeRecipeId);

  if (!recipe) return null;

  const handleAddIngredients = async () => {
    const newListId = Math.random().toString(36).substr(2, 9);

    const newItems: ShoppingItem[] = recipe.ingredients.map((ing: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      listId: newListId,
      name: ing.name,
      quantity: ing.quantity,
      category: ing.category || 'Outros',
      checked: false
    }));
    
    setItems(prev => [...newItems, ...prev]);
    
    const newList: ShoppingList = {
      id: newListId,
      name: recipe.title,
      itemCount: newItems.length,
      lastEdited: 'agora mesmo',
      color: '#ff6b6b',
      icon: 'Flame'
    };
    
    setLists(prev => [newList, ...prev]);

    try {
      const dbList = await dbCreateList(newList.name, newList.color, newList.icon);
      const promises = newItems.map(item => dbAddItem(dbList.id, item.name, item.category, item.quantity));
      await Promise.all(promises);
      
      setLists(prev => prev.map(l => l.id === newList.id ? { ...l, id: dbList.id } : l));
      setItems(prev => prev.map(i => i.listId === newList.id ? { ...i, listId: dbList.id } : i));
      
      if (session?.user?.name) {
        logActivity('Criou uma Lista', newList.name, session.user.name).catch(console.error);
      }
      
      alert('Ingredientes adicionados com sucesso numa nova lista!');
      setCurrentScreen('lists');
    } catch (e) {
      console.error("Falha ao gravar lista da receita na DB", e);
      alert('Erro ao gravar a lista de compras na base de dados.');
    }
  };

  return (
    <div className="pb-32 pt-16 px-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentScreen('recipes')} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-on-surface flex-grow truncate">{recipe.title}</h2>
        <span className="text-2xl">{recipe.emoji}</span>
      </header>

      <section className="mb-8">
        <p className="text-outline font-medium text-lg">{recipe.description}</p>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-bold text-on-surface mb-4">Ingredientes</h3>
        <div className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/10 flex flex-col gap-3">
          {recipe.ingredients.map((ing, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
               <span className="font-medium text-on-surface">{ing.name}</span>
               <span className="text-sm font-bold bg-surface px-3 py-1 rounded-full text-primary">{ing.quantity}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={handleAddIngredients}
          className="w-full mt-4 h-14 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <ShoppingCart size={18} /> Adicionar à Lista de Compras
        </button>
      </section>

      <section>
        <h3 className="text-xl font-bold text-on-surface mb-4">Preparação</h3>
        <div className="space-y-4">
          {recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions.map((step, idx) => (
             <div key={idx} className="bg-surface-container-low p-5 rounded-[24px] border border-outline-variant/10 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-on-surface font-medium leading-relaxed">{step}</p>
             </div>
          )) : (
             <p className="text-outline italic">Instruções não disponíveis para esta receita.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const { status, data: session } = useSession();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');
  const [theme, setTheme] = useState<string>('dark-midnight');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isSupermarketMode, setIsSupermarketMode] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentScreen('home');
      setFamilyMembers([{
        id: session.user.email || '1',
        name: session.user.name || 'Utilizador',
        role: 'Admin',
        avatar: session.user.image || '',
        email: session.user.email || ''
      }]);
    } else if (status === 'unauthenticated') {
      setCurrentScreen('onboarding');
      setFamilyMembers([]);
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated') {
      getLists().then(dbLists => {
        const mappedLists = dbLists.map(list => ({
          id: list.id,
          name: list.name,
          color: list.color,
          icon: list.icon,
          itemCount: list.items.length,
          completedCount: list.items.filter(i => i.checked).length,
          lastEdited: 'agora mesmo'
        }));
        setLists(mappedLists);
        
        const allItems = dbLists.flatMap(list => list.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          checked: item.checked,
          isUrgent: item.isUrgent,
          notes: item.notes || undefined,
          listId: item.listId
        })));
        setItems(allItems);
        setIsLoadingDB(false);
      });
      getRecipes().then(dbRecipes => {
        setRecipes(dbRecipes as unknown as SavedRecipe[]);
      });
      getActivities().then(dbActivities => {
        setActivities(dbActivities);
      });
    }
  }, [status]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{ items, setItems, lists, setLists, activeListId, setActiveListId, setCurrentScreen, familyMembers, setFamilyMembers, recipes, setRecipes, activeRecipeId, setActiveRecipeId, activities, setActivities }}>
      <div className="min-h-screen max-w-lg mx-auto bg-surface relative transition-colors duration-300">
        <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <Onboarding key="onboarding" onStart={() => setCurrentScreen('home')} />
        )}
        {currentScreen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Dashboard />
          </motion.div>
        )}
        {currentScreen === 'lists' && (
          <motion.div key="lists" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ListsOverview />
          </motion.div>
        )}
        {currentScreen === 'list-detail' && (
          <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ListDetail isSupermarketMode={isSupermarketMode} setIsSupermarketMode={setIsSupermarketMode} />
          </motion.div>
        )}
        {currentScreen === 'recipes' && (
          <motion.div key="recipes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <RecipesOverview />
          </motion.div>
        )}
        {currentScreen === 'recipe-detail' && (
          <motion.div key="recipe-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <RecipeDetail />
          </motion.div>
        )}
        {currentScreen === 'family' && (
          <motion.div key="family" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Family />
          </motion.div>
        )}
        {currentScreen === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Settings theme={theme} setTheme={setTheme} />
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar activeScreen={currentScreen} onScreenChange={setCurrentScreen} isSupermarketMode={isSupermarketMode} />
      </div>
    </AppContext.Provider>
  );
}
