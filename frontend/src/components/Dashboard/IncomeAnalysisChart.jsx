import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Store, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const timeFilters = ['Día', 'Semana', 'Mes', 'Año'];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl z-50">
                <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-300 font-medium">{entry.name}:</span>
                        <span className="text-white font-bold">Bs {entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const IncomeAnalysisChart = () => {
    const { isEmpresaMode } = useStore();
    const [activeFilter, setActiveFilter] = useState('Año');
    const [activeView, setActiveView] = useState('Ingresos');

    // Data State
    const [chartData, setChartData] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(null); // null means 'All'
    const [loading, setLoading] = useState(true);

    const scrollContainerRef = useRef(null);

    // Fetch Stores on Mount
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(err => console.error("Error fetching stores:", err));
    }, []);

    // Fetch Sales Data when Store or Filter changes
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedStoreId) params.append('storeId', selectedStoreId);

        // Map filter to backend groupBy param
        const filterMap = {
            'Día': 'day',
            'Semana': 'week',
            'Mes': 'month',
            'Año': 'year'
        };
        params.append('groupBy', filterMap[activeFilter] || 'month');

        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setChartData(data.stats.chartData || []);
                    setAvailableYears(data.stats.availableYears || []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching sales stats:", err);
                setLoading(false);
            });
    }, [selectedStoreId, activeFilter]);


    const scrollStores = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Colors for different years/series
    const yearColors = {
        0: 'blue',      // 1st
        1: 'emerald',   // 2nd
        2: 'orange',    // 3rd
        3: 'pink',      // 4th
        4: 'purple'     // 5th
    };

    const getYearColor = (index) => {
        const colorName = yearColors[index % 5];
        const colorMap = {
            blue: '#2563eb',
            emerald: '#10b981',
            orange: '#f97316',
            pink: '#ec4899',
            purple: '#a855f7'
        };
        return colorMap[colorName];
    };

    const renderChartAreas = () => {
        const isNeto = activeView === 'Neto';

        if (activeFilter === 'Año') {
            // Year View: Single Area for Revenue
            return (
                <>
                    <Area type="monotone" dataKey={isNeto ? "netValue" : "value"} stroke={isNeto ? "#10b981" : "#2563eb"} strokeWidth={3} fillOpacity={1} fill={isNeto ? "url(#colorNetRevenue)" : "url(#colorRevenue)"} name={isNeto ? "Neto" : "Ingresos"} />
                </>
            );
        } else if (activeFilter === 'Mes') {
            // Month View: Multiple Years (y202X or netY202X)
            return availableYears.map((year, index) => {
                const color = getYearColor(index);
                const dataKey = isNeto ? `netY${year}` : `y${year}`;
                return (
                    <Area
                        key={year}
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#color${year})`}
                        name={year.toString()}
                    />
                );
            });
        } else if (activeFilter === 'Semana') {
            // Week View: This Week vs Last Week
            return (
                <>
                    <Area type="monotone" dataKey={isNeto ? "netThisWeek" : "thisWeek"} stroke="#2563eb" strokeWidth={3} fill="none" name="Esta Semana" />
                    <Area type="monotone" dataKey={isNeto ? "netLastWeek" : "lastWeek"} stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Semana Pasada" />
                </>
            );
        } else if (activeFilter === 'Día') {
            // Day View: Today vs Yesterday
            return (
                <>
                    <Area type="monotone" dataKey={isNeto ? "netToday" : "today"} stroke="#2563eb" strokeWidth={3} fill="none" name="Hoy" />
                    <Area type="monotone" dataKey={isNeto ? "netYesterday" : "yesterday"} stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Ayer" />
                </>
            );
        }
        return null; // Should not happen
    };

    const renderLegend = () => {
        if (activeFilter === 'Mes') {
            return availableYears.map((year, index) => {
                const bgClass = {
                    blue: 'bg-blue-600',
                    emerald: 'bg-emerald-500',
                    orange: 'bg-orange-500',
                    pink: 'bg-pink-500',
                    purple: 'bg-purple-500'
                }[yearColors[index % 5]];

                return (
                    <div key={year} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${bgClass}`} />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{year}</span>
                    </div>
                );
            });
        } else if (activeFilter === 'Año') {
            return (
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${activeView === 'Neto' ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Anual</span>
                </div>
            );
        } else {
            return (
                <>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {activeFilter === 'Semana' ? (activeView === 'Neto' ? 'Neto Esta Sem.' : 'Esta Semana') : (activeView === 'Neto' ? 'Neto Hoy' : 'Hoy')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {activeFilter === 'Semana' ? (activeView === 'Neto' ? 'Neto Sem. Pasada' : 'Semana Pasada') : (activeView === 'Neto' ? 'Neto Ayer' : 'Ayer')}
                        </span>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-[32px] p-8 lg:p-10 border border-gray-100 dark:border-white/5 shadow-xl flex flex-col h-full relative overflow-hidden">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0 relative z-10">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Análisis de Ingresos</h3>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Comparativa histórica de rendimiento financiero</p>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveView('Ingresos')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'Ingresos'
                            ? 'bg-white dark:bg-blue-600 text-black dark:text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Ingresos
                    </button>
                    <button
                        onClick={() => setActiveView('Vendedor')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'Vendedor'
                            ? 'bg-white dark:bg-blue-600 text-black dark:text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Vendedor
                    </button>
                    <button
                        onClick={() => setActiveView('Neto')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'Neto'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Neto
                    </button>
                </div>
            </div>

            {/* Store Selector (Horizontal Scroll) */}
            <div className="relative mb-8 group">
                <div
                    ref={scrollContainerRef}
                    className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
                >
                    <button
                        onClick={() => setSelectedStoreId(null)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${selectedStoreId === null
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105'
                            : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-500/50'
                            }`}
                    >
                        <Store className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Todas las Tiendas</span>
                    </button>

                    {stores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => setSelectedStoreId(store.id)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${selectedStoreId === store.id
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105'
                                : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-500/50'
                                }`}
                        >
                            <span className="text-xs font-black uppercase tracking-wider">{store.name}</span>
                        </button>
                    ))}
                </div>

                {/* Scroll Indicators (Visible on hover if needed, or simple gradient) */}
                <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white dark:from-dark-card to-transparent pointer-events-none" />
            </div>

            {/* Layout Grid: Filters (Left) + Chart (Right) */}
            <div className="flex flex-col lg:flex-row flex-1 gap-8 relative">
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Left Controls: Time Filters & Legend */}
                <div className="flex flex-row lg:flex-col justify-between lg:justify-start lg:space-y-8 w-full lg:w-32 flex-shrink-0">

                    {/* Time Filters */}
                    <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-2xl flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                        {timeFilters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === filter
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Chart Legend */}
                    <div className="hidden lg:flex flex-col space-y-3 pl-2">
                        {renderLegend()}
                    </div>
                </div>

                {/* Chart Container */}
                <div className="flex-1 w-full min-h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                            <defs>
                                {activeFilter === 'Mes' && availableYears.map((year, index) => {
                                    const color = getYearColor(index);
                                    return (
                                        <linearGradient key={year} id={`color${year}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    );
                                })}
                                {activeFilter === 'Año' && (
                                    <>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorNetRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </>
                                )}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                                tickFormatter={(value) => `Bs ${value / 1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {renderChartAreas()}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Legend for Mobile (Below) */}
            <div className="lg:hidden flex justify-center space-x-4 mt-6 flex-wrap">
                {renderLegend()}
            </div>
        </div>
    );
};

export default IncomeAnalysisChart;
