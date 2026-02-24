import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
    Search, Filter, Plus, Box, AlertTriangle, CheckCircle2,
    History, ArrowUpRight, ArrowDownRight, TrendingUp,
    LayoutGrid, List, MoreVertical, X, ChevronDown,
    ChevronUp, Download, DollarSign, Store, Layers, Trash2, Edit2
} from 'lucide-react';
import OrderStock from './OrderStock';

const Inventory = () => {
    const { activeStore } = useStore();
    // Unified check: Global view is active if mode is 'empresa' OR store is null/undefined
    // const isGlobalView = isEmpresaMode || !activeStore || activeStore === 'empresa'; // REMOVED


    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [activeTab, setActiveTab] = useState('Inventory');
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [historyPopup, setHistoryPopup] = useState(null);
    const [adjustModal, setAdjustModal] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const fileInputRef = useRef(null);
    const [uploadingFor, setUploadingFor] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { product: Product, isGlobal: boolean }
    const [transferModal, setTransferModal] = useState(null); // { product: Product }
    const [editModal, setEditModal] = useState(null); // { product: Product }
    const [selectedTransferProductId, setSelectedTransferProductId] = useState("");

    const handleImageUpload = async (e, productId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/${productId}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };


    useEffect(() => {
        fetchData();
    }, [activeStore, activeTab, selectedStoreId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory`;
            if (activeTab === 'Inventario Tiendas' && selectedStoreId) {
                url += `?storeId=${selectedStoreId}`;
            } else if (activeStore) {
                url += `?storeId=${activeStore.id}`;
            }

            const [resProducts, resStores] = await Promise.all([
                fetch(url),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
            ]);

            const dataProducts = await resProducts.json();
            const dataStores = await resStores.json();

            // Safety Checks
            setProducts(Array.isArray(dataProducts) ? dataProducts : []);
            setStores(Array.isArray(dataStores) ? dataStores : []);

            if (!Array.isArray(dataProducts)) {
                console.error("API Error: Products is not an array", dataProducts);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setProducts([]);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            if (deleteConfirm.isGlobal) {
                const productsToDelete = products.filter(p => p.code === deleteConfirm.product.code);
                await Promise.all(productsToDelete.map(p =>
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/${p.id}`, { method: 'DELETE' })
                ));
            } else {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/${deleteConfirm.product.id}`, { method: 'DELETE' });
            }

            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- GLOBAL VIEW LOGIC ---
    // REMOVED

    // --- FILTERING LOGIC ---
    const getVisibleProducts = () => {
        let sourceData = [];

        if (activeTab === 'Inventory') {
            sourceData = products;
        } else if (activeTab === 'Inventario Tiendas') {
            if (selectedStoreId) {
                sourceData = products.filter(p => p.storeId === selectedStoreId);
            } else {
                // If no specific store selected in this tab, show nothing or all?
                // For now, let's just return empty until store is selected
                return [];
            }
        } else {
            return Array.isArray(products) ? products : [];
        }

        // Ensure sourceData is array
        if (!Array.isArray(sourceData)) {
            console.warn("sourceData is not array", sourceData);
            return [];
        }

        return sourceData
            .filter(p => {
                if (!p) return false;
                const searchStr = searchTerm.toLowerCase();
                const matchesSearch = (p.name?.toLowerCase().includes(searchStr) ||
                    p.code?.toLowerCase().includes(searchStr));
                const matchesCategory = filterCategory === 'Todas' || p.category === filterCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
    };

    const visibleProducts = getVisibleProducts();

    const currentStats = useMemo(() => {
        const data = visibleProducts;

        let assets = 0;
        let ok = 0, low = 0, empty = 0;

        if (Array.isArray(data)) {
            data.forEach(p => {
                if (!p) return;
                const stock = p.totalStock !== undefined ? p.totalStock : p.stock;
                assets += (stock || 0) * (p.price || 0);
                if (stock === 0) empty++;
                else if (stock <= 10) low++;
                else ok++;
            });
        }
        return { totalAssets: assets, stockStatus: { ok, low, empty }, totalCount: data?.length || 0 };
    }, [visibleProducts]);


    const renderStoreList = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {stores.map(store => (
                <button
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] hover:shadow-xl hover:scale-105 transition-all group gap-4 relative overflow-hidden"
                >
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Store className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{store.name}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-1">{store.location || 'Sin ubicación'}</p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <div className="absolute top-6 right-6 px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-[10px] font-black text-gray-500">
                        {products.filter(p => p.storeId === store.id).length} Items
                    </div>
                </button>
            ))}
        </div>
    );

    return (
        // FIX: Removed min-h-full and added h-full overflow-y-auto to fix double scrollbars if parent has fixed height
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 bg-transparent h-full overflow-y-auto custom-scrollbar">

            {/* Print Only Title */}
            <div className="hidden print:block mb-8 border-b-2 border-blue-600 pb-4">
                <h1 className="text-2xl font-black uppercase text-gray-900 tracking-widest">Reporte de Inventario</h1>
                <p className="text-xs font-bold text-gray-500">{new Date().toLocaleDateString()} - {activeStore?.name || 'Empresa Global'}</p>
            </div>

            {/* Header / Stats Section */}
            <div className="no-print grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Card */}
                <div className="lg:col-span-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center space-x-6 flex-1">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Asset Value</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                ${currentStats.totalAssets.toLocaleString('en-US')}
                            </h3>
                        </div>
                    </div>

                    <div className="h-20 w-px bg-gray-100 dark:bg-white/10 hidden md:block" />

                    <div className="flex-1 w-full max-w-lg">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-gray-900 dark:text-white">{currentStats.totalCount}</span>
                                <span className="text-sm font-bold text-gray-400">products</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full flex overflow-hidden mb-4">
                            <div style={{ width: `${currentStats.totalCount > 0 ? (currentStats.stockStatus.ok / currentStats.totalCount) * 100 : 0}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${currentStats.totalCount > 0 ? (currentStats.stockStatus.low / currentStats.totalCount) * 100 : 0}%` }} className="bg-amber-500 h-full mx-[2px]" />
                            <div style={{ width: `${currentStats.totalCount > 0 ? (currentStats.stockStatus.empty / currentStats.totalCount) * 100 : 0}%` }} className="bg-red-500 h-full" />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-400">In stock: {currentStats.stockStatus.ok}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-gray-400">Low stock: {currentStats.stockStatus.low}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <span className="text-[10px] font-bold text-gray-400">Out of stock: {currentStats.stockStatus.empty}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setTransferModal({ isGeneral: true });
                        setSelectedTransferProductId("");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[32px] shadow-lg shadow-indigo-500/30 flex flex-col justify-center items-start gap-4 transition-all hover:scale-[1.02] group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="w-32 h-32" />
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                        <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <div className="text-left relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Transferir Stock</h3>
                        <p className="text-xs font-bold text-indigo-200 mt-1 uppercase tracking-widest">Mover inventario entre tiendas</p>
                    </div>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="no-print flex items-center justify-between border-b border-gray-100 dark:border-white/10 mt-4">
                <div className="flex items-center space-x-8 px-2 overflow-x-auto">
                    {['Inventory', 'Inventario Tiendas', 'Order Stock'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSelectedStoreId(null);
                            }}
                            className={`pb-4 text-sm font-black tracking-tight transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'} whitespace-nowrap`}
                        >
                            {tab === 'Inventory' ? `${activeStore?.name || 'Inventario'}` : tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 shrink-0">
                    {activeTab === 'Inventario Tiendas' && selectedStoreId && (
                        <button
                            onClick={() => setSelectedStoreId(null)}
                            className="mb-4 flex items-center space-x-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" />
                            <span>Volver a Tiendas</span>
                        </button>
                    )}

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mb-4 flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Producto</span>
                    </button>
                </div>
            </div>

            {/* 1. ORDER STOCK (CALENDAR) */}
            {activeTab === 'Order Stock' && (
                <OrderStock products={products} />
            )}

            {/* 2. INVENTARIO TIENDAS - LIST VIEW */}
            {activeTab === 'Inventario Tiendas' && !selectedStoreId && (
                renderStoreList()
            )}

            {/* 3. TABLE VIEWS */}
            {((activeTab === 'Inventory') || (activeTab === 'Inventario Tiendas' && selectedStoreId)) && (
                <>
                    {/* Controls Bar */}
                    <div className="no-print flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                        <div className="flex flex-1 w-full max-w-xl bg-[#F3F4F6] dark:bg-white/5 border border-transparent rounded-2xl px-5 py-3 space-x-4 items-center transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Inventory"
                                className="bg-transparent border-none flex-1 outline-none text-sm text-gray-900 dark:text-white font-bold placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex px-4 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl items-center space-x-3 text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                                <Filter className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-tight">Filters</span>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Table */}
                    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-[32px] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0 block md:table">
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-white dark:bg-white/5 border-b border-gray-100 dark:border-white/10 uppercase font-black text-[10px] tracking-[0.2em] text-gray-400">
                                        <th className="px-6 py-6 cursor-pointer hover:text-blue-500 transition-colors w-24" onClick={() => handleSort('code')}>
                                            <div className="flex items-center space-x-2">
                                                <span>Código</span>
                                                {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                            </div>
                                        </th>
                                        <th className="px-6 py-6 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center space-x-2">
                                                <span>Nombre/Producto</span>
                                                {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                            </div>
                                        </th>

                                        <th className="px-4 py-6 w-28">Categoría</th>

                                        <th className="px-4 py-6 w-24">Stock</th>
                                        <th className="px-4 py-6 w-24">Precio</th>
                                        {!activeStore && <th className="px-4 py-6">Tienda</th>}

                                        <th className="px-6 py-6 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('createdAt')}>Ingreso</th>
                                        <th className="px-6 py-6 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('updatedAt')}>Salida</th>

                                        <th className="px-6 py-6 min-w-[160px]">Acciones</th>

                                        <th className="px-2 py-6 w-12 text-center">Stat</th>

                                        <th className="px-4 py-6 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y md:divide-y divide-gray-50 dark:divide-white/5 block md:table-row-group">
                                    {loading ? (
                                        <tr className="block md:table-row">
                                            <td colSpan="11" className="px-8 py-20 text-center block md:table-cell">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
                                            </td>
                                        </tr>
                                    ) : (visibleProducts || []).map((p, idx) => {
                                        const lastMovement = p.history?.[0];
                                        const displayStock = p.totalStock !== undefined ? p.totalStock : p.stock;

                                        const status = displayStock === 0
                                            ? { text: 'Agotado', bg: 'bg-red-500' }
                                            : displayStock <= 10
                                                ? { text: 'Bajo Stock', bg: 'bg-amber-500' }
                                                : { text: 'Disponible', bg: 'bg-emerald-500' };
                                        return (
                                            <tr key={p.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors group block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none border border-gray-100 dark:border-white/5 md:border-none relative p-4 md:p-0">
                                                <td className="px-2 md:px-6 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</span>
                                                    <span className="text-xs font-black font-mono text-gray-400">
                                                        {p.code?.substring(0, 4) || '----'}
                                                    </span>
                                                </td>

                                                <td className="px-2 md:px-6 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Producto</span>
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => {
                                                                setUploadingFor(p.id);
                                                                fileInputRef.current.click();
                                                            }}
                                                            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10 group-hover:border-blue-200 transition-all hover:scale-110 relative group/icon"
                                                        >
                                                            {p.imageUrl ? (
                                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Box className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                                            )}
                                                            <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                                                                <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
                                                            </div>
                                                        </button>
                                                        <span className="font-bold text-gray-900 dark:text-white tracking-tight text-right md:text-left">{p.name}</span>
                                                    </div>
                                                </td>

                                                <td className="px-2 md:px-4 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</span>
                                                    <span className="text-xs font-bold text-gray-500 max-w-[120px] truncate">
                                                        {p.category}
                                                    </span>
                                                </td>

                                                <td className="px-2 md:px-4 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</span>
                                                    <div className="flex items-center space-x-1.5">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                                            {displayStock}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                                                            {p.unit || 'pz'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-2 md:px-4 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</span>
                                                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                                                        ${p.price}
                                                    </span>
                                                </td>

                                                {!activeStore && (
                                                    <td className="px-2 md:px-4 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tienda</span>
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                                            {p.store?.name || 'Central'}
                                                        </span>
                                                    </td>
                                                )}

                                                <>
                                                    <td className="px-2 md:px-6 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ingreso</span>
                                                        <button onClick={() => setHistoryPopup({ type: 'ENTRY', product: p })} className="text-[10px] font-bold text-gray-400 hover:text-blue-500 transition-all">
                                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '--/--/--'}
                                                        </button>
                                                    </td>
                                                    <td className="px-2 md:px-6 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salida</span>
                                                        <button onClick={() => setHistoryPopup({ type: 'EXIT', product: p })} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all">
                                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '--/--/--'}
                                                        </button>
                                                    </td>
                                                </>

                                                {/* Acciones (History Summary in local, Delete in all) */}
                                                <td className="px-2 md:px-6 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Último Mov.</span>
                                                    <div className="flex flex-col items-end md:items-start">
                                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                                                            {lastMovement?.type === 'Ingreso' ? 'INGRESÓ' : lastMovement?.type === 'Salida' ? 'SALIÓ' : '---'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                                            {lastMovement ? `${lastMovement.quantity} un.` : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 md:px-2 py-2 md:py-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-50 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                                                    <div className={`w-3 h-3 rounded-full md:mx-auto shadow-sm ${status.bg} border-2 border-white dark:border-dark-card`} />
                                                </td>

                                                <td className="px-2 md:px-4 py-4 md:py-4 flex md:table-cell items-center justify-end md:justify-center gap-1 md:gap-1 mt-2 md:mt-0">
                                                    <button
                                                        onClick={() => {
                                                            setTransferModal({ product: p });
                                                            setSelectedTransferProductId(p.id.toString());
                                                        }}
                                                        className="w-10 md:w-8 h-10 md:h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                                                        title="Transferir Stock"
                                                    >
                                                        <ArrowUpRight className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setAdjustModal({ product: p })}
                                                        className="w-10 md:w-8 h-10 md:h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                                                    >
                                                        <Plus className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditModal({ product: p })}
                                                        className="w-10 md:w-8 h-10 md:h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                                                        title="Editar Producto"
                                                    >
                                                        <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ product: p, isGlobal: false })}
                                                        className="w-10 md:w-8 h-10 md:h-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                        title="Eliminar Producto"
                                                    >
                                                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Hidden File Input for Image Upload */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, uploadingFor)}
            />

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">¿Eliminar Producto?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {deleteConfirm.isGlobal
                                        ? `Estás a punto de eliminar "${deleteConfirm.product.name}" de TODAS las tiendas. Esta acción no se puede deshacer.`
                                        : `Estás a punto de eliminar "${deleteConfirm.product.name}" de esta tienda.`}
                                </p>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Adjust Stock Modal */}
            {
                adjustModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Ajustar Inventario</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{adjustModal.product.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAdjustModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const data = {
                                    quantity: parseFloat(formData.get('quantity')),
                                    type: formData.get('type'),
                                    details: formData.get('details')
                                };
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/${adjustModal.product.id}/adjust`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (res.ok) {
                                        setAdjustModal(null);
                                        fetchData();
                                    }
                                } catch (error) {
                                    console.error('Error adjusting stock:', error);
                                }
                            }} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="type" value="Ingreso" defaultChecked className="hidden peer" />
                                            <div className="py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all peer-checked:bg-white dark:peer-checked:bg-blue-600 peer-checked:text-blue-600 dark:peer-checked:text-white peer-checked:shadow-sm text-gray-400">Ingreso</div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="type" value="Salida" className="hidden peer" />
                                            <div className="py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all peer-checked:bg-white dark:peer-checked:bg-red-600 peer-checked:text-red-600 dark:peer-checked:text-white peer-checked:shadow-sm text-gray-400">Salida</div>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cantidad</label>
                                        <input required step="0.01" type="number" name="quantity" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Motivo / Notas</label>
                                        <input name="details" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Ej: Reposición de stock" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20">
                                    Confirmar Ajuste
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* History Popup Overlays */}
            {
                historyPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-[32px] border border-gray-100 dark:border-dark-border shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Historial de {historyPopup.type}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{historyPopup.product.name}</p>
                                </div>
                                <button onClick={() => setHistoryPopup(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
                                {historyPopup.product.history?.filter(h => h.type === historyPopup.type).length === 0 ? (
                                    <p className="text-center py-10 text-gray-500 text-sm">No hay registros de {historyPopup.type.toLowerCase()}s.</p>
                                ) : (
                                    historyPopup.product.history?.filter(h => h.type === historyPopup.type).map((h, i) => (
                                        <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{h.quantity} Unidades</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(h.date).toLocaleString()}</p>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{h.details}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Product Modal */}
            {
                isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-bg w-full max-w-2xl rounded-[32px] border border-gray-100 dark:border-dark-border shadow-2xl animate-in slide-in-from-bottom duration-300">
                            <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Nuevo Producto</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Registra un nuevo artículo en el inventario</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);

                                const rawStoreId = formData.get('storeId');
                                const productData = {
                                    name: formData.get('name'),
                                    code: formData.get('code').substring(0, 4),
                                    category: formData.get('category'),
                                    unit: formData.get('unit'),
                                    price: parseFloat(formData.get('price')),
                                    providerPrice: parseFloat(formData.get('providerPrice')),
                                    providerName: formData.get('providerName'),
                                    comparePrice: parseFloat(formData.get('comparePrice')),
                                    stock: parseFloat(formData.get('stock')),
                                    storeId: rawStoreId ? parseInt(rawStoreId) : activeStore?.id
                                };
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(productData)
                                    });
                                    if (res.ok) {
                                        setIsCreateModalOpen(false);
                                        fetchData();
                                    } else {
                                        const errorText = await res.text();
                                        alert("Error Registrando Producto: " + errorText);
                                        console.error('Error backend:', errorText);
                                    }
                                } catch (error) {
                                    console.error('Error creating product:', error);
                                    alert("Error de red al crear producto");
                                }
                            }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Informacion Basica */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-100 pb-2">Información Básica</h4>
                                    </div>

                                    {!activeStore && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tienda Destino</label>
                                            <select required name="storeId" defaultValue="" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold">
                                                <option value="" disabled>Selecciona una tienda</option>
                                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre del Producto</label>
                                        <input required name="name" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Ej: Camisa Pro" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Código (Máx 4 car.)</label>
                                        <input required name="code" maxLength={4} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="A12B" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Categoría</label>
                                        <input required name="category" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Ej: Electrónica, Ropa..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Unidad de Medida</label>
                                        <select required name="unit" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold">
                                            <optgroup label="Unidades por conteo (discretas)">
                                                <option value="pz">Piezas (pz / und)</option>
                                                <option value="und">Unidades</option>
                                                <option value="paq">Paquetes</option>
                                                <option value="cja">Cajas</option>
                                                <option value="doc">Docenas</option>
                                                <option value="lot">Lotes</option>
                                                <option value="kit">Kits</option>
                                                <option value="rol">Rollos</option>
                                                <option value="bot">Botellas</option>
                                                <option value="sac">Sacos</option>
                                            </optgroup>
                                            <optgroup label="Unidades por peso">
                                                <option value="kg">Kilogramo (kg)</option>
                                                <option value="g">Gramo (g)</option>
                                                <option value="t">Tonelada (t)</option>
                                                <option value="lb">Libra (lb)</option>
                                                <option value="oz">Onza (oz)</option>
                                            </optgroup>
                                            <optgroup label="Unidades por volumen">
                                                <option value="L">Litros (L)</option>
                                                <option value="ml">Mililitros (ml)</option>
                                                <option value="m3">Metros cúbicos (m³)</option>
                                                <option value="gal">Galones</option>
                                                <option value="bar">Barriles</option>
                                            </optgroup>
                                            <optgroup label="Unidades por longitud">
                                                <option value="m">Metro (m)</option>
                                                <option value="cm">Centímetro (cm)</option>
                                                <option value="km">Kilómetro (km)</option>
                                                <option value="pul">Pulgadas</option>
                                                <option value="pie">Pies</option>
                                            </optgroup>
                                            <optgroup label="Unidades por área">
                                                <option value="m2">Metro cuadrado (m²)</option>
                                                <option value="ha">Hectárea (ha)</option>
                                                <option value="pie2">Pie cuadrado</option>
                                            </optgroup>
                                            <optgroup label="Unidades logísticas">
                                                <option value="master">Caja master</option>
                                                <option value="pallet">Pallet</option>
                                                <option value="cont">Contenedor</option>
                                                <option value="fardo">Fardo</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    {/* Precios y Stock */}
                                    <div className="space-y-4 md:col-span-2 mt-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border-b border-emerald-100 pb-2">Precios y Existencias</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Precio de Venta ($)</label>
                                        <input required step="0.01" type="number" name="price" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Stock Inicial</label>
                                        <input required step="0.01" type="number" name="stock" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="0" />
                                    </div>

                                    {/* Proveedores */}
                                    <div className="space-y-4 md:col-span-2 mt-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 border-b border-amber-100 pb-2">Datos de Proveedor</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre Proveedor</label>
                                        <input name="providerName" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="Empresa S.A." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Precio Proveedor ($)</label>
                                        <input step="0.01" type="number" name="providerPrice" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Comparación de Costo (Proveedor Alt.)</label>
                                        <input step="0.01" type="number" name="comparePrice" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>


                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20">
                                        Registrar Producto
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Product Modal */}
            {
                editModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-bg w-full max-w-2xl rounded-[32px] border border-gray-100 dark:border-dark-border shadow-2xl animate-in slide-in-from-bottom duration-300">
                            <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Editar Producto</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{editModal.product.name}</p>
                                </div>
                                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);

                                const productData = {
                                    name: formData.get('name'),
                                    code: formData.get('code').substring(0, 4),
                                    category: formData.get('category'),
                                    unit: formData.get('unit'),
                                    price: parseFloat(formData.get('price')),
                                    providerPrice: parseFloat(formData.get('providerPrice')) || 0,
                                    providerName: formData.get('providerName'),
                                    comparePrice: parseFloat(formData.get('comparePrice')) || 0,
                                };
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/${editModal.product.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(productData)
                                    });
                                    if (res.ok) {
                                        setEditModal(null);
                                        fetchData();
                                    } else {
                                        const errorText = await res.text();
                                        alert("Error Editando Producto: " + errorText);
                                        console.error('Error backend:', errorText);
                                    }
                                } catch (error) {
                                    console.error('Error editing product:', error);
                                    alert("Error de red al editar producto");
                                }
                            }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Informacion Basica */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-100 pb-2">Información Básica</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre del Producto</label>
                                        <input required name="name" defaultValue={editModal.product.name} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Ej: Camisa Pro" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Código (Máx 4 car.)</label>
                                        <input required name="code" maxLength={4} defaultValue={editModal.product.code} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="A12B" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Categoría</label>
                                        <input required name="category" defaultValue={editModal.product.category} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Ej: Electrónica, Ropa..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Unidad de Medida</label>
                                        <select required name="unit" defaultValue={editModal.product.unit || 'pz'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold">
                                            <optgroup label="Unidades por conteo (discretas)">
                                                <option value="pz">Piezas (pz / und)</option>
                                                <option value="und">Unidades</option>
                                                <option value="paq">Paquetes</option>
                                                <option value="cja">Cajas</option>
                                                <option value="doc">Docenas</option>
                                                <option value="lot">Lotes</option>
                                                <option value="kit">Kits</option>
                                                <option value="rol">Rollos</option>
                                                <option value="bot">Botellas</option>
                                                <option value="sac">Sacos</option>
                                            </optgroup>
                                            <optgroup label="Unidades por peso">
                                                <option value="kg">Kilogramo (kg)</option>
                                                <option value="g">Gramo (g)</option>
                                                <option value="t">Tonelada (t)</option>
                                                <option value="lb">Libra (lb)</option>
                                                <option value="oz">Onza (oz)</option>
                                            </optgroup>
                                            <optgroup label="Unidades por volumen">
                                                <option value="L">Litros (L)</option>
                                                <option value="ml">Mililitros (ml)</option>
                                                <option value="m3">Metros cúbicos (m³)</option>
                                                <option value="gal">Galones</option>
                                                <option value="bar">Barriles</option>
                                            </optgroup>
                                            <optgroup label="Unidades por longitud">
                                                <option value="m">Metro (m)</option>
                                                <option value="cm">Centímetro (cm)</option>
                                                <option value="km">Kilómetro (km)</option>
                                                <option value="pul">Pulgadas</option>
                                                <option value="pie">Pies</option>
                                            </optgroup>
                                            <optgroup label="Unidades por área">
                                                <option value="m2">Metro cuadrado (m²)</option>
                                                <option value="ha">Hectárea (ha)</option>
                                                <option value="pie2">Pie cuadrado</option>
                                            </optgroup>
                                            <optgroup label="Unidades logísticas">
                                                <option value="master">Caja master</option>
                                                <option value="pallet">Pallet</option>
                                                <option value="cont">Contenedor</option>
                                                <option value="fardo">Fardo</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    {/* Precios */}
                                    <div className="space-y-4 md:col-span-2 mt-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border-b border-emerald-100 pb-2">Precios</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Precio de Venta ($)</label>
                                        <input required step="0.01" type="number" name="price" defaultValue={editModal.product.price} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>

                                    {/* Proveedores */}
                                    <div className="space-y-4 md:col-span-2 mt-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 border-b border-amber-100 pb-2">Datos de Proveedor</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre Proveedor</label>
                                        <input name="providerName" defaultValue={editModal.product.providerName || ''} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="Empresa S.A." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Precio Proveedor ($)</label>
                                        <input step="0.01" type="number" name="providerPrice" defaultValue={editModal.product.providerPrice || ''} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Comparación de Costo (Proveedor Alt.)</label>
                                        <input step="0.01" type="number" name="comparePrice" defaultValue={editModal.product.comparePrice || ''} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold" placeholder="0.00" />
                                    </div>

                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Transfer Modal */}
            {
                transferModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 overflow-hidden">
                        <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Transferir Stock</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {transferModal.isGeneral ? 'Seleccione producto y destino' : transferModal.product?.name}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setTransferModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                // If general transfer (no product preset), get ID from select
                                const productId = transferModal.product?.id || formData.get('productId');

                                // Calculate max stock (prevent transferring more than available)
                                // If general, we need to find the product object from list to check stock
                                let sourceProduct = transferModal.product;
                                if (!sourceProduct && productId) {
                                    sourceProduct = products.find(p => p.id === parseInt(productId));
                                }

                                if (!sourceProduct) {
                                    alert("Producto no válido");
                                    return;
                                }

                                const qty = parseFloat(formData.get('quantity'));
                                // Store check happens in backend, but frontend check is good UI
                                const currentStock = sourceProduct.totalStock !== undefined ? sourceProduct.totalStock : sourceProduct.stock;
                                if (qty > currentStock) {
                                    alert(`Stock insuficiente. Disponible: ${currentStock}`);
                                    return;
                                }

                                const data = {
                                    productId: parseInt(productId),
                                    targetStoreId: formData.get('targetStoreId'),
                                    quantity: qty,
                                    reason: formData.get('reason')
                                };
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory/transfer`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (res.ok) {
                                        setTransferModal(null);
                                        fetchData();
                                    } else {
                                        const err = await res.json();
                                        alert("Error: " + (err.error || "Fallo en transferencia"));
                                    }
                                } catch (error) {
                                    console.error('Error transferring stock:', error);
                                    alert("Error de conexión");
                                }
                            }} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    {/* Product Selector if General Transfer */}
                                    {transferModal.isGeneral ? (

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Producto a Transferir</label>
                                            <select required name="productId" value={selectedTransferProductId} onChange={e => setSelectedTransferProductId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold">
                                                <option value="" disabled className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Seleccionar Producto...</option>
                                                {products
                                                    .filter(p => !activeStore || p.storeId === activeStore.id) // Only show products from current store context? Or allow all?
                                                    // Assuming user wants to transfer FROM activeStore if selected, or FROM any store?
                                                    // Let's filter by activeStore if exists, or show all with store label
                                                    .map(p => (
                                                        <option key={p.id} value={p.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                                                            {p.name} ({p.code}) - Stock: {p.totalStock !== undefined ? p.totalStock : p.stock}
                                                            {!activeStore && ` [${p.store?.name || '?'}]`}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    ) : (
                                        // Hidden input if product is pre-selected
                                        <input type="hidden" name="productId" value={transferModal.product.id} />
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tienda de Destino</label>
                                        <select required name="targetStoreId" className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold">
                                            <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Seleccionar Tienda...</option>
                                            {stores
                                                // Filter out source store if known
                                                .filter(s => {
                                                    const currentTransferProduct = transferModal.isGeneral
                                                        ? products.find(p => p.id.toString() === selectedTransferProductId)
                                                        : transferModal.product;
                                                    const srcStoreId = currentTransferProduct?.storeId || activeStore?.id;
                                                    return !srcStoreId || s.id !== srcStoreId;
                                                })
                                                .map(s => (
                                                    <option key={s.id} value={s.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{s.name} - {s.location}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cantidad a Transferir</label>
                                        <input required step="0.01" type="number" name="quantity"
                                            max={(() => {
                                                const currentTransferProduct = transferModal.isGeneral
                                                    ? products.find(p => p.id.toString() === selectedTransferProductId)
                                                    : transferModal.product;
                                                return currentTransferProduct?.stock;
                                            })()}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-bold" placeholder="0.00" />
                                        <p className="text-[10px] font-bold text-gray-400 text-right">
                                            Disponible: {(() => {
                                                const currentTransferProduct = transferModal.isGeneral
                                                    ? products.find(p => p.id.toString() === selectedTransferProductId)
                                                    : transferModal.product;
                                                return currentTransferProduct?.stock ?? '-';
                                            })()}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nota de Transferencia</label>
                                        <input name="reason" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" placeholder="Ej: Pedido semanal" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20">
                                    Confirmar Transferencia
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default Inventory;
