import React, { useState, useEffect, useRef } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, Trash2,
    CreditCard, User, Truck, QrCode, Banknote,
    CheckCircle, X, Package, ChevronRight, DollarSign,
    Filter, Camera, UploadCloud, Store, Calendar, Clock, FileText,
    TrendingUp, PieChart, BarChart
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Sales = () => {
    const { activeStore, isEmpresaMode } = useStore();
    const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'
    const [salesHistory, setSalesHistory] = useState({ sales: [], stats: null });
    const [selectedSale, setSelectedSale] = useState(null); // For details modal
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBundles, setFilterBundles] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadingId, setUploadingId] = useState(null);

    // Checkout State
    const [checkoutData, setCheckoutData] = useState({
        customerName: '',
        customerNit: '',
        customerWhatsapp: '',
        orderType: 'Venta en Tienda',
        paymentMethod: 'Cash',
        discount: 0
    });

    useEffect(() => {
        if (!activeStore && !isEmpresaMode) return;
        fetchProducts();
    }, [activeStore, isEmpresaMode]);

    useEffect(() => {
        if (!activeStore && !isEmpresaMode) return;
        fetchProducts();
        if (activeTab === 'history') fetchSalesHistory();
    }, [activeStore, isEmpresaMode, activeTab]);

    const fetchProducts = () => {
        const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
        fetch(`http://localhost:3001/api/inventory?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    };

    const fetchSalesHistory = () => {
        setLoading(true);
        const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
        fetch(`http://localhost:3001/api/sales?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => setSalesHistory(data))
            .catch(err => console.error("Error fetching history:", err))
            .finally(() => setLoading(false));
    };

    // Image Upload Handler
    const handleImageUpload = async (e) => {
        if (!e.target.files || !e.target.files[0] || !uploadingId) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`http://localhost:3001/api/inventory/${uploadingId}/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                fetchProducts(); // Refresh to show new image
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading:", error);
        } finally {
            setUploadingId(null);
            e.target.value = null; // Reset input
        }
    };

    const triggerUpload = (e, productId) => {
        e.stopPropagation(); // Prevent adding to cart
        setUploadingId(productId);
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    // Derived State
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const isBundle = p.code.toUpperCase().startsWith('S-') || p.isBundle;

        if (filterBundles && !isBundle) return false;
        return matchesSearch;
    });

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = Math.max(0, cartTotal - (parseFloat(checkoutData.discount) || 0));

    // Cart Handlers
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, originalPrice: product.price }];
        });
    };

    const updateQuantity = (id, value) => {
        const newQty = parseFloat(value);
        if (isNaN(newQty) || newQty < 1) return; // Prevent invalid inputs

        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updatePrice = (id, newPrice) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const payload = {
                storeId: activeStore?.id,
                items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
                ...checkoutData
            };

            const res = await fetch('http://localhost:3001/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Success UI Feedback instead of alert
                setCart([]);
                setIsCheckoutOpen(false);
                setCheckoutData({
                    customerName: '',
                    customerNit: '',
                    customerWhatsapp: '',
                    orderType: 'Venta en Tienda',
                    paymentMethod: 'Cash',
                    discount: 0
                });
                fetchProducts();
            } else {
                console.error('Error processing sale');
            }
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#F9FAFB] dark:bg-dark-bg flex flex-col md:flex-row animate-in fade-in duration-300 relative">

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Content Switcher */}
            {activeTab === 'pos' ? (
                <>
                    {/* LEFT: Catalog Section */}
                    <div className="flex-1 flex flex-col min-w-0 p-4 space-y-4 overflow-hidden">
                        {/* Header & Filters */}
                        <div className="flex flex-col space-y-2 shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center space-x-4 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-2">
                                        <button
                                            onClick={() => setActiveTab('pos')}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'pos' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            <span>Nueva Venta</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                        >
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span>Total Ventas</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-white dark:bg-dark-card p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex-1 flex items-center px-3 space-x-2">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar..."
                                        className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                    />
                                </div>
                                <div className="h-5 w-px bg-gray-100 dark:bg-white/10" />
                                <button
                                    onClick={() => setFilterBundles(!filterBundles)}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterBundles ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Package className="w-3 h-3" />
                                    <span>{filterBundles ? 'Packs' : 'Todo'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-20">
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="group bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 p-3 cursor-pointer hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 flex flex-col relative"
                                    >
                                        <div className="aspect-square rounded-xl bg-gray-50 dark:bg-white/5 mb-2 overflow-hidden relative group/image">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}

                                            {/* Upload Trigger Overlay */}
                                            <div
                                                onClick={(e) => triggerUpload(e, product.id)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity"
                                            >
                                                <Camera className="w-6 h-6 text-white drop-shadow-md" />
                                            </div>

                                            {/* Stock Badge */}
                                            <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                {product.stock > 0 ? product.stock : '0'}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs leading-tight mb-auto line-clamp-2">{product.name}</h3>
                                        <div className="mt-2 flex items-end justify-between">
                                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">${product.price}</span>
                                            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                                                <Plus className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Cart Section */}
                    <div className="w-full md:w-[360px] lg:w-[400px] bg-white dark:bg-dark-card border-l border-gray-100 dark:border-white/5 flex flex-col shadow-2xl z-20 h-[40vh] md:h-full shrink-0 relative">
                        {/* Mobile Handle */}
                        <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto my-2 shrink-0" />

                        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Carrito ({cart.length})
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                                    <ShoppingCart className="w-8 h-8 stroke-1" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Vacio</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-xl group border border-transparent hover:border-blue-500/20 transition-all flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-xs text-gray-800 dark:text-gray-200 line-clamp-2 flex-1 mr-2">{item.name}</span>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1 bg-white dark:bg-black/20 rounded-lg p-0.5">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                                                    className="w-12 text-center text-xs font-bold font-mono bg-transparent outline-none"
                                                    min="1"
                                                />
                                            </div>

                                            <div className="flex items-center relative">
                                                <DollarSign className="w-3 h-3 text-gray-400 absolute left-1" />
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updatePrice(item.id, e.target.value)}
                                                    className="w-14 pl-4 pr-1 py-0.5 text-right bg-transparent border-b border-gray-300 dark:border-gray-600 text-xs font-mono font-bold focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-black/20 backdrop-blur-md space-y-3 shrink-0">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">${cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={cart.length === 0}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Procesar</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* HISTORY & ANALYTICS DASHBOARD */
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {/* Navigation Header */}
                    <div className="md:w-1/3">
                        <div className="flex items-center space-x-4 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-4">
                            <button
                                onClick={() => setActiveTab('pos')}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'pos' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Nueva Venta</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-white dark:bg-dark-card text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Total Ventas</span>
                            </button>
                        </div>
                    </div>

                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">+12% vs ayer</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingresos Totales</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                ${salesHistory.stats?.totalRevenue?.toFixed(2) || '0.00'}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black text-gray-400">{salesHistory.stats?.totalOrders || 0} Ordenes</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ticket Promedio</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                ${salesHistory.stats?.averageTicket?.toFixed(2) || '0.00'}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Producto Top</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1 line-clamp-1">
                                {salesHistory.stats?.topProducts?.[0]?.name || 'N/A'}
                            </h3>
                            <p className="text-xs font-bold text-blue-500 mt-1">
                                {salesHistory.stats?.topProducts?.[0]?.quantity || 0} Unds. vendidas
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Transactions */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Historial Reciente</h3>
                                <button className="text-blue-500 hover:text-blue-600 text-xs font-bold">Ver Todo</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Pago</th>
                                            <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {salesHistory.sales?.map(sale => (
                                            <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">#{sale.id}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(sale.date).toLocaleDateString()} <span className="text-[10px] opacity-70">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-black text-gray-900 dark:text-white">${sale.total.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider items-center gap-1
                                                        ${sale.paymentMethod === 'Qr' || sale.paymentMethod === 'QR' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {sale.paymentMethod === 'Qr' || sale.paymentMethod === 'QR' ? <QrCode className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                                        {sale.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setSelectedSale(sale)}
                                                        className="text-blue-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                                    >
                                                        Ver Detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Products & Methods */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Productos Top</h3>
                                <div className="space-y-3">
                                    {salesHistory.stats?.topProducts?.map((prod, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{prod.name}</p>
                                                    <p className="text-[10px] text-gray-400">{prod.quantity} vendidos</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-gray-900 dark:text-white">${prod.revenue.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Métodos de Pago</h3>
                                    <div className="space-y-2">
                                        {Object.entries(salesHistory.stats?.paymentMethods || {}).map(([method, amount]) => (
                                            <div key={method} className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{method}</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">${amount.toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Canales</h3>
                                    <div className="space-y-2">
                                        {Object.entries(salesHistory.stats?.orderTypes || {}).map(([type, count]) => (
                                            <div key={type} className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{type}</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CHECKOUT MODAL */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-white/10">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Finalizar</h2>
                            </div>
                            <button onClick={() => setIsCheckoutOpen(false)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            {/* Customer Info */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 border-b border-blue-100 dark:border-blue-500/30 pb-1 mb-2">Cliente</h3>

                                <div className="space-y-2">
                                    <div className="flex items-center bg-gray-50 dark:bg-dark-bg/50 rounded-xl px-3 border border-gray-100 dark:border-white/5">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                        <input
                                            placeholder="Nombre"
                                            value={checkoutData.customerName}
                                            onChange={e => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                                            className="flex-1 bg-transparent py-2.5 text-sm font-bold outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
                                        />
                                    </div>
                                    <div className="flex items-center bg-gray-50 dark:bg-dark-bg/50 rounded-xl px-3 border border-gray-100 dark:border-white/5">
                                        <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                        <input
                                            placeholder="NIT / CI"
                                            value={checkoutData.customerNit}
                                            onChange={e => setCheckoutData({ ...checkoutData, customerNit: e.target.value })}
                                            className="flex-1 bg-transparent py-2.5 text-sm font-bold outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
                                        />
                                    </div>
                                    <div className="flex items-center bg-gray-50 dark:bg-dark-bg/50 rounded-xl px-3 border border-gray-100 dark:border-white/5">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                        <input
                                            placeholder="WhatsApp"
                                            value={checkoutData.customerWhatsapp}
                                            onChange={e => setCheckoutData({ ...checkoutData, customerWhatsapp: e.target.value })}
                                            className="flex-1 bg-transparent py-2.5 text-sm font-bold outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Entrega</label>
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => setCheckoutData({ ...checkoutData, orderType: 'Venta en Tienda' })}
                                            className={`w-full flex items-center p-2.5 rounded-xl border transition-all ${checkoutData.orderType === 'Venta en Tienda' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/50 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            <Store className="w-3.5 h-3.5 mr-2" />
                                            <span className="text-[10px] font-bold uppercase">Tienda</span>
                                        </button>
                                        <button
                                            onClick={() => setCheckoutData({ ...checkoutData, orderType: 'Envio' })}
                                            className={`w-full flex items-center p-2.5 rounded-xl border transition-all ${checkoutData.orderType === 'Envio' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/50 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            <Truck className="w-3.5 h-3.5 mr-2" />
                                            <span className="text-[10px] font-bold uppercase">Envío</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Pago</label>
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'Cash' })}
                                            className={`w-full flex items-center p-2.5 rounded-xl border transition-all ${checkoutData.paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/50 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            <Banknote className="w-3.5 h-3.5 mr-2" />
                                            <span className="text-[10px] font-bold uppercase">Efectivo</span>
                                        </button>
                                        <button
                                            onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'QR' })}
                                            className={`w-full flex items-center p-2.5 rounded-xl border transition-all ${checkoutData.paymentMethod === 'QR' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/50 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            <QrCode className="w-3.5 h-3.5 mr-2" />
                                            <span className="text-[10px] font-bold uppercase">QR</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Descuento ($)</label>
                                <input
                                    type="number"
                                    value={checkoutData.discount}
                                    onChange={e => setCheckoutData({ ...checkoutData, discount: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-lg text-gray-900 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>

                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</span>
                                <span className="text-3xl font-black text-gray-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <span>Procesando...</span>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Confirmar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SALE DETAILS MODAL */}
            {selectedSale && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-white/10">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Detalle de Venta</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{selectedSale.id} • {new Date(selectedSale.date).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedSale(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            {/* Customer Info Card */}
                            <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-4 border border-blue-100 dark:border-blue-500/10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Información del Cliente</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Cliente</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedSale.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">NIT / CI</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedSale.customerNit || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">WhatsApp</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedSale.customerWhatsapp || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Orden</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300">
                                            {selectedSale.orderType === 'Envio' ? <Truck className="w-3 h-3 mr-1" /> : <Store className="w-3 h-3 mr-1" />}
                                            {selectedSale.orderType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Productos</h3>
                                <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                    <table className="w-full">
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {selectedSale.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                                        {item.product?.name || 'Producto Eliminado'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-right">
                                                        {item.quantity} x ${item.price}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-black text-gray-900 dark:text-white text-right">
                                                        ${(item.quantity * item.price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col items-end space-y-1 pt-2">
                                <div className="flex justify-between w-full max-w-[200px]">
                                    <span className="text-xs text-gray-500 font-bold">Subtotal</span>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">${selectedSale.total.toFixed(2)}</span>
                                </div>
                                {selectedSale.discount > 0 && (
                                    <div className="flex justify-between w-full max-w-[200px] text-emerald-500">
                                        <span className="text-xs font-bold">Descuento</span>
                                        <span className="text-xs font-black">-${selectedSale.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-full max-w-[200px] pt-2 border-t border-gray-100 dark:border-white/10">
                                    <span className="text-sm text-gray-900 dark:text-white font-black uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">${selectedSale.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
