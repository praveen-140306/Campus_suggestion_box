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
import BottomNavbar from './components/BottomNavbar';

// Layout component for authenticated/main pages
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow pb-24 lg:pb-0">
                <Outlet />
            </main>
            <BottomNavbar />
            <footer className="hidden lg:block bg-white border-t border-slate-200 py-10 text-center relative z-20">
                <div className="max-w-4xl mx-auto px-4">
                    <p className="text-slate-400 text-sm font-medium">
                        © {new Date().getFullYear()} <span className="text-indigo-600 font-bold">CampusBox</span>. Built for the community.
                    </p>
                </div>
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
