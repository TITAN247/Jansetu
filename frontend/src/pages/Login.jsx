import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('citizen');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password);
            if (data.token) {
                const userRole = data.user.role;

                if (role.toLowerCase() !== userRole) {
                    setError(`Unauthorized: You are registered as a ${userRole}, but trying to login as ${role}.`);
                    setIsLoading(false);
                    return;
                }

                if (userRole === 'admin' || userRole === 'governance') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setError('Unauthorized role. Please use the Official Login portal.');
                    setIsLoading(false);
                    return;
                }

                if (userRole === 'citizen') navigate('/user-dashboard');
                else if (userRole === 'worker') navigate('/worker-dashboard');
                else navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">
            {/* LEFT SECTION: Government Branding */}
            <div className="w-full md:w-1/2 bg-[#001f3f] text-white flex flex-col justify-between p-12 relative overflow-hidden border-r-8 border-yellow-500">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#001730] skew-x-12 transform translate-x-20 hidden md:block"></div>

                {/* Official Header */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex flex-col items-start">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="National Emblem"
                            className="h-20 invert brightness-0 filter mb-4"
                        />
                        <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-80">Satyameva Jayate</span>
                    </div>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 mt-10 md:mt-0"
                >
                    <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-sm text-yellow-400 text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm">
                        Official Citizen Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wide mb-6 leading-tight">
                        JanSetu<span className="text-yellow-500">.AI</span> Governance
                    </h1>
                    <p className="text-lg font-light text-gray-300 mb-8 leading-relaxed max-w-md">
                        A seamless digital interface for grievance redressal and civic engagement.
                    </p>

                    <div className="border-l-4 border-yellow-500 pl-6 py-2">
                        <p className="text-2xl font-serif italic text-white/90">"Technology at the service of the common citizen."</p>
                    </div>
                </motion.div>

                {/* Footer Logos */}
                <div className="relative z-10 mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                    <div className="text-xs font-bold uppercase tracking-widest border-t border-white/30 pt-4">
                        Ministry of Urban Affairs <br /> Government of India
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
                {/* Tricolor Top Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

                {/* Back to Home Button */}
                <Link to="/" className="absolute top-6 right-6 text-gray-500 hover:text-blue-900 flex items-center gap-2 transition-colors z-40 font-bold text-xs uppercase tracking-wide">
                    Return to Home →
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8 z-30"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 border-b-2 border-gray-200 pb-4 inline-block px-8">Sign In</h2>
                        <p className="mt-4 text-sm text-gray-600 font-medium">
                            Access your Digital Governance Dashboard
                        </p>
                    </div>

                    <form className="mt-8 space-y-6 bg-white" onSubmit={handleLogin}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-sm text-sm font-medium flex items-center gap-3"
                            >
                                <span>⚠️</span> {error}
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            {/* Role Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select User Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('citizen')}
                                        className={`flex items-center justify-center px-4 py-3 border-2 rounded-sm text-sm font-bold uppercase tracking-wide transition-all ${role === 'citizen'
                                            ? 'border-blue-900 bg-blue-50 text-blue-900'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        Citizen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('worker')}
                                        className={`flex items-center justify-center px-4 py-3 border-2 rounded-sm text-sm font-bold uppercase tracking-wide transition-all ${role === 'worker'
                                            ? 'border-blue-900 bg-blue-50 text-blue-900'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        Staff / Worker
                                    </button>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="relative group">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Username / Email ID
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white"
                                    placeholder="Enter your registered email"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white pr-16"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-xs font-bold text-blue-800 uppercase hover:text-blue-600 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all duration-200 uppercase tracking-widest active:scale-[0.99] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Authenticating...' : 'Secure Authorization'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-6">
                            <span className="text-gray-500 text-xs">New to the platform?</span>
                            <Link to="/register" className="font-bold text-blue-900 hover:underline uppercase text-xs tracking-wide">
                                Register New Account
                            </Link>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t-2 border-gray-100 pt-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-6 mx-auto opacity-30 invert-0 mb-2" alt="Watermark" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            Official Digital Portal • Municipal Corporation
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
