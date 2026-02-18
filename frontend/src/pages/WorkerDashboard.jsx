import React, { useEffect, useState } from 'react';
import { getWorkerAssignedTasks, uploadWorkerWork, acceptTask } from '../services/api';
import { Link } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';

const StepItem = ({ step, current, label }) => {
    let icon = '⚪', color = 'var(--text-secondary)';
    if (current > step) { icon = '✅'; color = 'var(--color-success)'; }
    else if (current === step) { icon = '⏳'; color = 'var(--accent)'; }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: current >= step ? 700 : 400, color }}>{label}</span>
        </div>
    );
};

const WorkerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('active');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [verificationStep, setVerificationStep] = useState(0);
    const [verificationResult, setVerificationResult] = useState(null);

    const getUser = () => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    };
    const user = getUser();
    if (!user) { window.location.href = '/login'; return null; }

    const fetchTasks = async () => {
        try {
            // Fetch tasks assigned specifically to this worker by worker_id
            const data = await getWorkerAssignedTasks(user.id);
            const p = { 'High': 3, 'Medium': 2, 'Low': 1 };
            setTasks(Array.isArray(data) ? data.sort((a, b) => (p[b.priority] || 0) - (p[a.priority] || 0)) : []);
        } catch { setTasks([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleAcceptTask = async (taskId) => {
        try {
            await acceptTask(taskId, user.id);
            fetchTasks(); // Refresh
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to accept task');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        if (!image || !selectedTask) return;
        setUploading(true); setVerificationStep(1);
        const stepInterval = setInterval(() => setVerificationStep(prev => prev < 4 ? prev + 1 : prev), 1800);
        const formData = new FormData();
        formData.append('complaint_id', selectedTask._id);
        formData.append('image', image);
        formData.append('remark', remarks);
        try {
            const data = await uploadWorkerWork(formData);
            clearInterval(stepInterval); setVerificationStep(4);
            setTimeout(() => { setVerificationResult(data.verification || {}); setUploading(false); }, 1000);
        } catch (error) {
            clearInterval(stepInterval); setUploading(false);
            alert(`Upload failed: ${error.response?.data?.error || error.message || 'Unknown'}`);
        }
    };

    const stats = {
        total: tasks.length,
        highPriority: tasks.filter(t => t.priority === 'High').length,
        pending: tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Resolved' || t.status === 'Verified').length
    };

    const filteredTasks = tasks.filter(t =>
        viewMode === 'active'
            ? ['Pending', 'Submitted', 'Assigned', 'In Progress'].includes(t.status)
            : ['Resolved', 'Verified'].includes(t.status)
    );

    const priorityPill = (p) => {
        const map = { 'High': 'pill-js--danger', 'Medium': 'pill-js--warning' };
        return `pill-js ${map[p] || 'pill-js--success'}`;
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Header */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '32px 0 24px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 24, marginBottom: 4 }}>
                            Field Officer Portal
                        </h1>
                        <p style={{ fontSize: 14, margin: 0 }}>
                            Department: <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{user.department}</span>
                        </p>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 20,
                        background: '#e6f4ea', fontSize: 12, fontWeight: 600,
                        color: 'var(--color-success)'
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'var(--color-success)', animation: 'float 2s ease-in-out infinite'
                        }} />
                        System Online
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Assigned', value: stats.total, icon: '📋', color: 'var(--accent)' },
                        { label: 'High Priority', value: stats.highPriority, icon: '🔴', color: 'var(--color-danger)' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#e67e22' },
                        { label: 'Completed', value: stats.completed, icon: '✅', color: 'var(--color-success)' }
                    ].map((stat, i) => (
                        <div key={i} className="card-js" style={{ padding: 24 }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab Selector */}
                <div className="card-js" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex', gap: 0, borderBottom: '1px solid var(--border-light)',
                        padding: '0 24px'
                    }}>
                        {['active', 'history'].map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} style={{
                                padding: '16px 20px', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-body)',
                                background: 'none', transition: 'all 0.2s',
                                borderBottom: viewMode === mode ? '2px solid var(--accent)' : '2px solid transparent',
                                color: viewMode === mode ? 'var(--accent)' : 'var(--text-secondary)'
                            }}>
                                {mode === 'active' ? 'Active Tasks' : 'History'}
                                <span style={{
                                    marginLeft: 8, padding: '2px 8px', borderRadius: 10,
                                    background: viewMode === mode ? 'var(--bg-secondary)' : 'transparent',
                                    fontSize: 11
                                }}>{filteredTasks.length}</span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, opacity: 0.5 }}>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                            <p>{viewMode === 'active' ? 'No active tasks.' : 'No completed work.'}</p>
                        </div>
                    ) : (
                        <div>
                            {filteredTasks.map((task, i) => (
                                <motion.div
                                    key={task._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        padding: '20px 24px', borderBottom: '1px solid var(--border-light)',
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        cursor: 'pointer', transition: 'background 0.2s', flexWrap: 'wrap'
                                    }}
                                    onClick={() => setSelectedTask(task)}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                >
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                            <span className={priorityPill(task.priority)} style={{ fontSize: 10, height: 24, padding: '0 10px' }}>
                                                {task.priority}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                                REF: {task._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{task.category} Issue</h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
                                        <span style={{
                                            fontWeight: 600, fontSize: 13,
                                            color: ['Resolved', 'Verified'].includes(task.status) ? 'var(--color-success)' : 'var(--accent)'
                                        }}>{task.status}</span>
                                        {task.status === 'Assigned' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleAcceptTask(task._id); }}
                                                style={{
                                                    padding: '6px 14px', borderRadius: 8, border: 'none',
                                                    background: 'var(--accent)', color: '#fff', fontSize: 12,
                                                    fontWeight: 600, cursor: 'pointer', marginTop: 4
                                                }}>
                                                ✅ Accept Task
                                            </button>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>→</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail / Action Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedTask(null)}
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
                                width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
                                padding: 0, borderRadius: 24, display: 'flex', flexDirection: 'column'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px 28px', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', borderBottom: '1px solid var(--border-light)',
                                position: 'sticky', top: 0, background: 'white', zIndex: 2, borderRadius: '24px 24px 0 0'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Task Detail</h2>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>REF: {selectedTask._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <button onClick={() => setSelectedTask(null)} style={{
                                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                                    background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 18,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                                }}>✕</button>
                            </div>

                            <div style={{ padding: 28 }}>
                                {/* Status */}
                                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 24 }}>
                                    <StatusTracker status={selectedTask.status} />
                                </div>

                                {/* Info + Image */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</div>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>{selectedTask.text}</p>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedTask.category}</span>
                                            <span className={priorityPill(selectedTask.priority)} style={{ fontSize: 11, height: 26, padding: '0 12px' }}>{selectedTask.priority}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Evidence (Before)</div>
                                        <img src={`http://localhost:5000/uploads/${selectedTask.image_before}`} alt="Before"
                                            style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border-light)' }} />
                                        {selectedTask.location?.lat && (
                                            <a href={`https://www.google.com/maps?q=${selectedTask.location.lat},${selectedTask.location.lng}`}
                                                target="_blank" rel="noopener noreferrer" className="btn-secondary"
                                                style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none', fontSize: 12, height: 36, padding: '0 16px' }}>
                                                🗺️ Navigate
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Action Panel */}
                                {selectedTask.status === 'Verified' || selectedTask.status === 'Resolved' ? (
                                    <div style={{ textAlign: 'center', padding: 32, background: '#e6f4ea', borderRadius: 16 }}>
                                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                                        <h3 style={{ fontSize: 20, color: 'var(--color-success)', marginBottom: 8 }}>Work Completed</h3>
                                        <p style={{ fontSize: 14, margin: 0 }}>This grievance has been resolved and verified.</p>
                                        {selectedTask.image_after && (
                                            <img src={`http://localhost:5000/uploads/${selectedTask.image_after}`} alt="After"
                                                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginTop: 16, border: '2px solid var(--color-success)' }} />
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitWork}>
                                        <div style={{
                                            padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12,
                                            borderLeft: '3px solid var(--accent)', marginBottom: 20, fontSize: 13
                                        }}>
                                            <strong>Instructions:</strong> Upload a clear photo of the resolved issue. AI will verify before closing.
                                        </div>

                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Upload Proof of Work</label>
                                            <input type="file" accept="image/*" onChange={handleImageChange} id="worker-proof" style={{ display: 'none' }} />
                                            <label htmlFor="worker-proof" style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                height: imagePreview ? 200 : 120,
                                                border: `2px dashed ${imagePreview ? 'var(--color-success)' : 'rgba(14,26,51,0.12)'}`,
                                                borderRadius: 16, cursor: 'pointer', background: 'var(--bg-primary)', overflow: 'hidden'
                                            }}>
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                                                ) : (
                                                    <>
                                                        <span style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📷</span>
                                                        <span style={{ fontSize: 13, fontWeight: 500 }}>Click to upload after image</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        <div style={{ marginBottom: 20 }}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Remarks</label>
                                            <textarea className="input-js" placeholder="Describe work completed..." value={remarks}
                                                onChange={e => setRemarks(e.target.value)} style={{ minHeight: 100 }} />
                                        </div>

                                        <button type="submit" className="btn-primary" disabled={uploading || !image} style={{ width: '100%', opacity: uploading || !image ? 0.6 : 1 }}>
                                            {uploading ? 'Verifying...' : 'Submit Resolution'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* AI Verification Overlay */}
                {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.85)', backdropFilter: 'blur(12px)'
                        }}>
                        <div className="card-js" style={{ maxWidth: 420, width: '100%', padding: 40, textAlign: 'center', borderRadius: 24 }}>
                            <div style={{ width: 64, height: 64, margin: '0 auto 24px', position: 'relative' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        border: '4px solid var(--bg-secondary)', borderTopColor: 'var(--accent)'
                                    }} />
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 24 }}>🤖</span>
                            </div>
                            <h3 style={{ fontSize: 20, marginBottom: 20 }}>AI Verification</h3>
                            <div style={{ textAlign: 'left', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                                <StepItem step={1} current={verificationStep} label="Analyzing Before Image (YOLOv8)" />
                                <StepItem step={2} current={verificationStep} label="Matching Location (ORB/SSIM)" />
                                <StepItem step={3} current={verificationStep} label="Verifying Issue Removal" />
                                <StepItem step={4} current={verificationStep} label="Finalizing Report" />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>Processing... Do not close</p>
                        </div>
                    </motion.div>
                )}

                {/* Verification Result Modal */}
                {verificationResult && !uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.85)', backdropFilter: 'blur(12px)'
                        }}>
                        <div className="card-js" style={{ maxWidth: 420, width: '100%', padding: 40, textAlign: 'center', borderRadius: 24 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                                background: (verificationResult.status === 'Verified' || verificationResult.status === 'Resolved') ? '#e6f4ea' : '#fef2f2'
                            }}>
                                {(verificationResult.status === 'Verified' || verificationResult.status === 'Resolved') ? '✅' : '❌'}
                            </div>
                            <h3 style={{
                                fontSize: 22, marginBottom: 8,
                                color: (verificationResult.status === 'Verified' || verificationResult.status === 'Resolved') ? 'var(--color-success)' : 'var(--color-danger)'
                            }}>
                                {(verificationResult.status === 'Verified' || verificationResult.status === 'Resolved') ? 'Verified!' : 'Failed'}
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                {verificationResult.reason || verificationResult.verification_reason}
                            </p>
                            {verificationResult.confidence && (
                                <div className="pill-js" style={{ margin: '0 auto 20px', fontSize: 12 }}>
                                    Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                                </div>
                            )}
                            <button className="btn-primary" onClick={() => { setVerificationResult(null); setSelectedTask(null); fetchTasks(); }}
                                style={{ width: '100%' }}>Close & Return</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkerDashboard;
