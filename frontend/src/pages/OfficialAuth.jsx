import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser, verifyAdminAccessCode, getUPDistricts } from '../services/api';
import { motion } from 'framer-motion';

const OfficialAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin', department: '', access_code: '', district: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [accessCodeVerified, setAccessCodeVerified] = useState(false);
    const [accessCodeError, setAccessCodeError] = useState('');
    const [upDistricts, setUpDistricts] = useState([]);
    const navigate = useNavigate();

    // Password format validation
    const passwordChecks = [
        { label: 'Min 8 characters', test: (p) => p.length >= 8 },
        { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'A digit (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'Special char (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
    ];
    const isPasswordValid = isLogin || passwordChecks.every(c => c.test(formData.password));

    useEffect(() => {
        // Fetch UP districts for dropdown
        const fetchDistricts = async () => {
            try {
                const data = await getUPDistricts();
                setUpDistricts(Array.isArray(data) ? data : []);
            } catch { /* Districts will be empty */ }
        };
        fetchDistricts();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
        setAccessCodeVerified(false);
        setAccessCodeError('');
    };

    const handleVerifyCode = async () => {
        if (!formData.access_code.trim()) {
            setAccessCodeError('Please enter an access code.');
            return;
        }
        try {
            const result = await verifyAdminAccessCode(formData.access_code);
            if (result.valid) {
                // Auto-set the role based on the code
                setFormData(prev => ({ ...prev, role: result.role }));
                setAccessCodeVerified(true);
                setAccessCodeError('');
            }
        } catch (err) {
            setAccessCodeError(err.response?.data?.message || 'Invalid access code.');
            setAccessCodeVerified(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            if (isLogin) {
                // 'admin_portal' context: only administration roles should be allowed here.
                const data = await loginUser(formData.email, formData.password, 'admin_portal');
                if (!data?.user) throw { response: { data: { error: 'Invalid response.' } } };
                const role = data.user.role;

                // Enforce that only admin / governance can use this form
                if (role !== 'admin' && role !== 'governance') {
                    // Clear any token/user that may have been set
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    throw { response: { data: { error: 'Access restricted to administration roles only.' } } };
                }

                if (role === 'admin') navigate('/admin-dashboard');
                else if (role === 'governance') navigate('/governance-dashboard');
                else setError('Unauthorized role.');
            } else {
                // Registration requires verified access code
                if (!accessCodeVerified) {
                    setError('Please verify your access code first.');
                    setLoading(false);
                    return;
                }
                if (!isPasswordValid) {
                    setError('Password does not meet the required format.');
                    setLoading(false);
                    return;
                }
                await registerUser(formData);
                alert('Registration successful! Please login.');
                setIsLogin(true);
                setAccessCodeVerified(false);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed.');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Branding */}
            <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                style={{
                    display: 'none', width: '50%', flexDirection: 'column', justifyContent: 'center',
                    padding: 64, background: 'var(--text-primary)', color: 'white', position: 'relative', overflow: 'hidden'
                }}
                className="official-auth-left"
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                    background: 'linear-gradient(to bottom, #f97316, white, #22c55e)'
                }} />

                <div style={{ position: 'relative', zIndex: 1, paddingLeft: 24 }}>
                    <div style={{
                        width: 64, height: 64, background: 'white', borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32
                    }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            style={{ height: 44 }} alt="Emblem" />
                    </div>

                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 12px', border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 20, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase'
                    }}>Restricted Access</span>

                    <h1 style={{
                        fontSize: 40, fontFamily: 'var(--font-heading)', fontWeight: 700,
                        marginTop: 24, marginBottom: 16, lineHeight: 1.2
                    }}>
                        Official Authority<br />
                        <span style={{ color: 'var(--accent)' }}>Portal</span>
                    </h1>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 400, lineHeight: 1.7 }}>
                        Secure gateway for municipal administration and governance bodies.
                        <br /><br />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                            🔐 Access Code required for registration. Codes are generated by developers only.
                        </span>
                    </p>
                </div>
            </motion.div>

            {/* Right Form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 32, position: 'relative'
            }}>
                <Link to="/" style={{
                    position: 'absolute', top: 24, right: 32, fontSize: 13, fontWeight: 600,
                    color: 'var(--text-secondary)', textDecoration: 'none'
                }}>← Home</Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="card-js" style={{ width: '100%', maxWidth: 440, padding: 40 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                            {isLogin ? 'Authority Login' : 'Official Registration'}
                        </h2>
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--color-danger)',
                            background: '#fef2f2', padding: '4px 12px', borderRadius: 20
                        }}>Authorized Personnel Only</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '12px 16px', background: '#fef2f2', borderRadius: 12,
                                borderLeft: '3px solid var(--color-danger)', fontSize: 13,
                                color: 'var(--color-danger)', marginBottom: 20
                            }}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {/* Role Toggle */}
                        <div style={{
                            display: 'flex', background: 'var(--bg-secondary)', borderRadius: 12,
                            padding: 4, marginBottom: 24
                        }}>
                            {['admin', 'governance'].map(role => (
                                <button key={role} type="button" onClick={() => handleRoleSelect(role)} style={{
                                    flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
                                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                                    fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                                    textTransform: 'capitalize',
                                    background: formData.role === role ? 'white' : 'transparent',
                                    boxShadow: formData.role === role ? 'var(--shadow-card)' : 'none',
                                    color: formData.role === role ? 'var(--text-primary)' : 'var(--text-secondary)'
                                }}>{role}</button>
                            ))}
                        </div>

                        {!isLogin && (
                            <>
                                {/* Access Code - Required for Registration */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#e65100' }}>
                                        🔐 Developer Access Code *
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input className="input-js" name="access_code" type="text" required
                                            value={formData.access_code}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setAccessCodeVerified(false);
                                                setAccessCodeError('');
                                            }}
                                            placeholder="e.g., JANSETU-ADM-2026-ALPHA"
                                            style={{
                                                flex: 1, fontFamily: 'monospace', letterSpacing: '0.05em',
                                                border: accessCodeVerified ? '2px solid #2ecc71' : accessCodeError ? '2px solid #e74c3c' : undefined
                                            }}
                                        />
                                        <button type="button" onClick={handleVerifyCode}
                                            style={{
                                                padding: '0 16px', borderRadius: 12, border: 'none',
                                                background: accessCodeVerified ? '#2ecc71' : 'var(--accent)',
                                                color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}>
                                            {accessCodeVerified ? '✅ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    {accessCodeError && (
                                        <p style={{ fontSize: 12, color: '#e74c3c', margin: '6px 0 0', fontWeight: 500 }}>
                                            ❌ {accessCodeError}
                                        </p>
                                    )}
                                    {accessCodeVerified && (
                                        <p style={{ fontSize: 12, color: '#2ecc71', margin: '6px 0 0', fontWeight: 500 }}>
                                            ✅ Code verified for <strong>{formData.role}</strong> role.
                                        </p>
                                    )}
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Official Name</label>
                                    <input className="input-js" name="name" type="text" required value={formData.name}
                                        onChange={handleChange} placeholder="Commissioner R.K. Singh" />
                                </div>

                                {/* UP District Selection */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                        📍 District (UP)
                                    </label>
                                    <select className="input-js" name="district" value={formData.district}
                                        onChange={handleChange} required
                                        style={{ width: '100%', height: 48, fontSize: 14 }}>
                                        <option value="">— Select your district —</option>
                                        {upDistricts.map(d => (
                                            <option key={d.name} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                            <input className="input-js" name="email" type="email" required value={formData.email}
                                onChange={handleChange} placeholder="official@jansetu.gov.in" />
                        </div>

                        <div style={{ marginBottom: !isLogin && formData.password.length > 0 ? 8 : 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
                            <input className="input-js" name="password" type="password" required value={formData.password}
                                onChange={handleChange} placeholder="••••••••" />
                        </div>

                        {/* Password Strength Checklist (registration only) */}
                        {!isLogin && formData.password.length > 0 && (
                            <div style={{
                                marginBottom: 24, padding: '12px 16px', borderRadius: 12,
                                background: 'var(--bg-secondary)', border: '1px solid var(--border-light)'
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                    Password Requirements
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                    {passwordChecks.map((check, i) => {
                                        const passed = check.test(formData.password);
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

                        <button type="submit" className="btn-primary"
                            disabled={loading || (!isLogin && !accessCodeVerified) || (!isLogin && !isPasswordValid)}
                            style={{
                                width: '100%',
                                opacity: (loading || (!isLogin && !accessCodeVerified) || (!isLogin && !isPasswordValid)) ? 0.5 : 1
                            }}>
                            {loading ? 'Verifying...' : (isLogin ? 'Access Dashboard' : 'Create Official ID')}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setAccessCodeVerified(false); setAccessCodeError(''); }}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, color: 'var(--accent)',
                                fontFamily: 'var(--font-body)'
                            }}>
                            {isLogin ? 'Create New Official ID' : 'Back to Login'}
                        </button>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .official-auth-left { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default OfficialAuth;
