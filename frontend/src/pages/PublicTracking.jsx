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

        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const data = await getComplaintDetails(complaintId);
            setComplaint(data);
        } catch (err) {
            setError('Complaint not found or invalid ID. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine active step in timeline
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
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

            {/* --- SECTION 1: GOVERNMENT HEADER STRIP --- */}
            <div className="bg-white border-b border-gray-200 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Support" className="h-10" />
                        <div>
                            <h1 className="text-xs font-bold uppercase tracking-widest text-gray-500">Government of India</h1>
                            <h2 className="text-lg font-serif font-bold text-[#001f3f]">Official Public Grievance Tracking Portal</h2>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span className="cursor-pointer hover:text-blue-900">High Contrast</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:text-blue-900">A+</span>
                        <span className="cursor-pointer hover:text-blue-900">A-</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:text-blue-900">English / हिंदी</span>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: SEARCH PANEL --- */}
            <div className="bg-[#001f3f] py-16 border-b-8 border-yellow-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Track Your Complaint Status</h2>
                    <p className="text-blue-200 mb-8 font-light">Enter your unique Complaint ID to view real-time progress.</p>

                    <form onSubmit={handleSearch} className="bg-white p-2 rounded-sm shadow-xl flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value)}
                            placeholder="Enter Complaint ID (e.g., 65c4...)"
                            className="flex-1 px-4 py-3 bg-gray-50 outline-none text-gray-900 font-mono font-bold uppercase placeholder-gray-400 border border-transparent focus:border-blue-900 transition"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-900 text-white font-bold uppercase tracking-widest hover:bg-blue-800 transition shadow-md disabled:bg-gray-400"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-red-100 border-l-4 border-red-600 text-red-700 p-3 text-left text-sm font-semibold rounded-sm shadow-md"
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* --- SECTION 3: STATUS DISPLAY --- */}
            <div className="flex-1 max-w-5xl mx-auto px-4 w-full py-12">
                {complaint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 shadow-md rounded-sm overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Complaint ID</span>
                                <div className="text-xl font-mono font-bold text-blue-900">{complaint._id.slice(-6).toUpperCase()}</div>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dates</span>
                                    <div className="text-sm font-bold text-gray-800">
                                        {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Priority</span>
                                    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-sm ${complaint.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {complaint.priority}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Issue Category & Department</h3>
                                    <div className="text-2xl font-serif font-bold text-gray-800 mb-1">{complaint.category}</div>
                                    <div className="text-blue-600 font-semibold">{complaint.department} Department</div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 border-l-4 border-gray-300 italic">
                                        "{complaint.text}"
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mb-12">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Action Timeline</h3>
                                <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
                                    {/* Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

                                    {['submitted', 'assigned', 'in progress', 'resolved'].map((step, idx) => {
                                        const status = getStepStatus(step);
                                        let color = 'bg-gray-200 text-gray-400';
                                        if (status === 'completed') color = 'bg-green-600 text-white';
                                        if (status === 'current') color = 'bg-blue-900 text-white ring-4 ring-blue-100';

                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${color}`}>
                                                    {status === 'completed' ? '✓' : idx + 1}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${status === 'pending' ? 'text-gray-400' : 'text-blue-900'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Verification / Images */}
                            {(complaint.status === 'Resolved' || complaint.status === 'Verified') && (
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Verification Evidence</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative group">
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 uppercase rounded-sm">Before</div>
                                            <img src={`http://localhost:5000/uploads/${complaint.image_path}`} alt="Before" className="w-full h-48 object-cover rounded-sm border border-gray-300" />
                                        </div>
                                        {complaint.work_image_path ? (
                                            <div className="relative group">
                                                <div className="absolute top-2 left-2 bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase rounded-sm">After Resolution</div>
                                                <img src={`http://localhost:5000/uploads/${complaint.work_image_path}`} alt="After" className="w-full h-48 object-cover rounded-sm border border-green-500 shadow-md" />
                                                <div className="mt-2 flex items-center gap-2 text-green-700 font-bold text-sm">
                                                    <span>✅ AI Verified Match</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 rounded-sm text-gray-400 text-xs italic">
                                                Resolution image pending upload
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Info / Empty State */}
                {!complaint && !loading && (
                    <div className="text-center py-12 opacity-60">
                        <div className="text-4xl mb-4">🏛️</div>
                        <p className="text-gray-500 font-serif italic">Enter a valid ID above to see official records.</p>
                    </div>
                )}
            </div>

            {/* --- SECTION 4: DISCLAIMER FOOTER --- */}
            <div className="bg-gray-100 border-t border-gray-200 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 leading-relaxed font-light">
                    <p className="mb-2"><strong>Disclaimer:</strong> The status displayed is based on the real-time data updated by the respective municipal departments. Verification is performed by automated AI systems.</p>
                    <p>For urgent grievances regarding public safety, please dial <strong>1916</strong> directly.</p>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center gap-6 font-bold text-gray-400 uppercase tracking-widest">
                        <span>Privacy Policy</span>
                        <span>Terms of Use</span>
                        <span>Accessibility</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicTracking;
