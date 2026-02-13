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
        return saved ? JSON.parse(saved) : null;
    });

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
