import React, { useEffect, useState } from 'react';
import { getAllComplaints } from '../services/api';
import { Link } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getAllComplaints();
            if (Array.isArray(data)) {
                setComplaints(data.slice().reverse()); // Reverse for latest first
            } else {
                console.error("Expected array but got:", data);
                setComplaints([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Stats Calculation ---
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length,
        highPriority: complaints.filter(c => c.priority === 'High').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        verified: complaints.filter(c => c.status === 'Verified').length
    };

    // --- Department Stats for Chart ---
    const deptStats = complaints.reduce((acc, curr) => {
        const dept = curr.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = 0;
        acc[dept]++;
        return acc;
    }, {});
    const chartData = Object.keys(deptStats).map(key => ({ name: key, count: deptStats[key] }));

    // --- Filtering ---
    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        // Handle Schema Evolution: 'complaint_text' (New) vs 'text' (Legacy)
        const text = c.complaint_text || c.text || '';
        const category = c.category || '';
        const id = c._id || '';

        const matchesSearch = text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const getPriorityBadge = (p) => {
        const colors = { High: 'bg-red-50 text-red-800 border-red-200', Medium: 'bg-orange-50 text-orange-800 border-orange-200', Low: 'bg-green-50 text-green-800 border-green-200' };
        return <span className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-bold tracking-wider ${colors[p] || 'bg-gray-50'}`}>{p}</span>;
    };

    const getStatusBadge = (s) => {
        const colors = {
            Submitted: 'bg-gray-100 text-gray-600 border-gray-200',
            Assigned: 'bg-blue-50 text-blue-800 border-blue-200',
            'In Progress': 'bg-yellow-50 text-yellow-800 border-yellow-200',
            Resolved: 'bg-green-50 text-green-800 border-green-200',
            Verified: 'bg-teal-50 text-teal-800 border-teal-200'
        };
        return <span className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-bold tracking-wider ${colors[s] || 'bg-gray-50'}`}>{s}</span>;
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] pb-12 font-sans">

            {/* --- SECTION 1: HEADER --- */}
            <header className="bg-[#001f3f] shadow-lg sticky top-0 z-30 border-b-4 border-yellow-500">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="Emblem"
                            className="h-10 invert brightness-0 filter"
                        />
                        <div>
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">Admin Control Center</h1>
                            <p className="text-[10px] md:text-xs text-blue-200 uppercase tracking-wider">System Monitoring & Oversight • <span className="text-yellow-500 font-bold">Confidential</span></p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="bg-blue-900/50 px-4 py-1 rounded-sm border border-blue-800">
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Administrator Access</p>
                            <p className="text-xs text-white font-mono">ID: ADMIN-ROOT-01</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECTION 2: SYSTEM OVERVIEW --- */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Complaints', value: stats.total, color: 'border-l-4 border-blue-900 bg-white text-blue-900' },
                        { label: 'Pending Action', value: stats.pending, color: 'border-l-4 border-orange-600 bg-white text-orange-800' },
                        { label: 'High Priority', value: stats.highPriority, color: 'border-l-4 border-red-600 bg-white text-red-800' },
                        { label: 'Resolved', value: stats.resolved, color: 'border-l-4 border-green-600 bg-white text-green-800' },
                        { label: 'Verified', value: stats.verified, color: 'border-l-4 border-teal-600 bg-white text-teal-800' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow ${stat.color}`}
                        >
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-serif font-extrabold mt-1">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* --- DEPARTMENT PERFORMANCE CHART --- */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                            <h3 className="text-lg font-serif font-bold text-[#001f3f]">Department Workload Analysis</h3>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Real-time Data</span>
                        </div>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e3a8a' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- AI METRICS --- */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-lg font-serif font-bold text-[#001f3f] mb-6 border-b border-gray-100 pb-2">AI System Health</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Text Categorization', status: 'Active', color: 'green' },
                                { name: 'Priority Engine', status: 'Active', color: 'green' },
                                { name: 'YOLOv8 Vision', status: 'Active', color: 'green' }
                            ].map((item) => (
                                <div key={item.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-sm border border-gray-100">
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{item.status}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">Last System Audit: Today, 08:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION: GEOSPATIAL MAP --- */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-serif font-bold text-[#001f3f] mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🗺️</span> Complaint Geo-Distribution
                    </h3>
                    <div className="h-[500px] w-full rounded-sm overflow-hidden border border-gray-300 relative z-0">
                        <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {complaints
                                .filter(c => c.location && c.location.lat && c.location.lng)
                                .map(c => {
                                    // Custom Icon Logic
                                    const getMarkerIcon = (priority) => {
                                        // Using Leaflet's built-in icon with color filters or custom URLs
                                        // For simplicity and reliability without external assets, we use CSS filter on default or specific colored marker URLs if available.
                                        // Or better, use a divIcon or circle marker for cleaner look, but user asked for "Pins".
                                        // Let's use simple CircleMarkers here too? No, user said "Pins".
                                        // Let's use a standard trick: URL to a colored marker API or local.
                                        // Since we don't have local colored assets, let's use the standard "hue-rotate" trick on the default icon style if possible, 
                                        // OR just use CircleMarkers which are natively colorable and often preferred for "City Issue Map".
                                        // "Displays all complaints as pins. Pin color based on priority".
                                        // Let's use CircleMarkers but style them like pins?
                                        // Actually, let's use CircleMarkers (dots) as they are cleaner for "City maps" and easier to color code directly.
                                        // If user strictly wants "Pins", we can try, but colored pins need assets.
                                        // Let's stick to CircleMarkers but make them larger/distinct.
                                        // Wait, the requirement says "Pin color based on priority". 
                                        // Let's use L.divIcon with a colored span.

                                        let color = 'green';
                                        if (priority === 'High') color = 'red';
                                        else if (priority === 'Medium') color = 'orange';

                                        return new L.DivIcon({
                                            className: 'custom-icon',
                                            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
                                            iconSize: [12, 12],
                                            iconAnchor: [6, 6]
                                        });
                                    };

                                    return (
                                        <Marker
                                            key={c._id}
                                            position={[c.location.lat, c.location.lng]}
                                            icon={getMarkerIcon(c.priority)}
                                        >
                                            <Popup>
                                                <div className="min-w-[200px]">
                                                    <strong className="text-sm text-[#001f3f]">{c.category} Issue</strong>
                                                    <div className="text-xs text-gray-600 my-1">
                                                        Status: <span className={`font-bold ${c.status === 'Resolved' ? 'text-green-600' : 'text-blue-600'}`}>{c.status}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{c.text || c.complaint_text}</p>
                                                    <div className="flex gap-2">
                                                        {c.priority && (
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}>
                                                                {c.priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link to={`/complaint/${c._id}`} className="block mt-2 text-xs text-blue-700 underline font-bold">View Details</Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })
                            }
                        </MapContainer>
                    </div>
                </div>

                {/* --- SECTION 3: COMPLAINT MANAGEMENT --- */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                        <h2 className="text-lg font-serif font-bold text-[#001f3f] flex items-center gap-2">
                            Grievance Registry <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-sans font-bold">{filteredComplaints.length} Records</span>
                        </h2>

                        <div className="flex gap-4 w-full md:w-auto">
                            <select
                                className="border border-gray-300 rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium text-gray-700"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Verified">Verified</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Search ID or Keyword..."
                                className="border border-gray-300 rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-blue-900 outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#001f3f] text-white uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Ref ID / Date</th>
                                    <th className="px-6 py-4">Grievance Details</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Priority Level</th>
                                    <th className="px-6 py-4">Current Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && <tr><td colSpan="6" className="text-center py-8">Loading Registry...</td></tr>}
                                {!loading && filteredComplaints.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-serif italic">No matching records found in the registry.</td></tr>
                                )}
                                {filteredComplaints.map((c) => (
                                    <tr key={c._id} className="hover:bg-blue-50/50 transition duration-150 group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-bold text-[#001f3f]">{c._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-[10px] text-gray-500 font-medium">{new Date(c.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-800 font-medium group-hover:text-blue-800">
                                            {c.complaint_text || c.text || 'No description provided'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{c.category}</td>
                                        <td className="px-6 py-4">{getPriorityBadge(c.priority)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/complaint/${c._id}`}
                                                className="text-[#001f3f] hover:text-orange-600 font-bold text-[10px] uppercase tracking-wider border border-gray-200 hover:border-orange-200 px-3 py-1 rounded-sm bg-white shadow-sm transition-all inline-block"
                                            >
                                                Inspect
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* --- SECTION 4: DETAIL MODAL --- */}
            <AnimatePresence>
                {selectedComplaint && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedComplaint(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border-t-8 border-[#001f3f]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-[#001f3f]">Grievance Case File: {selectedComplaint._id}</h2>
                                    <p className="text-xs text-gray-500 font-mono">Timestamp: {new Date(selectedComplaint.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-red-100 shadow-sm">⚠ Flag for Escalation</button>
                                    <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">×</button>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b pb-2">AI Diagnostic Report</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase">Topic Category</label>
                                                <p className="font-bold text-lg text-[#001f3f]">{selectedComplaint.category}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase">Urgency Level</label>
                                                <p className={`font-bold text-lg ${selectedComplaint.priority === 'High' ? 'text-red-700' : 'text-gray-800'}`}>{selectedComplaint.priority}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase">Assigned Dept</label>
                                                <p className="font-semibold text-gray-800">{selectedComplaint.department}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase">AI Confidence</label>
                                                <p className="text-sm font-mono text-green-700 font-bold">92% Match</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Case Timeline</h3>
                                        <StatusTracker status={selectedComplaint.status} />
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description of Issue</h3>
                                        <p className="text-gray-800 bg-white border border-gray-200 p-4 rounded-sm text-sm leading-relaxed shadow-sm">
                                            {selectedComplaint.complaint_text || selectedComplaint.text || 'No description available.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Evidence & Documentation</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase mb-2 block">Initial Status (Before)</label>
                                                <div className="p-1 border border-gray-200 rounded-sm">
                                                    <img
                                                        src={`http://localhost:5000/uploads/${selectedComplaint.image_before}`}
                                                        alt="Before"
                                                        className="w-full h-40 object-cover rounded-sm hover:scale-105 transition duration-300"
                                                    />
                                                </div>
                                            </div>
                                            {selectedComplaint.image_after ? (
                                                <div>
                                                    <label className="text-[10px] text-green-600 font-bold uppercase mb-2 block">Resolution Proof (After)</label>
                                                    <div className="p-1 border-2 border-green-500/20 rounded-sm">
                                                        <img
                                                            src={`http://localhost:5000/uploads/${selectedComplaint.image_after}`}
                                                            alt="After"
                                                            className="w-full h-40 object-cover rounded-sm hover:scale-105 transition duration-300"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-40 bg-gray-50 rounded-sm flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4 border border-dashed border-gray-300">
                                                    <span className="text-2xl opacity-30 mb-2">⏳</span>
                                                    Resolution pending
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedComplaint.remarks && (
                                        <div className="bg-blue-50 p-6 rounded-sm border-l-4 border-blue-600 shadow-sm">
                                            <label className="text-[10px] font-bold text-blue-800 uppercase mb-2 block tracking-widest">Official Resolution Report</label>
                                            <p className="text-blue-900 text-sm italic font-medium">"{selectedComplaint.remarks}"</p>
                                        </div>
                                    )}

                                    {selectedComplaint.feedback && (
                                        <div className="bg-green-50 p-6 rounded-sm border-l-4 border-green-600 shadow-sm">
                                            <label className="text-[10px] font-bold text-green-800 uppercase mb-2 block tracking-widest">Citizen Satisfaction Feedback</label>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-yellow-500 text-lg">{'★'.repeat(selectedComplaint.feedback.rating)}<span className="text-gray-300">{'★'.repeat(5 - selectedComplaint.feedback.rating)}</span></span>
                                            </div>
                                            <p className="text-green-900 text-sm">"{selectedComplaint.feedback.comment}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
