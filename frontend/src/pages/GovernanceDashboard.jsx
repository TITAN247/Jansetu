import React, { useEffect, useState } from 'react';
import { getGovernanceAnalytics, getDeptPerformance, getComplaintTrends, getAIMetrics, getAllComplaints } from '../services/api';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GovernanceDashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [deptStats, setDeptStats] = useState([]);
    const [trends, setTrends] = useState([]);
    const [aiMetrics, setAiMetrics] = useState(null);
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [kpiData, deptData, trendData, aiData, allComplaints] = await Promise.all([
                    getGovernanceAnalytics().catch(() => ({})),
                    getDeptPerformance().catch(() => []),
                    getComplaintTrends().catch(() => []),
                    getAIMetrics().catch(() => ({})),
                    getAllComplaints().catch(() => [])
                ]);

                // --- DUMMY DATA INJECTION (If API returns empty/null) ---

                // 1. KPIs
                if (!kpiData?.kpis || Object.keys(kpiData.kpis).length === 0) {
                    setKpis({
                        total_complaints: 1245,
                        resolution_rate: 87,
                        verification_rate: 92,
                        citizen_satisfaction: 4.6,
                        avg_resolution_time_hours: 28
                    });
                } else {
                    setKpis(kpiData.kpis);
                }

                // 2. Department Stats
                if (!Array.isArray(deptData) || deptData.length === 0) {
                    setDeptStats([
                        { name: 'Roads & Transport', total: 450, resolution_rate: 78 },
                        { name: 'Sanitation', total: 320, resolution_rate: 91 },
                        { name: 'Street Lighting', total: 210, resolution_rate: 85 },
                        { name: 'Water Supply', total: 180, resolution_rate: 65 },
                        { name: 'Parks & Garden', total: 85, resolution_rate: 94 }
                    ]);
                } else {
                    setDeptStats(deptData);
                }

                // 3. Trends
                if (!Array.isArray(trendData) || trendData.length === 0) {
                    setTrends([
                        { month: 'Jan', complaints: 120, resolved: 100 },
                        { month: 'Feb', complaints: 145, resolved: 130 },
                        { month: 'Mar', complaints: 110, resolved: 95 },
                        { month: 'Apr', complaints: 180, resolved: 160 },
                        { month: 'May', complaints: 160, resolved: 140 },
                        { month: 'Jun', complaints: 195, resolved: 180 }
                    ]);
                } else {
                    setTrends(trendData);
                }

                // 4. AI Metrics
                if (!aiData || Object.keys(aiData).length === 0) {
                    setAiMetrics({
                        category_accuracy: 94.5,
                        priority_precision: 89.2,
                        vision_detection_rate: 96.8,
                        mismatches_flagged: 12
                    });
                } else {
                    setAiMetrics(aiData);
                }

                // 5. Heatmap Map Data
                const baseLat = 28.6139;
                const baseLng = 77.2090;
                // Generate 60 dummy points clustered loosely
                const dummyHeatmapData = Array.from({ length: 150 }).map((_, i) => ({
                    _id: `heat_${i}`,
                    category: i % 3 === 0 ? 'Pothole' : (i % 3 === 1 ? 'Garbage' : 'Street Light'),
                    priority: i % 5 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'), // 20% High priority
                    location: {
                        lat: baseLat + (Math.random() - 0.5) * 0.08, // Wider spread (approx 8km)
                        lng: baseLng + (Math.random() - 0.5) * 0.08
                    }
                }));

                const realData = Array.isArray(allComplaints) ? allComplaints : [];
                setMapData([...realData, ...dummyHeatmapData]);

            } catch (error) {
                console.error("Error fetching governance data", error);
                // Fallback catch-all if critical failure
                setKpis({ total_complaints: 0, resolution_rate: 0, verification_rate: 0, citizen_satisfaction: 0, avg_resolution_time_hours: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);


    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text("City Governance Report - FY 2025-26", 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text("Generated by JanSetu AI System", 14, 28);

            // KPI Summary
            autoTable(doc, {
                startY: 35,
                head: [['Metric', 'Value', 'Status']],
                body: [
                    ['Total Resolution Rate', `${kpis?.resolution_rate || 0}%`, 'Target: 85%'],
                    ['AI Verification Score', `${kpis?.verification_rate || 0}%`, 'Consistent'],
                    ['Citizen Satisfaction', `${kpis?.citizen_satisfaction || 0}/5.0`, 'Positive'],
                ],
                theme: 'grid',
                headStyles: { fillColor: [0, 31, 63] }
            });

            // Departments
            doc.text("Departmental Performance", 14, doc.lastAutoTable.finalY + 10);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Department', 'Caseload', 'Efficiency']],
                body: deptStats.map(d => [d.name, d.total, `${d.resolution_rate}%`]),
                theme: 'striped',
                headStyles: { fillColor: [22, 160, 133] }
            });

            // Dummy Heatmap Data Section (as requested)
            doc.text("Hotspot Analysis Data (Sample)", 14, doc.lastAutoTable.finalY + 10);
            const dummyRows = mapData.slice(0, 15).map(d => [
                d.category || 'Pothole',
                d.priority || 'High',
                d.location?.lat?.toFixed(4) || '28.6139',
                d.location?.lng?.toFixed(4) || '77.2090'
            ]);

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Issue Type', 'Priority', 'Lat', 'Lng']],
                body: dummyRows,
                theme: 'plain',
                styles: { fontSize: 8 }
            });

            doc.save("governance_report.pdf");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. check console for details.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading Governance Data...</div>;



    const radialData = aiMetrics ? [
        { name: 'Category Accuracy', uv: aiMetrics.category_accuracy, fill: '#1e3a8a' }, // Navy
        { name: 'Priority Precision', uv: aiMetrics.priority_precision, fill: '#ea580c' }, // Orange
        { name: 'Vision Detection', uv: aiMetrics.vision_detection_rate, fill: '#15803d' } // Green
    ] : [];

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-900 pb-12">

            {/* --- HEADER --- */}
            <header className="bg-[#001f3f] text-white shadow-lg sticky top-0 z-40 border-b-4 border-yellow-500">
                <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-4">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="Emblem"
                                className="h-12 invert brightness-0 filter"
                            />
                            <div>
                                <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide">City Governance Dashboard</h1>
                                <p className="text-[10px] md:text-xs text-blue-200 uppercase tracking-widest">Office of the Municipal Commissioner • Executive View</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-right">
                            <button
                                onClick={handleDownloadPDF}
                                className="bg-yellow-500 text-[#001f3f] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-yellow-400 transition"
                            >
                                ⬇ Download Report (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* --- KPI SECTION --- */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {kpis && [
                        { label: 'Total Complaints', value: kpis.total_complaints || 0, sub: 'City-wide', color: 'bg-white border-t-4 border-blue-900' },
                        { label: 'Resolution Rate', value: `${kpis.resolution_rate || 0}%`, sub: 'Target: 85%', color: 'bg-white border-t-4 border-green-600' },
                        { label: 'Verification Score', value: `${kpis.verification_rate || 0}%`, sub: 'AI Validated', color: 'bg-white border-t-4 border-teal-600' },
                        { label: 'Citizen Rating', value: `${kpis.citizen_satisfaction || 0}/5.0`, sub: 'Public Trust', color: 'bg-white border-t-4 border-yellow-500' },
                        { label: 'Avg Resolution Time', value: `${kpis.avg_resolution_time_hours || 0}h`, sub: 'Efficiency', color: 'bg-white border-t-4 border-purple-800' },
                    ].map((kpi, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow ${kpi.color}`}
                        >
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{kpi.label}</p>
                            <h3 className="text-3xl font-serif font-extrabold text-[#001f3f]">{kpi.value}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{kpi.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* --- HOTSPOT ANALYSIS --- */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                    <h3 className="text-lg font-serif font-bold text-[#001f3f] mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🔥</span> Complaint Density & Hotspots
                    </h3>
                    {/* B&W Map Style REMOVED - Restoring Colors */}
                    <div className="h-[400px] w-full rounded-sm overflow-hidden border border-gray-300 relative z-0">
                        <div className="absolute inset-0 z-0">
                            <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {mapData
                                    .filter(c => c.location && c.location.lat && c.location.lng)
                                    .map(c => {
                                        const isPriority = c.priority === 'High';
                                        // Colors: Red for High, Orange for Medium, Green for Low
                                        const color = isPriority ? '#ef4444' : (c.priority === 'Medium' ? '#f97316' : '#22c55e');
                                        const radius = isPriority ? 20 : 10;
                                        return (
                                            <CircleMarker
                                                key={c._id}
                                                center={[c.location.lat, c.location.lng]}
                                                pathOptions={{ color: color, fillColor: color, fillOpacity: 0.6, weight: 0 }}
                                                radius={radius}
                                            >
                                                <Popup>
                                                    <div className="text-xs font-bold">{c.category} ({c.priority})</div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })
                                }
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* --- STRATEGIC INSIGHTS ROW 1 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Department Performance Card */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-sm shadow-sm border border-gray-200">
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-[#001f3f]">Department Performance Scorecard</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Monthly Efficiency Report</p>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="text-[#001f3f] text-xs font-bold uppercase tracking-wider border border-gray-200 px-3 py-1 hover:bg-gray-50 transition"
                            >
                                Download PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#001f3f] text-white uppercase font-bold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Department</th>
                                        <th className="px-4 py-3">Caseload</th>
                                        <th className="px-4 py-3">Resolution Rate</th>
                                        <th className="px-4 py-3">Performance Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {deptStats.map(dept => (
                                        <tr key={dept.name} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 font-bold text-gray-800 border-l-4 border-transparent hover:border-blue-900 transition-all">{dept.name}</td>
                                            <td className="px-4 py-4 font-mono text-gray-600">{dept.total}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-200 rounded-sm overflow-hidden">
                                                        <div className={`h-full ${dept.resolution_rate > 80 ? 'bg-green-600' : dept.resolution_rate > 50 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{ width: `${dept.resolution_rate}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold">{dept.resolution_rate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {dept.resolution_rate > 80 ? (
                                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider border border-green-200 rounded-sm">Excellent</span>
                                                ) : dept.resolution_rate > 50 ? (
                                                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider border border-yellow-200 rounded-sm">Average</span>
                                                ) : (
                                                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider border border-red-200 rounded-sm">Critical</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Complaint Trend Chart */}
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-lg font-serif font-bold text-[#001f3f] mb-2">Complaint Volume Trend</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">6-Month Trajectory</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                                    <Area type="monotone" dataKey="complaints" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorComplaints)" strokeWidth={2} name="Total Complaints" />
                                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} name="Resolved" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* --- AI TRANSPARENCY & TRUST --- */}
                <div className="bg-[#001f3f] text-white p-8 rounded-sm shadow-xl overflow-hidden relative border-t-8 border-yellow-500">
                    {/* Decorative bg */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#000000] to-transparent opacity-50"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 bg-yellow-500 text-[#001f3f] rounded-sm text-[10px] font-bold uppercase tracking-widest mb-4">AI Governance Protocol</div>
                            <h2 className="text-3xl font-serif font-bold mb-4">Artificial Intelligence Performance Monitor</h2>
                            <p className="text-blue-100 mb-8 max-w-md leading-relaxed text-sm font-light">
                                Real-time oversight of the automated decision-making engines. Monitors accuracy rates for classification, prioritization, and visual verification systems to ensure public accountability.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 p-4 rounded-sm border-l-2 border-green-500">
                                    <p className="text-blue-300 text-[10px] uppercase font-bold tracking-widest mb-1">Category Accuracy</p>
                                    <p className="text-2xl font-mono font-bold text-white">{aiMetrics?.category_accuracy}%</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-sm border-l-2 border-yellow-500">
                                    <p className="text-blue-300 text-[10px] uppercase font-bold tracking-widest mb-1">Mismatches Flagged</p>
                                    <p className="text-2xl font-mono font-bold text-white">{aiMetrics?.mismatches_flagged}</p>
                                    <p className="text-[10px] text-yellow-500 mt-1 uppercase">Requires Review</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 bg-white/5 rounded-sm border border-white/10 p-4 relative">
                            <h4 className="absolute top-4 left-4 text-[10px] text-white/50 uppercase tracking-widest font-bold">Model Performance Metrics</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={radialData}>
                                    <RadialBar
                                        minAngle={15}
                                        label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                        background
                                        clockWise
                                        dataKey="uv"
                                    />
                                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" wrapperStyle={{ color: '#bfdbfe', fontSize: '11px', fontFamily: 'monospace' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </main >
        </div >
    );
};

export default GovernanceDashboard;
