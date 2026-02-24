import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';

const OrderStock = ({ products }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

    // Extract and flatten all history events
    const events = useMemo(() => {
        const allEvents = [];
        products.forEach(product => {
            if (product.history) {
                product.history.forEach(h => {
                    allEvents.push({
                        ...h,
                        productName: product.name,
                        productCode: product.code,
                        storeName: product.store?.name || 'Unknown Store'
                    });
                });
            }
        });
        return allEvents;
    }, [products]);

    // Get events for a specific date
    const getEventsForDate = (day) => {
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const handleDayClick = (day, dayEvents) => {
        if (dayEvents.length > 0) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            setDetailsModalOpen(true);
        }
    };

    // Group events logic (group exits for same product on same day)
    const groupEvents = (dayEvents) => {
        const grouped = [];
        const entryEvents = dayEvents.filter(e => e.type === 'Ingreso');
        const exitEvents = dayEvents.filter(e => e.type === 'Salida' || e.type !== 'Ingreso'); // Assume strict 'Ingreso' vs others

        // Entries are always individual as per requirement? "acabo de ingresar 10 items... aparece color"
        // Requirement says: "Color verde para todo lo que fue ingresado... con el nombre del codigo y numero"
        entryEvents.forEach(e => grouped.push({ ...e, isGrouped: false }));

        // Exits are grouped per product
        // "si se venderios varios de ese, no apareceran mas amarillos, si no que se juntaran en ese"
        const exitsMap = {};
        exitEvents.forEach(e => {
            if (!exitsMap[e.productCode]) {
                exitsMap[e.productCode] = {
                    type: 'Salida',
                    productName: e.productName,
                    productCode: e.productCode,
                    quantity: 0,
                    detailsList: [],
                    date: e.date,
                    isGrouped: true
                };
            }
            exitsMap[e.productCode].quantity += e.quantity;
            exitsMap[e.productCode].detailsList.push(e);
        });
        Object.values(exitsMap).forEach(group => grouped.push(group));

        return grouped;
    };


    const renderCalendarDays = () => {
        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-transparent"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(day);
            const groupedDisplayEvents = groupEvents(dayEvents);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day, dayEvents)}
                    className={`h-32 border border-gray-100 dark:border-white/5 rounded-2xl p-2 relative overflow-hidden transition-all group ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 hover:scale-[1.02] hover:shadow-lg' : ''} ${isToday ? 'ring-2 ring-blue-500/20 bg-blue-50/10' : 'bg-white dark:bg-dark-card'}`}
                >
                    <span className={`absolute top-2 right-3 text-sm font-black ${isToday ? 'text-blue-600' : 'text-gray-300'}`}>{day}</span>
                    
                    <div className="flex flex-col gap-1 mt-6 h-full overflow-y-auto custom-scrollbar pr-1">
                        {groupedDisplayEvents.map((event, idx) => (
                            <div
                                key={idx}
                                className={`text-[9px] font-bold px-2 py-1.5 rounded-lg flex items-center justify-between shadow-sm border ${event.type === 'Ingreso' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}
                            >
                                <span className="truncate max-w-[70%]">{event.productCode}</span>
                                <span className="font-mono">{event.quantity}</span>
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
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                        Agenda de Inventario
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Movimientos y Stock</p>
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
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Detalles del Día</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setDetailsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {/* Ingresos Section */}
                                {getEventsForDate(selectedDate.getDate()).filter(e => e.type === 'Ingreso').length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                                            <ArrowDownRight className="w-4 h-4" />
                                            Ingresos de Mercadería
                                        </h4>
                                        <div className="grid gap-3">
                                            {getEventsForDate(selectedDate.getDate()).filter(e => e.type === 'Ingreso').map((event, idx) => (
                                                <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-black text-gray-900 dark:text-white">{event.productName}</span>
                                                            <span className="text-[10px] bg-white dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 font-mono">{event.productCode}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">{event.details || 'Sin detalles'}</p>
                                                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">{event.storeName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-emerald-600">+{event.quantity}</span>
                                                        <p className="text-[9px] text-gray-400">UNIDADES</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Salidas Section - Grouped */}
                                {groupEvents(getEventsForDate(selectedDate.getDate())).filter(e => e.type !== 'Ingreso').length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-4 flex items-center gap-2">
                                            <ArrowUpRight className="w-4 h-4" />
                                            Salidas y Ventas
                                        </h4>
                                        <div className="grid gap-3">
                                            {groupEvents(getEventsForDate(selectedDate.getDate())).filter(e => e.type !== 'Ingreso').map((group, idx) => (
                                                <div key={idx} className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl overflow-hidden">
                                                    <div className="p-4 flex items-center justify-between bg-amber-50/80 dark:bg-amber-500/10">
                                                         <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-black text-gray-900 dark:text-white">{group.productName}</span>
                                                                <span className="text-[10px] bg-white dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 font-mono">{group.productCode}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-400">{group.isGrouped ? 'Múltiples salidas agrupadas' : group.details}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xl font-black text-amber-600">-{group.quantity}</span>
                                                            <p className="text-[9px] text-gray-400">TOTAL SALE</p>
                                                        </div>
                                                    </div>
                                                    {group.isGrouped && (
                                                        <div className="divide-y divide-amber-100 dark:divide-white/5">
                                                            {group.detailsList.map((detail, dIdx) => (
                                                                <div key={dIdx} className="px-4 py-3 text-xs flex justify-between items-center hover:bg-white/50 dark:hover:bg-white/5">
                                                                    <div className="flex flex-col">
                                                                         <span className="text-gray-600 dark:text-gray-300 font-medium">{detail.details}</span>
                                                                         <span className="text-[9px] text-amber-600/70 font-bold uppercase">{detail.storeName}</span>
                                                                    </div>
                                                                    
                                                                    <span className="font-mono font-bold text-gray-400">-{detail.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
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

export default OrderStock;
