import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getComplaintDetails } from '../services/api';

const PublicTracking = () => {
    const [complaintId, setComplaintId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!complaintId.trim()) return;
        setLoading(true); setError(''); setComplaint(null);
        try {
            const data = await getComplaintDetails(complaintId);
            setComplaint(data);
        } catch {
            setError('Complaint not found or invalid ID. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (step) => {
        if (!complaint) return 'pending';
        const status = complaint.status.toLowerCase();
        const steps = ['submitted', 'assigned', 'in progress', 'resolved', 'verified'];
        const currentIndex = steps.indexOf(status);
        const stepIndex = steps.indexOf(step);
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Search Area */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '80px 0 60px',
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <div className="blob" style={{ width: 400, height: 400, background: 'rgba(43,107,255,0.06)', top: '-20%', right: '10%' }} />
                <div className="container-js" style={{ maxWidth: 600, position: 'relative', zIndex: 1 }}>
                    <div className="pill-js pill-js--accent" style={{ marginBottom: 16 }}>Public Portal</div>
                    <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 12 }}>Track Your Complaint</h1>
                    <p style={{ marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
                        Enter your Complaint ID to view real-time progress and resolution status.
                    </p>

                    <form onSubmit={handleSearch} style={{
                        display: 'flex', gap: 8, background: 'white',
                        padding: 6, borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <input
                            type="text"
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value)}
                            placeholder="Enter Complaint ID (e.g., JAN-ROAD-2026-X92A)"
                            style={{
                                flex: 1, padding: '14px 20px', border: 'none', outline: 'none',
                                fontFamily: 'var(--font-body)', fontSize: 15, borderRadius: 'var(--radius-pill)',
                                color: 'var(--text-primary)', fontWeight: 500
                            }}
                        />
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ borderRadius: 'var(--radius-pill)', padding: '12px 28px' }}>
                            {loading ? '...' : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 12,
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: 'var(--color-danger)', fontSize: 14, fontWeight: 500
                        }}>
                            ⚠️ {error}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Results */}
            <section style={{ flex: 1, padding: '40px 0 80px' }}>
                <div className="container-js" style={{ maxWidth: 800 }}>
                    {complaint && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-js" style={{ overflow: 'hidden' }}>

                            {/* Header */}
                            <div style={{
                                padding: '20px 28px', background: 'var(--bg-secondary)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border-light)'
                            }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Complaint ID</div>
                                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                                        {complaint._id.slice(-6).toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Date</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date().toLocaleDateString()}</div>
                                    </div>
                                    {complaint.priority && (
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Priority</div>
                                            <span className={`pill-js ${complaint.priority === 'High' ? 'pill-js--danger' : 'pill-js--warning'}`}
                                                style={{ fontSize: 11, height: 26, padding: '0 10px' }}>
                                                {complaint.priority}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: 28 }}>
                                {/* Category & Description */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: 24, marginBottom: 32
                                }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Category & Department</div>
                                        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{complaint.category}</h3>
                                        <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>{complaint.department} Department</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Description</div>
                                        <p style={{
                                            padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: 12,
                                            fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)'
                                        }}>"{complaint.text}"</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div style={{ marginBottom: 32 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Progress Timeline</div>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        position: 'relative', maxWidth: 600, margin: '0 auto'
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '50%', left: 0, right: 0,
                                            height: 3, background: 'var(--bg-secondary)', zIndex: 0, transform: 'translateY(-50%)'
                                        }} />
                                        {['submitted', 'assigned', 'in progress', 'resolved'].map((step, idx) => {
                                            const status = getStepStatus(step);
                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                                    position: 'relative', zIndex: 1, background: 'white', padding: '0 4px'
                                                }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 12, fontWeight: 700,
                                                        background: status === 'completed' ? 'var(--color-success)' :
                                                            status === 'current' ? 'var(--accent)' : 'var(--bg-secondary)',
                                                        color: status === 'pending' ? 'var(--text-secondary)' : 'white',
                                                        boxShadow: status === 'current' ? '0 0 0 4px rgba(43,107,255,0.15)' : 'none'
                                                    }}>
                                                        {status === 'completed' ? '✓' : idx + 1}
                                                    </div>
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        color: status === 'pending' ? 'var(--text-secondary)' : 'var(--accent)'
                                                    }}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Verification Images */}
                                {(complaint.status === 'Resolved' || complaint.status === 'Verified') && (
                                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 24 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Verification Evidence</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                                            <div style={{ position: 'relative' }}>
                                                <span className="pill-js pill-js--danger" style={{
                                                    position: 'absolute', top: 8, left: 8, fontSize: 10, height: 24, padding: '0 10px', zIndex: 1
                                                }}>Before</span>
                                                <img src={`http://localhost:5000/uploads/${complaint.image_path}`} alt="Before"
                                                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-light)' }} />
                                            </div>
                                            {complaint.work_image_path ? (
                                                <div style={{ position: 'relative' }}>
                                                    <span className="pill-js pill-js--success" style={{
                                                        position: 'absolute', top: 8, left: 8, fontSize: 10, height: 24, padding: '0 10px', zIndex: 1
                                                    }}>After</span>
                                                    <img src={`http://localhost:5000/uploads/${complaint.work_image_path}`} alt="After"
                                                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--color-success)' }} />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-success)' }}>
                                                        ✅ AI Verified Match
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    height: 180, borderRadius: 12, border: '2px dashed var(--border-light)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic'
                                                }}>Resolution image pending</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!complaint && !loading && (
                        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                            <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                Enter a valid Complaint ID above to see status.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PublicTracking;
