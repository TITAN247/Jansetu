import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    // Worker Action State
    const [workImage, setWorkImage] = useState(null);
    const [workImagePreview, setWorkImagePreview] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [submittingWork, setSubmittingWork] = useState(false);

    // Citizen Feedback State
    const [rating, setRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) setUser(JSON.parse(userStr));
        } catch (e) {
            navigate('/login');
        }
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const data = await getComplaintDetails(id);
            setComplaint(data);
        } catch (err) {
            setError('Failed to fetch complaint details.');
        } finally {
            setLoading(false);
        }
    };

    // --- WORKER ACTIONS ---
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
        if (!workImage) return alert("Please upload an image of the completed work.");

        setSubmittingWork(true);
        const formData = new FormData();
        formData.append('complaint_id', id);
        formData.append('worker_id', user.id);
        formData.append('image', workImage);
        formData.append('remarks', remarks || "Work completed.");

        try {
            await uploadWorkerWork(formData);
            alert("Work uploaded successfully!");
            fetchDetails(); // Refresh
        } catch (err) {
            alert("Failed to upload work.");
        } finally {
            setSubmittingWork(false);
        }
    };

    // --- CITIZEN ACTIONS ---
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try {
            await submitFeedback({ complaint_id: id, rating, feedback: feedbackText });
            setFeedbackSubmitted(true);
            alert("Thank you for your feedback!");
        } catch (err) {
            alert("Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading official record...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

    // Helper: Timeline Status
    const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified'];
    const currentStepIndex = steps.indexOf(complaint.status) > -1 ? steps.indexOf(complaint.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">

            {/* --- SECTION 1: HEADER --- */}
            <div className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-8" />
                    <div>
                        <h1 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">JanSetu Official Record</h1>
                        <h2 className="text-sm font-serif font-bold text-[#001f3f]">Complaint Details</h2>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">Complaint ID</span>
                    <span className="font-mono font-bold text-blue-900">{id.slice(-6).toUpperCase()}</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* --- SECTION 2: SUMMARY CARD --- */}
                <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-blue-900 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-sm mb-2 ${complaint.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {complaint.priority} Priority
                        </span>
                        <h1 className="text-2xl font-serif font-bold text-gray-800">{complaint.category} Issue</h1>
                        <p className="text-sm text-gray-500 mb-3">{complaint.department} Department • {new Date().toLocaleDateString()}</p>

                        {/* Location Action */}
                        {complaint.location && complaint.location.lat && (
                            <button
                                onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`, '_blank')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-green-200 transition border border-green-200"
                            >
                                📍 Track Exact Location
                            </button>
                        )}
                    </div>

                    <div className="text-center md:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Current Status</span>
                        <span className={`text-xl font-bold uppercase tracking-wide ${complaint.status === 'Verified' ? 'text-green-700' : 'text-blue-900'}`}>
                            ● {complaint.status}
                        </span>
                    </div>
                </div>

                {/* --- SECTION 3: DESCRIPTION & AI ANALYSIS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Description */}
                    <div className="md:col-span-2 bg-white p-6 rounded-sm shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Complaint Description</h3>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 border-l-2 border-gray-200 rounded-sm">
                            "{complaint.text}"
                        </p>
                    </div>

                    {/* Right: AI Analysis */}
                    <div className="bg-[#001f3f] text-white p-6 rounded-sm shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">🤖</div>
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4 border-b border-blue-800 pb-2">AI Analysis</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase text-blue-400">Detected Category</span>
                                <div className="font-bold text-lg">{complaint.category}</div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-blue-400">Severity Score</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-full bg-blue-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400" style={{ width: '85%' }}></div>
                                    </div>
                                    <span className="text-xs font-mono">85%</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-blue-400">Auto-Assigned To</span>
                                <div className="font-bold text-yellow-500">{complaint.department}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 5: TIMELINE --- */}
                <div className="bg-white p-8 rounded-sm shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">Resolution Timeline</h3>
                    <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transition-all duration-1000" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${idx <= currentStepIndex ? 'bg-green-600 text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
                                    {idx < currentStepIndex ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${idx <= currentStepIndex ? 'text-green-700' : 'text-gray-400'}`}>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SECTIONS 4 & 7: EVIDENCE & AI VERIFICATION --- */}
                {complaint.work_image_path ? (
                    <AIVerificationPanel complaint={complaint} />
                ) : (
                    /* Default Evidence View if no work done yet */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-sm shadow-sm">
                            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm mb-2 inline-block">Before Resolution</span>
                            <img src={`http://localhost:5000/uploads/${complaint.image_path}`} alt="Before" className="w-full h-64 object-cover rounded-sm border border-gray-200" />
                            <p className="text-xs text-gray-400 mt-2">Uploaded by Citizen • {new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-sm shadow-sm flex flex-col items-center justify-center text-gray-400">
                            <span className="text-2xl mb-2">⏳</span>
                            <span className="text-xs font-bold uppercase tracking-wide">Awaiting Official Response</span>
                        </div>
                    </div>
                )}

                {/* --- SECTION 6: ROLE SPECIFIC ACTIONS --- */}

                {/* WORKER ACTION: Upload Work */}
                {user?.role === 'worker' && complaint.status !== 'Verified' && complaint.status !== 'Resolved' && (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-sm">
                        <h3 className="text-blue-900 font-serif font-bold text-lg mb-4">👷 Worker Action Panel</h3>
                        <form onSubmit={handleWorkerSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Completed Work Image</label>
                                <input type="file" accept="image/*" onChange={handleWorkImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800" />
                            </div>
                            {workImagePreview && <img src={workImagePreview} alt="Preview" className="h-32 object-cover rounded-sm border border-gray-300" />}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Remarks / Work Description</label>
                                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full p-3 border border-gray-300 rounded-sm text-sm" placeholder="Describe the work done..." rows="3"></textarea>
                            </div>
                            <button type="submit" disabled={submittingWork} className="px-6 py-3 bg-green-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-green-700 shadow-md">
                                {submittingWork ? 'Uploading...' : 'Submit Work for Verification'}
                            </button>
                        </form>
                    </div>
                )}

                {/* CITIZEN ACTION: Feedback */}
                {user?.role === 'citizen' && complaint.status === 'Verified' && !feedbackSubmitted && (
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-sm text-center">
                        <h3 className="text-yellow-800 font-serif font-bold text-lg mb-2">How was our service?</h3>
                        <p className="text-xs text-gray-600 mb-6">Please rate the resolution quality.</p>
                        <form onSubmit={handleFeedbackSubmit} className="max-w-md mx-auto">
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
                                ))}
                            </div>
                            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-sm text-sm mb-4" placeholder="Any additional feedback?" rows="2"></textarea>
                            <button type="submit" disabled={submittingFeedback} className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold uppercase tracking-widest rounded-sm hover:bg-yellow-400 shadow-sm text-xs">
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
