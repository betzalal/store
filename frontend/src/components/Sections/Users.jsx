import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User as UserIcon, Calendar, FileText, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserForm, setCurrentUserForm] = useState({ id: null, username: '', password: '', role: 'vendedor', storeId: '' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState({ sales: [], memories: [] });

    useEffect(() => {
        fetchUsers();
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`);
            if (res.ok) {
                const data = await res.json();
                setStores(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${currentUserForm.id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users`;
            const method = isEditing ? 'PUT' : 'POST';

            // Only send password if it's filled, or if we are creating
            const payload = { ...currentUserForm };
            if (isEditing && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchUsers();
                setShowCreate(false);
                setIsEditing(false);
                setCurrentUserForm({ id: null, username: '', password: '', role: 'vendedor', storeId: '' });
                if (selectedUser?.id === currentUserForm.id) fetchUsers(); // Refresh history if current user updated
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (user) => {
        setIsEditing(true);
        setCurrentUserForm({
            id: user.id,
            username: user.username,
            password: '',
            role: user.role,
            storeId: user.stores && user.stores.length > 0 ? user.stores[0].id : ''
        });
        setShowCreate(true);
    };

    const closeForm = () => {
        setShowCreate(false);
        setIsEditing(false);
        setCurrentUserForm({ id: null, username: '', password: '', role: 'vendedor', storeId: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas borrar este usuario? Esto puede afectar el historial guardado.")) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
            if (selectedUser?.id === id) setSelectedUser(null);
        } catch (error) {
            console.error(error);
        }
    };

    const viewHistory = async (user) => {
        setSelectedUser(user);
        setUserHistory({ sales: [], memories: [] });
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/history`);
            if (res.ok) {
                const data = await res.json();
                setUserHistory(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const RoleBadge = ({ role }) => {
        const config = {
            admin: { color: 'red', label: 'Administrador' },
            contador: { color: 'blue', label: 'Contador' },
            vendedor: { color: 'green', label: 'Vendedor' }
        };
        const c = config[role] || config.vendedor;
        return (
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-${c.color}-500/10 text-${c.color}-600 dark:text-${c.color}-400 border border-${c.color}-500/20 shadow-sm inline-block`}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-light-card/80 dark:bg-dark-card/70 backdrop-blur-xl p-6 rounded-3xl border border-light-border dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Control de Accesos y Privilegios</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentUserForm({ id: null, username: '', password: '', role: 'vendedor', storeId: '' });
                        setShowCreate(!showCreate);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* User List */}
                <div className="lg:col-span-1 flex flex-col bg-light-card dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden relative">
                    {/* Create Dialog Overlay */}
                    <AnimatePresence>
                        {showCreate && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute inset-x-0 top-0 z-10 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 shadow-2xl p-6"
                            >
                                <h3 className="font-black text-sm uppercase tracking-widest mb-4">{isEditing ? 'Editar Usuario' : 'Crear Nuevo'}</h3>
                                <form onSubmit={handleSaveUser} className="space-y-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nombre de usuario"
                                        value={currentUserForm.username}
                                        onChange={e => setCurrentUserForm({ ...currentUserForm, username: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <input
                                        type="password"
                                        required={!isEditing}
                                        placeholder={isEditing ? "Nueva Contraseña (dejar en blanco para mantener)" : "Contraseña"}
                                        value={currentUserForm.password}
                                        onChange={e => setCurrentUserForm({ ...currentUserForm, password: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <select
                                        value={currentUserForm.role}
                                        onChange={e => setCurrentUserForm({ ...currentUserForm, role: e.target.value })}
                                        className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="admin" className="text-gray-900 dark:bg-gray-800 dark:text-white">Administrador</option>
                                        <option value="contador" className="text-gray-900 dark:bg-gray-800 dark:text-white">Contador</option>
                                        <option value="vendedor" className="text-gray-900 dark:bg-gray-800 dark:text-white">Vendedor</option>
                                    </select>
                                    {currentUserForm.role === 'vendedor' && (
                                        <select
                                            required
                                            value={currentUserForm.storeId}
                                            onChange={e => setCurrentUserForm({ ...currentUserForm, storeId: e.target.value })}
                                            className="w-full bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                        >
                                            <option value="" disabled className="text-gray-900 dark:bg-gray-800 dark:text-white">Seleccionar Tienda Asignada</option>
                                            {stores.map(store => (
                                                <option key={store.id} value={store.id} className="text-gray-900 dark:bg-gray-800 dark:text-white">
                                                    {store.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest shadow-md hover:bg-blue-700">Guardar</button>
                                        <button type="button" onClick={closeForm} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl py-3 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/20">Cancelar</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-4 bg-light-bg dark:bg-black/20 border-b border-light-border dark:border-white/5">
                        <h2 className="font-black text-xs uppercase tracking-widest text-light-text/60 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Directorio
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {users.map(user => (
                            <div
                                key={user.id}
                                onClick={() => viewHistory(user)}
                                role="button"
                                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between group transition-all cursor-pointer
                                    ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-inner' : 'hover:bg-light-bg dark:hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                        ${selectedUser?.id === user.id ? 'bg-blue-600 text-white shadow-md' : 'bg-light-bg dark:bg-white/10 text-gray-500'}`}>
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-sm truncate">{user.username}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <RoleBadge role={user.role} />
                                            {user.role === 'vendedor' && user.stores?.length > 0 && (
                                                <span className="text-[10px] uppercase font-bold text-gray-400 truncate max-w-[100px]">
                                                    • {user.stores[0].name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 p-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(user); }} className="p-1 hover:text-blue-500 transition-colors text-gray-400">
                                        <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }} className="p-1 hover:text-red-500 transition-colors text-gray-400">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Details & History */}
                <div className="lg:col-span-2 flex flex-col bg-light-card dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-light-bg/50 dark:bg-black/10">
                            <UserIcon className="w-20 h-20 mb-4 opacity-20" />
                            <p className="font-black text-sm uppercase tracking-widest">Selecciona un usuario</p>
                            <p className="text-xs mt-2 opacity-60 max-w-xs">Haz clic en un usuario del directorio para ver su historial de ventas y accesos en el sistema.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-light-border dark:border-white/5 bg-light-bg dark:bg-white/5 flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{selectedUser.username}</h2>
                                    <p className="text-xs font-bold text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar className="w-3.5 h-3.5" /> Registrado el {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <RoleBadge role={selectedUser.role} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Sales History */}
                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-4">
                                            <ShoppingCart className="w-4 h-4" /> Últimas Ventas
                                        </h3>
                                        {userHistory.sales.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic bg-light-bg dark:bg-white/5 p-4 rounded-xl text-center">Sin ventas recientes.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {userHistory.sales.map(sale => (
                                                    <div key={sale.id} className="bg-light-bg dark:bg-black/20 p-4 rounded-2xl border border-light-border dark:border-white/5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="text-[10px] font-black underline text-blue-500 uppercase">Orden #{sale.id}</span>
                                                                <p className="text-xs font-bold mt-0.5">{sale.customerName}</p>
                                                            </div>
                                                            <span className="text-sm font-black text-emerald-500">${sale.total.toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(sale.date).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action History */}
                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-4">
                                            <FileText className="w-4 h-4" /> Historial de Actividad
                                        </h3>
                                        {userHistory.memories.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic bg-light-bg dark:bg-white/5 p-4 rounded-xl text-center">Sin actividad reciente.</p>
                                        ) : (
                                            <div className="relative border-l border-light-border dark:border-white/10 ml-3 space-y-4 pb-4">
                                                {userHistory.memories.map(memory => (
                                                    <div key={memory.id} className="pl-5 relative">
                                                        <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-white dark:border-dark-card" />
                                                        <p className="text-xs font-black">{memory.action}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{memory.details}</p>
                                                        <p className="text-[9px] text-blue-500/80 uppercase tracking-widest font-black mt-1.5">
                                                            {new Date(memory.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
