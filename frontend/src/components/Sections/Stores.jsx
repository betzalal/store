import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
    Store as StoreIcon, MapPin, Plus, Trash2, Edit2, X,
    Image as ImageIcon, Users, Check, Lock, ChevronRight
} from 'lucide-react';

const SetupModal = ({ isOpen, onClose, store, onSave, mode = 'create' }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        category: '',
        // For simplicity in this demo, mocked photos/staff
        photos: [],
        staff: []
    });

    useEffect(() => {
        if (store && mode === 'edit') {
            setFormData({
                name: store.name || '',
                location: store.location || '',
                description: store.description || '',
                category: store.category || '',
                photos: store.photos ? JSON.parse(store.photos) : [],
                staff: store.staff ? JSON.parse(store.staff) : []
            });
        }
    }, [store, mode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1a1c23] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {mode === 'create' ? 'Nueva Tienda' : 'Editar Tienda'}
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Nombre de la Tienda</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    placeholder="Ej: Tech Hub Central"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Ubicación</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    placeholder="Ej: Av. Principal #123"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Categoría / Especialidad</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="Ej: Reparaciones, Venta de Accesorios, Showroom"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 min-h-[100px]"
                                placeholder="Describe qué hace especial a esta tienda..."
                            />
                        </div>

                        {/* Placeholder for future detailed Photo/Staff management */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-sm font-bold">Gestión de Fotos y Personal</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                Podrás agregar fotos y gestionar el equipo detallado una vez creada la tienda.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>{mode === 'create' ? 'Crear Tienda' : 'Guardar Cambios'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    const [password, setPassword] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1a1c23] rounded-3xl w-full max-w-md p-8 shadow-2xl border border-red-500/20 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Confirmar Eliminación</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Esta acción es irreversible. Por seguridad, ingresa tu contraseña de administrador.
                    </p>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-center tracking-widest"
                        placeholder="••••••••"
                        autoFocus
                    />

                    <div className="flex space-x-3 mt-6">
                        <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold uppercase text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={() => onConfirm(password)}
                            disabled={!password}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase text-xs transition-all shadow-lg hover:shadow-red-500/30"
                        >
                            Eliminar Tienda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    return data.url;
};

const StaffModal = ({ isOpen, onClose, store, onSave }) => {
    if (!isOpen) return null;
    const [staff, setStaff] = useState(store.staff ? safeParse(store.staff) : []);
    const [newMember, setNewMember] = useState({ name: '', role: 'Staff', photo: '' });
    const [uploading, setUploading] = useState(false);

    const handleAdd = () => {
        if (!newMember.name) return;
        const updatedStaff = [...staff, newMember];
        setStaff(updatedStaff);
        setNewMember({ name: '', role: 'Staff', photo: '' });
    };

    const handleRemove = (index) => {
        const updatedStaff = staff.filter((_, i) => i !== index);
        setStaff(updatedStaff);
    };

    const handleSave = () => {
        onSave({ staff: staff });
        onClose();
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await handleFileUpload(file);
            setNewMember({ ...newMember, photo: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1a1c23] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Gestionar Personal</h3>

                {/* Add New */}
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6 space-y-3">
                    <h4 className="text-sm font-bold uppercase text-gray-500">Agregar Miembro</h4>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="w-full bg-white dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10"
                    />
                    <div className="flex gap-2 items-center">
                        <select
                            value={newMember.role}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                            className="flex-1 bg-white dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10"
                        >
                            <option>Gerente</option>
                            <option>Administrador</option>
                            <option>Staff</option>
                            <option>Seguridad</option>
                        </select>

                        <div className="relative flex-1">
                            <input
                                type="file"
                                onChange={onFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                            />
                            <div className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors ${newMember.photo ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white dark:bg-black/20 text-gray-500'}`}>
                                {uploading ? 'Subiendo...' : newMember.photo ? 'Foto Lista' : 'Subir Foto'}
                                {newMember.photo && <Check className="w-3 h-3" />}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleAdd} disabled={uploading} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">Agregar</button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                    {staff.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center border border-gray-300" style={{ backgroundImage: `url('${member.photo || 'https://ui-avatars.com/api/?name=' + member.name}')` }} />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</p>
                                    <p className="text-xs text-blue-500 font-bold uppercase">{member.role}</p>
                                </div>
                            </div>
                            <button onClick={() => handleRemove(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {staff.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No hay personal asignado</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm shadow-lg shadow-blue-500/30">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

const PhotosModal = ({ isOpen, onClose, store, onSave }) => {
    if (!isOpen) return null;
    const [photos, setPhotos] = useState(store.photos ? safeParse(store.photos) : []);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await handleFileUpload(file);
            setPhotos([...photos, url]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave({ photos: photos });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1a1c23] rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Gestionar Galería</h3>

                {/* Add New */}
                <div className="flex gap-2 mb-6 justify-center">
                    <label className={`cursor-pointer px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all ${uploading ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
                        {uploading ? 'Subiendo...' : 'Subir Nueva Imagen'}
                        <ImageIcon className="w-4 h-4" />
                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" disabled={uploading} />
                    </label>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto mb-6 p-1">
                    {photos.map((url, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-md">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                                onClick={() => handleRemove(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {photos.length === 0 && <p className="col-span-3 text-center text-gray-400 py-10">Agrega fotos para darle vida a tu tienda</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm shadow-lg shadow-blue-500/30">Guardar Galería</button>
                </div>
            </div>
        </div>
    );
};

// Safe JSON parser to prevent crashes
const safeParse = (jsonString) => {
    try {
        const parsed = jsonString ? JSON.parse(jsonString) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn("JSON Parse Error:", e);
        return [];
    }
};

const Stores = () => {
    const { selectStore } = useStore();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStoreDetail, setActiveStoreDetail] = useState(null);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [deletingStoreId, setDeletingStoreId] = useState(null);
    const [staffModalStore, setStaffModalStore] = useState(null);
    const [photosModalStore, setPhotosModalStore] = useState(null);

    const fetchStores = () => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
            .then(res => res.json())
            .then(data => {
                setStores(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching stores:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleCreate = (data) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(() => {
                fetchStores();
                setIsCreateModalOpen(false);
            });
    };

    const handleEdit = (data, storeIdToUpdate) => {
        const id = storeIdToUpdate || editingStore.id;
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(updatedStore => {
                fetchStores();
                setEditingStore(null);

                // Re-open specific detail view if active
                if (activeStoreDetail?.id === updatedStore.id) {
                    setActiveStoreDetail(updatedStore);
                }
            });
    };

    const handleDelete = (password) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores/${deletingStoreId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })
            .then(res => {
                if (res.ok) {
                    fetchStores();
                    setDeletingStoreId(null);
                    if (activeStoreDetail?.id === deletingStoreId) setActiveStoreDetail(null);
                } else {
                    alert("Contraseña incorrecta o error al eliminar.");
                }
            });
    };

    // Helper to parse JSON safely using the new safeParse function
    const getPhotos = (store) => safeParse(store.photos);
    const getStaff = (store) => safeParse(store.staff);

    // If viewing a store (Detail View)
    if (activeStoreDetail) {
        const photos = getPhotos(activeStoreDetail);
        const staff = getStaff(activeStoreDetail);
        const coverImage = photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2940&auto=format&fit=crop';

        return (
            <div className="h-full flex flex-col bg-white dark:bg-[#0f172a] overflow-hidden animate-in fade-in slide-in-from-right duration-300">
                {/* Detail Hero - Improved Location Visibility */}
                <div className="relative h-64 md:h-80 w-full shrink-0 group">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${coverImage}')` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
                    </div>

                    <button
                        onClick={() => setActiveStoreDetail(null)}
                        className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all z-20"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>

                    <button
                        onClick={() => setPhotosModalStore(activeStoreDetail)}
                        className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all z-20 flex items-center gap-2 text-xs font-bold uppercase"
                    >
                        <ImageIcon className="w-4 h-4" /> Gestionar Fotos
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest backdrop-blur-md mb-4">
                                    {activeStoreDetail.category || 'General Store'}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 shadow-black drop-shadow-lg">{activeStoreDetail.name}</h1>

                                {/* Enhanced Location Display */}
                                <div className="flex items-center space-x-6 text-gray-200">
                                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                        <span className="text-base font-bold tracking-wide">{activeStoreDetail.location || "Sin dirección registrada"}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 hidden md:flex">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-emerald-400">Activa</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setEditingStore(activeStoreDetail)}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-white font-bold uppercase text-xs transition-all flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> <span>Editar Info</span>
                                </button>
                                <button
                                    onClick={() => setDeletingStoreId(activeStoreDetail.id)}
                                    className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 backdrop-blur-md border border-red-500/30 rounded-xl text-red-500 font-bold uppercase text-xs transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0f172a]">
                    <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Sobre la Tienda</h3>
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {activeStoreDetail.description || "Agrega una descripción para contar la historia de esta tienda."}
                                </p>
                            </div>

                            {/* Gallery */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <ImageIcon className="w-6 h-6 text-purple-500" />
                                        Galería
                                    </h3>
                                    <button onClick={() => setPhotosModalStore(activeStoreDetail)} className="text-blue-500 text-sm font-bold hover:underline">Gestionar</button>
                                </div>
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {photos.map((url, i) => (
                                            <div key={i} className="aspect-video rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden hover:scale-105 transition-all cursor-pointer shadow-lg group relative">
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${url}')` }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm font-medium">Sin fotos aún</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Staff */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-[#151921] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        Equipo
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {staff.map((member, i) => (
                                        <div key={i} className="flex items-center p-3 rounded-2xl bg-gray-50 dark:bg-white/5 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-gray-200 bg-cover bg-center mr-4 shadow-inner" style={{ backgroundImage: `url('${member.photo || 'https://ui-avatars.com/api/?name=' + member.name}')` }} />
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</p>
                                                <span className="text-[10px] uppercase font-black tracking-wider text-blue-500">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {staff.length === 0 && <p className="text-center text-gray-500 text-sm py-2">No hay personal registrado.</p>}
                                </div>
                                <button
                                    onClick={() => setStaffModalStore(activeStoreDetail)}
                                    className="w-full mt-6 py-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase transition-all border border-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4" /> Gestionar Personal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <SetupModal isOpen={!!editingStore} onClose={() => setEditingStore(null)} store={editingStore} onSave={handleEdit} mode="edit" />
                <DeleteModal isOpen={!!deletingStoreId} onClose={() => setDeletingStoreId(null)} onConfirm={handleDelete} />
                <StaffModal isOpen={!!staffModalStore} onClose={() => setStaffModalStore(null)} store={staffModalStore} onSave={(data) => handleEdit(data, staffModalStore.id)} />
                <PhotosModal isOpen={!!photosModalStore} onClose={() => setPhotosModalStore(null)} store={photosModalStore} onSave={(data) => handleEdit(data, photosModalStore.id)} />
            </div>
        );
    }

    // Grid View
    return (
        <div className="h-full flex flex-col p-8 pt-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Mis Sucursales</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Gestiona y personaliza tus espacios comerciales</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nueva Tienda</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-white/5 rounded-[32px]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                    {stores.map(store => {
                        const photos = getPhotos(store);
                        const cover = photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop';
                        return (
                            <div
                                key={store.id}
                                onClick={() => setActiveStoreDetail(store)}
                                className="group relative h-[320px] rounded-[32px] overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/20"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${cover}')` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <span className="inline-block self-start px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                        {store.category || 'General'}
                                    </span>

                                    <h3 className="text-3xl font-black text-white leading-none mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{store.name}</h3>

                                    <div className="flex items-center space-x-2 text-gray-300 mb-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium truncate">{store.location}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-white/10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                                        <div className="flex -space-x-2">
                                            {getStaff(store).slice(0, 3).map((s, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-300 bg-cover bg-center" style={{ backgroundImage: `url('${s.photo || 'https://ui-avatars.com/api/?name=' + s.name}')` }} />
                                            ))}
                                            {getStaff(store).length === 0 && <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-500 flex items-center justify-center text-[8px] text-white">?</div>}
                                        </div>
                                        <span className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                                            Ver Detalles <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SetupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleCreate} />
        </div>
    );
};

export default Stores;
