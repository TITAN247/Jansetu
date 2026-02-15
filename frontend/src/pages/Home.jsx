import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { submitComplaint } from '../services/api';

const Home = () => {
    // Quick Complaint State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, loading, success, error
    const [complaintId, setComplaintId] = useState(null);
    const [declaration, setDeclaration] = useState(false);

    // Location State
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    // Voice Input Handler
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setDescription((prev) => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert("Browser does not support speech recognition.");
        }
    };

    // Geolocation Handler
    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('success');
            },
            () => {
                setLocationStatus('error');
                alert("Unable to retrieve your location. Please allow access.");
            }
        );
    };

    // Image Upload Handler
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('loading');

        const formData = new FormData();
        const userStr = localStorage.getItem('user');
        const userId = userStr ? JSON.parse(userStr).id : 'Anonymous';
        formData.append('user_id', userId);
        formData.append('description', description);
        formData.append('image', image);
        if (location) {
            formData.append('lat', location.lat);
            formData.append('lng', location.lng);
        }

        if (location) {
            formData.append('lat', location.lat);
            formData.append('lng', location.lng);
        } else {
            // Optional: Force location? User said "add the detect location thing". 
            // Ideally we should alert if missing, but let's make it consistent with RegisterComplaint logic.
            // But RegisterComplaint logic enforced it. Let's strictly enforce it or just append if exists.
            // Given "add the detect location thing", I'll enforce it via UI validation or just letting it trigger.
            // Let's enforce it in the button disabled state or here.
        }

        if (!location) {
            alert("Please detect your location.");
            setSubmissionStatus('idle');
            return;
        }

        try {
            const response = await submitComplaint(formData);
            setSubmissionStatus('success');
            setComplaintId(response.complaint_id);
            // Reset form
            setDescription('');
            setImage(null);
            setImagePreview(null);
            setDeclaration(false);
        } catch (error) {
            console.error(error);
            setSubmissionStatus('error');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">

            {/* --- SECTION 3: HERO (GOVERNMENT STYLE) --- */}
            <section className="relative bg-[#001f3f] text-white min-h-[550px] flex items-center overflow-hidden border-b-8 border-yellow-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#001730] skew-x-12 transform translate-x-20 hidden md:block"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between">
                    {/* Left Content */}
                    <div className="max-w-3xl text-center md:text-left pt-12 md:pt-0">
                        <div className="inline-block px-4 py-1.5 bg-yellow-500 text-blue-900 text-xs font-bold mb-6 uppercase tracking-widest rounded-sm shadow-sm">
                            Official Grievance Redressal Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide mb-6 leading-tight drop-shadow-md">
                            Transparent Governance <br /> for a <span className="text-yellow-400">Better Tomorrow</span>
                        </h1>
                        <p className="text-lg text-blue-100 font-light mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed tracking-wide">
                            A unified digital platform connecting citizens with municipal authorities for rapid grievance resolution and real-time tracking.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                            <Link to="/register-complaint" className="px-8 py-4 bg-yellow-500 text-blue-900 font-bold uppercase tracking-wider rounded-sm shadow-md hover:bg-yellow-400 transition hover:shadow-lg border-2 border-yellow-500">
                                File a Grievance
                            </Link>
                            <Link to="/track" className="px-8 py-4 border-2 border-white bg-transparent text-white font-bold uppercase tracking-wider rounded-sm hover:bg-white hover:text-blue-900 transition shadow-md">
                                Track Status
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-4 text-blue-200 text-xs uppercase tracking-widest font-semibold justify-center md:justify-start opacity-80">
                            <span>Secure</span> • <span>Encrypted</span> • <span>AI-Powered</span>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="hidden md:block w-1/2 relative h-[600px]">
                        <motion.img
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            src="/indian_citizen_flag_v2.png"
                            alt="Proud Indian Citizen"
                            className="absolute bottom-0 right-0 h-[650px] object-contain drop-shadow-2xl z-20"
                        />
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: PUBLIC NOTICE STRIP --- */}
            <div className="bg-orange-50 border-b border-orange-200 py-3 overflow-hidden shadow-inner">
                <div className="max-w-7xl mx-auto px-4 flex items-center">
                    <span className="bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded-sm mr-4 uppercase tracking-wider blink">Public Notice</span>
                    <div className="flex-1 overflow-hidden relative h-6">
                        <div className="absolute w-full animate-marquee whitespace-nowrap text-sm text-gray-800 font-semibold font-serif">
                            📢 High-priority complaints are resolved within 48 hours.  •  All complaints are AI-verified for transparency.  •  Citizens can track complaints using Complaint ID.  •  Monsoon preparedness drive initiated.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 5: QUICK COMPLAINT REGISTRATION --- */}
            <section id="quick-complaint" className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-blue-900 mb-2">Lodge Your Grievance</h2>
                        <div className="h-1 w-24 bg-orange-500 mx-auto mt-2 mb-4"></div>
                        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Fill the form below for immediate action</p>
                    </div>

                    <div className="bg-white rounded shadow border-t-4 border-blue-900 overflow-hidden">
                        <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                <span className="text-blue-900 text-xl">✍️</span> New Complaint Form
                            </h3>
                            <span className="text-xs text-gray-500 font-mono">ID: REF-{Math.floor(Math.random() * 10000)}</span>
                        </div>

                        <div className="p-10">
                            {submissionStatus === 'success' ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                                    <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border-4 border-green-50">✓</div>
                                    <h3 className="text-2xl font-serif font-bold text-green-900 mb-2">Grievance Submitted</h3>
                                    <p className="text-gray-600 mb-8">Your unique reference ID is <strong className="text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 font-mono tracking-wider">{complaintId}</strong></p>
                                    <button onClick={() => setSubmissionStatus('idle')} className="text-blue-800 underline font-bold uppercase text-sm tracking-wide hover:text-blue-600">File Another Grievance</button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                            Description of Issue <span className="text-red-700">*</span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                className="w-full p-4 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition h-40 text-sm bg-gray-50/50 resize-y"
                                                placeholder="Provide detailed information about the grievance..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                maxLength={500}
                                                required
                                            ></textarea>
                                            <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
                                                {description.length}/500
                                            </div>
                                            <button
                                                type="button"
                                                onClick={startListening}
                                                className={`absolute bottom-4 right-16 px-3 py-1.5 rounded-sm border transition text-xs flex items-center gap-2 font-bold uppercase ${isListening ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                                                title="Speak to type"
                                            >
                                                🎤 {isListening ? 'Listening...' : 'Dictate'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-sm">
                                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Supporting Evidence</label>
                                        <div className="flex flex-col sm:flex-row items-start gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer px-6 py-3 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 shadow-sm transition">
                                                <span className="text-lg">📷</span>
                                                <span className="text-sm font-bold text-gray-700 uppercase">Upload Photo</span>
                                                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
                                            </label>
                                            {image && (
                                                <div className="flex items-center gap-3 bg-white px-4 py-2 border border-gray-200 rounded-sm">
                                                    <span className="text-green-600 text-lg">✓</span>
                                                    <span className="text-sm text-gray-700 font-medium">{image.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        {imagePreview && (
                                            <div className="mt-4 w-48 h-32 border-4 border-white shadow-sm rounded-sm">
                                                <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-3 italic">Allowed formats: JPG, PNG. Max file size: 5MB.</p>
                                    </div>

                                    {/* Location */}
                                    <div className="p-6 bg-green-50/50 border border-green-100 rounded-sm">
                                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                            Incident Location <span className="text-red-700">*</span>
                                        </label>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                {location ? (
                                                    <span className="font-mono text-green-700 font-bold">
                                                        ✅ Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                                    </span>
                                                ) : (
                                                    "Location is required for accurate resolution."
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                disabled={locationStatus === 'loading'}
                                                className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition ${location ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                            >
                                                {locationStatus === 'loading' ? 'Detecting...' : location ? 'Update Location' : '📍 Detect Location'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Declaration */}
                                    <div className="bg-yellow-50 p-5 rounded-sm border-l-4 border-yellow-400">
                                        <label className="flex items-start gap-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-5 h-5 text-blue-900 rounded-sm border-gray-300 focus:ring-blue-900"
                                                checked={declaration}
                                                onChange={(e) => setDeclaration(e.target.checked)}
                                                required
                                            />
                                            <span className="text-sm text-gray-800 leading-relaxed font-medium">
                                                I hereby declare that the information provided is true to the best of my knowledge. I understand that submitting false reports is punishable under the Municipal Act.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={!declaration || submissionStatus === 'loading' || !description}
                                        className="w-full py-4 bg-blue-900 text-white font-bold uppercase tracking-widest rounded-sm shadow hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                                    >
                                        {submissionStatus === 'loading' ? 'Processing Submission...' : 'Lodge Grievance'}
                                    </button>

                                    {submissionStatus === 'error' && (
                                        <div className="bg-red-50 text-red-700 p-4 border border-red-200 text-center font-bold text-sm">
                                            ⚠️ System Error. Please try again later.
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 6: ABOUT JANSETU (OFFICIAL STYLE) --- */}
            <section id="about" className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        {/* Image Side - Layered Composition */}
                        <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[500px] flex items-center justify-center">
                            {/* Decorative Background Element */}
                            <div className="absolute top-10 left-10 w-4/5 h-4/5 bg-gradient-to-br from-orange-100 to-transparent rounded-2xl -z-10 border border-orange-200"></div>

                            {/* Main Hero Image */}
                            <img
                                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // India Gate / Iconic
                                alt="Pride of Governance"
                                className="w-4/5 h-auto rounded-lg shadow-2xl border-4 border-white relative z-10 object-cover"
                            />



                            {/* Floating Stat Badge */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-0 right-0 md:-right-6 bg-white p-4 rounded-lg shadow-xl border-l-4 border-orange-500 z-30 flex flex-col items-center"
                            >
                                <span className="text-4xl font-black text-[#001f3f]">98%</span>
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Grievance Resolution</span>
                            </motion.div>
                        </div>

                        {/* Text Side */}
                        <div className="w-full md:w-1/2">
                            <h4 className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-2">About The Initiative</h4>
                            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                                Bridging the Gap Between <br /> <span className="text-blue-900">Citizens & Administration</span>
                            </h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed font-light">
                                <span className="font-bold text-gray-800">Jansetu_AI</span> is the official digital interface for citizen grievance redressal. It leverages cutting-edge Artificial Intelligence to ensure transparency, accountability, and speed in municipal operations.
                            </p>

                            <ul className="space-y-4 text-gray-700">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    <span>Zero tolerance for delays in grievance verification.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    <span>Real-time status tracking for every ticket.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    <span>3-Tier automated escalation matrix.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: HOW IT WORKS (Timeline Style) --- */}
            <section id="how-it-works" className="py-20 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold text-blue-900 mb-16">Grievance Redressal Process</h2>

                    <div className="flex flex-col md:flex-row justify-between relative px-4">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

                        {[
                            { step: '1', title: 'Register', desc: 'File complaint via App/Web' },
                            { step: '2', title: 'AI Analysis', desc: 'Automated Routing' },
                            { step: '3', title: 'Verification', desc: 'On-site Inspection' },
                            { step: '4', title: 'Resolution', desc: 'Issue Resolved' },
                            { step: '5', title: 'Closure', desc: 'Citizen Feedback' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-4 relative w-full md:w-1/5 my-4 md:my-0">
                                <div className="w-12 h-12 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4 shadow-lg border-4 border-white relative z-10">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 uppercase text-sm tracking-wide">{item.title}</h3>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECTION 8: KEY FEATURES (Grid) --- */}
            <section id="services" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">Key Digital Services</h2>
                        <div className="h-0.5 w-16 bg-gray-400 mx-auto mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'AI-Based Classification', desc: 'Deep learning models capable of identifying 50+ types of civic issues from uploaded images.' },
                            { title: 'Smart Prioritization', desc: 'Critical infrastructure issues are automatically flagged for emergency response teams.' },
                            { title: 'Transparency Audit', desc: 'Every action taken by department officials is logged on an immutable ledger for audit.' }
                        ].map((feat, i) => (
                            <div key={i} className="bg-white p-8 border-t-4 border-blue-900 shadow-sm hover:shadow-md transition group">
                                <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-900 transition">{feat.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed text-justify">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECTION 11: OFFICIAL FOOTER --- */}
            <footer className="bg-[#1a1a1a] text-gray-400 py-16 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-10 invert opacity-80" alt="Emblem" />
                        </div>
                        <p className="text-xs leading-relaxed text-gray-500 mb-6">
                            Content on this website is published and managed by the Municipal Corporation.
                            <br /><br />
                            For any query regarding this website, please contact the Web Information Manager.
                        </p>
                    </div>

                    <div className="col-span-1 md:col-span-1">
                        <h4 className="text-white font-bold uppercase mb-6 tracking-widest text-xs border-b border-gray-700 pb-2 inline-block">Information</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-blue-400 transition">RTI Act</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Citizen Charter</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Tenders & Notices</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Circulars</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-1">
                        <h4 className="text-white font-bold uppercase mb-6 tracking-widest text-xs border-b border-gray-700 pb-2 inline-block">Important Links</h4>
                        <ul className="space-y-3">
                            <li><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">National Portal of India</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Digital India</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">MyGov</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-1">
                        <h4 className="text-white font-bold uppercase mb-6 tracking-widest text-xs border-b border-gray-700 pb-2 inline-block">Contact</h4>
                        <p className="text-xs mb-2"><strong>Municipal Corporation Head Office</strong></p>
                        <p className="text-xs mb-4">Sector 12, Civil lines, New City - 110001</p>
                        <p className="text-xs">Helpline: <strong className="text-white">1800-11-2345</strong></p>
                        <p className="text-xs">Email: <span className="text-blue-400">helpdesk@jansetu.gov.in</span></p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600">
                    <p>&copy; 2026 Municipal Corporation. All Rights Reserved. | Designed & Developed by JanSetu Team.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 font-bold uppercase tracking-wide">
                        <a href="#" className="hover:text-white">Website Policy</a>
                        <a href="#" className="hover:text-white">Help</a>
                        <a href="#" className="hover:text-white">Feedback</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
