import React, { useState, useEffect } from 'react';
import { Settings, User, Monitor, Image, Trash2, Save, X, Check, Sun, Moon } from 'lucide-react';

const OptionsMenu = ({ onClose, onThemeToggle, isDark, config, onBackgroundChange }) => {
    const [ip, setIp] = useState('Loading...');
    const [user, setUser] = useState({ username: 'Guest', role: 'Visitor' });
    const [backgrounds, setBackgrounds] = useState([]);
    const [activeTab, setActiveTab] = useState('general'); // general, appearance, data

    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'employee' });

    useEffect(() => {
        // Fetch System Info
        fetch('http://localhost:3001/api/system/info')
            .then(res => res.json())
            .then(data => setIp(data.ip));

        // Fetch Current User
        fetch('http://localhost:3001/api/users/current')
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => setUser({ username: 'Admin Loop', role: 'admin' }));

        // Fetch All Users
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));

        // Fetch Backgrounds
        fetch('http://localhost:3001/api/setup/backgrounds')
            .then(res => res.json())
            .then(data => setBackgrounds(data));
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const created = await res.json();
            setUsers([...users, created]);
            setNewUser({ username: '', password: '', role: 'employee' });
            alert('Usuario creado correctamente');
        } catch (error) {
            alert('Error creando usuario');
        }
    };


    const handleReset = async () => {
        if (confirm('¿Estás seguro de borrar los datos operativos (ventas, inventario)? Esto no borrará tu configuración de empresa.')) {
            await fetch('http://localhost:3001/api/system/reset', { method: 'POST' });
            alert('Datos borrados correctamente.');
            window.location.reload();
        }
    };

    const saveConfig = () => {
        // In a real app, you might save specific user prefs here
        alert('Configuración guardada.');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="bg-orange-500/10 p-2 rounded-lg">
                            <Settings className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Opciones</h2>
                            <p className="text-sm text-gray-500">Configuración del Sistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 bg-gray-50 dark:bg-black/20 border-r border-gray-200 dark:border-gray-800 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition-colors ${activeTab === 'general' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <User className="w-4 h-4" />
                            <span>General</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition-colors ${activeTab === 'appearance' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <Image className="w-4 h-4" />
                            <span>Apariencia</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition-colors ${activeTab === 'data' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <Monitor className="w-4 h-4" />
                            <span>Sistema</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition-colors ${activeTab === 'users' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <User className="w-4 h-4" />
                            <span>Usuarios</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">

                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Usuario Actual</label>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white capitalize">{user.username}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-600'}`}>
                                                    {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Información de Sesión</label>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Dirección IP</span>
                                        <span className="font-mono text-sm text-gray-900 dark:text-white bg-gray-200 dark:bg-black/40 px-2 py-1 rounded">{ip}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Estado del Sistema</span>
                                        <span className="text-sm text-green-500 font-medium flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> Online</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Tema de la Interfaz</label>
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                        <button
                                            onClick={() => !isDark && onThemeToggle()}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <span>Oscuro</span>
                                        </button>
                                        <button
                                            onClick={() => isDark && onThemeToggle()}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${!isDark ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <Sun className="w-4 h-4" />
                                            <span>Claro</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Fondo de Pantalla</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {backgrounds.map((bg) => (
                                            <div
                                                key={bg.url}
                                                onClick={() => onBackgroundChange(bg.url)}
                                                className={`cursor-pointer aspect-video rounded-lg overflow-hidden border-2 relative group transition-all ${config.backgroundUrl === bg.url ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                            >
                                                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded-full">{bg.name}</span>
                                                </div>
                                                {config.backgroundUrl === bg.url && (
                                                    <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-0.5">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Crear Nuevo Usuario</h3>
                                    <form onSubmit={handleCreateUser} className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Nombre de Usuario"
                                                value={newUser.username}
                                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <input
                                                type="password"
                                                placeholder="Contraseña"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
                                                required
                                            />
                                            <select
                                                value={newUser.role}
                                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
                                            >
                                                <option value="employee">Empleado</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors">
                                            Crear Usuario
                                        </button>
                                    </form>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Usuarios Existentes ({users.length})</h3>
                                    <div className="space-y-2">
                                        {users.map(u => (
                                            <div key={u.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                        {u.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{u.username}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{u.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                                    <h4 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center">
                                        <Trash2 className="w-4 h-4 mr-2" /> Zona de Peligro
                                    </h4>
                                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                                        Estas acciones son destructivas y no se pueden deshacer.
                                    </p>
                                    <button
                                        onClick={handleReset}
                                        className="w-full py-2 bg-white dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm font-bold"
                                    >
                                        Borrar Datos Operativos
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancelar</button>
                    <button onClick={saveConfig} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-500/20 flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionsMenu;
