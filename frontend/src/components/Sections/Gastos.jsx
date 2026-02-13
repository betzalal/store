import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, DollarSign, Tag, Calendar, Building2, Store } from 'lucide-react';

const Gastos = () => {
    const { activeStore, isEmpresaMode } = useStore();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'General',
        storeId: activeStore?.id || '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchExpenses();
    }, [activeStore, isEmpresaMode]);

    const fetchExpenses = async () => {
        try {
            const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
            const res = await fetch(`http://localhost:3001/api/expenses?storeId=${storeId}`);
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newExpense,
                    storeId: isEmpresaMode ? newExpense.storeId : activeStore.id
                })
            });
            if (res.ok) {
                setIsAdding(false);
                setNewExpense({
                    description: '',
                    amount: '',
                    category: 'General',
                    storeId: activeStore?.id || '',
                    date: new Date().toISOString().split('T')[0]
                });
                fetchExpenses();
            }
        } catch (error) {
            console.error('Error creating expense:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            await fetch(`http://localhost:3001/api/expenses/${id}`, { method: 'DELETE' });
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Gastos {isEmpresaMode ? 'Globales' : `- ${activeStore?.name}`}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Administra los egresos de tu negocio.</p>
                </div>
                {(!isEmpresaMode || newExpense.storeId) && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Añadir Gasto</span>
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[32px] animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Descripción</label>
                            <input
                                required
                                value={newExpense.description}
                                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                placeholder="Ej: Pago de Luz"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Monto ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={newExpense.amount}
                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Categoría</label>
                            <select
                                value={newExpense.category}
                                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            >
                                <option value="General">General</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Personal">Personal</option>
                                <option value="Arriendo">Arriendo</option>
                                <option value="Insumos">Insumos</option>
                            </select>
                        </div>
                        <div className="flex items-end space-x-3">
                            <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-white/10">
                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No hay gastos registrados aún.</p>
                    </div>
                ) : (
                    expenses.map(expense => (
                        <div key={expense.id} className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-3xl hover:border-orange-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <button onClick={() => handleDelete(expense.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{expense.description}</h3>
                            <div className="text-2xl font-black text-orange-500 mb-4 font-mono">
                                $ {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                                    {isEmpresaMode ? <Building2 className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                                    <span>{expense.store?.name || 'Global'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Gastos;
