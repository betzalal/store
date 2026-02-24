import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, CreditCard, Clock, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RecentActivity = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales`)
            .then(res => res.json())
            .then(data => {
                if (data.sales) {
                    setSales(data.sales.slice(0, 10)); // Top 10 recent
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching recent activity:", err);
                setLoading(false);
            });
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getPaymentIcon = (method) => {
        // Simple mapping, adjust as needed based on your exact method strings
        if (method === 'QR') return <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500"><CreditCard className="w-3 h-3" /></div>;
        if (method === 'Card') return <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500"><CreditCard className="w-3 h-3" /></div>;
        return <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500"><ShoppingBag className="w-3 h-3" /></div>; // Cash default
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-[32px] p-8 lg:p-10 border border-gray-100 dark:border-white/5 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Actividad Reciente</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Últimas transacciones en tiempo real</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-white/5 rounded-full">
                    <Clock className="w-5 h-5 text-blue-500" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[400px]">
                {loading ? (
                    <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando actividad...</div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No hay actividad reciente</div>
                ) : (
                    sales.map((sale) => (
                        <div key={sale.id} className="group flex items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">

                            {/* Icon / Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Store className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">

                                {/* Store Name */}
                                <div className="col-span-2 md:col-span-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {sale.store?.name || 'Tienda Desconocida'}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        Venta #{sale.id}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right md:text-left">
                                    <span className="text-sm font-black text-gray-900 dark:text-white block">
                                        {formatCurrency(sale.total)}
                                    </span>
                                </div>

                                {/* Payment Method */}
                                <div className="hidden md:flex items-center space-x-2">
                                    {getPaymentIcon(sale.paymentMethod)}
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {sale.paymentMethod}
                                    </span>
                                </div>

                                {/* Time */}
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                        {formatTime(sale.date)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-center">
                <button
                    onClick={() => {
                        if (currentUser?.role === 'vendedor') {
                            navigate('/sales');
                        } else {
                            navigate('/memory');
                        }
                    }}
                    className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors group"
                >
                    <span>Ver Historial Completo</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default RecentActivity;
