import React, { useState, useEffect } from 'react';
import { X, Plus, Store, Building2, Trash2, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const StoreSelectionModal = ({ isOpen, onClose }) => {
    const { activeStore, selectStore } = useStore();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newStore, setNewStore] = useState({ name: '', location: '' });
    const [user, setUser] = useState({ isAdmin: true }); // Temporary mock, should come from Auth

    useEffect(() => {
        if (isOpen) {
            fetchStores();
        }
    }, [isOpen]);

    const fetchStores = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/stores');
            const data = await res.json();
            setStores(data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStore)
            });
            if (res.ok) {
                setNewStore({ name: '', location: '' });
                setIsCreating(false);
                fetchStores();
            }
        } catch (error) {
            console.error('Error creating store:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('¿Estás seguro de eliminar esta tienda?')) return;
        try {
            await fetch(`http://localhost:3001/api/stores/${id}`, { method: 'DELETE' });
            fetchStores();
            if (activeStore?.id === id) selectStore(null);
        } catch (error) {
            console.error('Error deleting store:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Seleccionar Entorno</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Escoge una tienda específica o la vista global de empresa.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                    {/* Global Option */}
                    <button
                        onClick={() => { selectStore('empresa'); onClose(); }}
                        className={`w-full group relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between
                            ${activeStore === 'empresa'
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                                : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900 dark:text-white">Vista Empresa</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Acceso global a todas las tiendas e inventarios</div>
                            </div>
                        </div>
                        {activeStore === 'empresa' && <Check className="w-6 h-6 text-orange-500" />}
                    </button>

                    <div className="flex items-center justify-between pt-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tiendas Disponibles</h3>
                        {user.isAdmin && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-orange-500 flex items-center space-x-1 hover:underline text-xs font-bold"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Añadir Tienda</span>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {stores.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => { selectStore(store); onClose(); }}
                                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between
                                        ${activeStore?.id === store.id
                                            ? 'border-orange-500 bg-orange-500/5'
                                            : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-900 dark:text-white">{store.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{store.location || 'Sin ubicación'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {user.isAdmin && (
                                            <button
                                                onClick={(e) => handleDelete(store.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {activeStore?.id === store.id && <Check className="w-5 h-5 text-orange-500" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Form Overlay */}
                {isCreating && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-20 animate-in slide-in-from-bottom duration-300">
                        <div className="p-12 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Nueva Tienda</h3>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre de la Tienda</label>
                                    <input
                                        required
                                        value={newStore.name}
                                        onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="Ej: Tienda Norte, Sucursal Central..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Ubicación (Opcional)</label>
                                    <input
                                        value={newStore.location}
                                        onChange={e => setNewStore({ ...newStore, location: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="Ej: Calle 123, Ciudad"
                                    />
                                </div>
                                <div className="pt-4 flex space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20"
                                    >
                                        Crear Tienda
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreSelectionModal;
