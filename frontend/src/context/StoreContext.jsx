import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // Auto-select Store 1 if nothing is selected on mount
    useEffect(() => {
        if (!activeStore) {
            // We can't know the name yet without fetching, but we can try to fetch stores
            // Or we just rely on the user picking it. 
            // BUT user said "it doesn't open", implying blank.
            // Let's try to fetch stores and pick the first one if activeStore is null.
            fetch('http://localhost:3001/api/stores')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        // Prefer Store ID 1 if exists, else first one
                        const defaultStore = data.find(s => s.id === 1) || data[0];
                        setActiveStore(defaultStore);
                        localStorage.setItem('activeStore', JSON.stringify(defaultStore));
                    }
                })
                .catch(err => console.error("Error setting default store:", err));
        }
    }, []);

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
