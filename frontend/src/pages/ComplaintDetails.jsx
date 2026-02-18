import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getComplaintDetails, uploadWorkerWork, submitFeedback } from '../services/api';
import AIVerificationPanel from '../components/AIVerificationPanel';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [workImage, setWorkImage] = useState(null);
    const [workImagePreview, setWorkImagePreview] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [submittingWork, setSubmittingWork] = useState(false);

    const [rating, setRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        try {
            const s = localStorage.getItem('user');
            if (s) setUser(JSON.parse(s));
        } catch { navigate('/login'); }
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try { setComplaint(await getComplaintDetails(id)); }
        catch { setError('Failed to fetch details.'); }
        finally { setLoading(false); }
    };

    const handleWorkImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setWorkImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setWorkImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleWorkerSubmit = async (e) => {
        e.preventDefault();
        if (!workImage) return alert('Please upload an image.');
        setSubmittingWork(true);
        const formData = new FormData();
        formData.append('complaint_id', id);
        formData.append('worker_id', user.id);
        formData.append('image', workImage);
        formData.append('remarks', remarks || 'Work completed.');
        try { await uploadWorkerWork(formData); alert('Uploaded!'); fetchDetails(); }
        catch { alert('Upload failed.'); }
        finally { setSubmittingWork(false); }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try { await submitFeedback({ complaint_id: id, rating, feedback: feedbackText }); setFeedbackSubmitted(true); alert('Thank you!'); }
        catch { alert('Feedback failed.'); }
        finally { setSubmittingFeedback(false); }
    };

    if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (error) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>;

    const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified'];
    const currentIdx = Math.max(0, steps.indexOf(complaint.status));

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Header */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '24px 0',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>JanSetu Record</p>
                        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Complaint Details</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>Complaint ID</div>
                        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)' }}>{id.slice(-6).toUpperCase()}</div>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32, maxWidth: 900 }}>
                {/* Summary */}
                <div className="card-js" style={{
                    padding: 28, marginBottom: 24, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
                    borderLeft: '3px solid var(--accent)'
                }}>
                    <div>
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginBottom: 8, display: 'inline-block',
                            background: complaint.priority === 'High' ? '#fef2f2' : '#fff7ed',
                            color: complaint.priority === 'High' ? '#e74c3c' : '#e67e22'
                        }}>{complaint.priority} Priority</span>
                        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '8px 0 4px' }}>{complaint.category} Issue</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                            {complaint.department} Department • {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                        {complaint.location?.lat && (
                            <button onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`, '_blank')}
                                className="btn-secondary" style={{ marginTop: 12, fontSize: 12, height: 36, padding: '0 16px' }}>
                                📍 View Location
                            </button>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Status</div>
                        <span style={{
                            fontSize: 16, fontWeight: 700,
                            color: complaint.status === 'Verified' ? 'var(--color-success)' : 'var(--accent)'
                        }}>● {complaint.status}</span>
                    </div>
                </div>

                {/* Description + AI Analysis */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div className="card-js" style={{ padding: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Description</div>
                        <p style={{
                            fontSize: 14, lineHeight: 1.8, margin: 0, padding: 16,
                            background: 'var(--bg-secondary)', borderRadius: 12, borderLeft: '3px solid var(--border-light)'
                        }}>"{complaint.text}"</p>
                    </div>
                    <div style={{
                        background: 'var(--text-primary)', color: 'white', padding: 24, borderRadius: 20, position: 'relative', overflow: 'hidden'
                    }}>
                        <span style={{ position: 'absolute', top: 8, right: 16, fontSize: 48, opacity: 0.08 }}>🤖</span>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>AI Analysis</div>
                        {[
                            { label: 'Category', value: complaint.category },
                            { label: 'Department', value: complaint.department },
                        ].map(item => (
                            <div key={item.label} style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{item.label}</div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.value}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Severity</div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '85%', background: 'var(--color-success)', borderRadius: 3 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="card-js" style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24, textAlign: 'center' }}>
                        Resolution Timeline
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', maxWidth: 600, margin: '0 auto' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: 'var(--bg-secondary)', transform: 'translateY(-50%)', zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, height: 3, background: 'var(--color-success)', transform: 'translateY(-50%)', zIndex: 0, width: `${(currentIdx / (steps.length - 1)) * 100}%`, transition: 'width 1s' }} />
                        {steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700, background: i <= currentIdx ? 'var(--color-success)' : 'var(--bg-secondary)',
                                    color: i <= currentIdx ? 'white' : 'var(--text-secondary)', transition: 'all 0.3s'
                                }}>
                                    {i < currentIdx ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 600, color: i <= currentIdx ? 'var(--color-success)' : 'var(--text-secondary)', marginTop: 8, textTransform: 'uppercase' }}>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evidence  / AI Verification */}
                {complaint.work_image_path ? (
                    <AIVerificationPanel complaint={complaint} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                        <div className="card-js" style={{ padding: 20 }}>
                            <span className="pill-js" style={{ fontSize: 10, marginBottom: 12, display: 'inline-block' }}>Before</span>
                            <img src={`http://localhost:5000/uploads/${complaint.image_path}`} alt="Before"
                                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-light)' }} />
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                                Uploaded • {new Date(complaint.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="card-js" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>⏳</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Awaiting Resolution</span>
                        </div>
                    </div>
                )}

                {/* Worker Action */}
                {user?.role === 'worker' && complaint.status !== 'Verified' && complaint.status !== 'Resolved' && (
                    <div className="card-js" style={{ padding: 28, marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>👷 Worker Action Panel</h3>
                        <form onSubmit={handleWorkerSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Upload Completed Work Image</label>
                                <input type="file" accept="image/*" onChange={handleWorkImageChange} id="worker-file"
                                    style={{ display: 'none' }} />
                                <label htmlFor="worker-file" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                    📷 Choose File
                                </label>
                            </div>
                            {workImagePreview && (
                                <img src={workImagePreview} alt="Preview"
                                    style={{ height: 120, borderRadius: 12, border: '1px solid var(--border-light)', marginBottom: 16, objectFit: 'cover' }} />
                            )}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Remarks</label>
                                <textarea className="input-js" value={remarks} onChange={e => setRemarks(e.target.value)}
                                    placeholder="Describe work done..." style={{ minHeight: 80 }} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={submittingWork}>
                                {submittingWork ? 'Uploading...' : 'Submit for Verification'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Citizen Feedback */}
                {user?.role === 'citizen' && complaint.status === 'Verified' && !feedbackSubmitted && (
                    <div className="card-js" style={{ padding: 28, marginBottom: 24, textAlign: 'center' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>How was our service?</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Rate the resolution quality</p>
                        <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: 360, margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16, fontSize: 28 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} type="button" onClick={() => setRating(s)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 28,
                                            color: s <= rating ? '#f1c40f' : '#ddd', transition: 'transform 0.1s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = ''}>★</button>
                                ))}
                            </div>
                            <textarea className="input-js" value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                                placeholder="Additional feedback..." style={{ minHeight: 64, marginBottom: 16 }} />
                            <button type="submit" className="btn-primary" disabled={submittingFeedback} style={{ width: '100%' }}>
                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintDetails;
