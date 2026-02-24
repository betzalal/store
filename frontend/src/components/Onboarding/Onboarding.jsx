import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, User, LayoutDashboard, Shield, ChevronRight, CheckCircle2, Factory, Lock, Mail, Upload, Building2 } from 'lucide-react';

// Extracted WizardLayout to prevent re-rendering issues
const WizardLayout = ({ title, desc, stepNum, children }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-screen bg-slate-50 text-slate-900 border-t-4 border-blue-600">
        <div className="hidden lg:block w-80 bg-slate-900 border-r border-slate-800 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="mb-16 relative z-10">
                <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">MERCURIO</h2>
                <p className="text-blue-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Configuración Inicial</p>
            </div>
            <div className="space-y-10 relative z-10">
                {[
                    { num: 1, title: 'Empresa y Cuenta' },
                    { num: 2, title: 'Perfil e Industria' },
                    { num: 3, title: 'Finalizar' }
                ].map(s => {
                    const isCurrent = stepNum === s.num;
                    const isPast = stepNum > s.num;
                    return (
                        <div key={s.num} className={`flex items-center space-x-4 transition-all duration-300 ${isCurrent ? 'text-white translate-x-1' : isPast ? 'text-blue-400' : 'text-slate-600 opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border ${isCurrent ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' :
                                isPast ? 'bg-slate-800 border-slate-700/50 text-blue-400' : 'bg-transparent border-slate-800 text-slate-600'
                                }`}>
                                {isPast ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`font-semibold text-sm ${isCurrent && 'tracking-wide'}`}>{s.title}</span>
                        </div>
                    )
                })}
            </div>
            <div className="absolute bottom-10 left-10 text-xs text-slate-700 font-mono">
                v1.0.0 Setup
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center pt-20 pb-40 px-6 sm:px-12 overflow-y-auto bg-slate-100/50">
            <div className="w-full max-w-3xl">
                <div className="mb-12 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{title}</h1>
                    <p className="text-slate-500 text-lg">{desc}</p>
                </div>
                {children}
            </div>
        </div>
    </motion.div>
);

const Question = ({ q, options, fieldKey, step2, setStep2 }) => (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/10 mb-8">
        <h4 className="font-bold text-lg mb-6 text-slate-800">{q}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 outline-none">
            {options.map(opt => {
                const isSelected = step2[fieldKey] === opt;
                return (
                    <label key={opt} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                        <input type="radio" name={fieldKey} className="hidden" value={opt} onChange={() => setStep2({ ...step2, [fieldKey]: opt })} />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500' : 'border-slate-300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'font-bold text-blue-900' : 'font-medium text-slate-600'}`}>{opt}</span>
                    </label>
                )
            })}
        </div>
    </div>
);

const Splash = ({ setStage }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center cursor-pointer select-none"
        onClick={() => setStage('login')}
    >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950"></div>
        <div className="z-10 text-center max-w-2xl px-8">
            <motion.div
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] mb-8 transform -rotate-6"
            >
                <LayoutDashboard className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-6xl sm:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
            >
                MERCURIO
            </motion.h1>
            <motion.p
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-2xl font-light tracking-wide text-blue-400 mb-8"
            >
                La app para el manejo de tu empresa
            </motion.p>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto mb-8"></div>
            <motion.p
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto"
            >
                La app, dedicada a tus tiendas, ventas, inventarios y todos los procesos necesarios para que tu empresa funcione - Bienvenido
            </motion.p>
            <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
                className="mt-16 text-xs text-gray-600 font-bold uppercase tracking-[0.3em]"
            >
                Haz clic en cualquier parte para continuar
            </motion.p>
        </div>
    </motion.div>
);

const LoginScreen = ({ loginForm, setLoginForm, runLogin, error }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
        className="flex min-h-screen bg-slate-950 text-white"
    >
        <div className="hidden lg:flex w-1/2 flex-col justify-center p-20 relative overflow-hidden bg-slate-900 border-r border-white/5">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 hidden md:block">
                <Shield className="w-96 h-96" />
            </div>
            <div className="z-10 relative">
                <h2 className="text-4xl font-bold mb-6 text-white">Bienvenido a Mercurio</h2>
                <div className="space-y-4 text-slate-300 text-lg">
                    <p>Para poder iniciar puede ingresar como:</p>
                    <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 font-mono text-xl space-y-2 max-w-md shadow-2xl">
                        <p className="flex justify-between border-b border-slate-700 pb-2"><span className="text-blue-400">Usuario:</span> <span>admin</span></p>
                        <p className="flex justify-between pt-2"><span className="text-blue-400">Pass:</span> <span>admin</span></p>
                    </div>
                    <p className="mt-8 text-sm text-slate-400 p-4 border-l-4 border-blue-500 bg-blue-500/5 max-w-md">
                        * Una vez dentro llene los datos de su empresa, suba un logo y cambie su usuario y contraseña.
                    </p>
                </div>
            </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
            <div className="w-full max-w-sm">
                <form onSubmit={runLogin} className="space-y-6 bg-slate-900 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-black text-white">Ingresar</h3>
                        <p className="text-sm text-slate-400 mt-2 font-medium">Usa las credenciales temporales</p>
                    </div>
                    {error && <p className="text-red-400 text-sm font-bold text-center bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Usuario</label>
                            <input
                                type="text"
                                value={loginForm.user}
                                onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono text-white placeholder-slate-600"
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={loginForm.pass}
                                onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono text-white placeholder-slate-600"
                                placeholder="•••••"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-4 border border-blue-500 hover:border-blue-400 flex justify-center items-center gap-2">
                        Ingresar <ChevronRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    </motion.div>
);

const Wizard1 = ({ step1, setStep1, setStage, validateStep1 }) => (
    <WizardLayout title="Empresa y Cuenta" desc="Vamos a personalizar tu experiencia en unos pocos pasos." stepNum={1}>
        <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800">Datos de la empresa</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre de la empresa *</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium text-slate-900"
                            value={step1.companyName} onChange={e => setStep1({ ...step1, companyName: e.target.value })} placeholder="Ej. Comercial Alpha" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nit</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium text-slate-900"
                            value={step1.nit} onChange={e => setStep1({ ...step1, nit: e.target.value })} placeholder="0000000000" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Marca</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium text-slate-900"
                            value={step1.brand} onChange={e => setStep1({ ...step1, brand: e.target.value })} placeholder="Opcional" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">A qué se dedica la empresa</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium text-slate-900"
                            value={step1.industry} onChange={e => setStep1({ ...step1, industry: e.target.value })} placeholder="Ej. Venta de respuestos automotrices" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800">Cuenta Administrativa</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Usuario Admin *</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-mono font-bold text-slate-900"
                            value={step1.adminUser} onChange={e => setStep1({ ...step1, adminUser: e.target.value })} placeholder="admin" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nueva Contraseña *</label>
                            <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-mono text-slate-900"
                                value={step1.newPass} onChange={e => setStep1({ ...step1, newPass: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Repita Contraseña *</label>
                            <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-red-500 focus:ring-4 ring-red-500/10 transition-all font-mono text-slate-900"
                                value={step1.repeatPass} onChange={e => setStep1({ ...step1, repeatPass: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={() => { if (validateStep1()) setStage('wizard2') }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 transition-colors shadow-lg shadow-blue-500/30">
                    Continuar <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    </WizardLayout>
);

const Wizard2 = ({ step2, setStep2, setStage, validateStep2 }) => (
    <WizardLayout title="Perfil e Industria" desc="Ayúdanos a entenderte mejor" stepNum={2}>
        <div className="animate-in slide-in-from-bottom-5 duration-500">
            <Question fieldKey="role" step2={step2} setStep2={setStep2} q="1. ¿Cuál es tu rol principal en la empresa?" options={['Dueño / Director General', 'Administrador / Gerente de Proyecto', 'Contador / Gestor Financiero', 'Recursos Humanos', 'Operativo', 'Otro']} />
            <Question fieldKey="sector" step2={step2} setStep2={setStep2} q="2. ¿En qué sector se desempeña tu organización?" options={['Construcción', 'Agua / Recursos Hídricos', 'Servicios Financieros', 'Comercio', 'Servicios Profesionales', 'Otro']} />
            <Question fieldKey="need" step2={step2} setStep2={setStep2} q="3. ¿Qué es lo primero que necesitas resolver hoy?" options={['Controlar gastos', 'Gestionar nómina', 'Automatizar impuestos', 'Centralizar info', 'Análisis de datos', 'Otro']} />
            <Question fieldKey="size" step2={step2} setStep2={setStep2} q="4. ¿Cuántas personas forman parte de tu equipo?" options={['Solo yo', '2 a 10 personas', '11 a 50 personas', '51 a 200 personas', 'Más de 200']} />
            <Question fieldKey="discovery" step2={step2} setStep2={setStep2} q="5. ¿Cómo descubriste nuestra plataforma?" options={['Recomendación', 'Redes Sociales', 'Google', 'Publicidad', 'Otro']} />

            <div className="flex justify-between items-center mt-10">
                <button onClick={() => setStage('wizard1')} className="text-slate-500 font-bold py-4 px-6 hover:bg-slate-200 rounded-2xl transition-colors">Volver</button>
                <button onClick={() => { if (validateStep2()) setStage('wizard3') }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 transition-colors shadow-lg shadow-blue-500/30">
                    Continuar <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    </WizardLayout>
);

const Wizard3 = ({ step3, setStep3, setStage, logoPreview, handleLogoSelect, handleFinalize, loading, error }) => (
    <WizardLayout title="Finalizar" desc="Completa los datos de contacto y sube tu logotipo." stepNum={3}>
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/30 space-y-10 animate-in slide-in-from-bottom-5 duration-500">

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre Completo *</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 ring-emerald-500/10 transition-all font-medium text-slate-900"
                        value={step3.fullName} onChange={e => setStep3({ ...step3, fullName: e.target.value })} placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Correo Electrónico *</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 ring-emerald-500/10 transition-all font-medium text-slate-900"
                        value={step3.email} onChange={e => setStep3({ ...step3, email: e.target.value })} placeholder="juan@ejemplo.com" />
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Logo de la empresa *</label>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                    <div className="w-32 h-32 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 pointer-events-none">
                        {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-2" alt="Preview" /> : <Building className="text-slate-300 w-12 h-12" />}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-slate-800 mb-1">Sube el logo principal</h4>
                        <p className="text-xs text-slate-500 mb-4 max-w-sm">Este logo aparecerá en el menú lateral de la app, en los recibos y en tus reportes. Formatos: PNG, JPG (Max 2MB)</p>

                        <label className="cursor-pointer bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 shadow-sm font-bold py-2.5 px-6 rounded-xl transition-all inline-flex items-center gap-2 group">
                            <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Seleccionar Imagen
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-10 mt-10 border-t border-slate-100">
                <button onClick={() => setStage('wizard2')} disabled={loading} className="text-slate-500 font-bold py-4 px-6 hover:bg-slate-200 rounded-2xl transition-colors disabled:opacity-50">
                    Volver
                </button>
                <button onClick={handleFinalize} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:scale-100 transform hover:scale-[1.02]">
                    {loading ? 'Guardando...' : 'Finalizar y Guardar'} <CheckCircle2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    </WizardLayout>
);


const Onboarding = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [stage, setStage] = useState('splash'); // splash, login, wizard1, wizard2, wizard3
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

    // Step 1
    const [step1, setStep1] = useState({
        companyName: '', nit: '', brand: '', industry: '',
        adminUser: '', newPass: '', repeatPass: ''
    });

    // Step 2
    const [step2, setStep2] = useState({
        role: '', sector: '', need: '', size: '', discovery: ''
    });

    // Step 3
    const [step3, setStep3] = useState({ fullName: '', email: '' });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const handleLogoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const runLogin = (e) => {
        e.preventDefault();
        if (loginForm.user === 'admin' && loginForm.pass === 'admin') {
            setStage('wizard1');
        } else {
            setError('Las credenciales iniciales deben ser admin / admin');
        }
    };

    const validateStep1 = () => {
        if (!step1.companyName || !step1.adminUser || !step1.newPass) {
            alert("Rellene los campos obligatorios (Empresa, Usuario y Nueva Contraseña)");
            return false;
        }
        if (step1.newPass !== step1.repeatPass) {
            alert("Las contraseñas no coinciden");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!step2.role || !step2.sector || !step2.need || !step2.size || !step2.discovery) {
            alert("Debe responder todas las preguntas para ayudarnos a personalizar su experiencia.");
            return false;
        }
        return true;
    };

    const handleFinalize = async () => {
        if (!step3.fullName || !step3.email || !logoFile) {
            alert("Rellene nombre, correo y suba un logo para finalizar.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Upload Logo
            let finalLogoUrl = '';
            const formData = new FormData();
            formData.append('logo', logoFile);
            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/upload`, {
                method: 'POST', body: formData
            });
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                finalLogoUrl = uploadData.url;
            }

            // 2. Create Admin User
            const userRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: step1.adminUser,
                    password: step1.newPass,
                    role: 'admin'
                })
            });
            if (!userRes.ok) throw new Error("No se pudo crear el usuario administrativo.");

            // 3. Complete Setup in DB
            const setupRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyInfo: {
                        name: step1.companyName,
                        nit: step1.nit,
                        logoUrl: finalLogoUrl,
                        slogan: step1.brand + ' - ' + step1.industry // Merging brand/industry here temporarily
                    },
                    customization: {
                        themeMode: 'dark',
                        backgroundUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop'
                    }
                })
            });
            if (!setupRes.ok) throw new Error("Fallo al guardar la configuración de la empresa.");

            // 4. Submit Survey form to theoretical IP
            const surveyData = {
                company: step1,
                profile: step2,
                contact: step3
            };
            console.log("SENDING SURVEY TO EXTERNAL IP:", surveyData);
            fetch('https://dummy-mercurio-api.com/setup-hook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData)
            }).catch(e => console.log('Dummy IP fetch skipped for local usage.'));

            // 5. Hard reload to complete the flow and navigate to Login / Dashboard
            window.location.reload();

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderSplash = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={() => setStage('login')}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950"></div>
            <div className="z-10 text-center max-w-2xl px-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] mb-8 transform -rotate-6"
                >
                    <LayoutDashboard className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-6xl sm:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
                >
                    MERCURIO
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                    className="text-2xl font-light tracking-wide text-blue-400 mb-8"
                >
                    La app para el manejo de tu empresa
                </motion.p>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto mb-8"></div>
                <motion.p
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                    className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto"
                >
                    La app, dedicada a tus tiendas, ventas, inventarios y todos los procesos necesarios para que tu empresa funcione - Bienvenido
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
                    className="mt-16 text-xs text-gray-600 font-bold uppercase tracking-[0.3em]"
                >
                    Haz clic en cualquier parte para continuar
                </motion.p>
            </div>
        </motion.div>
    );

    const renderLogin = () => (
        <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="flex min-h-screen bg-slate-950 text-white"
        >
            <div className="hidden lg:flex w-1/2 flex-col justify-center p-20 relative overflow-hidden bg-slate-900 border-r border-white/5">
                <div className="absolute top-0 right-0 p-8 text-blue-500/10 hidden md:block">
                    <Shield className="w-96 h-96" />
                </div>
                <div className="z-10 relative">
                    <h2 className="text-4xl font-bold mb-6 text-white">Bienvenido a Mercurio</h2>
                    <div className="space-y-4 text-slate-300 text-lg">
                        <p>Para poder iniciar puede ingresar como:</p>
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 font-mono text-xl space-y-2 max-w-md shadow-2xl">
                            <p className="flex justify-between border-b border-slate-700 pb-2"><span className="text-blue-400">Usuario:</span> <span>admin</span></p>
                            <p className="flex justify-between pt-2"><span className="text-blue-400">Pass:</span> <span>admin</span></p>
                        </div>
                        <p className="mt-8 text-sm text-slate-400 p-4 border-l-4 border-blue-500 bg-blue-500/5 max-w-md">
                            * Una vez dentro llene los datos de su empresa, suba un logo y cambie su usuario y contraseña.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                <div className="w-full max-w-sm">
                    <form onSubmit={runLogin} className="space-y-6 bg-slate-900 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white">Ingresar</h3>
                            <p className="text-sm text-slate-400 mt-2 font-medium">Usa las credenciales temporales</p>
                        </div>
                        {error && <p className="text-red-400 text-sm font-bold text-center bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Usuario</label>
                                <input
                                    type="text"
                                    value={loginForm.user}
                                    onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono text-white placeholder-slate-600"
                                    placeholder="admin"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    value={loginForm.pass}
                                    onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono text-white placeholder-slate-600"
                                    placeholder="•••••"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-4 border border-blue-500 hover:border-blue-400 flex justify-center items-center gap-2">
                            Ingresar <ChevronRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );

    // Extracted WizardLayout to prevent re-rendering issues
    const WizardLayout = ({ title, desc, stepNum, children }) => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-screen bg-slate-50 text-slate-900 border-t-4 border-blue-600">
            <div className="hidden lg:block w-80 bg-slate-900 border-r border-slate-800 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="mb-16 relative z-10">
                    <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">MERCURIO</h2>
                    <p className="text-blue-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Configuración Inicial</p>
                </div>
                <div className="space-y-10 relative z-10">
                    {[
                        { num: 1, title: 'Empresa y Cuenta' },
                        { num: 2, title: 'Perfil e Industria' },
                        { num: 3, title: 'Finalizar' }
                    ].map(s => {
                        const isCurrent = stepNum === s.num;
                        const isPast = stepNum > s.num;
                        return (
                            <div key={s.num} className={`flex items-center space-x-4 transition-all duration-300 ${isCurrent ? 'text-white translate-x-1' : isPast ? 'text-blue-400' : 'text-slate-600 opacity-60'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border ${isCurrent ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' :
                                    isPast ? 'bg-slate-800 border-slate-700/50 text-blue-400' : 'bg-transparent border-slate-800 text-slate-600'
                                    }`}>
                                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                                </div>
                                <span className={`font-semibold text-sm ${isCurrent && 'tracking-wide'}`}>{s.title}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="absolute bottom-10 left-10 text-xs text-slate-700 font-mono">
                    v1.0.0 Setup
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center pt-20 pb-40 px-6 sm:px-12 overflow-y-auto bg-slate-100/50">
                <div className="w-full max-w-3xl">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{title}</h1>
                        <p className="text-slate-500 text-lg">{desc}</p>
                    </div>
                    {children}
                </div>
            </div>
        </motion.div>
    );

    // Functons runLogin, validateStep1, validateStep2, handleFinalize already moved to the top.

    return (
        <AnimatePresence mode="wait">
            {stage === 'splash' && <Splash setStage={setStage} />}
            {stage === 'login' && <LoginScreen loginForm={loginForm} setLoginForm={setLoginForm} runLogin={runLogin} error={error} />}
            {stage === 'wizard1' && <Wizard1 step1={step1} setStep1={setStep1} setStage={setStage} validateStep1={validateStep1} />}
            {stage === 'wizard2' && <Wizard2 step2={step2} setStep2={setStep2} setStage={setStage} validateStep2={validateStep2} />}
            {stage === 'wizard3' && <Wizard3 step3={step3} setStep3={setStep3} setStage={setStage} logoPreview={logoPreview} handleLogoSelect={handleLogoSelect} handleFinalize={handleFinalize} loading={loading} error={error} />}
        </AnimatePresence>
    );
};

export default Onboarding;
