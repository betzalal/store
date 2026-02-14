import React, { useEffect, useState } from 'react';
import { Store, MapPin, Plus, Edit2, X, Save } from 'lucide-react';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState(null); // null = create mode
    const [formData, setFormData] = useState({ name: '', location: '' });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = () => {
        fetch('http://localhost:3001/api/stores')
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(err => console.error(err));
    };

    const handleOpenModal = (store = null) => {
        if (store) {
            setEditingStore(store);
            setFormData({ name: store.name, location: store.location });
        } else {
            setEditingStore(null);
            setFormData({ name: '', location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingStore
            ? `http://localhost:3001/api/stores/${editingStore.id}`
            : 'http://localhost:3001/api/stores';

        const method = editingStore ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchStores();
            }
        } catch (error) {
            console.error('Error saving store:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[32px] shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestión de Tiendas</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Administra tus sucursales</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Tienda</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <div key={store.id} className="group relative bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-[24px] hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleOpenModal(store)}
                                className="p-2 bg-white dark:bg-dark-card rounded-xl text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 dark:border-white/10"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <Store className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{store.name}</h3>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold mb-4">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {store.location || 'Sin ubicación'}
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">ID: #{store.id}</span>
                            <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-white/5 px-2 py-1 rounded-lg">
                                {new Date(store.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - Fixed for scrolling and visibility */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editingStore ? 'Editar Tienda' : 'Nueva Tienda'}
                                </h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                    {editingStore ? 'Modifica los datos de la sucursal' : 'Registra una nueva sucursal'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nombre de la Tienda</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        autoFocus
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ej: Sucursal Centro"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ubicación / Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ej: Av. Principal #123"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
                            <button
                                onClick={handleSubmit}
                                className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Save className="w-5 h-5" />
                                <span>{editingStore ? 'Guardar Cambios' : 'Crear Tienda'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
