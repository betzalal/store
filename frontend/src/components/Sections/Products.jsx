import React, { useState, useEffect } from 'react';
import {
    Package, TrendingUp, AlertTriangle, DollarSign,
    Plus, Calendar, Search, Filter, ChevronDown, ChevronUp,
    ArrowUpRight, ArrowDownRight, Box, Layers
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const KPICard = ({ title, value, growth, icon: Icon, color, prefix = '' }) => (
    <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-bl-[80px] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

        <div className="flex justify-between items-start z-10">
            <div className={`p-2.5 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-5 h-5" />
            </div>
            {growth !== undefined && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(growth).toFixed(1)}%</span>
                </div>
            )}
        </div>

        <div className="z-10">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{title}</h3>
            <div className="flex items-baseline space-x-1">
                <span className="text-gray-400 font-bold text-sm">{prefix}</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
            </div>
        </div>
    </div>
);


const Products = () => {
    const { activeStore } = useStore();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

    // Bundling State
    const [inventory, setInventory] = useState([]);
    const [bundleName, setBundleName] = useState('');
    const [bundlePrice, setBundlePrice] = useState('');
    const [selectedComponents, setSelectedComponents] = useState([]);

    const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    // Inventory Table State
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
        fetchInventory();
    }, [selectedMonth, selectedYear, activeStore]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredInventory = inventory
        .filter(item => {
            const term = searchTerm.toLowerCase();
            return item.name.toLowerCase().includes(term) ||
                (item.code && item.code.toLowerCase().includes(term));
        })
        .sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/dashboard-stats?month=${selectedMonth}&year=${selectedYear}&storeId=${activeStore?.id || ''}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/analytics?month=${selectedMonth}&year=${selectedYear}&storeId=${activeStore?.id || ''}`);
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory?storeId=${activeStore?.id || ''}`);
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const handleAddComponent = (product) => {
        const existing = selectedComponents.find(c => c.id === product.id);
        if (existing) return;
        setSelectedComponents([...selectedComponents, { ...product, quantity: 1 }]);
    };

    const updateComponentQuantity = (id, qty) => {
        setSelectedComponents(selectedComponents.map(c =>
            c.id === id ? { ...c, quantity: parseFloat(qty) } : c
        ));
    };

    const removeComponent = (id) => {
        setSelectedComponents(selectedComponents.filter(c => c.id !== id));
    };

    const handleCreateBundle = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/bundle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: bundleName,
                    finalPrice: bundlePrice,
                    components: selectedComponents.map(c => ({ id: c.id, quantity: c.quantity })),
                    storeId: activeStore?.id || (selectedComponents.length > 0 ? selectedComponents[0].storeId : 1)
                })
            });
            if (!res.ok) {
                const errText = await res.text();
                alert("Error al agrupar: " + errText);
                return;
            }
            if (res.ok) {
                setIsBundleModalOpen(false);
                setBundleName('');
                setBundlePrice('');
                setSelectedComponents([]);
                fetchStats();
                fetchAnalytics();
                alert('Producto creado exitosamente');
            }
        } catch (error) {
            console.error("Error creating bundle:", error);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-transparent p-6 space-y-6 no-scrollbar transition-colors duration-300">
            {/* Level 1: Header - Compact */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Productos</h1>
                    <p className="text-sm text-gray-500 font-medium">Gestión y análisis de inventario</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative group">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="appearance-none flex items-center px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl hover:border-blue-500 text-gray-900 dark:text-white font-bold text-xs cursor-pointer outline-none shadow-sm transition-colors pr-8"
                        >
                            {months.map((m, idx) => (
                                <option key={idx} value={idx}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-[calc(50%-6px)] w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative group">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="appearance-none flex items-center px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl hover:border-blue-500 text-gray-900 dark:text-white font-bold text-xs cursor-pointer outline-none shadow-sm transition-colors pr-8"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-[calc(50%-6px)] w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setIsBundleModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider text-[10px]">Unir Items</span>
                    </button>
                </div>
            </div>

            {/* Level A: KPI Cards - Compact */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Comprado"
                        value={stats.purchased.value}
                        growth={stats.purchased.growth}
                        icon={Package}
                        color="blue"
                        prefix="$"
                    />
                    <KPICard
                        title="Órdenes Hechas"
                        value={stats.orders.value}
                        growth={stats.orders.growth}
                        icon={Layers}
                        color="indigo"
                    />
                    <KPICard
                        title="Bajo Stock"
                        value={stats.lowStock.value}
                        growth={stats.lowStock.growth}
                        icon={AlertTriangle}
                        color="orange"
                    />
                    <KPICard
                        title="Ganancia Total"
                        value={stats.revenue.profit}
                        growth={stats.revenue.growth}
                        icon={TrendingUp}
                        color="emerald"
                        prefix="$"
                    />
                </div>
            )}

            {/* Level B: Analytics Row - Compact & Responsive */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-64">
                    {/* Column 1: Top Selling (Vertical Bar) */}
                    <div className="lg:col-span-4 bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col justify-between transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-none">Mejor Vendido</h3>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Top Products</div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-1 flex items-end space-x-3 px-2">
                            <div className="flex flex-col justify-between h-full text-[10px] font-bold text-gray-300 pb-6">
                                <span>{Math.max(...analytics.topProducts.map(p => p.quantity), 10)}</span>
                                <span>{Math.max(...analytics.topProducts.map(p => p.quantity), 10) / 2}</span>
                                <span>0</span>
                            </div>

                            {analytics.topProducts.length === 0 ? (
                                <div className="w-full flex items-center justify-center text-xs text-gray-400 italic">No Data</div>
                            ) : (
                                analytics.topProducts.slice(0, 5).map((p, idx) => {
                                    const max = Math.max(...analytics.topProducts.map(x => x.quantity), 1);
                                    const height = (p.quantity / max) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                            <div
                                                style={{ height: `${height}%` }}
                                                className={`w-full rounded-t-lg rounded-b-sm transition-all duration-500 group-hover:scale-y-105 ${idx === 0 ? 'bg-blue-600' : 'bg-blue-100 dark:bg-white/10 group-hover:bg-blue-400'}`}
                                            />
                                            <span className="text-[9px] font-bold text-gray-400 mt-2 truncate w-full text-center rotate-[-45deg] origin-top-left translate-y-2">
                                                {p.name.split(' ')[0]}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Column 2: Orders Analytics (Horizontal) */}
                    <div className="lg:col-span-5 bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-none">Analítica</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Estado de Órdenes</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {Object.entries(analytics.orderStats).slice(0, 4).map(([key, value], idx) => {
                                const max = Math.max(...Object.values(analytics.orderStats), 1);
                                const width = (value / max) * 100;
                                const colors = {
                                    Ventas: 'bg-emerald-500',
                                    Ordenes: 'bg-blue-500',
                                    Cancelados: 'bg-red-500',
                                    Retornados: 'bg-orange-500'
                                };
                                return (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">{key}</span>
                                            <span className="text-gray-900 dark:text-white">{value}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${width}%` }}
                                                className={`h-full ${colors[key]} rounded-full shadow-sm transition-all duration-700`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Column 3: Major Buyers (Clean Channel Performance Style) */}
                    <div className="lg:col-span-3 bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col items-center justify-between transition-colors">
                        <div className="w-full text-left">
                            <h3 className="text-base font-black text-gray-900 dark:text-white leading-none">Compradores</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Top Clientes</p>
                        </div>

                        <div className="relative w-40 h-20 mt-2">
                            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                {/* Background Arc */}
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-gray-100 dark:text-white/5" />

                                {/* Data Arcs */}
                                {analytics.topBuyers.map((b, i) => {
                                    const total = analytics.topBuyers.reduce((acc, x) => acc + x.orders, 0);
                                    let offset = 0;
                                    for (let j = 0; j < i; j++) offset += analytics.topBuyers[j].orders;

                                    // Calculate dash array based on percentage of semi-circle length (approx 126)
                                    // Total length of semi-circle arc with r=40 is PI*r = ~125.6
                                    const arcLength = 125.6;
                                    const gap = 2; // Gap between segments
                                    const value = (b.orders / total) * arcLength;
                                    const dashArray = `${Math.max(0, value - gap)} ${arcLength * 2}`;
                                    const dashOffset = -((offset / total) * arcLength) + gap / 2; // Adjust for gap centering roughly? 
                                    // Actually simpler: just stroke-dashoffset based on previous sum.

                                    // Let's rely on standard dashoffset logic for simplicity but add gap
                                    const segmentLength = (b.orders / total) * 125.6;
                                    const startOffset = (offset / total) * 125.6;

                                    return (
                                        <path
                                            key={i}
                                            d="M 10 50 A 40 40 0 0 1 90 50"
                                            fill="none"
                                            stroke={b.color}
                                            strokeWidth="12"
                                            strokeDasharray={`${segmentLength - 2} 200`} // -2 for visual gap
                                            strokeDashoffset={-startOffset}
                                            strokeLinecap="round" // Rounded ends for style
                                            className="transition-all duration-1000 hover:opacity-80"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center translate-y-2">
                                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                    {analytics.topBuyers.reduce((acc, x) => acc + x.orders, 0)}
                                </p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</p>
                            </div>
                        </div>

                        <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
                            {analytics.topBuyers.slice(0, 3).map((b, idx) => (
                                <div key={idx} className="flex items-center space-x-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                                    <span className="text-[9px] font-bold text-gray-500 truncate max-w-[60px]">{b.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Level C: Inventory Table (Replaced Activities) */}
            <div className="flex-1 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden flex flex-col min-h-0 transition-colors">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none">Inventario General</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Gestión de Productos</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar código o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-transparent hover:bg-white hover:border-blue-500/30 focus:bg-white focus:border-blue-500 rounded-xl text-xs font-bold outline-none w-64 transition-all text-gray-900 dark:text-white"
                            />
                        </div>
                        <button className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-white border border-transparent hover:border-gray-100 dark:hover:border-white/10 rounded-xl transition-all">
                            <Filter className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-dark-card z-10">
                                <th
                                    className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => handleSort('code')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Código</span>
                                        {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Producto</span>
                                        {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Categoría</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Stock</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Precio</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-xs text-gray-400 italic">No se encontraron productos</td>
                                </tr>
                            ) : (
                                filteredInventory.map((item, idx) => {
                                    const status = item.stock === 0
                                        ? { text: 'Agotado', bg: 'bg-red-500', color: 'text-red-600 border-red-100 bg-red-50' }
                                        : item.stock <= 10
                                            ? { text: 'Bajo', bg: 'bg-amber-500', color: 'text-amber-600 border-amber-100 bg-amber-50' }
                                            : { text: 'OK', bg: 'bg-emerald-500', color: 'text-emerald-600 border-emerald-100 bg-emerald-50' };

                                    return (
                                        <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <span className="font-mono text-[10px] font-bold text-gray-400">{item.code}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Box className="w-4 h-4 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white text-xs">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">{item.category}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                                                    {item.stock} <span className="text-[9px] text-gray-400 font-normal">{item.unit}</span>
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">${item.price}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border ${status.color}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{status.text}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bundle Modal */}
            {isBundleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-dark-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Crear Producto Final</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Agrupa ítems del inventario</p>
                            </div>
                            <button onClick={() => setIsBundleModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Component Selection */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Search className="w-3.5 h-3.5 text-blue-500" />
                                    Seleccionar Componentes
                                </h3>

                                <div className="space-y-2 h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {inventory.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleAddComponent(item)}
                                            className="group flex items-center p-2.5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 cursor-pointer transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center mr-3">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Box className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{item.code}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-4 h-4 text-blue-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Configuration */}
                            <div className="space-y-5 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Nombre del Producto Final</label>
                                    <input
                                        value={bundleName}
                                        onChange={(e) => setBundleName(e.target.value)}
                                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Ej: Pack Gamer Básico"
                                    />
                                    <p className="mt-1.5 text-[10px] text-blue-500 font-mono">Código: S-{bundleName.toUpperCase().replace(/\s+/g, '-') || '...'}</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Componentes Seleccionados</label>
                                    {selectedComponents.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-xs italic border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                            Sin selección
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {selectedComponents.map((comp, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white dark:bg-black/20 p-2.5 rounded-xl border border-gray-200 dark:border-white/10">
                                                    <span className="text-xs font-bold truncate flex-1 text-gray-700 dark:text-gray-300">{comp.name}</span>
                                                    <div className="flex items-center space-x-2 ml-2">
                                                        <input
                                                            type="number"
                                                            value={comp.quantity}
                                                            onChange={(e) => updateComponentQuantity(comp.id, e.target.value)}
                                                            className="w-12 bg-transparent text-right font-mono text-xs border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                                        />
                                                        <span className="text-[10px] text-gray-400">{comp.unit}</span>
                                                        <button onClick={() => removeComponent(comp.id)} className="text-red-400 hover:text-red-500">
                                                            <Plus className="w-3 h-3 rotate-45" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Precio de Venta</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={bundlePrice}
                                            onChange={(e) => setBundlePrice(e.target.value)}
                                            className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 font-black text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsBundleModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateBundle}
                                disabled={!bundleName || !bundlePrice || selectedComponents.length === 0}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                Crear Producto
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Products;
