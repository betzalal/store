import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sparkles as SparklesIcon, TrendingUp, Users as UsersIcon, Package, ShoppingCart, Layout, Store, Building2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import StoreSelectionModal from './StoreSelectionModal';

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

const RemoteIcon = ({ name, isHovered }) => {
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        fetch(`/icons/${name}.svg`)
            .then(res => res.text())
            .then(data => {
                // Resize for the dashboard container
                const stylized = data
                    .replace('<svg ', '<svg class="w-12 h-12" ');
                setSvgContent(stylized);
            })
            .catch(err => console.error(`Failed to load icon: ${name}`, err));
    }, [name]);

    if (!svgContent) return <div className="w-12 h-12 bg-gray-200/20 animate-pulse rounded-lg" />;

    return (
        <div
            className={`text-blue-600 dark:text-blue-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-500 ${isHovered ? 'animate-draw' : ''}`}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

const Card = ({ title, iconName, path, tagline }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={() => navigate(path)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-3 cursor-pointer border border-white/20 dark:border-white/5 hover:border-orange-500/50 shadow-2xl"
        >
            {/* Liquid Orange Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

            {/* Nano Sparkles */}
            {isHovered && <div className="absolute inset-0 overflow-hidden pointer-events-none"><Sparkles /></div>}

            <div className="relative p-8 h-full flex flex-col items-center justify-between z-10">
                <div className={`w-28 h-28 rounded-[40px] bg-white/5 dark:bg-white/5 flex items-center justify-center mb-6 
                    group-hover:scale-110 group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/10 transition-all duration-700 
                    shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/10 group-hover:border-orange-500/30`}>
                    <div className={`${isHovered ? 'animate-rotate-360-stop' : ''} transition-all duration-1000 filter drop-shadow-[0_10px_10px_rgba(234,88,12,0.2)]`}>
                        <RemoteIcon name={iconName} isHovered={isHovered} />
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors duration-500 tracking-tight">{title}</h3>
                    <p className="text-[10px] font-bold text-gray-500/80 dark:text-gray-400 uppercase tracking-[0.2em]">{tagline}</p>
                </div>

                <div className="mt-8 w-full flex justify-center">
                    <div className="px-6 py-2 rounded-full bg-white/10 border border-white/20 flex items-center space-x-3 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-500 shadow-lg">
                        <span className="text-[11px] font-black uppercase tracking-widest">Entrar</span>
                        <ArrowRight className="w-4 h-4" />
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
        fetch('http://localhost:3001/api/setup/status')
            .then(res => res.json())
            .then(data => {
                if (data.config) setConfig(data.config);
            })
            .catch(err => console.error("Error fetching config", err));
    }, []);

    const bgUrl = config.backgroundUrl && config.backgroundUrl !== ''
        ? config.backgroundUrl
        : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <div className="w-full relative min-h-screen bg-light-bg dark:bg-dark-bg">

            {/* First Fold - Hero Section */}
            <div className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 animate-ken-burns"
                        style={{ backgroundImage: `url('${bgUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-bg/50 to-light-bg dark:via-dark-bg/50 dark:to-dark-bg" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-8 py-20 text-center space-y-8">
                    <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 animate-in fade-in slide-in-from-top duration-1000">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Panel de Control Inteligente</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                            <span className="text-gray-900 dark:text-white">
                                Bienvenido a <br />
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
                                    {config.companyName || 'MagicStore'}
                                </span>
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto italic">
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
            <div className="container mx-auto px-8 -mt-20 relative z-20 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card title="Ventas" iconName="ventas" path="/sales" tagline="Flujo de Caja" />
                    <Card title="Sucursales" iconName="tiendas" path="/stores" tagline="Locales" />
                    <Card title="Inventarios" iconName="inventarios" path="/inventory" tagline="Existencias" />
                    <Card title="Promo Codes" iconName="promo" path="/promo" tagline="Marketing" />
                    <Card title="Configuración" iconName="gear" path="/settings" tagline="Ajustes" />
                </div>

                {/* Analytics Section */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Weekly Summary */}
                    <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-[32px] p-10 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Rendimiento Semanal</h3>
                                <p className="text-sm text-gray-400 font-medium">Análisis de ingresos y egresos</p>
                            </div>
                            <div className="flex space-x-3">
                                <span className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/10"></span>
                                <span className="w-3 h-3 rounded-full bg-indigo-400 ring-4 ring-indigo-400/10"></span>
                            </div>
                        </div>
                        <div className="h-72 flex items-center justify-center bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-end justify-between px-10 pb-10 opacity-30">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div key={i} className="w-12 bg-blue-500 rounded-t-xl" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }}></div>
                                ))}
                            </div>
                            <span className="text-blue-500 font-black uppercase tracking-widest text-xs relative z-10 glass-card px-4 py-2 rounded-full border border-blue-500/20">Gráfico Desbloqueado</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-dark-card rounded-[32px] p-10 border border-gray-100 dark:border-white/5 shadow-xl flex flex-col">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Actividad Reciente</h3>
                        <div className="space-y-6 flex-1">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <ArrowRight className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-gray-900 dark:text-white font-bold group-hover:text-blue-500 transition-colors truncate">Update {i + 1}</h4>
                                        <p className="text-gray-400 text-xs">Sistema activado • 2h ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-8 w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                            Ver Historial Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
