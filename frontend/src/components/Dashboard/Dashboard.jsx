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
        companyName: 'Betza',
        slogan: 'Impulsando tu negocio',
        backgroundUrl: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/system/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error("Error fetching config", err));
    }, []);

    const bgUrl = config.backgroundUrl && config.backgroundUrl !== ''
        ? config.backgroundUrl
        : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <div className="w-full relative">
            <StoreSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* First Fold - Full Width Background */}
            <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden">
                {/* Background Image - Absolute Full Viewport Width */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 animate-ken-burns"
                        style={{ backgroundImage: `url('${bgUrl}')` }}
                    ></div>
                </div>

                {/* Overlays - Full Viewport Width */}
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 pointer-events-none"></div>

                {/* Centered Content Container */}
                <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 space-y-12 py-12">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 animate-in fade-in slide-in-from-top duration-1000">
                            <SparklesIcon className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Sistema de Gestión Web3</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 animate-pulse">
                                    {config.companyName || 'betza'}
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                {activeStore === 'empresa' ? (
                                    <span className="flex items-center justify-center space-x-2 text-orange-500 font-black uppercase tracking-[0.3em]">
                                        <Building2 className="w-6 h-6" />
                                        <span>Vista Empresa Global</span>
                                    </span>
                                ) : activeStore ? (
                                    <span className="flex items-center justify-center space-x-2 text-orange-500 font-black uppercase tracking-[0.3em]">
                                        <Store className="w-6 h-6" />
                                        <span>{activeStore.name}</span>
                                    </span>
                                ) : (
                                    config.slogan || 'betzalelando desde los 80s'
                                )}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative px-10 py-5 bg-white dark:bg-white text-black rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <span className="relative flex items-center space-x-3">
                                <span>{activeStore ? 'Cambiar Entorno' : 'Comenzar Ahora'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
                        <Card title="Ventas" iconName="ventas" path="/sales" tagline="Registro Diario" />
                        <Card title="Tiendas" iconName="tiendas" path="/stores" tagline="Gestión Local" />
                        <Card title="Inventarios" iconName="inventarios" path="/inventory" tagline="Stock Global" />
                        <Card title="Promo Codes" iconName="promo" path="/promo" tagline="Campañas" />
                        <Card title="Estado" iconName="estado" path="/stats" tagline="Métricas Web3" />
                    </div>
                </div>
            </div>

            {/* Second Fold - Analytics/Widgets */}
            <div className="px-4 md:px-8 pb-12 space-y-12 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {/* Weekly Summary */}
                    <div className="bg-white/5 dark:bg-black/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 dark:border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resumen Semanal</h3>
                            <div className="flex space-x-2">
                                <span className="w-3 h-3 rounded-full bg-dark-accent"></span>
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50/10 dark:bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-end justify-between px-8 pb-8 opacity-50">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div key={i} className="w-8 bg-orange-200 dark:bg-dark-accent" style={{ height: `${h}%`, opacity: 0.1 + (i * 0.1) }}></div>
                                ))}
                            </div>
                            <span className="text-gray-400 dark:text-gray-500 relative z-10">Gráfico Interactivo</span>
                        </div>
                    </div>

                    {/* Featured Projects / Activities */}
                    <div className="bg-white/5 dark:bg-black/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 dark:border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Featured Projects</h3>
                            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">🔥 HOT</span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mr-4 group-hover:scale-105 transition-transform"></div>
                                    <div className="flex-1">
                                        <h4 className="text-gray-900 dark:text-white font-bold group-hover:text-dark-accent transition-colors">Project Alpha {i + 1}</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">DeFi • +12.5%</p>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white text-sm hover:bg-gray-300 dark:hover:bg-white/20 hover:text-dark-accent transition-all">View</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
