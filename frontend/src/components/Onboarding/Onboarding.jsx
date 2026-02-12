import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, Palette, Check, Upload } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [adminUser, setAdminUser] = useState({ username: '', password: '' });
    const [companyInfo, setCompanyInfo] = useState({ name: '', slogan: '', logoUrl: '' });
    const [customization, setCustomization] = useState({ themeMode: 'dark', backgroundUrl: '' });
    const [logoFile, setLogoFile] = useState(null);
    const [backgrounds, setBackgrounds] = useState([]);

    // Fetch backgrounds on mount
    useEffect(() => {
        fetch('http://localhost:3001/api/setup/backgrounds')
            .then(res => res.json())
            .then(data => {
                setBackgrounds(data);
                // Optionally set the first background as default if none selected
                if (data.length > 0 && !customization.backgroundUrl) {
                    setCustomization(prev => ({ ...prev, backgroundUrl: data[0].url }));
                }
            })
            .catch(err => console.error("Error fetching backgrounds:", err));
    }, []);

    const toggleThemePreview = (mode) => {
        setCustomization({ ...customization, themeMode: mode });
        const html = document.documentElement;
        if (mode === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setCompanyInfo({ ...companyInfo, logoUrl: URL.createObjectURL(file) }); // Preview
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Upload Logo if exists
            let finalLogoUrl = companyInfo.logoUrl;
            if (logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);
                const uploadRes = await fetch('http://localhost:3001/api/setup/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                finalLogoUrl = uploadData.url;
            }

            // 2. Save Setup Data
            const res = await fetch('http://localhost:3001/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUser,
                    companyInfo: { ...companyInfo, logoUrl: finalLogoUrl },
                    customization
                })
            });

            if (res.ok) {
                // Ensure theme is applied according to final choice
                if (customization.themeMode === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                navigate('/');
                window.location.reload();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save setup');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${step >= i ? 'bg-orange-500' : 'bg-gray-700'}`} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-lg bg-gray-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                    Bienvenido
                </h1>
                <p className="text-gray-400 text-center mb-8">Configura tu Magic Store en unos pasos</p>

                <StepIndicator />

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center"><User className="mr-2 text-orange-500" /> Crear Administrador</h2>
                        <input
                            type="text"
                            placeholder="Usuario"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-orange-500 focus:outline-none transition-colors"
                            value={adminUser.username}
                            onChange={(e) => setAdminUser({ ...adminUser, username: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-orange-500 focus:outline-none transition-colors"
                            value={adminUser.password}
                            onChange={(e) => setAdminUser({ ...adminUser, password: e.target.value })}
                        />
                        <button
                            onClick={() => setStep(2)}
                            disabled={!adminUser.username || !adminUser.password}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center"><Building className="mr-2 text-orange-500" /> Identidad de Empresa</h2>
                        <input
                            type="text"
                            placeholder="Nombre de la Empresa"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-orange-500 focus:outline-none transition-colors"
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Eslogan (Ej: Calidad y Precio)"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-orange-500 focus:outline-none transition-colors"
                            value={companyInfo.slogan}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, slogan: e.target.value })}
                        />

                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-orange-500 transition-colors cursor-pointer relative">
                            <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {companyInfo.logoUrl ? (
                                <img src={companyInfo.logoUrl} alt="Preview" className="h-16 mx-auto object-contain" />
                            ) : (
                                <div className="text-gray-500">
                                    <Upload className="mx-auto w-8 h-8 mb-2" />
                                    <p className="text-sm">Subir Logo</p>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl transition-colors">Atrás</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!companyInfo.name}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center"><Palette className="mr-2 text-orange-500" /> Personalización</h2>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Tema</label>
                            <div className="flex bg-black/50 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => toggleThemePreview('dark')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${customization.themeMode === 'dark' ? 'bg-orange-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Oscuro
                                </button>
                                <button
                                    onClick={() => toggleThemePreview('light')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${customization.themeMode === 'light' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Claro
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Fondo de Pantalla</label>
                            {backgrounds.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                                    {backgrounds.map((bg) => (
                                        <div
                                            key={bg.url}
                                            onClick={() => setCustomization({ ...customization, backgroundUrl: bg.url })}
                                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative group ${customization.backgroundUrl === bg.url ? 'border-orange-500 scale-95 ring-2 ring-orange-500/50' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                        >
                                            <div className="aspect-video bg-gray-800">
                                                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-center text-xs py-1 bg-black/50 absolute bottom-0 w-full truncate px-1">{bg.name}</div>
                                            {customization.backgroundUrl === bg.url && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-orange-500/20 backdrop-blur-[1px]">
                                                    <div className="bg-orange-500 rounded-full p-1">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">Cargando fondos...</p>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl transition-colors">Atrás</button>
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? 'Guardando...' : 'Finalizar Setup'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
