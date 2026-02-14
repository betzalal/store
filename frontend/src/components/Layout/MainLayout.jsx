import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Menu, X, DollarSign, Settings, Search, Plus,
    CheckCircle2, TrendingUp, Box, ChevronLeft,
    ChevronRight, LayoutGrid, Store, Users,
    Database, CreditCard, ChevronDown, FileDown,
    Printer, Send, FileSpreadsheet, FileText, Package
} from 'lucide-react';
import OptionsMenu from '../Options/OptionsMenu';
import StoreSelectionModal from '../Dashboard/StoreSelectionModal';
import { useStore } from '../../context/StoreContext';

const MainLayout = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isCreateStoreMode, setIsCreateStoreMode] = useState(false);
    const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
    const [config, setConfig] = useState({ companyName: 'MagicStore', logoUrl: null, backgroundUrl: null });
    const [balance, setBalance] = useState(0);
    const { activeStore, isEmpresaMode } = useStore();
    const location = useLocation();

    useEffect(() => {
        fetch('http://localhost:3001/api/setup/status')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setConfig(data.config);
                    if (data.config.themeMode === 'light') {
                        setIsDark(false);
                        document.documentElement.classList.remove('dark');
                    } else {
                        setIsDark(true);
                        document.documentElement.classList.add('dark');
                    }
                }
            })
            .catch(err => console.error("Config fetch failed", err));
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
                const res = await fetch(`http://localhost:3001/api/expenses/total?storeId=${storeId}`);
                const data = await res.json();
                setBalance(data.total || 0);
            } catch (err) {
                console.error("Balance fetch failed", err);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [activeStore, isEmpresaMode]);

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        const newMode = newIsDark ? 'dark' : 'light';
        if (newIsDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        try {
            await fetch('http://localhost:3001/api/setup/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeMode: newMode })
            });
        } catch (err) {
            console.error("Failed to save theme preference:", err);
        }
    };

    const updateBackground = async (newUrl) => {
        setConfig(prev => ({ ...prev, backgroundUrl: newUrl }));
        try {
            await fetch('http://localhost:3001/api/setup/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backgroundUrl: newUrl })
            });
        } catch (err) {
            console.error("Failed to save background preference:", err);
        }
    };

    const menuGroups = [
        {
            label: 'General',
            items: [
                { name: 'Dashboard', path: '/', icon: LayoutGrid },
                { name: 'Tiendas', path: '/stores', icon: Store },
            ]
        },
        {
            label: 'Operaciones',
            items: [
                { name: 'Ventas', path: '/sales', icon: TrendingUp },
                { name: 'Inventarios', path: '/inventory', icon: Box },
                { name: 'Productos', path: '/products', icon: Package },
            ]
        },
        {
            label: 'Administración',
            items: [
                { name: 'Gastos', path: '/gastos', icon: DollarSign },
                { name: 'Usuarios', path: '/users', icon: Users },
                { name: 'Memoria', path: '/memory', icon: Database },
            ]
        }
    ];

    const isHomePage = location.pathname === '/';

    // Menu 1: Top Navigation Bar (Only for Home)
    const TopNavbar = () => (
        <nav className="no-print h-20 px-8 flex items-center justify-between bg-white/70 dark:bg-dark-bg/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-50">
            {/* Branding */}
            <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        {config.logoUrl ? (
                            <img src={`http://localhost:3001${config.logoUrl}`} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <span className="text-white font-black text-xl italic leading-none">Z</span>
                        )}
                    </div>
                </Link>

                {/* Menu 1 Items */}
                <div className="hidden md:flex items-center space-x-1 ml-8">
                    {menuGroups.flatMap(g => g.items).map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
                {/* Active Store Display */}
                <button
                    onClick={() => setIsStoreModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:border-blue-500/30 transition-all group"
                >
                    <Store className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                        {activeStore?.name || 'Vista Global'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

                {/* User Profile Placeholder */}
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 rounded-xl transition-all">
                    <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                        US
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-xs font-black text-gray-900 dark:text-white leading-none">Usuario Demo</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Admin</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsOptionsOpen(true)}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );

    return (
        <div className={`min-h-screen flex font-sans selection:bg-blue-500 selection:text-white ${isDark ? 'dark' : ''} bg-light-bg dark:bg-dark-bg transition-colors duration-300`}>

            {/* Options Modal */}
            {isOptionsOpen && (
                <OptionsMenu
                    onClose={() => setIsOptionsOpen(false)}
                    onThemeToggle={toggleTheme}
                    isDark={isDark}
                    config={config}
                    onBackgroundChange={updateBackground}
                />
            )}

            {/* Store Switcher Modal */}
            <StoreSelectionModal
                isOpen={isStoreModalOpen}
                onClose={() => {
                    setIsStoreModalOpen(false);
                    setIsCreateStoreMode(false);
                }}
                initialCreateMode={isCreateStoreMode}
            />

            {/* LAYOUT 1: HOME PAGE (Menu 1 Top) */}
            {isHomePage ? (
                <div className="flex-1 flex flex-col relative w-full">
                    <TopNavbar />
                    <main className="flex-1 w-full">
                        {children}
                    </main>
                </div>
            ) : (
                /* LAYOUT 2: WORKSPACE (Menu 2 Sidebar) */
                <>
                    {/* Sidebar Desktop */}
                    <aside className={`no-print fixed inset-y-0 left-0 z-50 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-xl border-r border-gray-200 dark:border-dark-border transition-all duration-500 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
                        <div className="p-6 flex-1 flex flex-col overflow-hidden">
                            {/* Header Branding */}
                            <div className="flex items-center justify-between mb-8 overflow-hidden">
                                <Link to="/" className="flex items-center space-x-3 min-w-max">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                                        {config.logoUrl ? (
                                            <img src={`http://localhost:3001${config.logoUrl}`} alt="Logo" className="w-6 h-6 object-contain" />
                                        ) : (
                                            <span className="text-white font-black text-xl italic leading-none">Z</span>
                                        )}
                                    </div>
                                    {!isSidebarCollapsed && (
                                        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent tracking-tighter truncate">
                                            {config.companyName}
                                        </span>
                                    )}
                                </Link>
                                {!isSidebarCollapsed && (
                                    <button
                                        onClick={() => setIsSidebarCollapsed(true)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                {isSidebarCollapsed && (
                                    <button
                                        onClick={() => setIsSidebarCollapsed(false)}
                                        className="absolute -right-3 top-12 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-[60] hover:scale-110 transition-transform"
                                    >
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Store Selection Trigger */}
                            <div
                                onClick={() => setIsStoreModalOpen(true)}
                                className={`mb-8 p-4 rounded-2xl flex items-center transition-all cursor-pointer border shadow-sm group
                                    ${isSidebarCollapsed ? 'p-2 justify-center' : 'space-x-4 px-4'}
                                    ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                            >
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Store className="w-5 h-5 text-blue-500" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tienda Activa</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                                                {activeStore?.name || 'Vista Global'}
                                            </span>
                                            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Groups */}
                            <nav className="space-y-8 flex-1 overflow-y-auto no-scrollbar py-2">
                                {menuGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-2">
                                        {!isSidebarCollapsed && (
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">{group.label}</p>
                                        )}
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                const isActive = location.pathname === item.path;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        to={item.path}
                                                        className={`flex items-center rounded-xl transition-all group relative
                                                            ${isSidebarCollapsed ? 'px-0 py-3 justify-center mx-2' : 'px-4 py-3'}
                                                            ${isActive
                                                                ? 'bg-blue-500/10 text-blue-500 font-bold'
                                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                                        {!isSidebarCollapsed && (
                                                            <span className="text-sm ml-4">{item.name}</span>
                                                        )}
                                                        {isActive && !isSidebarCollapsed && (
                                                            <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                                                        )}
                                                        {isSidebarCollapsed && isActive && (
                                                            <div className="absolute right-0 w-1 h-6 bg-blue-600 rounded-l-full" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Footer Section (Options) */}
                        <div className="p-6 pt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
                            <button
                                onClick={() => {
                                    setIsCreateStoreMode(true);
                                    setIsStoreModalOpen(true);
                                }}
                                className={`w-full flex items-center rounded-xl text-gray-400 hover:text-blue-500 transition-all
                                ${isSidebarCollapsed ? 'p-3 justify-center' : 'p-3 space-x-3'}`}
                            >
                                <Plus className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="text-sm font-bold">Crear Tienda</span>}
                            </button>

                            <button
                                onClick={() => setIsOptionsOpen(true)}
                                className={`w-full flex items-center rounded-xl text-gray-400 hover:text-blue-500 transition-all
                                ${isSidebarCollapsed ? 'p-3 justify-center' : 'p-3 space-x-3'}`}
                            >
                                <Settings className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="text-sm font-bold">Configuración</span>}
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Component */}
                    <div className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarCollapsed ? 'pl-20' : 'pl-72'}`}>
                        {/* Top Header - Streamlined (Workspace Header) */}
                        <header className="no-print h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-dark-bg/50 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:border-white/5">

                            {/* Left - Workspace / Breadcrumbs (Placeholder) */}
                            <div className="flex items-center space-x-4 w-60">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                    {location.pathname === '/sales' ? 'Punto de Venta' : 'Panel Central'}
                                </span>
                            </div>

                            {/* Center - Global Actions */}
                            {location.pathname !== '/sales' ? (
                                <div className="flex-1 flex items-center justify-center space-x-8 md:space-x-12">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSaveDropdownOpen(!isSaveDropdownOpen)}
                                            className="flex items-center space-x-3 text-gray-400 hover:text-blue-500 transition-all group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 border border-transparent group-hover:border-blue-500/20">
                                                <FileDown className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Guardar</span>
                                        </button>

                                        {isSaveDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">Formato de Exportación</p>
                                                <button className="w-full flex items-center space-x-3 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover/item:text-emerald-600">Excel (.xlsx)</span>
                                                </button>
                                                <button className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover/item:text-red-600">PDF (.pdf)</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center space-x-3 text-gray-400 hover:text-blue-500 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 border border-transparent group-hover:border-blue-500/20">
                                            <Printer className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Imprimir</span>
                                    </button>

                                    <button className="flex items-center space-x-3 text-gray-400 hover:text-blue-500 transition-all group">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 border border-transparent group-hover:border-blue-500/20">
                                            <Send className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Enviar</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1" /> /* Spacer for Sales view */
                            )}

                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => {
                                        setIsCreateStoreMode(true);
                                        setIsStoreModalOpen(true);
                                    }}
                                    className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>

                                <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />

                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">En Línea</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Viewport Content */}
                        <main className="flex-1 p-0 relative">
                            {children}
                        </main>
                    </div >
                </>
            )}
        </div >
    );
};

export default MainLayout;
