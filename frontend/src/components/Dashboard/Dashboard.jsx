import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sparkles as SparklesIcon, TrendingUp, Users as UsersIcon, Package, ShoppingCart, Layout, Store, Building2, Settings } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import StoreSelectionModal from './StoreSelectionModal';
import RecentActivity from './RecentActivity';

const Sparkles = () => {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newSparkle = {
                id: Date.now() + Math.random(),
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                x: (Math.random() - 0.5) * 100 + 'px',
                y: (Math.random() - 0.5) * 100 + 'px',
            };
            setSparkles(prev => [...prev.slice(-10), newSparkle]);
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {sparkles.map(s => (
                <div
                    key={s.id}
                    className="sparkle"
                    style={{
                        left: s.left,
                        top: s.top,
                        '--x': s.x,
                        '--y': s.y,
                        animation: 'sparkle-anim 1s ease-out forwards'
                    }}
                />
            ))}
        </>
    );
};

const IconMap = {
    ventas: TrendingUp,
    tiendas: Store,
    inventarios: Package,
    promo: Star,
    gear: Settings
};

const Card = ({ title, iconName, path, tagline }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (path === '/settings') {
            window.dispatchEvent(new Event('open-settings'));
        } else {
            navigate(path);
        }
    };

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-3 cursor-pointer border border-white/20 dark:border-white/5 hover:border-orange-500/50 shadow-2xl"
        >
            {/* Liquid Orange Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

            {/* Nano Sparkles */}
            {isHovered && <div className="absolute inset-0 overflow-hidden pointer-events-none"><Sparkles /></div>}

            <div className="relative p-8 h-full flex flex-col items-center justify-between z-10">
                <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-[32px] bg-white/5 dark:bg-white/5 flex items-center justify-center mb-4 lg:mb-6 
                    group-hover:scale-110 group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/10 transition-all duration-700 
                    shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/10 group-hover:border-orange-500/30`}>
                    <div className={`${isHovered ? 'animate-rotate-360-stop' : ''} transition-all duration-1000 filter drop-shadow-[0_10px_10px_rgba(234,88,12,0.2)]`}>
                        {IconMap[iconName] ? React.createElement(IconMap[iconName], {
                            className: `w-12 h-12 text-blue-600 dark:text-blue-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-500 ${isHovered ? 'animate-bounce' : ''}`
                        }) : <div className="w-12 h-12 bg-gray-200/20 animate-pulse rounded-lg" />}
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors duration-500 tracking-tight">{title}</h3>
                    <p className="text-[10px] font-bold text-gray-500/80 dark:text-gray-400 uppercase tracking-[0.2em]">{tagline}</p>
                </div>

                <div className="mt-4 lg:mt-8 w-full flex justify-center">
                    <div className="px-6 py-2 rounded-full bg-white/10 border border-white/20 flex items-center space-x-3 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-500 shadow-lg">
                        <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Entrar</span>
                        <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { activeStore } = useStore();
    const [config, setConfig] = useState({
        companyName: 'MagicStore',
        slogan: 'Impulsando tu negocio',
        backgroundUrl: ''
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/status`)
            .then(res => res.json())
            .then(data => {
                if (data.config) setConfig(data.config);
            })
            .catch(err => console.error("Error fetching config", err));
    }, []);

    const bgUrl = config.backgroundUrl && config.backgroundUrl !== ''
        ? (config.backgroundUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.backgroundUrl}` : config.backgroundUrl)
        : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <div className="w-full relative min-h-screen">
            {/* Scrollable Content */}
            <div className="relative z-10">

                {/* First Fold - Hero Section */}
                <div className="relative min-h-[50vh] lg:min-h-[65vh] flex flex-col justify-start overflow-hidden pt-12 pb-16 lg:pt-24 lg:pb-32">
                    {/* Hero Content */}
                    <div className="container mx-auto px-4 md:px-8 text-center space-y-6 lg:space-y-8">
                        <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 animate-in fade-in slide-in-from-top duration-1000 backdrop-blur-md">
                            <SparklesIcon className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Panel de Control Inteligente</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                                <span className="text-gray-900 dark:text-white drop-shadow-sm">
                                    Bienvenido a <br />
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
                                        {config.companyName || 'MagicStore'}
                                    </span>
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 max-w-2xl mx-auto italic drop-shadow-sm">
                                {activeStore === 'empresa' ? (
                                    <span className="flex items-center justify-center space-x-2 text-blue-500 font-black uppercase tracking-[0.3em]">
                                        <Building2 className="w-6 h-6" />
                                        <span>Gestión Global Corporativa</span>
                                    </span>
                                ) : activeStore ? (
                                    <span className="flex items-center justify-center space-x-2 text-blue-500 font-black uppercase tracking-[0.2em]">
                                        <Store className="w-6 h-6" />
                                        <span>{activeStore.name} • {activeStore.location}</span>
                                    </span>
                                ) : (
                                    config.slogan || 'Potenciando cada rincón de tu empresa'
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Grid */}
                <div className="container mx-auto px-4 md:px-8 -mt-16 lg:-mt-24 pb-12 lg:pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                        <Card title="Ventas" iconName="ventas" path="/sales" tagline="Flujo de Caja" />
                        <Card title="Sucursales" iconName="tiendas" path="/stores" tagline="Locales" />
                        <Card title="Inventarios" iconName="inventarios" path="/inventory" tagline="Existencias" />
                        <Card title="Promo Codes" iconName="promo" path="/promo" tagline="Marketing" />
                        <Card title="Configuración" iconName="gear" path="/settings" tagline="Ajustes" />
                    </div>

                    {/* Analytics Section */}
                    <div className="mt-16 flex flex-col gap-8">
                        {/* Recent Activity (Full Width) */}
                        <div className="w-full">
                            <RecentActivity />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
