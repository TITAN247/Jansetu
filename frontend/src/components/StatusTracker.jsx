import React from 'react';
import { motion } from 'framer-motion';

const StatusTracker = ({ status }) => {
    const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified'];
    const currentStepIndex = steps.indexOf(status);

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-1000 ease-out"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step} className="flex flex-col items-center relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                            >
                                {isCompleted ? '✓' : index + 1}
                            </motion.div>
                            <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTracker;
