import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, Store } from 'lucide-react';

const Login = ({ config }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/count`)
            .then(res => res.json())
            .then(data => {
                if (data.count === 0) setIsFirstTime(true);
            })
            .catch(err => console.error("Error checking users count", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isFirstTime) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role: 'admin' })
                });
                if (res.ok) {
                    setIsFirstTime(false);
                    // Automatically log them in after creation
                    const result = await login(username, password);
                    if (result.success) {
                        if (result.user.role === 'vendedor') navigate('/sales');
                        else navigate('/');
                    }
                } else {
                    const errData = await res.json();
                    setError(errData.error || 'Error creating user');
                }
            } catch (err) {
                setError(err.message);
            }
        } else {
            const result = await login(username, password);

            if (result.success) {
                if (result.user.role === 'vendedor') {
                    navigate('/sales');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.error);
            }
        }
        setLoading(false);
    };

    const bgUrl = config?.backgroundUrl
        ? (config.backgroundUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.backgroundUrl}` : config.backgroundUrl)
        : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-white font-sans selection:bg-blue-500">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
                style={{ backgroundImage: `url('${bgUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] mb-6 transform -rotate-6 hover:rotate-0 transition-all duration-300">
                        {config?.logoUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.logoUrl}`} alt="Logo" className="w-12 h-12 object-contain" />
                        ) : (
                            <Store className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">{isFirstTime ? 'Crear Administrador' : 'Bienvenido'}</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        {isFirstTime ? 'Configuración Inicial' : (config?.companyName || 'Sistema de Gestión')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-4 rounded-xl text-center uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                                placeholder="Usuario"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 uppercase tracking-widest shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                <span>{isFirstTime ? 'Crear Usuario' : 'Ingresar'}</span>
                                {!isFirstTime && <LogIn className="w-4 h-4" />}
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                            {isFirstTime ? 'Este usuario tendrá acceso total' : 'Acceso Restringido'}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
