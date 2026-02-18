import React, { useEffect, useState } from 'react';
import { getDeptOfficerDashboard, getDeptComplaints, getDeptWorkers, assignComplaint, reassignComplaint } from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DeptOfficerDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [complaints, setComplaints] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unassigned');
    const [assignModal, setAssignModal] = useState(null); // complaint object or null
    const [selectedWorker, setSelectedWorker] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { setUser(JSON.parse(u)); } catch { } }
    }, []);

    useEffect(() => {
        if (user?.department) fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [dashData, compData, workData] = await Promise.all([
                getDeptOfficerDashboard(user.department),
                getDeptComplaints(user.department),
                getDeptWorkers(user.department)
            ]);
            setStats(dashData.stats || {});
            setComplaints(compData || []);
            setWorkers(workData || []);
        } catch (err) {
            console.error('Failed to load:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assignModal || !selectedWorker) return;
        setActionLoading(true);
        try {
            await assignComplaint(assignModal._id, selectedWorker, user.id);
            setSuccessMsg(`Assigned to ${workers.find(w => w._id === selectedWorker)?.name || 'worker'}`);
            setAssignModal(null);
            setSelectedWorker('');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Assignment failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReassign = async (complaint) => {
        if (!selectedWorker) return;
        setActionLoading(true);
        try {
            await reassignComplaint(complaint._id, selectedWorker, user.id);
            setSuccessMsg('Reassigned successfully');
            setAssignModal(null);
            setSelectedWorker('');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Reassignment failed');
        } finally {
            setActionLoading(false);
        }
    };



    const filtered = complaints.filter(c => {
        if (activeTab === 'unassigned') return !c.worker_id || c.status === 'Pending';
        if (activeTab === 'assigned') return c.status === 'Assigned';
        if (activeTab === 'in_progress') return c.status === 'In Progress';
        if (activeTab === 'resolved') return c.status === 'Resolved';
        return true;
    });

    const statusColor = (s) => {
        const map = { Pending: '#ff9800', Assigned: '#2196f3', 'In Progress': '#ff6f00', Resolved: '#4caf50', Reopened: '#ff6f00' };
        return map[s] || '#888';
    };

    const priorityColor = (p) => {
        const map = { High: '#f44336', Medium: '#ff9800', Low: '#4caf50' };
        return map[p] || '#888';
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 40, height: 40, border: '3px solid #e0e0e0', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
        </div>
    );

    return (
        <div className="page-bg" style={{ minHeight: '100vh', padding: '100px 20px 40px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'linear-gradient(135deg, #2B6BFF, #1a4fd4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, color: 'white'
                        }}>🏗️</div>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                Department Officer
                            </h1>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                {user?.name} · {user?.department} Department
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Success Toast */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'fixed', top: 80, right: 20, zIndex: 1000,
                                background: '#4caf50', color: '#fff', padding: '12px 24px',
                                borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}>
                            ✅ {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16, marginTop: 24, marginBottom: 32
                }}>
                    {[
                        { label: 'Total', value: stats.total || 0, color: '#2B6BFF', icon: '📋' },
                        { label: 'Unassigned', value: stats.unassigned || 0, color: '#ff9800', icon: '⏳' },
                        { label: 'Assigned', value: stats.assigned || 0, color: '#2196f3', icon: '📌' },
                        { label: 'In Progress', value: stats.in_progress || 0, color: '#ff6f00', icon: '🔧' },
                        { label: 'Resolved', value: stats.resolved || 0, color: '#4caf50', icon: '✅' }
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }} className="glass-card"
                            style={{ padding: 20, borderRadius: 16, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                            <div style={{ fontSize: 24 }}>{s.icon}</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Workers Panel */}
                <div className="glass-card" style={{ padding: 20, borderRadius: 16, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                        👷 Workers in {user?.department} Department
                    </h3>
                    {workers.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No workers registered in this department yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                            {workers.map(w => (
                                <div key={w._id} style={{
                                    padding: 14, borderRadius: 12, background: 'var(--bg-secondary)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{w.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.email}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{w.active_tasks}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Active Tasks</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                        { key: 'unassigned', label: `Unassigned (${complaints.filter(c => !c.worker_id || c.status === 'Pending').length})` },
                        { key: 'assigned', label: `Assigned (${complaints.filter(c => c.status === 'Assigned').length})` },
                        { key: 'in_progress', label: `In Progress (${complaints.filter(c => c.status === 'In Progress').length})` },
                        { key: 'resolved', label: `Resolved (${complaints.filter(c => c.status === 'Resolved').length})` },
                        { key: 'all', label: `All (${complaints.length})` }
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            style={{
                                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                                background: activeTab === t.key ? 'var(--accent)' : 'var(--bg-secondary)',
                                color: activeTab === t.key ? '#fff' : 'var(--text-secondary)'
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Complaints List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, borderRadius: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No complaints in this category</p>
                        </div>
                    ) : (
                        filtered.map((c, i) => (
                            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }} className="glass-card"
                                style={{ padding: 18, borderRadius: 14, borderLeft: `4px solid ${statusColor(c.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>
                                                {c.ref_id || c._id.slice(-8)}
                                            </span>
                                            <span style={{
                                                fontSize: 11, padding: '2px 10px', borderRadius: 20,
                                                background: statusColor(c.status) + '18', color: statusColor(c.status), fontWeight: 600
                                            }}>
                                                {c.status}
                                            </span>
                                            <span style={{
                                                fontSize: 11, padding: '2px 10px', borderRadius: 20,
                                                background: priorityColor(c.priority) + '18', color: priorityColor(c.priority), fontWeight: 600
                                            }}>
                                                {c.priority}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '4px 0', lineHeight: 1.5 }}>
                                            {c.complaint_text?.slice(0, 120)}{c.complaint_text?.length > 120 ? '...' : ''}
                                        </p>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                            {c.category} · {new Date(c.created_at).toLocaleDateString()}
                                            {c.worker_name && <span> · 👷 {c.worker_name}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        {/* Manual assign — only shown when auto-assignment failed (no available workers) */}
                                        {(!c.worker_id || c.status === 'Pending' || c.status === 'Reopened') && (
                                            <button onClick={() => { setAssignModal(c); setSelectedWorker(''); }}
                                                style={{
                                                    padding: '8px 16px', borderRadius: 10, border: 'none',
                                                    background: 'var(--accent)', color: '#fff', fontWeight: 600,
                                                    fontSize: 13, cursor: 'pointer'
                                                }}>
                                                📌 Assign Manually
                                            </button>
                                        )}
                                        {c.worker_id && c.status !== 'Resolved' && (
                                            <button onClick={() => { setAssignModal({ ...c, isReassign: true }); setSelectedWorker(''); }}
                                                style={{
                                                    padding: '8px 16px', borderRadius: 10, border: '1px solid var(--accent)',
                                                    background: 'transparent', color: 'var(--accent)', fontWeight: 600,
                                                    fontSize: 13, cursor: 'pointer'
                                                }}>
                                                🔄 Reassign
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Assign Modal */}
                <AnimatePresence>
                    {assignModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', zIndex: 999, padding: 20
                            }}
                            onClick={() => setAssignModal(null)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
                                style={{
                                    background: 'var(--bg-primary)', borderRadius: 20, padding: 28,
                                    maxWidth: 450, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                                }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                                    {assignModal.isReassign ? '🔄 Reassign Complaint' : '📌 Assign Complaint'}
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                    {assignModal.ref_id} — {assignModal.complaint_text?.slice(0, 80)}...
                                </p>

                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                    Select Worker
                                </label>
                                <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 12,
                                        border: '1px solid var(--border-color)', fontSize: 14,
                                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                        marginBottom: 20, outline: 'none'
                                    }}>
                                    <option value="">— Choose a worker —</option>
                                    {workers.map(w => (
                                        <option key={w._id} value={w._id}>
                                            {w.name} ({w.active_tasks} active tasks)
                                        </option>
                                    ))}
                                </select>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => setAssignModal(null)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-color)',
                                            background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600,
                                            fontSize: 14, cursor: 'pointer'
                                        }}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => assignModal.isReassign ? handleReassign(assignModal) : handleAssign()}
                                        disabled={!selectedWorker || actionLoading}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                                            background: selectedWorker ? 'var(--accent)' : '#ccc', color: '#fff',
                                            fontWeight: 600, fontSize: 14, cursor: selectedWorker ? 'pointer' : 'not-allowed',
                                            opacity: actionLoading ? 0.7 : 1
                                        }}>
                                        {actionLoading ? 'Processing...' : assignModal.isReassign ? 'Reassign' : 'Assign'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DeptOfficerDashboard;
