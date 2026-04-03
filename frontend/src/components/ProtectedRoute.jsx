import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
    const userInfo = localStorage.getItem('userInfo');
    let user = null;
    if (userInfo) {
        try {
            user = JSON.parse(userInfo);
        } catch (error) {
            console.error("Error parsing userInfo in ProtectedRoute:", error);
            localStorage.removeItem('userInfo'); // Clear invalid data
        }
    }

    if (!user) {
        return <Navigate to="/welcome" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
