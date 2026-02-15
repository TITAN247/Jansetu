import React, { useEffect, useState } from 'react';
import { getUserComplaints, submitFeedback } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');

    // Safe User Retrieval
    const getUser = () => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    };

    const user = getUser();
    const userId = user?.id || user?._id;

    // Redirect if no user (should be handled by ProtectedRoute, but double safety)
    if (!user || !userId) {
        window.location.href = '/login';
        return null;
    }

    const fetchComplaints = async () => {
        try {
            const data = await getUserComplaints(userId);
            // Verify data is an array before setting state
            if (Array.isArray(data)) {
                setComplaints(data.slice().reverse()); // Create copy before reversing to avoid mutating constant refs if any
            } else {
                console.error("Expected array but got:", data);
                setComplaints([]);
            }
        } catch (error) {
            console.error("Error fetching complaints:", error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        try {
            await submitFeedback({
                complaint_id: selectedComplaint._id,
                rating: feedbackRating,
                comment: feedbackComment
            });
            alert('Feedback submitted successfully!');
            fetchComplaints(); // Refresh to update local state
            setSelectedComplaint(null); // Close modal
        } catch (error) {
            alert('Failed to submit feedback.');
        }
    };

    // Stats Calculation
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Verified').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        verified: complaints.filter(c => c.status === 'Verified').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Assigned': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'In Progress': return 'bg-orange-50 text-orange-800 border-orange-200';
            case 'Resolved': return 'bg-green-50 text-green-800 border-green-200';
            case 'Verified': return 'bg-teal-50 text-teal-800 border-teal-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">JanSetu Dashboard</h1>
                            <p className="text-[10px] md:text-xs text-blue-200 uppercase tracking-wider">Citizen Grievance Portal</p>
                        </div>
                    </div>






                    <button
                        onClick={() => navigate('/register-complaint')}
                        className="bg-orange-600 text-white px-5 py-2 rounded-sm hover:bg-orange-700 transition shadow-md font-bold text-sm uppercase tracking-wider border border-orange-700 active:scale-[0.98]"
                    >
                        + New Complaint
                    </button>
                    {/* User Profile Hook */}
                    <div className="hidden md:flex items-center gap-3 ml-6 border-l border-blue-800 pl-6">
                        <div className="text-right">
                            <p className="text-xs font-bold text-white">{user?.name || 'Citizen'}</p>
                            <p className="text-[10px] text-blue-300">Citizen ID: {userId ? userId.slice(-6).toUpperCase() : 'N/A'}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-600">
                            {user?.name ? user.name.charAt(0) : 'U'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECTION 2: QUICK STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Complaints', value: stats.total, color: 'border-l-4 border-blue-900 bg-white text-blue-900' },
                        { label: 'Pending Action', value: stats.pending, color: 'border-l-4 border-orange-600 bg-white text-orange-800' },
                        { label: 'Resolved', value: stats.resolved, color: 'border-l-4 border-green-600 bg-white text-green-800' },
                        { label: 'Verified by AI', value: stats.verified, color: 'border-l-4 border-teal-600 bg-white text-teal-800' }
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow ${stat.color}`}
                        >
                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-serif font-extrabold mt-2">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* --- SECTION 3: COMPLAINT LIST --- */}
                <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
                    <h2 className="text-lg font-serif font-bold text-[#001f3f] flex items-center gap-2">
                        <span className="text-orange-600">YOUR</span> GRIEVANCES
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-medium">Fetching Records...</div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-sm shadow-sm border border-dashed border-gray-300">
                        <div className="text-6xl mb-4 opacity-50">📂</div>
                        <h3 className="text-xl font-serif font-bold text-[#001f3f]">No Records Found</h3>
                        <p className="text-gray-500 mt-2 text-sm">You have not submitted any grievances yet.</p>
                        <button
                            onClick={() => setShowNewComplaintModal(true)}
                            className="mt-6 text-blue-900 font-bold hover:underline uppercase text-xs tracking-wider"
                        >
                            Register your first complaint
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map((complaint, index) => (
                            <motion.div
                                key={complaint._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-sm shadow-sm hover:shadow-lg transition-all border-t-4 border-blue-900 overflow-hidden flex flex-col group"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-400">
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-serif font-bold text-lg text-[#001f3f] mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                        {complaint.category} Issue
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10 border-l-2 border-gray-100 pl-3">
                                        {complaint.text}
                                    </p>

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <span className="bg-gray-50 px-2 py-1 rounded-sm border border-gray-200">Priority: {complaint.priority}</span>
                                        <span className="bg-gray-50 px-2 py-1 rounded-sm border border-gray-200">Dept: {complaint.department}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setSelectedComplaint(complaint)}
                                        className="text-blue-900 font-bold text-xs uppercase tracking-wider hover:text-orange-600 transition flex items-center gap-1"
                                    >
                                        View Details <span className="text-lg">›</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- SECTION 4: MODALS --- */}
            <AnimatePresence>
                {/* DETAIL MODAL */}
                {selectedComplaint && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedComplaint(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-[#001f3f]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-[#001f3f]">Grievance Details</h2>
                                    <p className="text-xs text-gray-500 font-mono">ID: {selectedComplaint._id}</p>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">×</button>
                            </div>

                            <div className="p-8 space-y-8 bg-gray-50/50">
                                {/* Timeline */}
                                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b pb-2">Application Status</h3>
                                    <StatusTracker status={selectedComplaint.status} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Info */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Grievance Information</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Description</label>
                                                    <p className="text-gray-800 text-sm leading-relaxed mt-1">{selectedComplaint.text}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Category</label>
                                                        <p className="font-bold text-sm text-[#001f3f]">{selectedComplaint.category}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Department</label>
                                                        <p className="font-bold text-sm text-[#001f3f]">{selectedComplaint.department}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Evidence Record</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-2 block">Available Evidence (Before)</label>
                                                    <img src={`http://localhost:5000/uploads/${selectedComplaint.image_before}`} alt="Issue" className="w-full h-48 object-cover rounded-sm border border-gray-200" />
                                                </div>
                                                {selectedComplaint.image_after && (
                                                    <div>
                                                        <label className="text-[10px] text-green-600 font-bold uppercase mb-2 block">Resolution Proof (After)</label>
                                                        <img src={`http://localhost:5000/uploads/${selectedComplaint.image_after}`} alt="Resolution" className="w-full h-48 object-cover rounded-sm border-2 border-green-500/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 5: FEEDBACK (Conditional) */}
                                {selectedComplaint.status === 'Verified' && !selectedComplaint.feedback && (
                                    <div className="bg-blue-50 p-8 rounded-sm border-l-4 border-blue-600 shadow-sm">
                                        <h3 className="font-serif font-bold text-blue-900 text-lg mb-2">Rate Resolution Quality</h3>
                                        <p className="text-sm text-blue-800 mb-4">Your feedback helps us improve municipal services.</p>

                                        <form onSubmit={handleFeedbackSubmit}>
                                            <div className="flex gap-2 mb-4 text-3xl">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setFeedbackRating(star)}
                                                        className={`transition-transform hover:scale-110 ${star <= feedbackRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full p-4 border border-blue-200 rounded-sm mb-4 text-sm focus:ring-1 focus:ring-blue-900 outline-none"
                                                placeholder="Provide specific feedback on the resolution work..."
                                                value={feedbackComment}
                                                onChange={(e) => setFeedbackComment(e.target.value)}
                                                rows="3"
                                            />
                                            <button type="submit" className="bg-blue-900 text-white px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-blue-800 shadow-md">Submit Evaluation</button>
                                        </form>
                                    </div>
                                )}

                                {selectedComplaint.feedback && (
                                    <div className="bg-green-50 p-4 rounded-sm border border-green-200 text-green-800 text-sm flex items-center gap-3">
                                        <span className="text-2xl">✓</span>
                                        <div>
                                            <strong>Feedback Recorded</strong>
                                            <p className="text-xs opacity-80">You rated this resolution {selectedComplaint.feedback.rating}/5 stars.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* NEW COMPLAINT MODAL - Removed in favor of redirect */}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboard;
