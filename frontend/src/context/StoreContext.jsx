import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

export const StoreProvider = ({ children }) => {
    const [activeStore, setActiveStore] = useState(() => {
        const saved = localStorage.getItem('activeStore');
        // Default to Bodega Central (ID 1) if nothing saved
        return saved ? JSON.parse(saved) : null;
    });

    const { currentUser } = useAuth();

    // Auto-select store depending on role & Validate against DB
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Check if current activeStore exists in DB
                    const storeExists = activeStore && data.some(s => s.id === activeStore.id);

                    if (currentUser?.role === 'vendedor' && currentUser.stores?.length > 0) {
                        const assignedStore = currentUser.stores[0];
                        setActiveStore(assignedStore);
                        localStorage.setItem('activeStore', JSON.stringify(assignedStore));
                    } else if (!storeExists) {
                        // If no active store, or it's a stale one from localStorage before a DB wipe
                        const defaultStore = data[0];
                        setActiveStore(defaultStore);
                        localStorage.setItem('activeStore', JSON.stringify(defaultStore));
                    }
                } else if (data.length === 0) {
                    // If DB has no stores, clear the state
                    setActiveStore(null);
                    localStorage.removeItem('activeStore');
                }
            })
            .catch(err => console.error("Error fetching stores:", err));
    }, [currentUser]);

    const isEmpresaMode = activeStore === 'empresa';

    const selectStore = (store) => {
        setActiveStore(store);
        if (store) {
            localStorage.setItem('activeStore', JSON.stringify(store));
        } else {
            localStorage.removeItem('activeStore');
        }
    };

    const logoutStore = () => {
        setActiveStore(null);
        localStorage.removeItem('activeStore');
    };

    return (
        <StoreContext.Provider value={{ activeStore, selectStore, isEmpresaMode, logoutStore }}>
            {children}
        </StoreContext.Provider>
    );
};
