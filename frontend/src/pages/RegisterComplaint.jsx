import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';

const RegisterComplaint = () => {
    const navigate = useNavigate();

    // Form State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [declaration, setDeclaration] = useState(false);

    // Location State
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    // Submission State
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [complaintId, setComplaintId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // --- LOGIC: Voice Input ---
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

    // --- LOGIC: Geolocation ---
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!description.trim()) { setErrorMsg("Please provide a description."); return; }
        if (!image) { setErrorMsg("Image evidence is mandatory."); return; }
        if (!location) { setErrorMsg("Location is mandatory."); return; }
        if (!declaration) { setErrorMsg("Please accept the declaration."); return; }

        setSubmissionStatus('loading');
        setErrorMsg('');

        const formData = new FormData();
        let userId = 'Anonymous';
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) userId = JSON.parse(userStr).id;
        } catch (e) { }

        formData.append('user_id', userId);
        formData.append('description', description);
        formData.append('image', image);

        if (location) {
            formData.append('lat', location.lat);
            formData.append('lng', location.lng);
        }

        try {
            const response = await submitComplaint(formData);
            setSubmissionStatus('success');
            setComplaintId(response.complaint_id);
            window.scrollTo(0, 0);
        } catch (error) {
            setSubmissionStatus('error');
            setErrorMsg("Server error. Please try again.");
        }
    };

    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white max-w-lg w-full p-10 rounded-sm shadow-2xl text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-700"></div>
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-5xl">✅</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#001f3f] mb-2">Submission Successful</h2>
                    <p className="text-gray-500 mb-8">Your concern has been registered with the municipal authority.</p>

                    <div className="bg-gray-50 p-6 border border-gray-200 rounded-sm mb-8 relative group cursor-pointer hover:bg-white hover:shadow-md transition">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Official Complaint ID</p>
                        <p className="text-3xl font-mono font-bold text-blue-900 tracking-wider">{complaintId}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/track" className="px-6 py-4 bg-[#001f3f] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-blue-900 transition shadow-lg text-xs md:text-sm flex items-center justify-center">
                            Track Status
                        </Link>
                        <Link to="/" className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50 hover:text-[#001f3f] transition text-xs md:text-sm flex items-center justify-center">
                            Back Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">

            {/* --- LEFT PANEL: IDENTITY & INFO --- */}
            <div className="w-full md:w-[40%] bg-[#001f3f] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-12 filter brightness-0 invert" />
                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.2em] text-blue-200">Government of India</h2>
                            <h1 className="text-2xl font-serif font-bold leading-none">JanSetu</h1>
                        </div>
                    </Link>

                    <h3 className="text-4xl font-serif font-bold leading-tight mb-6">
                        Your Vigilance,<br /> <span className="text-yellow-500">Our Action.</span>
                    </h3>
                    <p className="text-blue-200 text-sm leading-relaxed max-w-sm mb-12">
                        This digital portal empowers every citizen to report civic issues directly to the concerned department with real-time tracking and AI-enabled verification.
                    </p>

                    {/* Steps */}
                    <div className="space-y-6">
                        {[
                            { step: '01', title: 'Describe Issue', desc: 'Provide clear details of the problem.' },
                            { step: '02', title: 'Upload Proof', desc: 'Attach a photo for AI verification.' },
                            { step: '03', title: 'Track Resolution', desc: 'Get updates on your dashboard.' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <span className="text-xl font-mono font-bold text-yellow-500 opacity-50 group-hover:opacity-100 transition">{item.step}</span>
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-wider mb-1">{item.title}</h4>
                                    <p className="text-xs text-blue-300">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-[10px] text-blue-400 uppercase tracking-widest mt-12 md:mt-0">
                    © 2024 Ministry of Urban Affairs
                </div>
            </div>

            {/* --- RIGHT PANEL: FORM --- */}
            <div className="w-full md:w-[60%] bg-white md:h-screen md:overflow-y-auto">
                <div className="max-w-2xl mx-auto p-8 md:p-16">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-3xl">✍️</span> File a Grievance
                        </h2>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Official Portal
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. DESCRIPTION */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-900 transition">
                                1. Issue Description <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue in detail..."
                                    className="w-full h-40 p-5 bg-gray-50 border-2 border-transparent rounded-sm focus:bg-white focus:border-blue-900 focus:shadow-lg outline-none resize-none transition-all text-gray-700 placeholder-gray-400"
                                    maxLength={500}
                                />
                                <button
                                    type="button"
                                    onMouseDown={startListening}
                                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-red-500/50 shadow-lg scale-110' : 'bg-white text-gray-400 hover:text-blue-900 shadow-sm'}`}
                                >
                                    🎤
                                </button>
                                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-400">
                                    {description.length} / 500
                                </div>
                            </div>
                        </div>

                        {/* 2. IMAGE UPLOAD */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-900 transition">
                                2. Photographic Evidence <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="complaint-image"
                                />
                                <label
                                    htmlFor="complaint-image"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm cursor-pointer transition-all duration-300 ${imagePreview ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'}`}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-full p-2 group-img">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-sm shadow-sm" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-img-hover:opacity-100 transition">
                                                <span className="text-white font-bold text-sm uppercase tracking-wider">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mb-3 text-xl">
                                                📷
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">Click to Upload Image</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Supports JPG, PNG</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* 3. LOCATION */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-900 transition">
                                3. Incident Location <span className="text-red-500">*</span>
                            </label>

                            <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 rounded-sm">
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
                                {locationStatus === 'error' && (
                                    <p className="text-xs text-red-500 mt-2 font-bold">⚠️ Location access denied or unavailable.</p>
                                )}
                            </div>
                        </div>

                        {/* 4. DECLARATION */}
                        <div className="bg-yellow-50/50 p-5 rounded-sm border-l-4 border-yellow-400">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={declaration}
                                        onChange={(e) => setDeclaration(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow transition-all checked:border-blue-900 checked:bg-blue-900 hover:shadow-md"
                                    />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                        ✔
                                    </span>
                                </div>
                                <span className="text-xs text-gray-600 leading-relaxed pt-0.5">
                                    I hereby declare that the information provided is accurate. I understand that submitting false complaints is a punishable offense.
                                </span>
                            </label>
                        </div>

                        {/* ERRORS */}
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-700 bg-red-50 px-4 py-3 rounded-sm text-sm font-bold flex items-center gap-2">
                                ⚠️ {errorMsg}
                            </motion.div>
                        )}

                        {/* ACTION */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submissionStatus === 'loading'}
                                className="w-full py-5 bg-[#001f3f] text-white font-bold uppercase tracking-[0.2em] rounded-sm shadow-xl hover:bg-blue-900 hover:shadow-2xl transition transform hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0"
                            >
                                {submissionStatus === 'loading' ? 'Processing...' : 'Submit Grievance'}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                                Secure Server • Encrypted Transmission
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterComplaint;
