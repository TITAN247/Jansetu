import React, { useEffect, useState } from 'react';
import { getAssignedTasks } from '../services/api';
import { Link } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';

const WorkerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null); // For Modal
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('active'); // 'active' | 'history'

    // Form State
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [remarks, setRemarks] = useState('');

    // AI Verification State
    const [verificationStep, setVerificationStep] = useState(0);
    const [verificationResult, setVerificationResult] = useState(null);


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

    // Redirect if no user (should be handled by ProtectedRoute)
    if (!user) {
        window.location.href = '/login';
        return null;
    }

    const fetchTasks = async () => {
        try {
            const data = await getAssignedTasks(user.department || 'General'); // Fallback if dept missing
            // Sort by priority (High > Medium > Low)
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            // Ensure data is array
            if (Array.isArray(data)) {
                const sortedData = data.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                setTasks(sortedData);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Submit Work
    const handleSubmitWork = async (e) => {
        e.preventDefault();
        if (!image || !selectedTask) return;

        setUploading(true);
        setVerificationStep(1); // Start Step 1

        // Simulate Steps Progress (Backend takes ~7s)
        const stepInterval = setInterval(() => {
            setVerificationStep(prev => prev < 4 ? prev + 1 : prev);
        }, 1800); // ~1.8s per step

        const formData = new FormData();
        formData.append('complaint_id', selectedTask._id);
        formData.append('image', image);
        formData.append('remark', remarks);

        try {
            const data = await uploadWorkerWork(formData);

            clearInterval(stepInterval);
            setVerificationStep(4);

            // Artificial small delay to show 'Finalizing'
            setTimeout(() => {
                const v = data.verification || {};
                setVerificationResult(v);
                setUploading(false); // Hide overlay
            }, 1000);

        } catch (error) {
            clearInterval(stepInterval);
            console.error(error);
            setUploading(false);
            const msg = error.response?.data?.error || error.message || "Unknown Error";
            alert(`Failed to upload work: ${msg}`);
        }
    };

    // Stats
    const stats = {
        total: tasks.length,
        highPriority: tasks.filter(t => t.priority === 'High').length,
        pending: tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Resolved' || t.status === 'Verified').length
    };

    const getPriorityColor = (p) => {
        if (p === 'High') return 'bg-red-50 text-red-800 border-red-200';
        if (p === 'Medium') return 'bg-orange-50 text-orange-800 border-orange-200';
        return 'bg-green-50 text-green-800 border-green-200';
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] pb-12 font-sans">

            {/* --- SECTION 1: HEADER --- */}
            <header className="bg-[#001f3f] shadow-lg sticky top-0 z-30 border-b-4 border-orange-500">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="Emblem"
                            className="h-10 invert brightness-0 filter"
                        />
                        <div>
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">Field Officer Portal</h1>
                            <p className="text-[10px] md:text-xs text-orange-200 uppercase tracking-wider">JanSetu Workforce • Department: <span className="text-white font-bold">{user.department}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-900/50 px-4 py-2 rounded-sm border border-blue-800">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">System Live</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECTION 2: STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Assigned Tasks', value: stats.total, color: 'border-l-4 border-blue-900 bg-white text-blue-900' },
                        { label: 'High Priority', value: stats.highPriority, color: 'border-l-4 border-red-600 bg-white text-red-800' },
                        { label: 'Pending Action', value: stats.pending, color: 'border-l-4 border-orange-600 bg-white text-orange-800' },
                        { label: 'Works Completed', value: stats.completed, color: 'border-l-4 border-green-600 bg-white text-green-800' }
                    ].map((stat) => (
                        <div key={stat.label} className={`p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow ${stat.color}`}>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-serif font-extrabold mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* --- SECTION 3: TASK LIST --- */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setViewMode('active')}
                                className={`text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition ${viewMode === 'active' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Active Tasks
                            </button>
                            <button
                                onClick={() => setViewMode('history')}
                                className={`text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition ${viewMode === 'history' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Work History
                            </button>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-sans font-bold">
                            {tasks.filter(t => viewMode === 'active'
                                ? ['Pending', 'Submitted', 'Assigned', 'In Progress'].includes(t.status)
                                : ['Resolved', 'Verified'].includes(t.status)
                            ).length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500 font-medium">Loading assignments...</div>
                    ) : tasks.filter(t => viewMode === 'active'
                        ? ['Pending', 'Submitted', 'Assigned', 'In Progress'].includes(t.status)
                        : ['Resolved', 'Verified'].includes(t.status)
                    ).length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-4xl mb-2 opacity-30">📋</div>
                            <p className="font-serif">
                                {viewMode === 'active' ? "No active tasks assigned." : "No completed work history found."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tasks
                                .filter(t => viewMode === 'active'
                                    ? ['Pending', 'Submitted', 'Assigned', 'In Progress'].includes(t.status)
                                    : ['Resolved', 'Verified'].includes(t.status)
                                )
                                .map((task, index) => (
                                    <motion.div
                                        key={task._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-6 hover:bg-blue-50/30 transition flex flex-col md:flex-row gap-6 items-start md:items-center group"
                                    >
                                        {/* Left: Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider border ${getPriorityColor(task.priority)}`}>
                                                    {task.priority} Priority
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-500">REF: {task._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">• {new Date(task.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-serif font-bold text-[#001f3f] mb-1 group-hover:text-blue-800 transition-colors">{task.category} Issue</h3>
                                            <p className="text-gray-600 text-sm line-clamp-1">{task.text}</p>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Status</p>
                                                <p className={`font-bold text-sm ${task.status === 'Resolved' || task.status === 'Verified' ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {task.status}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/complaint/${task._id}`}
                                                className="px-6 py-2 bg-[#001f3f] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-blue-900 transition-colors shadow-md border border-transparent hover:border-blue-500"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    )}
                </div>
            </main>

            {/* --- SECTION 4: MODALS --- */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedTask(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-sm w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden border-t-8 border-orange-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Left: Details */}
                            <div className="w-full md:w-1/2 bg-gray-50 p-8 border-r border-gray-200 overflow-y-auto">
                                <h3 className="text-xl font-serif font-bold mb-6 text-[#001f3f] border-b pb-4">Job Detail Card</h3>

                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Problem Description</label>
                                        <p className="text-gray-800 mt-2 text-sm leading-relaxed">{selectedTask.text}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                                            <p className="font-bold text-gray-800 mt-1">{selectedTask.category}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority Level</label>
                                            <p className={`font-bold mt-1 ${selectedTask.priority === 'High' ? 'text-red-600' : 'text-gray-800'}`}>{selectedTask.priority}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">Field Evidence (Incoming)</label>
                                        <div className="p-2 bg-white border border-gray-200 rounded-sm shadow-sm">
                                            <img
                                                src={`http://localhost:5000/uploads/${selectedTask.image_before}`}
                                                alt="Evidence"
                                                className="w-full rounded-sm"
                                            />
                                        </div>
                                        <div className="mt-4">
                                            {selectedTask.location && selectedTask.location.lat ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${selectedTask.location.lat},${selectedTask.location.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-center bg-blue-50 text-blue-900 py-3 rounded-sm font-bold uppercase text-xs tracking-widest border border-blue-200 hover:bg-blue-100 transition shadow-sm"
                                                >
                                                    🗺️ Navigate to Location
                                                </a>
                                            ) : (
                                                <div className="text-center bg-gray-50 text-gray-400 py-3 rounded-sm font-bold uppercase text-xs tracking-widest border border-gray-200 cursor-not-allowed">
                                                    🚫 Location Data Not Available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <StatusTracker status={selectedTask.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Right: Action Panel */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h3 className="text-xl font-serif font-bold text-[#001f3f]">Action Console</h3>
                                    <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-red-600 transition text-2xl font-bold">✕</button>
                                </div>

                                {selectedTask.status === 'Verified' || selectedTask.status === 'Resolved' ? (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-4xl text-green-600 border border-green-100 mb-2">✓</div>
                                        <h4 className="text-2xl font-serif font-bold text-green-800">Work Completed</h4>
                                        <p className="text-gray-500 text-sm">This grievance has been resolved and verified by the system.</p>

                                        {selectedTask.image_after && (
                                            <div className="mt-8 w-full bg-gray-50 p-4 rounded-sm border border-gray-200">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 text-left tracking-widest">Proof of Work Submitted</p>
                                                <img
                                                    src={`http://localhost:5000/uploads/${selectedTask.image_after}`}
                                                    alt="Proof"
                                                    className="w-full h-48 object-cover rounded-sm border border-gray-300"
                                                />
                                            </div>
                                        )}
                                        {selectedTask.remarks && (
                                            <div className="w-full text-left mt-4">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Official Remarks</p>
                                                <p className="text-sm bg-blue-50 p-3 rounded-sm w-full text-blue-900 border-l-4 border-blue-200">
                                                    {selectedTask.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitWork} className="flex-1 flex flex-col space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-sm border border-blue-100 text-sm text-blue-900 mb-2">
                                            <strong>Instructions:</strong> Please upload a clear photo of the resolved issue. The AI system will verify the fix before closing the ticket.
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">1. Upload Proof of Work</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex-1 cursor-pointer group">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition group-hover:border-blue-400">
                                                        <span className="text-3xl block mb-2 opacity-50">📷</span>
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-blue-600">Click to upload After Image</span>
                                                    </div>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
                                                </label>
                                            </div>
                                            {imagePreview && (
                                                <div className="mt-4 p-2 border border-gray-200 rounded-sm">
                                                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Preview Selected:</p>
                                                    <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-sm" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">2. Official Remarks / Report</label>
                                            <textarea
                                                className="w-full p-4 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 outline-none h-32 resize-none text-sm"
                                                placeholder="Describe the technical work completed..."
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={uploading || !image}
                                                className="w-full py-4 bg-[#001f3f] text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg active:scale-[0.99]"
                                            >
                                                {uploading ? 'Initiating Verification Protocol...' : 'Submit Resolution Report'}
                                            </button>
                                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                                By submitting, you certify that the work has been completed as per regulations.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* --- AI VERIFICATION OVERLAY --- */}
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="bg-white p-8 rounded-sm max-w-md w-full text-center relative overflow-hidden border-t-4 border-blue-500">
                            {/* Scanning Effect */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-0"
                            />

                            <div className="relative z-10">
                                <div className="w-20 h-20 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                                    ></motion.div>
                                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                                </div>

                                <h3 className="text-xl font-serif font-bold text-[#001f3f] mb-2">AI Verification in Progress</h3>

                                <div className="space-y-3 text-left mt-6 bg-gray-50 p-4 rounded-sm border border-gray-100">
                                    <StepItem step={1} current={verificationStep} label="Analyzing Before Image Context (YOLOv8)" />
                                    <StepItem step={2} current={verificationStep} label="Matching Location Features (ORB/SSIM)" />
                                    <StepItem step={3} current={verificationStep} label="Verifying Issue Removal" />
                                    <StepItem step={4} current={verificationStep} label="Finalizing Governance Report" />
                                </div>

                                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest animate-pulse">
                                    Processing... Do not close window
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- VERIFICATION RESULT MODAL --- */}
                {verificationResult && !uploading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="bg-white p-8 rounded-sm max-w-md w-full text-center border-t-4 border-gray-800">
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-inner ${verificationResult.status === 'Verified' || verificationResult.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {verificationResult.status === 'Verified' || verificationResult.status === 'Resolved' ? '✅' : '❌'}
                            </div>

                            <h3 className={`text-2xl font-serif font-bold mb-2 ${verificationResult.status === 'Verified' || verificationResult.status === 'Resolved' ? 'text-green-800' : 'text-red-800'}`}>
                                {verificationResult.status === 'Verified' || verificationResult.status === 'Resolved' ? 'Verification Successful' : 'Verification Failed'}
                            </h3>

                            <p className="text-gray-600 mb-6 font-medium">
                                {verificationResult.reason || verificationResult.verification_reason}
                            </p>

                            {verificationResult.confidence && (
                                <div className="mb-6 inline-block px-4 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                    AI Confidence Score: {(verificationResult.confidence * 100).toFixed(1)}%
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setVerificationResult(null);
                                    setSelectedTask(null);
                                    fetchTasks(); // Refresh list
                                }}
                                className="w-full py-3 bg-[#001f3f] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-blue-900 transition"
                            >
                                Close & Return to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkerDashboard;

const StepItem = ({ step, current, label }) => {
    let icon = '⚪';
    let textClass = 'text-gray-400';

    if (current > step) {
        icon = '✅';
        textClass = 'text-green-600 font-bold';
    } else if (current === step) {
        icon = '⏳';
        textClass = 'text-blue-600 font-bold animate-pulse';
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <span className={`text-sm ${textClass}`}>{label}</span>
        </div>
    );
};

