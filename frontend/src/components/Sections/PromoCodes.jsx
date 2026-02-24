import React, { useState, useEffect } from 'react';
import { Plus, Tag, Calendar, Store, Percent, CheckCircle, XCircle, Trash2, List, Copy, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PromoCodes = () => {
    const [promos, setPromos] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('activos'); // 'activos' | 'pasados'
    const [showCreate, setShowCreate] = useState(false);

    // Stats Modal State
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [promoSales, setPromoSales] = useState([]);
    const [showStats, setShowStats] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        storeId: '',
        externalStore: '',
        validUntil: '',
        maxUses: '',
        discountType: 'percentage',
        discountValue: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [promosRes, storesRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/promo`),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
            ]);

            if (promosRes.ok) setPromos(await promosRes.json());
            if (storesRes.ok) setStores(await storesRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `PROMO-${result}`;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                storeId: formData.storeId === 'external' ? '' : formData.storeId,
                code: generateCode(),
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/promo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowCreate(false);
                setFormData({
                    name: '', storeId: '', externalStore: '', validUntil: '', maxUses: '', discountType: 'percentage', discountValue: ''
                });
                fetchData();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating promo:', error);
            alert('Hubo un error al crear la campaña.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este cupón?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/promo/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting promo:', error);
        }
    };

    const handleViewStats = async (promo) => {
        setSelectedPromo(promo);
        setShowStats(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/promo/${promo.code}/sales`);
            if (res.ok) {
                setPromoSales(await res.json());
            }
        } catch (error) {
            console.error('Error fetching promo sales:', error);
        }
    };

    const activePromos = promos.filter(p => p.isActive);
    const pastPromos = promos.filter(p => !p.isActive);
    const displayedPromos = activeTab === 'activos' ? activePromos : pastPromos;

    return (
        <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-light-card/80 dark:bg-dark-card/70 backdrop-blur-xl p-6 rounded-3xl border border-light-border dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Tag className="w-8 h-8 text-emerald-500" />
                        Cupones y Promociones
                    </h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Gestión de campañas de descuento</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cupón
                </button>
            </div>

            {/* Create Form Overlay */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleCreate} className="bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-light-border dark:border-white/5 shadow-sm space-y-4">
                            <h3 className="font-black text-sm uppercase tracking-widest mb-4">Crear Nueva Campaña</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre de Campaña</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                        placeholder="Ej: Verano 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tienda Asociada</label>
                                    <select
                                        value={formData.storeId}
                                        onChange={e => setFormData({ ...formData, storeId: e.target.value, externalStore: e.target.value === 'external' ? formData.externalStore : '' })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 mb-2"
                                    >
                                        <option value="">Todas las tiendas</option>
                                        <option value="external">Otra marca o tienda externa...</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>

                                    {formData.storeId === 'external' && (
                                        <input
                                            type="text"
                                            required
                                            value={formData.externalStore}
                                            onChange={e => setFormData({ ...formData, externalStore: e.target.value })}
                                            placeholder="Nombre de empresa afiliada..."
                                            className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Válido Hasta</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Descuento</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                    >
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Monto Fijo (Bs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valor del Descuento</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.discountValue}
                                        onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                        placeholder="Ej: 10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Límite de Usos</label>
                                    <input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                                        placeholder="0 para Ilimitado"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="bg-emerald-500 text-white rounded-xl px-6 py-3 font-black text-xs uppercase tracking-widest shadow-md hover:bg-emerald-600">Guardar Campaña</button>
                                <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/20">Cancelar</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Section */}
            <div className="flex-1 bg-light-card dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden flex flex-col">
                <div className="flex border-b border-light-border dark:border-white/5 px-2">
                    <button
                        onClick={() => setActiveTab('activos')}
                        className={`px-6 py-4 font-black uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'activos' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <CheckCircle className="w-4 h-4" /> Activos
                    </button>
                    <button
                        onClick={() => setActiveTab('pasados')}
                        className={`px-6 py-4 font-black uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pasados' ? 'border-gray-500 text-gray-700 dark:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <XCircle className="w-4 h-4" /> Pasados
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse block md:table">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-light-bg dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                <th className="p-4 font-black">Campaña / Código</th>
                                <th className="p-4 font-black">Tienda</th>
                                <th className="p-4 font-black">Descuento</th>
                                <th className="p-4 font-black">Vencimiento</th>
                                <th className="p-4 font-black">Usos</th>
                                <th className="p-4 font-black text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="block md:table-row-group">
                            {displayedPromos.length === 0 ? (
                                <tr className="block md:table-row">
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic block md:table-cell">No hay cupones en esta sección.</td>
                                </tr>
                            ) : (
                                displayedPromos.map(promo => (
                                    <tr key={promo.id} className="border-b border-light-border dark:border-white/5 hover:bg-light-bg/50 dark:hover:bg-white/5 block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0 relative">
                                        <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                            <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Campaña</span>
                                            <div>
                                                <p className="font-black text-sm text-right md:text-left">{promo.name}</p>
                                                <div className="flex items-center justify-end md:justify-start gap-2 mt-1">
                                                    <p className="font-bold text-xs font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded-md">{promo.code}</p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(promo.code);
                                                            // Optional simple feedback
                                                        }}
                                                        className="text-gray-400 hover:text-emerald-500 transition-colors"
                                                        title="Copiar código"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                            <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tienda</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-right md:text-left">
                                                {promo.storeId ? promo.store?.name :
                                                    promo.externalStore ? `Extr: ${promo.externalStore}` : 'Todas las sucursales'}
                                            </span>
                                        </td>
                                        <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                            <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descuento</span>
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-wider">
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `Bs ${promo.discountValue}`}
                                            </span>
                                        </td>
                                        <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                            <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vencimiento</span>
                                            <span className="text-xs font-bold text-gray-500">
                                                {new Date(promo.validUntil).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                            <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usos</span>
                                            <span className="text-xs font-bold">
                                                <span className="text-gray-900 dark:text-white">{promo.usageCount}</span>
                                                <span className="text-gray-400"> / {promo.maxUses === 0 ? '∞' : promo.maxUses}</span>
                                            </span>
                                        </td>
                                        <td className="p-2 md:p-4 flex md:table-cell justify-end items-center mt-2 md:mt-0">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewStats(promo)}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Ver usos"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Modal */}
            <AnimatePresence>
                {showStats && selectedPromo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-dark-card w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <List className="w-5 h-5 text-emerald-500" /> Usos de {selectedPromo.code}
                                    </h2>
                                    <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">
                                        Total usados: {promoSales.length}
                                        {selectedPromo.maxUses > 0 ? ` / ${selectedPromo.maxUses}` : ''}
                                    </p>
                                </div>
                                <button onClick={() => setShowStats(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-left border-collapse text-sm block md:table">
                                    <thead className="hidden md:table-header-group">
                                        <tr className="bg-gray-50 dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                            <th className="p-4 font-black">Fecha</th>
                                            <th className="p-4 font-black">Venta ID</th>
                                            <th className="p-4 font-black">Items Vendidos</th>
                                            <th className="p-4 font-black text-right">Total Venta</th>
                                            <th className="p-4 font-black">Vendedor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="block md:table-row-group">
                                        {promoSales.length === 0 ? (
                                            <tr className="block md:table-row">
                                                <td colSpan="5" className="p-8 text-center text-gray-500 italic block md:table-cell">No hay ventas registradas con este cupón.</td>
                                            </tr>
                                        ) : (
                                            promoSales.map(s => (
                                                <tr key={s.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0 relative">
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
                                                        <span className="font-medium text-gray-500 whitespace-nowrap">{new Date(s.date).toLocaleString()}</span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Venta ID</span>
                                                        <span className="font-black text-blue-500">#{s.id}</span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items Vendidos</span>
                                                        <span className="font-bold text-xs text-gray-400 text-right md:text-left">
                                                            {s.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Venta</span>
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400">Bs {s.total?.toFixed(2)}</span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendedor</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{s.user?.username || 'Sistema'}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromoCodes;
