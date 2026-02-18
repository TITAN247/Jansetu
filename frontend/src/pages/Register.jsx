import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';
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

    // Password format validation
    const passwordChecks = [
        { label: 'Min 8 characters', test: (p) => p.length >= 8 },
        { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'A digit (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'Special character (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
    ];
    const isPasswordValid = passwordChecks.every(c => c.test(password));

    const getDashboardPath = (userRole) => {
        switch (userRole?.toLowerCase()) {
            case 'citizen': return '/user-dashboard';
            case 'worker': return '/worker-dashboard';
            case 'dept_officer': return '/dept-officer-dashboard';
            case 'admin': return '/admin-dashboard';
            case 'governance': return '/governance-dashboard';
            default: return '/';
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isPasswordValid) {
            setError('Password does not meet the required format.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await registerUser({ name, email, password, role, department });
            // Auto-login after successful registration
            const loginData = await loginUser(email, password);
            navigate(getDashboardPath(loginData.user?.role || role));
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            <div className="blob" style={{ width: 400, height: 400, background: 'var(--bg-secondary)', top: '-10%', left: '-5%' }} />
            <div className="blob" style={{ width: 300, height: 300, background: 'rgba(43,107,255,0.06)', bottom: '5%', right: '-5%' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
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
                    <h2 style={{ fontSize: 28, marginBottom: 8 }}>Create your account</h2>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>Join the governance revolution</p>
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
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500, marginBottom: 20
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleRegister}>
                        {/* Role Selector */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                I am registering as
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {['Citizen', 'Worker', 'dept_officer'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            padding: '12px 16px', borderRadius: 16,
                                            border: role === r ? '2px solid var(--accent)' : '2px solid var(--border-light)',
                                            background: role === r ? 'var(--bg-secondary)' : 'var(--surface)',
                                            color: role === r ? 'var(--accent)' : 'var(--text-secondary)',
                                            fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                            fontFamily: 'var(--font-body)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {r === 'Citizen' ? '👤' : '👷'} {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                            <input type="text" className="input-js" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                            <input type="email" className="input-js" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: 8, position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-js"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: 60 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 14, top: 38,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                                    fontFamily: 'var(--font-body)', textTransform: 'uppercase'
                                }}
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>

                        {/* Password Strength Checklist */}
                        {password.length > 0 && (
                            <div style={{
                                marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                                background: 'var(--bg-secondary)', border: '1px solid var(--border-light)'
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                    Password Requirements
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                    {passwordChecks.map((check, i) => {
                                        const passed = check.test(password);
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: passed ? '#2ecc71' : '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}>
                                                <span style={{ fontSize: 10 }}>{passed ? '✅' : '⬜'}</span>
                                                {check.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(role === 'Worker' || role === 'dept_officer') && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Department</label>
                                <select className="input-js" value={department} onChange={e => setDepartment(e.target.value)}>
                                    <option value="">Select Department</option>
                                    <option value="Water">Water Supply</option>
                                    <option value="Road">Roads & Transport</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Sanitation">Sanitation</option>
                                </select>
                            </motion.div>
                        )}

                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
