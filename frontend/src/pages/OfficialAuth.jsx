import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api'; // Reuse existing API services
import { motion } from 'framer-motion';

const OfficialAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin', // Default to admin for this page
        department: '' // Not really used for admin/governance typically, but kept for schema consistency if needed
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // LOGIN LOGIC
                const data = await loginUser(formData.email, formData.password);

                if (!data || !data.user) {
                    throw { response: { data: { error: 'Invalid server response.' } } };
                }

                // Strict Role Check for this Portal
                if (data.user.role !== 'admin' && data.user.role !== 'governance') {
                    throw { response: { data: { error: 'Access restricted to Official Authorities only.' } } };
                }

                if (data.user.role !== formData.role) {
                    // If user selects 'admin' but is 'governance' in DB, or vice versa
                    // We could block it, or just allow it and redirect based on ACTUAL role.
                    // For security/clarity, let's allow the DB role to dictate the redirect.
                }

                if (data.user.role === 'admin') navigate('/admin-dashboard');
                else if (data.user.role === 'governance') navigate('/governance-dashboard');
                else setError("Unauthorized role.");

            } else {
                // REGISTER LOGIC
                await registerUser(formData);
                alert('Official Account Registration successful! Please login.');
                setIsLogin(true); // Switch to login view
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#001f3f] font-sans text-white">

            {/* LEFT: Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative overflow-hidden border-r-4 border-yellow-500"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                {/* Tricolor Strip on Side */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-orange-500 via-white to-green-600"></div>

                <div className="relative z-10 pl-8">
                    <div className="w-20 h-20 bg-white rounded-sm flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/50">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-14" alt="Emblem" />
                    </div>
                    <div className="inline-block px-2 py-0.5 border border-yellow-500 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                        Restricted Access
                    </div>
                    <h1 className="text-5xl font-serif font-bold tracking-tight mb-4 text-white">
                        Official Authority <br /> <span className="text-yellow-500">Portal</span>
                    </h1>
                    <p className="text-lg text-blue-200 max-w-lg mb-8 font-light leading-relaxed">
                        Secure Gateway for Municipal Administration and Governance Bodies to manage civic operations.
                    </p>

                    <div className="flex gap-4 text-[10px] font-mono text-blue-300 border-t border-blue-800 pt-8 mt-8 uppercase tracking-widest">
                        <span>SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        <span>•</span>
                        <span>ENC: AES-256</span>
                    </div>
                </div>
            </motion.div>

            {/* RIGHT: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 text-gray-900 relative">
                {/* Mobile Tricolor Top Strip */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

                <Link to="/" className="absolute top-6 right-6 text-gray-500 hover:text-blue-900 flex items-center gap-2 transition-colors z-40 font-bold text-xs uppercase tracking-wide">
                    Return to Home →
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-10 rounded-sm shadow-xl border-t-4 border-blue-900"
                >
                    <div className="mb-8 text-center border-b border-gray-100 pb-6">
                        <h2 className="text-2xl font-serif font-bold text-gray-900">
                            {isLogin ? 'Authority Login' : 'Official Registration'}
                        </h2>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mt-2 bg-red-50 inline-block px-2 py-1 rounded-sm">
                            Authorized Personnel Only
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-3 text-sm rounded-sm font-medium">
                                <strong>Access Error:</strong> {error}
                            </div>
                        )}

                        {/* Role Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-sm mb-4 border border-gray-200">
                            {['admin', 'governance'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleSelect(role)}
                                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${formData.role === role ? 'bg-white shadow-sm text-blue-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Official Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-sm transition-all focus:bg-white"
                                    placeholder="e.g. Commissioner R.K. Singh"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Check-in Email API</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-sm transition-all focus:bg-white"
                                placeholder="official@jansetu.gov.in"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Secure Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-sm transition-all focus:bg-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-900 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-blue-800 transition shadow-md disabled:opacity-70 mt-6 active:scale-[0.99]"
                        >
                            {loading ? 'Verifying Credentials...' : (isLogin ? 'Access Dashboard' : 'Create Official ID')}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-xs font-bold text-gray-500 hover:text-blue-900 uppercase tracking-wide hover:underline"
                        >
                            {isLogin ? 'Initialize New Official ID' : 'Return to Login'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OfficialAuth;
