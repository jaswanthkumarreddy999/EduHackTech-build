import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication and optional role check.
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} roles - Optional array of allowed roles (e.g., ['admin'])
 */
const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Wait for auth state to resolve
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if specified
    if (roles.length > 0 && !roles.includes(user.role)) {
        // User doesn't have required role
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Access Denied</h1>
                    <p className="text-slate-400 mb-6">You don't have permission to access this page.</p>
                    <a href="/" className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition">Go Home</a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
