import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, Search, Settings } from 'lucide-react';

import OptionsMenu from '../Options/OptionsMenu';

const MainLayout = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [config, setConfig] = useState({ companyName: 'MagicStore', logoUrl: null, backgroundUrl: null });
    const location = useLocation();

    useEffect(() => {
        fetch('http://localhost:3001/api/setup/status')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setConfig(data.config);
                    // Apply theme preference from DB if needed
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

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        const newMode = newIsDark ? 'dark' : 'light';
        if (newIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

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

    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Tiendas', path: '/stores' },
        { name: 'Ventas', path: '/sales' },
        { name: 'Inventarios', path: '/inventory' },
        { name: 'Usuarios', path: '/users' },
        { name: 'Memoria', path: '/memory' }
    ];

    return (
        <div className={`min-h-screen flex flex-col font-sans selection:bg-dark-accent selection:text-white ${isDark ? 'dark' : ''}`}>

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

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2 group">
                            {config.logoUrl ? (
                                <img src={`http://localhost:3001${config.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10" />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-red-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                    <span className="text-white font-bold text-lg">{config.companyName.charAt(0)}</span>
                                </div>
                            )}
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent hidden sm:block">
                                {config.companyName}
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                                        ? 'text-dark-accent bg-dark-accent/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Interface */}
                    <div className="flex items-center space-x-4">
                        {/* Search Bar (Hidden on small mobile) */}
                        <div className="hidden lg:flex items-center bg-gray-100 dark:bg-dark-card border border-transparent dark:border-dark-border rounded-full px-4 py-1.5 focus-within:border-dark-accent transition-colors">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>

                        {/* Balance Pill */}
                        <div className="hidden sm:flex items-center bg-dark-card border border-dark-border rounded-full px-3 py-1.5 space-x-2">
                            <div className="w-2 h-2 rounded-full bg-dark-accent animate-pulse"></div>
                            <span className="text-xs font-mono text-gray-300">$ 1,250.00</span>
                        </div>

                        {/* Options Button (Replaces Theme Toggle) */}
                        <button
                            onClick={() => setIsOptionsOpen(true)}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card transition-colors group relative"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-500 dark:text-gray-400"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg">
                        <div className="px-4 py-2 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path
                                        ? 'bg-purple-50 dark:bg-white/5 text-purple-600 dark:text-dark-accent'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 bg-light-bg dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
