import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Menu, X, Settings, Search, Plus,
    CheckCircle2, TrendingUp, Box, ChevronLeft,
    ChevronRight, LayoutGrid, Store, Users,
    Database, CreditCard, ChevronDown, FileDown,
    Printer, Send, FileSpreadsheet, FileText, Package,
    LogOut
} from 'lucide-react';
import OptionsMenu from '../Options/OptionsMenu';
import StoreSelectionModal from '../Dashboard/StoreSelectionModal';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isCreateStoreMode, setIsCreateStoreMode] = useState(false);
    const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
    const [config, setConfig] = useState({ companyName: 'MagicStore', logoUrl: null, backgroundUrl: null });
    const [balance, setBalance] = useState(0);
    const { activeStore, isEmpresaMode } = useStore();
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/status`)
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
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/expenses/total?storeId=${storeId}`);
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
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/config`, {
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
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/config`, {
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
                { name: 'Inicio', path: '/', icon: LayoutGrid, roles: ['admin', 'contador'] },
                { name: 'Tiendas', path: '/stores', icon: Store, roles: ['admin'] },
                { name: 'Usuarios', path: '/users', icon: Users, roles: ['admin'] },
            ]
        },
        {
            label: 'Operaciones',
            items: [
                { name: 'Inventarios', path: '/inventory', icon: Box, roles: ['admin', 'contador'] },
                { name: 'Productos', path: '/products', icon: Package, roles: ['admin', 'contador'] },
                { name: 'Ventas', path: '/sales', icon: TrendingUp, roles: ['admin', 'contador', 'vendedor'] },
            ]
        },
        {
            label: 'Reportes',
            items: [
                { name: 'Memorias', path: '/memory', icon: Database, roles: ['admin', 'contador', 'vendedor'] },
            ]
        }
    ];

    // Filter menu groups based on user role
    const filteredMenuGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || (currentUser && item.roles.includes(currentUser.role)))
    })).filter(group => group.items.length > 0);

    const isHomePage = location.pathname === '/';

    // Menu 1: Top Navigation Bar (Only for Home)
    const TopNavbar = () => (
        <nav className="no-print h-20 px-4 md:px-8 flex items-center justify-between bg-light-card/80 dark:bg-dark-bg/70 backdrop-blur-xl border-b border-light-border dark:border-white/5 sticky top-0 z-50">
            {/* Branding */}
            <div className="flex items-center space-x-2 md:space-x-4">
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        {config.logoUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.logoUrl}`} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <span className="text-white font-black text-xl italic leading-none">Z</span>
                        )}
                    </div>
                </Link>

                {/* Menu 1 Items */}
                <div className="hidden md:flex items-center space-x-1 ml-8">
                    {filteredMenuGroups.flatMap(g => g.items).map((item) => (
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
            <div className="flex items-center space-x-2 md:space-x-6">
                {/* Active Store Display */}
                <button
                    onClick={() => setIsStoreModalOpen(true)}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:border-blue-500/30 transition-all group"
                >
                    <Store className="w-4 h-4 text-blue-500" />
                    <span className="hidden md:inline text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                        {activeStore?.name || 'Vista Global'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 rounded-xl transition-all">
                    <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                        {currentUser?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{currentUser?.username || 'Usuario'}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 capitalize">{currentUser?.role || 'Admin'}</p>
                    </div>
                </div>

                <div className="flex space-x-1 md:space-x-2">
                    <button
                        onClick={() => setIsOptionsOpen(true)}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
                        title="Configuración"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2.5 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-medium flex items-center gap-2"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block text-sm">Salir</span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu for TopNavbar */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-light-card dark:bg-[#0f172a] border-b border-gray-200 dark:border-white/5 py-4 px-4 flex flex-col space-y-2 shadow-xl animate-fade-in z-50">
                    {filteredMenuGroups.flatMap(g => g.items).map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-4 py-3 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/5 transition-all flex items-center space-x-3"
                        >
                            <item.icon className="w-5 h-5 opacity-70" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );

    // Global background apply for active layout
    return (
        <div
            className={`min-h-screen flex font-sans selection:bg-blue-500 selection:text-white ${isDark ? 'dark' : ''} transition-colors duration-300 relative`}
            style={config.backgroundUrl ? {
                backgroundImage: `url('${config.backgroundUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}` + config.backgroundUrl : config.backgroundUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            } : {}}
        >
            {/* Global Background Overlay */}
            <div className={`fixed inset-0 pointer-events-none transition-colors duration-300 z-0 ${config.backgroundUrl ? 'bg-white/50 dark:bg-[#0f172a]/80' : 'bg-light-bg dark:bg-dark-bg'}`}></div>

            <div className="flex-1 flex w-full relative z-10">

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
                ) : location.pathname === '/sales' ? (
                    /* LAYOUT 3: SALES POS (Full Screen) */
                    <div className="flex-1 flex flex-col relative w-full h-screen overflow-hidden">
                        <main className="flex-1 w-full h-full">
                            {children}
                        </main>
                    </div>
                ) : (
                    /* LAYOUT 2: WORKSPACE (Menu 2 Sidebar) */
                    <>
                        {/* Mobile sidebar overlay */}
                        {isMobileMenuOpen && (
                            <div
                                className="md:hidden fixed inset-0 bg-black/50 z-[40] backdrop-blur-sm transition-opacity"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        )}
                        {/* Sidebar Desktop/Mobile */}
                        <aside className={`no-print fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0f172a] md:bg-white/70 md:dark:bg-dark-bg/70 md:backdrop-blur-xl border-r border-gray-200 dark:border-dark-border transition-all duration-300 transform flex flex-col 
                            ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} 
                            w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        `}>
                            <div className="p-4 md:p-6 flex-1 flex flex-col overflow-hidden">
                                {/* Header Branding */}
                                <div className="flex items-center justify-between mb-8 overflow-hidden">
                                    <Link to="/" className="flex items-center space-x-3 min-w-max">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                                            {config.logoUrl ? (
                                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.logoUrl}`} alt="Logo" className="w-6 h-6 object-contain" />
                                            ) : (
                                                <span className="text-white font-black text-xl italic leading-none">Z</span>
                                            )}
                                        </div>
                                        <span className={`text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent tracking-tighter truncate ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
                                            {config.companyName}
                                        </span>
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
                                    ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-light-bg border-light-border hover:bg-black/5'}`}
                                >
                                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Store className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className={`flex-1 overflow-hidden ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tienda Activa</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                                                {activeStore?.name || 'Vista Global'}
                                            </span>
                                            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Groups */}
                                <nav className="space-y-8 flex-1 overflow-y-auto no-scrollbar py-2">
                                    {filteredMenuGroups.map((group, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <p className={`text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
                                                {group.label}
                                            </p>
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
                                                            <span className={`text-sm ml-3 text-medium ${isSidebarCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>
                                                            {isActive && (
                                                                <div className={`absolute w-1 h-6 bg-blue-600 ${isSidebarCollapsed ? 'md:right-0 md:rounded-l-full left-0 rounded-r-full' : 'left-0 rounded-r-full'}`} />
                                                            )}
                                                            {isSidebarCollapsed && (
                                                                <span className="hidden md:absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity shadow-xl">
                                                                    {item.name}
                                                                </span>
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
                                ${isSidebarCollapsed ? 'md:p-3 md:justify-center p-3 space-x-3' : 'p-3 space-x-3'}`}
                                >
                                    <Plus className="w-5 h-5 flex-shrink-0" />
                                    <span className={`text-sm font-bold ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Crear Tienda</span>
                                </button>

                                <button
                                    onClick={() => setIsOptionsOpen(true)}
                                    className={`w-full flex items-center rounded-xl text-gray-400 hover:text-blue-500 transition-all
                                ${isSidebarCollapsed ? 'md:p-3 md:justify-center p-3 space-x-3' : 'p-3 space-x-3'}`}
                                >
                                    <Settings className="w-5 h-5 flex-shrink-0" />
                                    <span className={`text-sm font-bold ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Configuración</span>
                                </button>
                            </div>
                        </aside>

                        {/* Main Content Component */}
                        <div className={`flex-1 flex flex-col transition-all duration-500 w-full ${location.pathname === '/sales' ? 'md:pl-0' : (isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64')}`}>
                            {/* Top Header - Streamlined (Workspace Header) */}
                            <header className="no-print h-16 flex items-center justify-between px-4 md:px-8 bg-white/50 dark:bg-dark-bg/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">

                                {/* Left - Workspace / Breadcrumbs */}
                                <div className="flex items-center space-x-2 md:space-x-4">
                                    <button
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-blue-500"
                                        onClick={() => setIsMobileMenuOpen(true)}
                                    >
                                        <Menu className="w-5 h-5" />
                                    </button>
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full hidden sm:block" />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                        {location.pathname === '/sales' ? 'Punto de Venta' : 'Panel Central'}
                                    </span>
                                </div>

                                {/* Center - Global Actions */}
                                <div className="flex-1" />

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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MainLayout;
