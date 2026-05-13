import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, History, Home, Moon, Sun, Menu, X, BrainCircuit, Activity } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const workflowNav = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Modèles', href: '/models', icon: BrainCircuit },
    { name: 'Prédiction', href: '/predict', icon: Car },
  ];

  const analysisNav = [
    { name: 'Dashboard ML', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Historique', href: '/history', icon: History },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark:bg-black dark:text-neutral-50' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans`}>
      <header className="bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center">
               <Link to="/" className="flex items-center group">
                <div className="bg-brand-blue p-2 rounded-xl group-hover:rotate-6 transition-transform">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-black text-brand-blue dark:text-white tracking-tighter">
                  AUTOCLASS<span className="text-slate-400 font-light">.ML</span>
                </span>
               </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1 tracking-widest">Workflow</span>
                <div className="flex space-x-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl">
                  {workflowNav.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                          isActive 
                            ? 'bg-white dark:bg-neutral-800 text-brand-blue dark:text-blue-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col border-l border-slate-200 dark:border-neutral-900 pl-8">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1 tracking-widest">Analyse</span>
                <div className="flex space-x-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl">
                  {analysisNav.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                          isActive 
                            ? 'bg-white dark:bg-neutral-800 text-brand-blue dark:text-blue-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="http://localhost:5000"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 font-bold text-sm transition-colors border border-indigo-200 dark:border-indigo-500/30"
                aria-label="Open MLflow"
              >
                <Activity size={18} />
                MLflow
              </a>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-neutral-400"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900 animate-in slide-in-from-top-4 duration-300">
            <div className="px-4 pt-2 pb-6 space-y-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 ml-4">Workflow</p>
                <div className="space-y-1">
                  {workflowNav.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-xl text-base font-bold ${
                          isActive 
                            ? 'bg-brand-blue/10 text-brand-blue dark:text-blue-400' 
                            : 'text-slate-600 dark:text-neutral-400'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 ml-4">Outils Externe</p>
                <div className="space-y-1 mb-6">
                   <a
                     href="http://localhost:5000"
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={() => setIsMenuOpen(false)}
                     className="flex items-center px-4 py-4 rounded-xl text-base font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                   >
                     <Activity size={20} className="mr-3" />
                     Ouvrir MLflow
                   </a>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 ml-4">Analyse</p>
                <div className="space-y-1">
                  {analysisNav.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-xl text-base font-bold ${
                          isActive 
                            ? 'bg-brand-blue/10 text-brand-blue dark:text-blue-400' 
                            : 'text-slate-600 dark:text-neutral-400'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full mx-auto container px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-white dark:bg-neutral-950 py-10 border-t border-slate-200 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Car size={16} />
            <span className="font-bold text-slate-600 dark:text-neutral-500">AutoClass ML</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-blue transition-colors">Documentation</a>
            <a href="#" className="hover:text-brand-blue transition-colors">GitHub</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Confidentialité</a>
          </div>
          <div>&copy; {new Date().getFullYear()} - Plateforme de Classification Intelligente</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
