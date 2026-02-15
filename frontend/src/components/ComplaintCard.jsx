import React, { useState } from 'react';
import StatusTracker from './StatusTracker';
import { submitFeedback } from '../services/api';
import { motion } from 'framer-motion';

const ComplaintCard = ({ complaint }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(complaint.feedback ? true : false);

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleFeedback = async () => {
        try {
            await submitFeedback({
                complaint_id: complaint._id,
                rating,
                comment
            });
            setFeedbackSubmitted(true);
            alert("Thank you for your feedback!");
        } catch (err) {
            console.error(err);
            alert("Failed to submit feedback");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card transition hover:shadow-lg mb-4"
        >
            <div className="flex justify-between items-start">
                <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} Priority
                    </span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {complaint.category}
                    </span>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{complaint.department}</h3>
                    <p className="mt-1 text-gray-600">{complaint.text}</p>
                </div>
                <div className="text-sm text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                </div>
            </div>

            <div className="mt-4">
                <StatusTracker status={complaint.status} />
            </div>

            {/* Images Section */}
            <div className="mt-4 flex space-x-4">
                {complaint.image_before && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Before</p>
                        <img
                            src={`http://localhost:5000/uploads/${complaint.image_before}`}
                            alt="Before"
                            className="h-24 w-24 object-cover rounded"
                        />
                    </div>
                )}
                {complaint.image_after && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">After</p>
                        <img
                            src={`http://localhost:5000/uploads/${complaint.image_after}`}
                            alt="After"
                            className="h-24 w-24 object-cover rounded border-2 border-green-500"
                        />
                    </div>
                )}
            </div>

            {complaint.remarks && complaint.remarks.length > 0 && (
                <div className="mt-3 bg-gray-50 p-2 rounded text-sm text-gray-700">
                    <strong>Latest Remark:</strong> {complaint.remarks[complaint.remarks.length - 1]}
                </div>
            )}

            {/* Feedback Section */}
            {(complaint.status === 'Resolved' || complaint.status === 'Verified') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {!feedbackSubmitted ? (
                        <div className="bg-blue-50 p-3 rounded">
                            <h4 className="text-sm font-semibold mb-2">Rate Service Provided</h4>
                            <div className="flex items-center mb-2">
                                <span className="mr-2 text-sm">Rating:</span>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="border rounded p-1 text-sm"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ Good</option>
                                    <option value="3">⭐⭐⭐ Average</option>
                                    <option value="2">⭐⭐ Poor</option>
                                    <option value="1">⭐ Very Poor</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Any comments?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full text-sm border rounded p-2 mb-2"
                            />
                            <button
                                onClick={handleFeedback}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-green-700 font-medium">
                            ✓ Feedback submitted. Thank you!
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default ComplaintCard;
