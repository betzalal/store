import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Onboarding from './components/Onboarding/Onboarding';
import Stores from './components/Sections/Stores';
import Inventory from './components/Sections/Inventory';
import Sales from './components/Sections/Sales';
import Gastos from './components/Sections/Gastos';
import Users from './components/Sections/Users';
import Memory from './components/Sections/Memory';
import PromoCodes from './components/Sections/PromoCodes';
import Stats from './components/Sections/Stats';
import { StoreProvider } from './context/StoreContext';

const LoadingScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
);

function App() {
    const [isSetup, setIsSetup] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/setup/status')
            .then(res => res.json())
            .then(data => setIsSetup(data.isSetup))
            .catch(err => {
                console.error("Setup check failed", err);
                setIsSetup(false);
            });
    }, []);

    if (isSetup === null) return <LoadingScreen />;

    return (
        <StoreProvider>
            <Router>
                <div className="bg-white dark:bg-dark-bg min-h-screen text-gray-900 dark:text-white font-sans">
                    <Routes>
                        <Route path="/onboarding" element={isSetup ? <Navigate to="/" /> : <Onboarding />} />

                        <Route path="/*" element={!isSetup ? <Navigate to="/onboarding" /> : (
                            <MainLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/stores" element={<Stores />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/sales" element={<Sales />} />
                                    <Route path="/gastos" element={<Gastos />} />
                                    <Route path="/users" element={<Users />} />
                                    <Route path="/memory" element={<Memory />} />
                                    <Route path="/promo" element={<PromoCodes />} />
                                    <Route path="/stats" element={<Stats />} />
                                </Routes>
                            </MainLayout>
                        )} />
                    </Routes>
                </div>
            </Router>
        </StoreProvider>
    );
}

export default App;
