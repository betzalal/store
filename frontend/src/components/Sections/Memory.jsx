import React, { useEffect, useState } from 'react';

const Memory = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/memory')
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Memoria del Sistema</h2>
            <ul className="space-y-2">
                {logs.map((log) => (
                    <li key={log.id} className="border-b border-gray-100 dark:border-gray-700 py-2">
                        <span className="font-mono text-xs text-gray-500 mr-2">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="font-semibold">{log.action}</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{log.details}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Memory;
