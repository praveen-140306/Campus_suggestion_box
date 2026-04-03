import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Admin from './components/Admin';
import Navbar from './components/Navbar';
import WelcomeScreen from './screens/WelcomeScreen';
import ProtectedRoute from './components/ProtectedRoute';
import MySuggestions from './screens/MySuggestions';
import ProfileScreen from './screens/ProfileScreen';
import AllSuggestions from './screens/AllSuggestions';

// Layout component for authenticated/main pages
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Campus Suggestion Box. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Initial Route: Splash Screen */}
                <Route path="/" element={<SplashScreen />} />

                {/* Welcome Screen */}
                <Route path="/welcome" element={<WelcomeScreen />} />

                {/* Login Routes (no layout) */}
                <Route path="/login" element={<Navigate to="/welcome" replace />} />
                <Route path="/login/student" element={<LoginScreen role="student" />} />
                <Route path="/login/admin" element={<LoginScreen role="admin" />} />

                {/* Main App Routes (with Layout) */}
                <Route element={<MainLayout />}>
                    {/* Protected User Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/home" element={<HomeScreen />} />
                        <Route path="/all-suggestions" element={<AllSuggestions />} />
                        <Route path="/my-suggestions" element={<MySuggestions />} />
                        <Route path="/profile" element={<ProfileScreen />} />
                    </Route>

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute role="admin" />}>
                        <Route path="/admin" element={<Admin />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
