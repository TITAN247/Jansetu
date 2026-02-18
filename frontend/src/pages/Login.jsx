import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                const routes = {
                    citizen: '/user-dashboard',
                    worker: '/worker-dashboard',
                    dept_officer: '/dept-officer-dashboard',
                    admin: '/admin-dashboard',
                    governance: '/governance-dashboard'
                };
                navigate(routes[parsed.role] || '/', { replace: true });
            } catch { }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 'public' context: only citizen / worker / dept_officer should be allowed here.
            const res = await loginUser(email, password, 'public');
            const role = res.user.role;

            // Block administration roles from using the public login form
            if (role === 'admin' || role === 'governance') {
                // Clear any token/user that may have been set
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setError('Administration roles must sign in from the Official Authority portal.');
                setLoading(false);
                return;
            }

            const routes = {
                citizen: '/user-dashboard',
                worker: '/worker-dashboard',
                dept_officer: '/dept-officer-dashboard',
                admin: '/admin-dashboard',
                governance: '/governance-dashboard',
            };
            navigate(routes[role] || '/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div className="blob" style={{
                width: 400, height: 400, background: 'var(--bg-secondary)',
                top: '-10%', right: '-5%'
            }} />
            <div className="blob" style={{
                width: 300, height: 300, background: 'rgba(43,107,255,0.06)',
                bottom: '10%', left: '-5%'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16
                        }}>JS</div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22, color: 'var(--text-primary)' }}>
                            JanSetu<span style={{ color: 'var(--accent)' }}>AI</span>
                        </span>
                    </Link>
                    <h2 style={{ fontSize: 28, marginBottom: 8 }}>Welcome back</h2>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>Sign in to access your dashboard</p>
                </div>

                {/* Card */}
                <div className="card-js" style={{ padding: 32 }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500,
                                marginBottom: 20
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Email Address</label>
                            <input
                                type="email"
                                className="input-js"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Password</label>
                            <input
                                type="password"
                                className="input-js"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center', marginTop: 24, paddingTop: 20,
                        borderTop: '1px solid var(--border-light)'
                    }}>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Official link */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/up2" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        Official / Worker Login →
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
