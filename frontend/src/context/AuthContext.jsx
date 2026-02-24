import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('ZStore_User');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing stored user", e);
                localStorage.removeItem('ZStore_User');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const user = await res.json();
                setCurrentUser(user);
                localStorage.setItem('ZStore_User', JSON.stringify(user));

                // Track login in Memory
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/memory/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'Inicio de Sesión',
                        details: `Usuario ${user.username} inició sesión`,
                        userId: user.id
                    })
                });

                return { success: true, user };
            } else {
                const errorData = await res.json();
                return { success: false, error: errorData.error || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        if (currentUser) {
            // Track logout
            try {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/memory/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'Cierre de Sesión',
                        details: `Usuario ${currentUser.username} cerró sesión`,
                        userId: currentUser.id
                    })
                });
            } catch (e) { console.error(e) }
        }

        setCurrentUser(null);
        localStorage.removeItem('ZStore_User');
    };

    const value = {
        currentUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
