import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Store, Package, Tag, Activity, ArrowRight, Star } from 'lucide-react';

const Hero = ({ companyName, slogan }) => (
    <div className="relative pt-10 pb-2 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center space-x-2 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 border border-orange-500/30">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Sistema de Gestión Web3</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-pulse">{companyName || 'Magic Store'}</span>
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
            {slogan || 'Gestiona tu negocio de forma inteligente.'}
        </p>

        <button className="bg-orange-600 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold hover:bg-orange-700 dark:hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-4 h-4" />
        </button>
    </div>
);

const Card = ({ title, icon, path, tagline }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(path)}
            className="group relative bg-white dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl p-1 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer border border-gray-200 dark:border-white/5 hover:border-dark-accent/30"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative rounded-xl p-6 h-full flex flex-col items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(icon, { className: "w-8 h-8 text-gray-700 dark:text-white group-hover:text-dark-accent transition-colors" })}
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-dark-accent transition-colors">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tagline}</p>
                </div>

                <div className="mt-4 w-full flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-dark-accent group-hover:text-black transition-colors text-gray-600 dark:text-white">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [config, setConfig] = useState({ companyName: 'Magic Store', slogan: 'Bienvenido', backgroundUrl: null });

    useEffect(() => {
        fetch('http://localhost:3001/api/setup/status')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setConfig(data.config);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const bgUrl = config.backgroundUrl || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <div className="w-full max-w-[1600px] mx-auto relative">
            {/* First Fold Container */}
            <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative px-4 md:px-8">
                {/* Background Image injected here */}
                <div
                    className="absolute top-0 left-[-50vw] right-[-50vw] bottom-0 opacity-40 dark:opacity-60 bg-cover bg-center pointer-events-none mask-image-gradient mix-blend-multiply dark:mix-blend-screen transition-all duration-1000"
                    style={{ backgroundImage: `url('${bgUrl}')` }}
                ></div>
                <div className="absolute top-0 left-[-50vw] right-[-50vw] bottom-0 bg-gradient-to-b from-transparent via-white/40 to-white/90 dark:via-dark-bg/40 dark:to-dark-bg/90 pointer-events-none"></div>

                <div className="relative z-10 space-y-12 py-12">
                    <Hero companyName={config.companyName} slogan={config.slogan} />

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8">
                        <Card title="Ventas" icon={<TrendingUp />} path="/sales" tagline="Registro Diario" />
                        <Card title="Tiendas" icon={<Store />} path="/stores" tagline="Gestión Local" />
                        <Card title="Inventarios" icon={<Package />} path="/inventory" tagline="Stock Global" />
                        <Card title="Promo Codes" icon={<Tag />} path="/promo" tagline="Campañas" />
                        <Card title="Estado" icon={<Activity />} path="/stats" tagline="Métricas Web3" />
                    </div>
                </div>
            </div>

            {/* Second Fold - Analytics/Widgets */}
            <div className="px-4 md:px-8 pb-12 space-y-12 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {/* Weekly Summary */}
                    <div className="bg-white dark:bg-dark-card/50 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resumen Semanal</h3>
                            <div className="flex space-x-2">
                                <span className="w-3 h-3 rounded-full bg-dark-accent"></span>
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-end justify-between px-8 pb-8 opacity-50">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div key={i} className="w-8 bg-orange-200 dark:bg-dark-accent" style={{ height: `${h}%`, opacity: 0.1 + (i * 0.1) }}></div>
                                ))}
                            </div>
                            <span className="text-gray-400 dark:text-gray-500 relative z-10">Gráfico Interactivo</span>
                        </div>
                    </div>

                    {/* Featured Projects / Activities */}
                    <div className="bg-white dark:bg-dark-card/50 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/5">
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
