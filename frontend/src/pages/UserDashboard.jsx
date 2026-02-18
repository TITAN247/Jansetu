import React, { useEffect, useState } from 'react';
import { getUserComplaints, getComplaintsByEmail, submitFeedback, reopenComplaint } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [appealReason, setAppealReason] = useState('');
    const [appealLoading, setAppealLoading] = useState(false);
    const [showAppealForm, setShowAppealForm] = useState(false);

    const getUser = () => {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    const userId = user?.id || user?._id;
    if (!user || !userId) { window.location.href = '/login'; return null; }

    const fetchComplaints = async () => {
        try {
            // Fetch by user ID
            const byId = await getUserComplaints(userId);
            const idList = Array.isArray(byId) ? byId : [];

            // Also fetch by email (catches pre-registration guest complaints)
            let merged = [...idList];
            if (user.email) {
                try {
                    const byEmail = await getComplaintsByEmail(user.email);
                    if (Array.isArray(byEmail)) {
                        const existingIds = new Set(idList.map(c => c._id));
                        const newOnes = byEmail.filter(c => !existingIds.has(c._id));
                        merged = [...merged, ...newOnes];
                    }
                } catch { /* email fetch failed, use ID results only */ }
            }

            setComplaints(merged.slice().reverse());
        } catch { setComplaints([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        try {
            await submitFeedback({ complaint_id: selectedComplaint._id, rating: feedbackRating, comment: feedbackComment });
            alert('Feedback submitted!');
            fetchComplaints();
            setSelectedComplaint(null);
        } catch { alert('Failed to submit feedback.'); }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Verified').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        verified: complaints.filter(c => c.status === 'Verified').length
    };

    const handleAppealSubmit = async () => {
        if (!selectedComplaint || !appealReason.trim()) return;
        setAppealLoading(true);
        try {
            await reopenComplaint(selectedComplaint._id, appealReason);
            alert('Complaint reopened successfully! It will be reassigned for re-investigation.');
            setShowAppealForm(false);
            setAppealReason('');
            setSelectedComplaint(null);
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reopen complaint.');
        } finally {
            setAppealLoading(false);
        }
    };

    const statusPillStyle = (status) => {
        const map = {
            'Submitted': { bg: '#f0f2f5', color: '#4A5B7A' },
            'Assigned': { bg: '#eaf2ff', color: '#2B6BFF' },
            'In Progress': { bg: '#fff7ed', color: '#e67e22' },
            'Resolved': { bg: '#e6f4ea', color: '#2ecc71' },
            'Verified': { bg: '#e0f7fa', color: '#00838f' },
            'Reopened': { bg: '#fff3e0', color: '#ff6f00' }
        };
        const m = map[status] || map['Submitted'];
        return { background: m.bg, color: m.color, border: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 };
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Dashboard Header */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '32px 0 24px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 16
                }}>
                    <div>
                        <h1 style={{ fontSize: 24, marginBottom: 4 }}>
                            Welcome, <span style={{ color: 'var(--accent)' }}>{user?.name || 'Citizen'}</span>
                        </h1>
                        <p style={{ fontSize: 14, margin: 0 }}>Citizen Dashboard</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/register-complaint')}>
                        + New Complaint
                    </button>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 16, marginBottom: 32
                }}>
                    {[
                        { label: 'Total', value: stats.total, icon: '📋', color: 'var(--accent)' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#e67e22' },
                        { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'var(--color-success)' },
                        { label: 'AI Verified', value: stats.verified, icon: '🤖', color: '#00838f' }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }} className="card-js" style={{ padding: 24 }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Complaint List */}
                <h2 style={{ fontSize: 20, marginBottom: 20 }}>Your Complaints</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="card-js" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📂</div>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>No complaints yet</h3>
                        <p style={{ marginBottom: 24 }}>You haven't submitted any grievances.</p>
                        <button className="btn-primary" onClick={() => navigate('/register-complaint')}>
                            Submit Your First Complaint
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20
                    }}>
                        {complaints.map((c, i) => (
                            <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }} className="card-js"
                                style={{
                                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => setSelectedComplaint(c)}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                            >
                                <div style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={statusPillStyle(c.status)}>{c.status}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                                        {c.category} Issue
                                    </h3>
                                    <p style={{
                                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0
                                    }}>{c.text}</p>
                                </div>
                                <div style={{
                                    padding: '12px 24px', borderTop: '1px solid var(--border-light)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: 'var(--bg-primary)'
                                }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="pill-js" style={{ fontSize: 10, height: 24, padding: '0 10px' }}>{c.priority}</span>
                                        <span className="pill-js" style={{ fontSize: 10, height: 24, padding: '0 10px' }}>{c.department}</span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>View →</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedComplaint(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.5)', backdropFilter: 'blur(6px)', padding: 20
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card-js"
                            style={{
                                width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto',
                                padding: 0, borderRadius: 24
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px 28px', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', borderBottom: '1px solid var(--border-light)',
                                position: 'sticky', top: 0, background: 'white', zIndex: 2, borderRadius: '24px 24px 0 0'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Complaint Details</h2>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {selectedComplaint._id}</span>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} style={{
                                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                                    background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 18,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)', transition: 'all 0.2s'
                                }}>✕</button>
                            </div>

                            <div style={{ padding: 28 }}>
                                {/* Status Tracker */}
                                <div style={{
                                    padding: 20, background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 24
                                }}>
                                    <StatusTracker status={selectedComplaint.status} />
                                </div>

                                {/* Info Grid */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: 20, marginBottom: 24
                                }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</div>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{selectedComplaint.text}</p>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedComplaint.category}</span>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedComplaint.department}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Evidence</div>
                                        <img src={`http://localhost:5000/uploads/${selectedComplaint.image_before}`} alt="Before"
                                            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-light)' }} />
                                        {selectedComplaint.image_after && (
                                            <img src={`http://localhost:5000/uploads/${selectedComplaint.image_after}`} alt="After"
                                                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--color-success)', marginTop: 12 }} />
                                        )}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {selectedComplaint.status === 'Verified' && !selectedComplaint.feedback && (
                                    <div style={{
                                        padding: 24, background: 'var(--bg-secondary)', borderRadius: 16,
                                        borderLeft: '3px solid var(--accent)'
                                    }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Rate this resolution</h3>
                                        <form onSubmit={handleFeedbackSubmit}>
                                            <div style={{ display: 'flex', gap: 4, marginBottom: 16, fontSize: 28 }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button type="button" key={star} onClick={() => setFeedbackRating(star)}
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 28,
                                                            color: star <= feedbackRating ? '#f1c40f' : '#ddd', transition: 'transform 0.1s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = ''}>★</button>
                                                ))}
                                            </div>
                                            <textarea className="input-js" placeholder="Share your feedback..." value={feedbackComment}
                                                onChange={e => setFeedbackComment(e.target.value)} rows="3" style={{ marginBottom: 16 }} />
                                            <button type="submit" className="btn-primary">Submit Feedback</button>
                                        </form>
                                    </div>
                                )}

                                {selectedComplaint.feedback && (
                                    <div style={{
                                        padding: '16px 20px', background: '#e6f4ea', borderRadius: 16,
                                        display: 'flex', alignItems: 'center', gap: 12, fontSize: 14
                                    }}>
                                        <span style={{ fontSize: 24 }}>✅</span>
                                        <div>
                                            <strong>Feedback recorded</strong>
                                            <p style={{ fontSize: 12, margin: 0, opacity: 0.8 }}>Rated {selectedComplaint.feedback.rating}/5 stars</p>
                                        </div>
                                    </div>
                                )}

                                {/* Reopen / Appeal Section */}
                                {(selectedComplaint.status === 'Resolved' || selectedComplaint.status === 'Verified') && (
                                    <div style={{
                                        marginTop: 20, padding: 24, background: '#fff8e1', borderRadius: 16,
                                        borderLeft: '3px solid #ff6f00'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e65100', margin: 0 }}>🔄 Not Satisfied?</h3>
                                            {selectedComplaint.reopen_count > 0 && (
                                                <span style={{ fontSize: 11, color: '#bf360c', fontWeight: 600 }}>
                                                    Appeals used: {selectedComplaint.reopen_count}/3
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 13, color: '#5d4037', marginBottom: 16, lineHeight: 1.6 }}>
                                            If you're not satisfied with the resolution, you can reopen this complaint for re-investigation.
                                        </p>
                                        {!showAppealForm ? (
                                            <button onClick={() => setShowAppealForm(true)}
                                                disabled={(selectedComplaint.reopen_count || 0) >= 3}
                                                style={{
                                                    padding: '10px 24px', borderRadius: 12, border: 'none',
                                                    background: (selectedComplaint.reopen_count || 0) >= 3 ? '#ccc' : 'linear-gradient(135deg, #ff6f00, #ff8f00)',
                                                    color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}>
                                                {(selectedComplaint.reopen_count || 0) >= 3 ? 'Max Appeals Reached' : '⚡ Reopen / Appeal'}
                                            </button>
                                        ) : (
                                            <div>
                                                <textarea
                                                    className="input-js"
                                                    placeholder="Explain why you are not satisfied with the resolution..."
                                                    value={appealReason}
                                                    onChange={e => setAppealReason(e.target.value)}
                                                    rows="3"
                                                    style={{ marginBottom: 12, width: '100%' }}
                                                />
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button onClick={handleAppealSubmit} disabled={appealLoading || !appealReason.trim()}
                                                        style={{
                                                            padding: '10px 24px', borderRadius: 12, border: 'none',
                                                            background: appealReason.trim() ? '#ff6f00' : '#ccc',
                                                            color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                                                        }}>
                                                        {appealLoading ? 'Submitting...' : '📤 Submit Appeal'}
                                                    </button>
                                                    <button onClick={() => { setShowAppealForm(false); setAppealReason(''); }}
                                                        style={{
                                                            padding: '10px 18px', borderRadius: 12,
                                                            border: '1px solid var(--border-color)', background: 'transparent',
                                                            color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                                                        }}>Cancel</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Appeal History */}
                                        {selectedComplaint.appeal_history && selectedComplaint.appeal_history.length > 0 && (
                                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#5d4037', marginBottom: 8 }}>APPEAL HISTORY</div>
                                                {selectedComplaint.appeal_history.map((appeal, idx) => (
                                                    <div key={idx} style={{
                                                        padding: '8px 12px', background: '#fff3e0', borderRadius: 8,
                                                        marginBottom: 6, fontSize: 12
                                                    }}>
                                                        <strong>#{idx + 1}:</strong> {appeal.reason}
                                                        <span style={{ float: 'right', color: '#8d6e63', fontSize: 11 }}>
                                                            {new Date(appeal.reopened_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reopened Status Banner */}
                                {selectedComplaint.status === 'Reopened' && (
                                    <div style={{
                                        marginTop: 20, padding: '16px 20px', background: '#fff3e0', borderRadius: 16,
                                        display: 'flex', alignItems: 'center', gap: 12, fontSize: 14,
                                        border: '1px solid #ffe0b2'
                                    }}>
                                        <span style={{ fontSize: 24 }}>🔄</span>
                                        <div>
                                            <strong style={{ color: '#e65100' }}>Complaint Reopened</strong>
                                            <p style={{ fontSize: 12, margin: 0, color: '#795548' }}>Your complaint is being re-investigated.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboard;
