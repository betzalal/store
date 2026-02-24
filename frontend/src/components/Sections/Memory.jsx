import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, Package, Clock, Download, FileText,
    Calendar, Shield, BarChart2, Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import IncomeAnalysisChart from '../Dashboard/IncomeAnalysisChart';

const Memory = () => {
    const [activeTab, setActiveTab] = useState('ventas');
    const [ventasSubTab, setVentasSubTab] = useState('general'); // 'general' or 'neto'
    const [logs, setLogs] = useState([]);

    // Inventory and Sales State
    const [sales, setSales] = useState([]);
    const [inventoryMoves, setInventoryMoves] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Logs
            const logsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/memory`);
            if (logsRes.ok) setLogs(await logsRes.json());

            // Fetch Sales (Simplified for report)
            // Fetching a larger dataset or using existing activities endpoint
            const salesRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales?groupBy=day`);
            if (salesRes.ok) {
                const sData = await salesRes.json();
                // We need raw sales for the table, assuming api/sales without groupBy gives all or we map
            }
            // For this version we will fetch recent activities that includes sales and inventory
            const actRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/activities`);
            if (actRes.ok) {
                const activities = await actRes.json();
                setSales(activities.filter(a => a.type === 'sale'));
                setInventoryMoves(activities.filter(a => a.type === 'product'));
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = (title, columns, data) => {
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [columns],
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save(`${title.replace(/ /g, '_').toLowerCase()}.pdf`);
    };

    const handleExportLogs = () => {
        const data = logs.map(l => [
            new Date(l.timestamp).toLocaleString(),
            l.action,
            l.details,
            l.userId || 'Sistema'
        ]);
        exportToPDF('Registro de Conexiones y Actividades', ['Fecha y Hora', 'Acción', 'Detalles', 'Usuario ID'], data);
    };

    const handleExportSales = () => {
        if (ventasSubTab === 'neto') {
            const data = sales.map(s => [
                new Date(s.rawDate).toLocaleString(),
                s.quantity,
                s.product,
                `Bs ${s.netProfit?.toFixed(2) || '0.00'}`
            ]);
            exportToPDF('Reporte de Ventas Neto', ['Fecha', 'Cantidad', 'Item Vendido', 'Monto Neto'], data);
        } else {
            const data = sales.map(s => [
                new Date(s.rawDate).toLocaleString(),
                s.product,
                s.quantity,
                `Bs ${s.total?.toFixed(2) || '0.00'}`,
                s.store,
                s.user || 'Sistema',
                s.saleStatus
            ]);
            exportToPDF('Reporte de Ventas', ['Fecha', 'Producto', 'Cantidad', 'Monto', 'Tienda', 'Vendedor', 'Estado'], data);
        }
    };

    const handleExportInventory = () => {
        const data = inventoryMoves.map(m => [
            new Date(m.rawDate).toLocaleString(),
            m.product,
            m.quantity,
            m.orderType,
            m.store
        ]);
        exportToPDF('Movimientos de Inventario', ['Fecha', 'Producto', 'Cantidad', 'Tipo', 'Ubicación'], data);
    };


    const tabs = [
        { id: 'ventas', name: 'Reportes de Ventas', icon: TrendingUp },
        { id: 'ingresos', name: 'Análisis de Ingresos', icon: BarChart2 },
        { id: 'inventario', name: 'Movimientos de Inventario', icon: Package },
        { id: 'conexiones', name: 'Conexiones y Actividad', icon: Activity }
    ];

    return (
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-light-bg dark:bg-transparent h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-light-card/80 dark:bg-dark-card/70 backdrop-blur-xl p-6 rounded-3xl border border-light-border dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Memoria y Reportes</h1>
                    <p className="text-gray-500 font-bold text-sm tracking-widest mt-1 uppercase">Centro de Información Histórica y Financiera</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mb-8 bg-light-card dark:bg-dark-card p-2 rounded-2xl border border-light-border dark:border-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex justify-center items-center gap-2 md:gap-3 px-2 md:px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase md:tracking-widest transition-all
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-500 hover:bg-light-bg dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{tab.name}</span>
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="bg-light-card dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden flex flex-col min-h-[500px]">

                {/* 1. Conexiones y Actividades */}
                {activeTab === 'conexiones' && (
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="p-6 border-b border-light-border dark:border-white/5 flex justify-between items-center bg-light-bg/50 dark:bg-black/20">
                            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" /> Registro de Sistema
                            </h2>
                            <button onClick={handleExportLogs} className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors">
                                <Download className="w-4 h-4" /> Exportar PDF
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse block md:table">
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-light-bg dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                        <th className="p-4 font-black">Fecha</th>
                                        <th className="p-4 font-black">Acción</th>
                                        <th className="p-4 font-black">Detalles</th>
                                        <th className="p-4 font-black">ID Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {logs.map(log => (
                                        <tr key={log.id} className="border-b border-light-border dark:border-white/5 hover:bg-light-bg/50 dark:hover:bg-white/5 text-sm block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0 relative">
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
                                                <span className="font-medium text-gray-500 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acción</span>
                                                <span className="font-black text-gray-900 dark:text-white">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalles</span>
                                                <span className="text-gray-600 dark:text-gray-400 text-right md:text-left">
                                                    {log.details}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center mt-2 md:mt-0">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuario</span>
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-xs font-bold">
                                                    {log.userId || 'Sistema'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && !loading && (
                                        <tr className="block md:table-row"><td colSpan="4" className="p-8 text-center text-gray-400 italic font-medium block md:table-cell">No hay registros de actividad.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 2. Reportes de Ventas */}
                {activeTab === 'ventas' && (
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="p-6 border-b border-light-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-light-bg/50 dark:bg-black/20">
                            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <FileText className={`w-5 h-5 ${ventasSubTab === 'neto' ? 'text-emerald-500' : 'text-blue-500'}`} />
                                {ventasSubTab === 'neto' ? 'Ganancias Netas' : 'Historial de Transacciones'}
                            </h2>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                {/* Sub-tab Toggle */}
                                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-hidden">
                                    <button
                                        onClick={() => setVentasSubTab('general')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ventasSubTab === 'general'
                                            ? 'bg-white dark:bg-blue-600 text-black dark:text-white shadow-md'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        General
                                    </button>
                                    <button
                                        onClick={() => setVentasSubTab('neto')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ventasSubTab === 'neto'
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        Neto
                                    </button>
                                </div>

                                <button onClick={handleExportSales} className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${ventasSubTab === 'neto' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'}`}>
                                    <Download className="w-4 h-4" /> Exportar PDF
                                </button>
                            </div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse block md:table">
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-light-bg dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                        <th className="p-4 font-black">Fecha</th>
                                        {ventasSubTab === 'neto' && <th className="p-4 font-black">Cant.</th>}
                                        <th className="p-4 font-black">Item Vendido</th>
                                        {ventasSubTab === 'general' && <th className="p-4 font-black">Cant.</th>}
                                        <th className={`p-4 font-black ${ventasSubTab === 'general' ? 'text-right' : ''}`}>Monto {ventasSubTab === 'neto' && 'Neto'}</th>
                                        {ventasSubTab === 'general' && (
                                            <>
                                                <th className="p-4 font-black">Tienda</th>
                                                <th className="p-4 font-black">Vendedor</th>
                                                <th className="p-4 font-black">Método / Estado</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {sales.map(s => (
                                        <tr key={s.id} className="border-b border-light-border dark:border-white/5 hover:bg-light-bg/50 dark:hover:bg-white/5 text-sm block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0 relative">
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
                                                <span className="font-medium text-gray-500 whitespace-nowrap">
                                                    {new Date(s.rawDate).toLocaleString()}
                                                </span>
                                            </td>

                                            {ventasSubTab === 'neto' && (
                                                <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cant.</span>
                                                    <span className="font-bold text-center md:text-left">
                                                        {s.quantity}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Vendido</span>
                                                <span className="font-black text-gray-900 dark:text-white text-right md:text-left">
                                                    {s.product}
                                                </span>
                                            </td>

                                            {ventasSubTab === 'general' && (
                                                <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cant.</span>
                                                    <span className="font-bold text-center">
                                                        {s.quantity}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monto {ventasSubTab === 'neto' && 'Neto'}</span>
                                                <div className={`font-black ${ventasSubTab === 'general' ? 'text-right' : 'text-right md:text-left'}`}>
                                                    <div className={ventasSubTab === 'neto' ? 'text-emerald-500 text-base' : 'text-emerald-600 dark:text-emerald-400'}>
                                                        Bs {ventasSubTab === 'neto' ? (s.netProfit?.toFixed(2) || '0.00') : (s.total?.toFixed(2) || '0.00')}
                                                    </div>
                                                    {ventasSubTab === 'general' && s.originalTotal > s.total && (
                                                        <div className="text-[10px] text-gray-400 line-through">Bs {s.originalTotal.toFixed(2)}</div>
                                                    )}
                                                </div>
                                            </td>

                                            {ventasSubTab === 'general' && (
                                                <>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tienda</span>
                                                        <span className="text-xs font-bold leading-tight uppercase text-gray-600 dark:text-gray-400">{s.store}</span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendedor</span>
                                                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">{s.user || 'Sistema'}</span>
                                                    </td>
                                                    <td className="p-2 md:p-4 flex md:table-cell justify-between items-center mt-2 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                                                        <div>
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                                                                ${s.saleStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700'}`}>
                                                                {s.status} / {s.saleStatus}
                                                            </span>
                                                            {s.couponCode && (
                                                                <span className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                                                    {s.couponCode}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {sales.length === 0 && !loading && (
                                        <tr className="block md:table-row"><td colSpan={ventasSubTab === 'general' ? "7" : "4"} className="p-8 text-center text-gray-400 italic font-medium block md:table-cell">No hay ventas registradas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. Análisis de Ingresos */}
                {activeTab === 'ingresos' && (
                    <div className="flex flex-col h-[600px] animate-in fade-in relative">
                        {/* We reuse the IncomeAnalysisChart from Dashboard */}
                        <IncomeAnalysisChart />
                        {/* Custom Print Button overlay for the chart */}
                        <div className="absolute top-8 right-8 z-20 hidden">
                            {/* Implementation of pdf export for charts requires html2canvas. 
                                 For now, we just show the chart. Users can use browser print. */}
                        </div>
                    </div>
                )}

                {/* 4. Movimientos de Inventario */}
                {activeTab === 'inventario' && (
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="p-6 border-b border-light-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-light-bg/50 dark:bg-black/20">
                            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-500" /> Registro de Movimientos
                            </h2>
                            <button onClick={handleExportInventory} className="flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors">
                                <Download className="w-4 h-4" /> Exportar PDF
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse block md:table">
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-light-bg dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                        <th className="p-4 font-black">Fecha</th>
                                        <th className="p-4 font-black">Producto Modificado</th>
                                        <th className="p-4 font-black text-center">Cant.</th>
                                        <th className="p-4 font-black">Tipo de Acción</th>
                                        <th className="p-4 font-black">Ubicación</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group">
                                    {inventoryMoves.map(m => (
                                        <tr key={m.id} className="border-b border-light-border dark:border-white/5 hover:bg-light-bg/50 dark:hover:bg-white/5 text-sm block md:table-row bg-white dark:bg-dark-card md:bg-transparent rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0 relative">
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
                                                <span className="font-medium text-gray-500 whitespace-nowrap">
                                                    {new Date(m.rawDate).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Producto</span>
                                                <span className="font-black text-gray-900 dark:text-white text-right md:text-left">
                                                    {m.product}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cant.</span>
                                                <span className={`font-bold text-center ${m.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center border-b md:border-none border-gray-100 dark:border-white/5">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    {m.orderType}
                                                </span>
                                            </td>
                                            <td className="p-2 md:p-4 flex md:table-cell justify-between items-center mt-2 md:mt-0">
                                                <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ubicación</span>
                                                <span className="text-gray-600 dark:text-gray-400 text-right md:text-left">
                                                    {m.store}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {inventoryMoves.length === 0 && !loading && (
                                        <tr className="block md:table-row"><td colSpan="5" className="p-8 text-center text-gray-400 italic font-medium block md:table-cell">No hay movimientos registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Memory;
