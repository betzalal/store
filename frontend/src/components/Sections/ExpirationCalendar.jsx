import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, AlertTriangle, Package } from 'lucide-react';

const ExpirationCalendar = ({ products }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Filter products that have expiration dates
    const expiringProducts = useMemo(() => products.filter(p => p.expirationDate), [products]);

    // Helper to get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get day of week for the first day of the month
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    // Get products expiring on a specific date in the current calendar month
    const getExpiringForDate = (day) => {
        return expiringProducts.filter(p => {
            const expDate = new Date(p.expirationDate);
            // Adjust to local timezone effectively for comparison just by year/month/day
            // Prisma returns UTC YYYY-MM-DDT00:00:00.000Z.
            // Using getUTCDate() avoids timezone shifts pushing it to the day before
            return expDate.getUTCDate() === day &&
                expDate.getUTCMonth() === currentDate.getMonth() &&
                expDate.getUTCFullYear() === currentDate.getFullYear();
        });
    };

    const handleDayClick = (day, dayProducts) => {
        if (dayProducts.length > 0) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            setDetailsModalOpen(true);
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-transparent"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayProducts = getExpiringForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            // Highlight dates approaching (e.g. within 7 days) if needed? Keep it simple: Purple for expirations
            const hasExpirations = dayProducts.length > 0;

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day, dayProducts)}
                    className={`h-32 border border-gray-100 dark:border-white/5 rounded-2xl p-2 relative overflow-hidden transition-all group ${hasExpirations ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:scale-[1.02] hover:shadow-lg bg-purple-50/30 dark:bg-purple-500/5' : 'bg-white dark:bg-dark-card'} ${isToday && !hasExpirations ? 'ring-2 ring-blue-500/20 bg-blue-50/10' : ''}`}
                >
                    <span className={`absolute top-2 right-3 text-sm font-black ${isToday ? 'text-blue-600' : hasExpirations ? 'text-purple-600' : 'text-gray-300'}`}>{day}</span>

                    <div className="flex flex-col gap-1 mt-6 h-full overflow-y-auto custom-scrollbar pr-1">
                        {dayProducts.map((product, idx) => (
                            <div
                                key={idx}
                                className={`text-[9px] font-bold px-2 py-1.5 rounded-lg flex items-center justify-between shadow-sm border bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30`}
                            >
                                <span className="truncate max-w-[70%]">{product.name}</span>
                                <span className="font-mono">{product.stock}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-purple-600" />
                        Control de Vencimientos
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Productos próximos a expirar</p>
                </div>
                <div className="flex items-center space-x-4 bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="w-32 text-center text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-[10px] font-black uppercase tracking-widest text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
                {renderCalendarDays()}
            </div>

            {/* Details Modal */}
            {detailsModalOpen && selectedDate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
                    <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-[32px] border border-gray-100 dark:border-dark-border shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-purple-600">Vencimientos del Día</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setDetailsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {/* Expiring Products Section */}
                                {getExpiringForDate(selectedDate.getDate()).length > 0 ? (
                                    <div>
                                        <div className="grid gap-3">
                                            {getExpiringForDate(selectedDate.getDate()).map((product, idx) => (
                                                <div key={idx} className="bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 p-4 rounded-2xl flex items-center justify-between group hover:bg-purple-100/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 overflow-hidden">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${product.imageUrl}` : product.imageUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-6 h-6" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-black text-gray-900 dark:text-white">{product.name}</span>
                                                                <span className="text-[10px] bg-white dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 font-mono">{product.code?.substring(0, 4)}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500">{product.category}</p>
                                                            <p className="text-[9px] font-bold text-purple-600 mt-1 uppercase tracking-wider">{product.store?.name || 'Inventario Global'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-purple-600 border-b-2 border-purple-200 pb-0.5">{product.stock !== undefined ? product.stock : product.totalStock}</span>
                                                        <p className="text-[9px] text-gray-400 mt-1 uppercase">ESTADO DE STOCK</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Sin Vencimientos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpirationCalendar;
