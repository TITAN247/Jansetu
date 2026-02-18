import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackButton from './components/BackButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernanceDashboard from './pages/GovernanceDashboard';
import DeptOfficerDashboard from './pages/DeptOfficerDashboard';
import OfficialAuth from './pages/OfficialAuth'; // Official Auth Page
import Services from './pages/Services';
import About from './pages/About';
import PublicTracking from './pages/PublicTracking';
import RegisterComplaint from './pages/RegisterComplaint';
import ComplaintDetails from './pages/ComplaintDetails';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        // If current role is not in allowedRoles, redirect to home
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        // If JSON parsing fails (corrupted data), force logout
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Citizen or Guest Route - Only allows citizens or guests (not logged in), blocks other roles
const CitizenOrGuestRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');

    // Guest access is allowed (not logged in)
    if (!userStr) {
        return children;
    }

    try {
        const user = JSON.parse(userStr);
        // Only citizens can access complaint registration when logged in
        if (user.role !== 'citizen') {
            // Redirect non-citizens to home
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        // If JSON parsing fails, allow access (treat as guest)
        return children;
    }

    return children;
};

// Redirects authenticated users away from public pages to their dashboard
const RedirectIfAuthenticated = ({ children }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return children;

    try {
        const user = JSON.parse(userStr);
        const routes = {
            citizen: '/user-dashboard',
            worker: '/worker-dashboard',
            dept_officer: '/dept-officer-dashboard',
            admin: '/admin-dashboard',
            governance: '/governance-dashboard',
        };
        const target = routes[user.role];
        if (target) {
            return <Navigate to={target} replace />;
        }
    } catch {
        // If parsing fails, treat as not authenticated for this redirect
        return children;
    }

    return children;
};

const App = () => {
    return (
        <Router>
            <Navbar />
            <BackButton />
            <Routes>
                {/* Public Routes (redirect logged-in users to their dashboard) */}
                <Route
                    path="/"
                    element={
                        <RedirectIfAuthenticated>
                            <Home />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <RedirectIfAuthenticated>
                            <Login />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <RedirectIfAuthenticated>
                            <Register />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/services"
                    element={
                        <RedirectIfAuthenticated>
                            <Services />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <RedirectIfAuthenticated>
                            <About />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route path="/track" element={<PublicTracking />} />
                <Route 
                    path="/register-complaint" 
                    element={
                        <CitizenOrGuestRoute>
                            <RegisterComplaint />
                        </CitizenOrGuestRoute>
                    } 
                />
                <Route path="/up2" element={<OfficialAuth />} />

                {/* Protected Routes */}
                {/* Citizen Dashboard */}
                <Route
                    path="/user-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Complaint Details */}
                <Route
                    path="/complaint/:id"
                    element={
                        <ProtectedRoute>
                            <ComplaintDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Worker Dashboard */}
                <Route
                    path="/worker-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['worker']}>
                            <WorkerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Dept Officer Dashboard */}
                <Route
                    path="/dept-officer-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['dept_officer']}>
                            <DeptOfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Governance Dashboard */}
                <Route
                    path="/governance-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['governance', 'admin']}>
                            <GovernanceDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
