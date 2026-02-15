import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header / Hero */}
            <div className="bg-[#001f3f] text-white py-20 relative overflow-hidden border-b-8 border-yellow-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block px-3 py-1 border border-yellow-500 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4 rounded-sm">
                        Official Initiative
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About JanSetu_AI</h1>
                    <p className="text-blue-100 max-w-3xl mx-auto text-lg font-light leading-relaxed">
                        A transformational governance platform initiated by the Ministry of Urban Affairs to bridge the gap between citizens and administration through transparency and Artificial Intelligence.
                    </p>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="prose prose-lg text-gray-700"
                    >
                        <h2 className="text-3xl font-serif font-bold text-[#001f3f] mb-6">Our Vision</h2>
                        <p className="text-justify leading-relaxed mb-6">
                            To create a responsive, transparent, and accountable municipal governance ecosystem where every citizen's voice is heard, and every grievance is addressed with speed and precision. We envision a future where technology acts as the great equalizer, ensuring that the last person in the queue receives the same quality of service as the first.
                        </p>
                        <h2 className="text-3xl font-serif font-bold text-[#001f3f] mb-6">The Mission</h2>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex items-start gap-3">
                                <span className="text-green-600 mt-1">✔</span>
                                <span><strong>Zero Tolerance</strong> for negligence in public service delivery.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-600 mt-1">✔</span>
                                <span><strong>100% Digital Literacy</strong> in grievance redressal for all citizens.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-600 mt-1">✔</span>
                                <span><strong>Data-Driven Policy Making</strong> using real-time complaint analytics.</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative h-[600px] w-full flex items-center justify-center perspective-1000"
                    >
                        {/* Abstract Background Elements */}
                        <div className="absolute top-10 right-10 w-48 h-48 bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>

                        {/* Image 1: Modern Infrastructure (Back Layer - Enhanced) */}
                        <div className="absolute top-0 right-4 w-3/5 h-80 shadow-2xl rounded-sm border-4 border-white transform rotate-3 z-10 transition hover:rotate-0 duration-500 hover:z-40 overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-900/20 z-10 group-hover:bg-transparent transition"></div>
                            {/* Tech Grid Overlay */}
                            <div className="absolute inset-0 z-20 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

                            <img
                                src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" // Smart City / Metro
                                alt="Modern Infrastructure"
                                className="w-full h-full object-cover"
                            />

                            {/* Floating Tech Label */}
                            <div className="absolute top-4 right-4 z-30 bg-black/70 backdrop-blur-sm px-3 py-1 border border-blue-400 rounded-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-blue-100 uppercase tracking-wider">Smart City Grid</span>
                                </div>
                            </div>
                        </div>

                        {/* Image 2: Digital/People (Front Layer) */}
                        <div className="absolute bottom-0 left-4 w-3/5 h-80 shadow-2xl rounded-sm border-4 border-white transform -rotate-3 z-20 transition hover:rotate-0 duration-500 hover:z-40">
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                alt="Citizen Empowerment"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500"
                            />
                        </div>

                        {/* The elaborated Quote Card (Floating Center) */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-8 shadow-2xl z-30 w-80 md:w-96 text-center border-t-8 border-blue-900 rounded-sm hover:scale-105 transition duration-300">
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                                🏛️
                            </div>
                            <div className="mt-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center justify-center gap-2">
                                    <span className="w-4 h-px bg-gray-300"></span> Official Vision <span className="w-4 h-px bg-gray-300"></span>
                                </h4>
                                <p className="font-serif italic text-2xl text-[#001f3f] leading-snug mb-6 relative px-4">
                                    <span className="text-4xl text-gray-200 absolute -top-4 left-0">“</span>
                                    Technology is not just an enabler, it is the <span className="text-orange-600 font-bold border-b-2 border-orange-200">bridge</span> to a new India.
                                    <span className="text-4xl text-gray-200 absolute -bottom-8 right-0">”</span>
                                </p>
                                <div className="flex flex-col items-center gap-1 mt-6 pt-4 border-t border-gray-100">
                                    <span className="text-blue-900 font-bold text-xs uppercase tracking-widest">Ministry of Urban Affairs</span>
                                    <span className="text-[9px] text-gray-400 uppercase tracking-widest">Govt. of India</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-[#001f3f] text-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-serif font-bold text-center mb-16 text-white">Core Values of Governance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Transparency", desc: "Open access to data and status for every stakeholder." },
                            { title: "Accountability", desc: "Every officer is answerable for the tasks assigned." },
                            { title: "Inclusivity", desc: "Designed for every citizen, regardless of digital expertise." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition">
                                <h3 className="text-xl font-bold text-yellow-500 mb-4 font-serif">{item.title}</h3>
                                <p className="text-blue-100 leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leadership / Authority */}
            <div className="max-w-7xl mx-auto px-4 py-20 bg-white">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif font-bold text-[#001f3f]">Our Commitment</h2>
                    <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-8 md:p-12 rounded-sm text-center relative max-w-4xl mx-auto">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-900 text-white flex items-center justify-center rounded-full shadow-lg text-2xl">
                        ❄
                    </div>
                    <p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed mb-6">
                        "Jansetu_AI is not just a portal, it is a promise. A promise that no grievance will go unheard and no resolution will be delayed. We are committed to building a city that cares for its people."
                    </p>
                    <p className="font-bold text-[#001f3f] uppercase tracking-widest text-sm">Commissioner of Municipal Corporation</p>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-gray-100 py-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Years of Service", value: "02+" },
                            { label: "Complaints Resolved", value: "1.2M+" },
                            { label: "Active Officers", value: "5,000+" },
                            { label: "Citizen Users", value: "500K+" }
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="text-4xl font-black text-blue-900 mb-2 font-serif">{stat.value}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="py-12 text-center bg-white border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Join us in building a better city.</h3>
                <Link to="/register" className="inline-block px-8 py-3 bg-green-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-green-700 transition shadow-md">
                    Become a Volunteer
                </Link>
            </div>
        </div>
    );
};

export default About;
