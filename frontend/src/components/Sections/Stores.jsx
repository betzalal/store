import React, { useEffect, useState } from 'react';

const Stores = () => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/stores')
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Gestión de Tiendas</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{store.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{store.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{store.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(store.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stores;
