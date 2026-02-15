import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Services = () => {
    const services = [
        {
            title: "AI-Powered Grievance Redressal",
            icon: "🤖",
            desc: "Advanced Natural Language Processing (NLP) automatically categorizes and prioritizes your complaints. Submit via text, voice, or image.",
            features: ["Multi-lingual Support", "Voice-to-Text Integration", "Smart Categorization"]
        },
        {
            title: "Real-Time Status Tracking",
            icon: "📍",
            desc: "Complete transparency in the governance process. Track your complaint from registration to resolution with live status updates.",
            features: ["SMS/Email Workflows", "Visual Timeline", "Estimated Resolution Time"]
        },
        {
            title: "Automated Department Routing",
            icon: "⚡",
            desc: "Zero manual intervention required. Our AI engine instantly routes your grievance to the exact municipal department responsible.",
            features: ["Roads & Infrastructure", "Sanitation & Waste", "Water Supply", "Public Safety"]
        },
        {
            title: "Smart Verification System",
            icon: "🔍",
            desc: "Every resolved complaint is verified using AI image analysis to ensure the work claimed is actually done.",
            features: ["Before/After Comparison", "Geo-tagging Verification", "Anti-Fraud Detection"]
        },
        {
            title: "Citizen Feedback Loop",
            icon: "⭐",
            desc: "Your voice matters. Rate the quality of service after every resolution to help us improve municipal performance.",
            features: ["5-Star Rating System", "Performance Scorecards", "Direct Escalation"]
        },
        {
            title: "Open Data Analytics",
            icon: "📊",
            desc: "Publicly accessible dashboards showcasing city-wide performance, resolution rates, and efficiency metrics.",
            features: ["City Health Index", "Department Leaderboards", "Transparency Reports"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header / Hero */}
            <div className="bg-[#001f3f] text-white py-16 relative overflow-hidden border-b-8 border-yellow-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block px-3 py-1 border border-yellow-500 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4 rounded-sm">
                        Citizen Charter
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Services</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Comprehensive digital solutions bridging the gap between citizens and administration through technology, transparency, and trust.
                    </p>
                </div>
            </div>

            {/* Service Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-sm shadow-sm hover:shadow-lg border-t-4 border-blue-900 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300 shadow-inner">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {service.desc}
                            </p>
                            <ul className="space-y-2 border-t border-gray-100 pt-4">
                                {service.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold text-[#001f3f] mb-4">Ready to File a Complaint?</h2>
                    <p className="text-gray-600 mb-8">Access these services instantly via the JanSetu portal. No queues, no paperwork.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/login" className="px-8 py-3 bg-blue-900 text-white font-bold uppercase tracking-widest rounded-sm shadow-lg hover:bg-blue-800 transition active:scale-[0.98]">
                            Login to Portal
                        </Link>
                        <Link to="/" className="px-8 py-3 border border-gray-300 text-gray-700 font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50 transition active:scale-[0.98]">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
