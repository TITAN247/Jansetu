import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Citizen');
    const [department, setDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await registerUser({ name, email, password, role, department });
            // Show success message or redirect
            // Ideally should show a toast or message before redirecting
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">
            {/* LEFT SECTION: Branding & Info */}
            <div className="w-full md:w-1/2 bg-[#001f3f] text-white flex flex-col justify-between p-12 relative overflow-hidden border-r-8 border-yellow-500 order-first md:order-last">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-[#001730] -skew-x-12 transform -translate-x-20 hidden md:block"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 text-center max-w-lg mx-auto flex flex-col h-full justify-center"
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                        alt="National Emblem"
                        className="h-24 mx-auto mb-6 invert brightness-0 filter"
                    />
                    <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-sm text-yellow-400 text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm self-center">
                        Unified Registration Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 leading-tight">
                        Join <span className="text-yellow-500">JanSetu.AI</span>
                    </h1>
                    <p className="text-xl font-light text-blue-100 mb-8 tracking-wide">
                        "Be Part of the Governance Revolution"
                    </p>

                    <div className="bg-white/5 backdrop-blur-md rounded-sm p-6 border border-white/10 text-left">
                        <p className="text-sm text-blue-100 leading-relaxed opacity-90 mb-6 italic border-l-2 border-yellow-500 pl-4">
                            "Create an account to report grievances, track their status, and contribute to a better society. Together, we build a transparent future."
                        </p>
                        <ul className="space-y-4 text-blue-50 text-sm">
                            <li className="flex items-center">
                                <span className="mr-3 bg-green-600 rounded-full p-1 opacity-100 text-[10px] w-5 h-5 flex items-center justify-center">✓</span>
                                <span className="font-bold tracking-wide uppercase text-xs">Real-time Complaint Tracking</span>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3 bg-green-600 rounded-full p-1 opacity-100 text-[10px] w-5 h-5 flex items-center justify-center">✓</span>
                                <span className="font-bold tracking-wide uppercase text-xs">Direct Official Communication</span>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3 bg-green-600 rounded-full p-1 opacity-100 text-[10px] w-5 h-5 flex items-center justify-center">✓</span>
                                <span className="font-bold tracking-wide uppercase text-xs">Secure AI-verify System</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <div className="relative z-10 text-center mt-8">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Secure • Transparent • Efficient</p>
                </div>
            </div>

            {/* RIGHT SECTION: Registration Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
                {/* Tricolor Top Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

                {/* Back to Home Button */}
                <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-blue-900 flex items-center gap-2 transition-colors z-40 font-bold text-xs uppercase tracking-wide">
                    ← Return to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-6 z-30"
                >
                    <div className="text-center md:text-left border-b-2 border-gray-100 pb-4">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 text-center">Citizen Registration</h2>
                        <p className="mt-2 text-sm text-gray-600 text-center font-medium">
                            Enter your details to create a verified account.
                        </p>
                    </div>

                    <form className="mt-6 space-y-5" onSubmit={handleRegister}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-sm text-sm font-medium"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        {/* Role Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I am registering as...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('Citizen')}
                                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-sm text-sm font-bold uppercase tracking-wide transition-colors ${role === 'Citizen'
                                        ? 'bg-blue-50 border-blue-900 text-blue-900'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    👤 Citizen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('Worker')}
                                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-sm text-sm font-bold uppercase tracking-wide transition-colors ${role === 'Worker'
                                        ? 'bg-blue-50 border-blue-900 text-blue-900'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    👷 Worker
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your full name as per ID"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white pr-16"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-xs font-bold text-blue-800 uppercase hover:text-blue-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        {role === 'Worker' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Department</label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm transition-all focus:bg-white"
                                >
                                    <option value="">Select Official Department</option>
                                    <option value="Water">Water Supply</option>
                                    <option value="Road">Roads & Transport</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Sanitation">Sanitation</option>
                                </select>
                            </motion.div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all duration-200 uppercase tracking-widest active:scale-[0.99] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Creating Account...' : 'Register Account'}
                            </button>
                        </div>

                        <div className="text-center text-sm border-t border-gray-200 pt-4">
                            <span className="text-gray-600 text-xs">Already have an account? </span>
                            <Link to="/login" className="font-bold text-blue-900 hover:underline uppercase text-xs tracking-wide">
                                Sign in here
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
