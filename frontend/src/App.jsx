import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Onboarding from './components/Onboarding/Onboarding';
import Stores from './components/Sections/Stores';
import Inventory from './components/Sections/Inventory';
import Sales from './components/Sections/Sales';
import Products from './components/Sections/Products';
import Users from './components/Sections/Users';
import Memory from './components/Sections/Memory';
import PromoCodes from './components/Sections/PromoCodes';
import Stats from './components/Sections/Stats';
import Login from './components/Auth/Login';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const LoadingScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to={currentUser.role === 'vendedor' ? '/sales' : '/'} replace />;
    }
    return children;
};

function App() {
    const [isSetup, setIsSetup] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/status`)
            .then(res => res.json())
            .then(data => {
                setIsSetup(data.isSetup);
                setConfig(data.config);
            })
            .catch(err => {
                console.error("Setup check failed", err);
                setIsSetup(false);
            });
    }, []);

    if (isSetup === null) return <LoadingScreen />;

    return (
        <AuthProvider>
            <StoreProvider>
                <Router>
                    <div className="bg-white dark:bg-dark-bg min-h-screen text-gray-900 dark:text-white font-sans">
                        <Routes>
                            <Route path="/onboarding" element={isSetup ? <Navigate to="/" /> : <Onboarding />} />
                            <Route path="/login" element={isSetup ? <Login config={config} /> : <Navigate to="/onboarding" />} />

                            <Route path="/*" element={!isSetup ? <Navigate to="/onboarding" /> : (
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'contador']}><Dashboard /></ProtectedRoute>} />
                                        <Route path="/stores" element={<ProtectedRoute allowedRoles={['admin', 'contador']}><Stores /></ProtectedRoute>} />
                                        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'contador']}><Inventory /></ProtectedRoute>} />
                                        <Route path="/products" element={<ProtectedRoute allowedRoles={['admin']}><Products /></ProtectedRoute>} />
                                        <Route path="/sales" element={<ProtectedRoute allowedRoles={['admin', 'contador', 'vendedor']}><Sales /></ProtectedRoute>} />
                                        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
                                        <Route path="/memory" element={<ProtectedRoute allowedRoles={['admin', 'contador']}><Memory /></ProtectedRoute>} />
                                        <Route path="/promo" element={<ProtectedRoute allowedRoles={['admin']}><PromoCodes /></ProtectedRoute>} />
                                        <Route path="/stats" element={<ProtectedRoute allowedRoles={['admin', 'contador']}><Stats /></ProtectedRoute>} />
                                    </Routes>
                                </MainLayout>
                            )} />
                        </Routes>
                    </div>
                </Router>
            </StoreProvider>
        </AuthProvider>
    );
}

export default App;
