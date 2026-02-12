import React from 'react';

const Stats = () => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Estado de Ventas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <h3 className="text-sm text-gray-500 uppercase">Ventas Hoy</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">$1,250.00</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <h3 className="text-sm text-gray-500 uppercase">Pedidos</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">15</p>
                </div>
            </div>
        </div>
    );
};

export default Stats;
