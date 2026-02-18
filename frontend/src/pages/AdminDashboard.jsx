import React, { useEffect, useState, useMemo } from 'react';
import { getAllComplaints, overrideComplaintStatus, adminReassign, getUPDistricts } from '../services/api';
import { Link } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: recenter map
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchRefId, setSearchRefId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [interventionTarget, setInterventionTarget] = useState(null);
    const [overrideStatus, setOverrideStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [reassignDept, setReassignDept] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // District-specific
    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    }, []);
    const adminDistrict = user?.district || '';
    const [districtCoords, setDistrictCoords] = useState(null);

    useEffect(() => {
        // Fetch district coordinates
        const fetchDistricts = async () => {
            try {
                const data = await getUPDistricts();
                if (adminDistrict && Array.isArray(data)) {
                    const match = data.find(d => d.name === adminDistrict);
                    if (match) setDistrictCoords({ lat: match.lat, lng: match.lng, zoom: match.zoom });
                }
            } catch { /* ignore */ }
        };
        fetchDistricts();
    }, [adminDistrict]);

    const handleOverride = async () => {
        if (!interventionTarget || !overrideStatus) return;
        setActionLoading(true);
        try {
            await overrideComplaintStatus(interventionTarget._id, overrideStatus, adminNote);
            setSuccessMsg(`Status overridden to ${overrideStatus}`);
            setInterventionTarget(null); setOverrideStatus(''); setAdminNote('');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Override failed'); }
        finally { setActionLoading(false); }
    };

    const handleReassignDept = async () => {
        if (!interventionTarget || !reassignDept) return;
        setActionLoading(true);
        try {
            await adminReassign(interventionTarget._id, reassignDept, null, adminNote);
            setSuccessMsg(`Reassigned to ${reassignDept}`);
            setInterventionTarget(null); setReassignDept(''); setAdminNote('');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Reassignment failed'); }
        finally { setActionLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            // Use query params for server-side filtering
            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (searchRefId) params.append('ref_id', searchRefId);
            if (filterStatus !== 'All') params.append('status', filterStatus);

            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/all?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(Array.isArray(response.data) ? response.data : []);
        } catch { setComplaints([]); }
        finally { setLoading(false); }
    };

    // Refetch when filters change (debounced for typing)
    useEffect(() => {
        const timer = setTimeout(() => { fetchData(); }, 400);
        return () => clearTimeout(timer);
    }, [dateFrom, dateTo, searchRefId, filterStatus]);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length,
        highPriority: complaints.filter(c => c.priority === 'High').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        verified: complaints.filter(c => c.status === 'Verified').length,
        reopened: complaints.filter(c => c.status === 'Reopened').length
    };

    const deptStats = complaints.reduce((acc, c) => { const d = c.department || 'N/A'; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
    const chartData = Object.keys(deptStats).map(k => ({ name: k, count: deptStats[k] }));

    const mapCenter = districtCoords ? [districtCoords.lat, districtCoords.lng] : [28.6139, 77.2090];
    const mapZoom = districtCoords ? districtCoords.zoom : 11;

    const getMarkerIcon = (priority) => {
        let color = 'green';
        if (priority === 'High') color = '#e74c3c';
        else if (priority === 'Medium') color = '#e67e22';
        return new L.DivIcon({
            className: 'custom-icon',
            html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7]
        });
    };

    const statusPill = (s) => {
        const m = { 'Submitted': '#4A5B7A', 'Assigned': '#2B6BFF', 'In Progress': '#e67e22', 'Resolved': '#2ecc71', 'Verified': '#00838f', 'Reopened': '#ff6f00', 'Escalated': '#e74c3c' };
        return { fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: `${m[s] || '#aaa'}15`, color: m[s] || '#888' };
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
                            District Administration
                            {adminDistrict && (
                                <span style={{
                                    fontSize: 14, fontWeight: 500, color: 'var(--accent)',
                                    marginLeft: 12, padding: '4px 14px', background: 'rgba(43,107,255,0.08)',
                                    borderRadius: 20
                                }}>📍 {adminDistrict}</span>
                            )}
                        </h1>
                        <p style={{ fontSize: 14, margin: 0 }}>System Monitoring, Oversight & Intervention</p>
                    </div>
                    <div className="pill-js" style={{ fontSize: 11 }}>Administrator Access</div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 32 }}>
                    {[
                        { label: 'Total', value: stats.total, icon: '📊', color: 'var(--accent)' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#e67e22' },
                        { label: 'High Priority', value: stats.highPriority, icon: '🔴', color: 'var(--color-danger)' },
                        { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'var(--color-success)' },
                        { label: 'Verified', value: stats.verified, icon: '🤖', color: '#00838f' },
                        { label: 'Reopened', value: stats.reopened, icon: '🔄', color: '#ff6f00' }
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }} className="card-js" style={{ padding: 20 }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts + AI Health */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
                    <div className="card-js" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Department Workload</h3>
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(14,26,51,0.06)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4A5B7A' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4A5B7A' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={36}>
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={i % 2 === 0 ? '#2B6BFF' : '#7cb3ff'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card-js" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>AI System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {['Text Categorization', 'Priority Engine', 'YOLOv8 Vision'].map(name => (
                                <div key={name} style={{
                                    padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color: 'var(--color-success)',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
                                        Active
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Geo Map - District-Specific */}
                <div className="card-js" style={{ padding: 24, marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        🗺️ Complaint Distribution
                        {adminDistrict && (
                            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
                                — {adminDistrict} District
                            </span>
                        )}
                    </h3>
                    <div style={{ height: 420, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <ChangeView center={mapCenter} zoom={mapZoom} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {complaints.filter(c => c.location?.lat && c.location?.lng).map(c => (
                                <Marker key={c._id} position={[c.location.lat, c.location.lng]} icon={getMarkerIcon(c.priority)}>
                                    <Popup>
                                        <div style={{ minWidth: 180 }}>
                                            <strong>{c.category} Issue</strong>
                                            <div style={{ fontSize: 12, margin: '4px 0' }}>Status: <b>{c.status}</b></div>
                                            <p style={{ fontSize: 12, color: '#666' }}>{(c.text || c.complaint_text || '').substring(0, 80)}...</p>
                                            <Link to={`/complaint/${c._id}`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>View →</Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Complaint Table with NEW Search Filters */}
                <div className="card-js" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        padding: '20px 24px', borderBottom: '1px solid var(--border-light)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                                Grievance Registry <span className="pill-js" style={{ fontSize: 11, marginLeft: 8 }}>{complaints.length}</span>
                            </h3>
                        </div>

                        {/* ====== NEW FILTER BAR: Date & Ref ID ====== */}
                        <div style={{
                            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From Date</label>
                                <input className="input-js" type="date" value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    style={{ width: 160, height: 40, fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Date</label>
                                <input className="input-js" type="date" value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    style={{ width: 160, height: 40, fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referral ID</label>
                                <input className="input-js" type="text" placeholder="e.g., JAN-ROAD-2026"
                                    value={searchRefId} onChange={e => setSearchRefId(e.target.value)}
                                    style={{ width: 220, height: 40, fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                                <select className="input-js" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                    style={{ width: 150, height: 40, fontSize: 13 }}>
                                    {['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified', 'Reopened', 'Escalated'].map(s => (
                                        <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                                    ))}
                                </select>
                            </div>
                            {(dateFrom || dateTo || searchRefId) && (
                                <button onClick={() => { setDateFrom(''); setDateTo(''); setSearchRefId(''); setFilterStatus('All'); }}
                                    style={{
                                        height: 40, padding: '0 16px', borderRadius: 10, border: '1px solid var(--border-color)',
                                        background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600,
                                        fontSize: 12, cursor: 'pointer'
                                    }}>✕ Clear Filters</button>
                            )}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)' }}>
                                    {['Ref ID / Date', 'Details', 'Category', 'Priority', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{
                                            padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                                            color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>}
                                {!loading && complaints.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No records found.</td></tr>
                                )}
                                {complaints.map(c => (
                                    <tr key={c._id} style={{
                                        borderBottom: '1px solid var(--border-light)',
                                        transition: 'background 0.15s', cursor: 'pointer'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ fontWeight: 700, fontSize: 12 }}>{c.ref_id || c._id.slice(-6).toUpperCase()}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '14px 20px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.complaint_text || c.text || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{c.category}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                background: c.priority === 'High' ? '#fef2f2' : c.priority === 'Medium' ? '#fff7ed' : '#e6f4ea',
                                                color: c.priority === 'High' ? '#e74c3c' : c.priority === 'Medium' ? '#e67e22' : '#2ecc71'
                                            }}>{c.priority}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}><span style={statusPill(c.status)}>{c.status}</span></td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <Link to={`/complaint/${c._id}`}
                                                    style={{
                                                        fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                                                        textDecoration: 'none', padding: '6px 14px',
                                                        borderRadius: 8, border: '1px solid rgba(43,107,255,0.2)',
                                                        transition: 'all 0.2s'
                                                    }}>Inspect</Link>
                                                <button onClick={() => { setInterventionTarget({ ...c, mode: 'override' }); setOverrideStatus(''); setAdminNote(''); }}
                                                    style={{
                                                        fontSize: 11, fontWeight: 600, color: '#e74c3c', padding: '5px 10px',
                                                        borderRadius: 8, border: '1px solid rgba(231,76,60,0.2)',
                                                        background: 'transparent', cursor: 'pointer'
                                                    }}>⚡ Override</button>
                                                <button onClick={() => { setInterventionTarget({ ...c, mode: 'reassign' }); setReassignDept(''); setAdminNote(''); }}
                                                    style={{
                                                        fontSize: 11, fontWeight: 600, color: '#2ecc71', padding: '5px 10px',
                                                        borderRadius: 8, border: '1px solid rgba(46,204,113,0.2)',
                                                        background: 'transparent', cursor: 'pointer'
                                                    }}>🔄 Reassign</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedComplaint(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.5)', backdropFilter: 'blur(6px)', padding: 20
                        }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()} className="card-js"
                            style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: 24 }}>
                            <div style={{
                                padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'white', zIndex: 2, borderRadius: '24px 24px 0 0'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Case File</h2>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {selectedComplaint._id}</span>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} style={{
                                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                                    background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 18,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                                }}>✕</button>
                            </div>
                            <div style={{ padding: 28 }}>
                                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 24 }}>
                                    <StatusTracker status={selectedComplaint.status} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>AI Diagnostic</div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedComplaint.category}</span>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedComplaint.priority}</span>
                                            <span className="pill-js" style={{ fontSize: 11 }}>{selectedComplaint.department}</span>
                                        </div>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                                            {selectedComplaint.complaint_text || selectedComplaint.text || 'No description.'}
                                        </p>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Evidence</div>
                                        <img src={`http://localhost:5000/uploads/${selectedComplaint.image_before}`} alt="Before"
                                            style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border-light)', marginBottom: 8 }} />
                                        {selectedComplaint.image_after && (
                                            <img src={`http://localhost:5000/uploads/${selectedComplaint.image_after}`} alt="After"
                                                style={{ width: '100%', borderRadius: 12, border: '2px solid var(--color-success)' }} />
                                        )}
                                    </div>
                                </div>
                                {selectedComplaint.feedback && (
                                    <div style={{ marginTop: 20, padding: '16px 20px', background: '#e6f4ea', borderRadius: 12 }}>
                                        <strong style={{ fontSize: 12 }}>Citizen Feedback:</strong>
                                        <span style={{ marginLeft: 8, color: '#f1c40f' }}>{'★'.repeat(selectedComplaint.feedback.rating)}</span>
                                        <p style={{ fontSize: 13, margin: '4px 0 0' }}>{selectedComplaint.feedback.comment}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Intervention Modal */}
            <AnimatePresence>
                {interventionTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.5)', backdropFilter: 'blur(6px)', padding: 20
                        }}
                        onClick={() => setInterventionTarget(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-primary)', borderRadius: 20, padding: 28,
                                maxWidth: 450, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                            }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                                {interventionTarget.mode === 'override' ? '⚡ Override Status' : '🔄 Reassign Department'}
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Complaint: {interventionTarget.ref_id || interventionTarget._id.slice(-6).toUpperCase()} — {interventionTarget.category}
                            </p>

                            {interventionTarget.mode === 'override' ? (
                                <>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>New Status</label>
                                    <select value={overrideStatus} onChange={e => setOverrideStatus(e.target.value)}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: 16 }}>
                                        <option value="">— Select status —</option>
                                        {['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Reopened'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>New Department</label>
                                    <select value={reassignDept} onChange={e => setReassignDept(e.target.value)}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: 16 }}>
                                        <option value="">— Select department —</option>
                                        {['Road', 'Water', 'Electricity', 'Sanitation'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </>
                            )}

                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Admin Note (optional)</label>
                            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                                rows={3} placeholder="Reason for intervention..."
                                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: 20, resize: 'vertical' }} />

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setInterventionTarget(null)}
                                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={interventionTarget.mode === 'override' ? handleOverride : handleReassignDept}
                                    disabled={actionLoading || (interventionTarget.mode === 'override' ? !overrideStatus : !reassignDept)}
                                    style={{
                                        flex: 1, padding: 12, borderRadius: 12, border: 'none',
                                        background: (interventionTarget.mode === 'override' ? overrideStatus : reassignDept) ? (interventionTarget.mode === 'override' ? '#e74c3c' : '#2ecc71') : '#ccc',
                                        color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                        opacity: actionLoading ? 0.7 : 1
                                    }}>
                                    {actionLoading ? 'Processing...' : interventionTarget.mode === 'override' ? '⚡ Override' : '🔄 Reassign'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
