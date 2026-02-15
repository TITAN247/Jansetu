import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernanceDashboard from './pages/GovernanceDashboard'; // Governance Dashboard
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

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/track" element={<PublicTracking />} />
                <Route path="/register-complaint" element={<RegisterComplaint />} />
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
