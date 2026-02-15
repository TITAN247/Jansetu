import React from 'react';
import { motion } from 'framer-motion';

const AIVerificationPanel = ({ complaint }) => {
    const {
        image_path,
        work_image_path,
        verification_status,
        ai_analysis_before,
        ai_analysis_after
    } = complaint;

    const getStatusColor = () => {
        if (verification_status === 'Verified') return 'bg-green-100 text-green-800 border-green-300';
        if (verification_status === 'Partially Done' || verification_status === 'Partially Verified') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    const getStatusIcon = () => {
        if (verification_status === 'Verified') return '✅';
        if (verification_status === 'Partially Done' || verification_status === 'Partially Verified') return '⚠️';
        return '❌';
    };

    return (
        <div className="bg-white rounded-sm shadow-sm border border-blue-100 overflow-hidden mt-8">
            {/* Header */}
            <div className="bg-[#001f3f] text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-serif font-bold text-lg">AI-Based Verification of Work Completion</h3>
                    <p className="text-[10px] text-blue-300 uppercase tracking-wider">Automated Issue Resolution Analysis</p>
                </div>
                <div className="text-2xl">🤖</div>
            </div>

            <div className="p-6">
                {/* Comparison View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Before Panel */}
                    <div className="border border-gray-200 rounded-sm p-4 relative">
                        <span className="absolute top-0 left-0 bg-gray-800 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-br-sm z-10">
                            Before Resolution (Citizen Submission)
                        </span>
                        <img
                            src={`http://localhost:5000/uploads/${image_path}`}
                            alt="Before"
                            className="w-full h-64 object-cover rounded-sm mb-4"
                        />
                        <div className="bg-gray-50 p-3 rounded-sm border border-gray-100">
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">AI Detected Issues</h4>
                            {ai_analysis_before?.objects?.length > 0 ? (
                                <div className="space-y-1">
                                    {ai_analysis_before.objects.map((obj, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-red-600">{obj.label}</span>
                                            <span className="text-xs text-gray-400 font-mono">{(obj.confidence * 100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No specific objects detected.</p>
                            )}
                        </div>
                    </div>

                    {/* After Panel */}
                    <div className="border border-gray-200 rounded-sm p-4 relative">
                        <span className="absolute top-0 left-0 bg-green-700 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-br-sm z-10">
                            After Resolution (Department Upload)
                        </span>
                        {work_image_path ? (
                            <>
                                <img
                                    src={`http://localhost:5000/uploads/${work_image_path}`}
                                    alt="After"
                                    className="w-full h-64 object-cover rounded-sm mb-4 border-2 border-green-500"
                                />
                                <div className="bg-green-50 p-3 rounded-sm border border-green-100">
                                    <h4 className="text-xs font-bold uppercase text-green-700 mb-2">AI Analysis Result</h4>
                                    {ai_analysis_after?.objects?.length > 0 ? (
                                        <div className="space-y-1">
                                            {ai_analysis_after.objects.map((obj, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-red-500">{obj.label}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{(obj.confidence * 100).toFixed(1)}%</span>
                                                </div>
                                            ))}
                                            <p className="text-xs text-red-600 mt-2 font-bold">⚠️ Issue still detected!</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-700">
                                            <span>✓</span>
                                            <span className="text-sm font-bold">No issues detected. Clear.</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 rounded-sm">
                                <span className="text-2xl mb-2">⏳</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Awaiting Department Upload</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Verdict Box */}
                {work_image_path && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-sm border-l-8 text-center ${getStatusColor()}`}
                    >
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">AI Verification Status</h4>
                        <div className="flex justify-center items-center gap-3 text-3xl font-serif font-bold mb-2">
                            <span>{getStatusIcon()}</span>
                            <span>{verification_status || 'Pending'}</span>
                        </div>
                        <p className="text-sm opacity-90 max-w-2xl mx-auto">
                            {verification_status === 'Verified'
                                ? "The AI system compared the before and after images. The issue detected earlier was not found in the updated image, indicating successful resolution."
                                : "The AI system still detects potential issues in the submitted image. This resolution may require further manual review."}
                        </p>
                    </motion.div>
                )}

                {/* Metadata & Disclaimer */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider">
                    <p>AI Model: YOLOv8 • Civic Issue Detection</p>
                    <p className="normal-case text-center md:text-right mt-2 md:mt-0">
                        * AI-based verification is performed to enhance transparency and accountability. <br />
                        Final administrative decisions remain subject to authority review.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIVerificationPanel;
