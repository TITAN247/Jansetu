import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';

const RegisterComplaint = () => {
    const navigate = useNavigate();

    // Check if user is logged in
    let loggedInUser = null;
    try {
        const u = localStorage.getItem('user');
        if (u) loggedInUser = JSON.parse(u);
    } catch { }

    // Enforce citizen-only access: If logged in as non-citizen, block access
    useEffect(() => {
        if (loggedInUser && loggedInUser.role && loggedInUser.role !== 'citizen') {
            // Non-citizen trying to access complaint registration
            const roleName = loggedInUser.role === 'worker' ? 'Worker' :
                loggedInUser.role === 'dept_officer' ? 'Department Officer' :
                    loggedInUser.role === 'admin' ? 'Administrator' :
                        loggedInUser.role === 'governance' ? 'Governance Official' : 'Official';
            alert(`Only citizens can register complaints. You are logged in as a ${roleName}.`);
            navigate('/');
        }
    }, [loggedInUser, navigate]);

    // Form State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [declaration, setDeclaration] = useState(false);
    const [email, setEmail] = useState(loggedInUser?.email || '');

    // Location State
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    // Submission State
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [complaintId, setComplaintId] = useState(null);
    const [refId, setRefId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);
    // Duplicate detection state
    const [duplicateInfo, setDuplicateInfo] = useState(null); // { message, existing_ref_id, existing_status, is_resolved }

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
        if (!navigator.geolocation) { alert("Geolocation is not supported."); return; }
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationStatus('success');
            },
            () => { setLocationStatus('error'); alert("Unable to retrieve location."); }
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

    const handleCopy = () => {
        const textToCopy = refId || complaintId;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) { setErrorMsg("Please provide a description."); return; }
        if (!image) { setErrorMsg("Image evidence is mandatory."); return; }
        if (!location) { setErrorMsg("Location is mandatory."); return; }
        if (!declaration) { setErrorMsg("Please accept the declaration."); return; }
        // Validate email format if provided
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrorMsg("Please enter a valid email address."); return;
        }

        setSubmissionStatus('loading');
        setErrorMsg('');

        // Final check: Block non-citizens from submitting
        if (loggedInUser && loggedInUser.role && loggedInUser.role !== 'citizen') {
            setErrorMsg("Only citizens can register complaints. Please log in as a citizen to submit a complaint.");
            return;
        }

        const formData = new FormData();
        formData.append('user_id', loggedInUser?.id || 'Anonymous');
        formData.append('description', description);
        formData.append('image', image);
        if (email.trim()) formData.append('email', email.trim());
        if (location) { formData.append('lat', location.lat); formData.append('lng', location.lng); }

        try {
            const response = await submitComplaint(formData);
            setSubmissionStatus('success');
            setComplaintId(response.complaint_id);
            setRefId(response.ref_id);
            window.scrollTo(0, 0);
        } catch (err) {
            // 409 = duplicate complaint detected
            if (err.response?.status === 409 && err.response?.data?.duplicate) {
                const d = err.response.data;
                setDuplicateInfo({
                    message: d.message,
                    existing_ref_id: d.existing_ref_id,
                    existing_status: d.existing_status,
                    is_resolved: d.is_resolved,
                });
                setSubmissionStatus('duplicate');
                window.scrollTo(0, 0);
            } else {
                setSubmissionStatus('error');
                const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again.';
                setErrorMsg(errorMessage);
            }
        }
    };

    /* ─── Duplicate Screen ─── */
    if (submissionStatus === 'duplicate' && duplicateInfo) {
        const isResolved = duplicateInfo.is_resolved;
        return (
            <div className="page-bg" style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card-js"
                    style={{ maxWidth: 540, width: '100%', padding: 40, textAlign: 'center' }}
                >
                    {/* Icon */}
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: isResolved ? '#e6f4ea' : '#EAF2FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px', fontSize: 40
                    }}>
                        {isResolved ? '✅' : '📋'}
                    </div>

                    <h2 style={{ fontSize: 26, marginBottom: 10 }}>
                        {isResolved ? 'Already Resolved!' : 'Already Registered!'}
                    </h2>

                    {/* Friendly message */}
                    <p style={{
                        fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
                        marginBottom: 28, maxWidth: 420, margin: '0 auto 28px'
                    }}>
                        {duplicateInfo.message}
                    </p>

                    {/* Existing complaint card */}
                    <div style={{
                        padding: '20px 24px', background: 'var(--bg-secondary)',
                        borderRadius: 16, marginBottom: 28,
                        border: `1px solid ${isResolved ? 'rgba(46,204,113,0.2)' : 'rgba(43,107,255,0.15)'}`
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Existing Complaint
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginBottom: 10, wordBreak: 'break-all' }}>
                            {duplicateInfo.existing_ref_id}
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20,
                            background: isResolved ? '#e6f4ea' : '#EAF2FF',
                            color: isResolved ? '#2ecc71' : 'var(--accent)'
                        }}>
                            {duplicateInfo.existing_status}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/track" className="btn-primary">Track Existing Complaint</Link>
                        <button
                            onClick={() => { setSubmissionStatus('idle'); setDuplicateInfo(null); }}
                            className="btn-secondary"
                        >
                            Submit Different Issue
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Success Screen ─── */
    if (submissionStatus === 'success') {
        const displayId = refId || complaintId;
        // Adaptive font size based on ID length
        const idFontSize = displayId.length > 20 ? 18 : displayId.length > 14 ? 22 : 28;

        return (
            <div className="page-bg" style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card-js"
                    style={{ maxWidth: 520, width: '100%', padding: 40, textAlign: 'center' }}
                >
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px', fontSize: 40
                    }}>✅</div>
                    <h2 style={{ fontSize: 28, marginBottom: 8 }}>Submitted Successfully</h2>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
                        Your complaint has been registered and will be routed to the relevant department.
                        {email && (
                            <span style={{ display: 'block', marginTop: 8, fontWeight: 600, color: 'var(--accent)' }}>
                                📧 Confirmation sent to {email}
                            </span>
                        )}
                    </p>

                    {/* Complaint ID with Copy Button */}
                    <div style={{
                        padding: '20px 24px', background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 32,
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em' }}>
                            COMPLAINT ID
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                        }}>
                            <div style={{
                                fontSize: idFontSize, fontWeight: 700, color: 'var(--accent)',
                                fontFamily: 'var(--font-heading)', letterSpacing: '0.03em',
                                wordBreak: 'break-all', lineHeight: 1.3
                            }}>{displayId}</div>
                            <button
                                onClick={handleCopy}
                                title="Copy to clipboard"
                                style={{
                                    background: copied ? 'var(--color-success)' : 'white',
                                    border: `1.5px solid ${copied ? 'var(--color-success)' : 'var(--border-light)'}`,
                                    borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease', flexShrink: 0
                                }}
                            >
                                {copied ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {copied && (
                            <div style={{
                                fontSize: 12, color: 'var(--color-success)', fontWeight: 600, marginTop: 8
                            }}>Copied to clipboard!</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/track" className="btn-primary">Track Status</Link>
                        <Link to="/" className="btn-secondary">Back Home</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Form Screen ─── */
    const isGuest = !loggedInUser;

    return (
        <div className="page-bg" style={{
            minHeight: '100vh', padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            <div className="blob" style={{ width: 400, height: 400, background: 'var(--bg-secondary)', top: '-10%', right: '-5%' }} />

            <div className="container-js" style={{ maxWidth: 640, paddingTop: 40 }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <Link to="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        textDecoration: 'none', fontSize: 14, fontWeight: 500,
                        color: 'var(--text-secondary)', marginBottom: 24
                    }}>
                        ← Back to Home
                    </Link>
                    <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 8 }}>
                        Report a Civic Issue
                    </h1>
                    <p style={{ maxWidth: 480 }}>
                        Describe the problem, upload evidence, and we'll route it to the right department using AI.
                    </p>
                    {isGuest && (
                        <div style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 12,
                            background: '#EAF2FF', border: '1px solid rgba(43,107,255,0.15)',
                            fontSize: 13, color: 'var(--accent)', fontWeight: 500
                        }}>
                            💡 You're submitting as a guest. Save your complaint ID from the success screen to track later. Optionally provide email for notifications.
                            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 4 }}>
                                Login for full tracking →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Steps indicator */}
                <div style={{
                    display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap'
                }}>
                    {[
                        { n: '1', label: 'Describe', done: description.length > 0 },
                        { n: '2', label: 'Photo', done: !!image },
                        { n: '3', label: 'Location', done: !!location },
                        { n: '4', label: isGuest ? 'Email' : 'Submit', done: isGuest ? !!email.trim() : false },
                    ].map((step, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700,
                                background: step.done ? 'var(--color-success)' : 'var(--bg-secondary)',
                                color: step.done ? 'white' : 'var(--text-secondary)'
                            }}>
                                {step.done ? '✓' : step.n}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: step.done ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                                {step.label}
                            </span>
                            {i < 3 && <span style={{ color: 'var(--border-light)', margin: '0 4px' }}>—</span>}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="card-js" style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit}>

                        {/* 1. Description */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Issue Description <span style={{ color: 'var(--color-danger)' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue in detail... You can also use voice input →"
                                    className="input-js"
                                    maxLength={500}
                                    style={{ minHeight: 140, paddingRight: 50 }}
                                />
                                <button
                                    type="button"
                                    onMouseDown={startListening}
                                    style={{
                                        position: 'absolute', top: 12, right: 12,
                                        width: 36, height: 36, borderRadius: '50%',
                                        border: 'none', cursor: 'pointer', fontSize: 16,
                                        transition: 'all 0.2s',
                                        background: isListening ? 'var(--color-danger)' : 'var(--bg-secondary)',
                                        color: isListening ? 'white' : 'var(--text-secondary)',
                                        boxShadow: isListening ? '0 0 0 4px rgba(234,67,53,0.2)' : 'none'
                                    }}
                                >🎤</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                {isListening && (
                                    <span style={{ fontSize: 12, color: 'var(--color-danger)', fontWeight: 600 }}>
                                        🔴 Listening...
                                    </span>
                                )}
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                    {description.length}/500
                                </span>
                            </div>
                        </div>

                        {/* 2. Image Upload */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Photo Evidence <span style={{ color: 'var(--color-danger)' }}>*</span>
                            </label>
                            <input type="file" accept="image/*" onChange={handleImageChange} id="complaint-image" style={{ display: 'none' }} />
                            <label htmlFor="complaint-image" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                width: '100%', height: imagePreview ? 220 : 160,
                                border: `2px dashed ${imagePreview ? 'var(--color-success)' : 'rgba(14,26,51,0.12)'}`,
                                borderRadius: 16, cursor: 'pointer',
                                background: imagePreview ? '#f0fdf4' : 'var(--bg-primary)',
                                transition: 'all 0.2s', overflow: 'hidden'
                            }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{
                                        width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14
                                    }} />
                                ) : (
                                    <>
                                        <div className="icon-container" style={{ marginBottom: 12, fontSize: 24 }}>📷</div>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload photo</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>JPG, PNG supported</span>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* 3. Location */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Location <span style={{ color: 'var(--color-danger)' }}>*</span>
                            </label>
                            <div style={{
                                padding: '16px 20px', borderRadius: 16,
                                background: location ? '#f0fdf4' : 'var(--bg-secondary)',
                                border: `1px solid ${location ? 'var(--color-success)' : 'transparent'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                gap: 12, flexWrap: 'wrap'
                            }}>
                                <div style={{ fontSize: 14 }}>
                                    {location ? (
                                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                            ✅ {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>Auto-detect your GPS location</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={locationStatus === 'loading'}
                                    className={location ? 'pill-js pill-js--success' : 'btn-primary'}
                                    style={location ? { fontSize: 12, height: 32, padding: '0 14px' } : { padding: '8px 20px', fontSize: 12 }}
                                >
                                    {locationStatus === 'loading' ? 'Detecting...' : location ? 'Update' : '📍 Detect Location'}
                                </button>
                            </div>
                            {locationStatus === 'error' && (
                                <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 8, fontWeight: 600 }}>
                                    ⚠️ Location access denied or unavailable.
                                </p>
                            )}
                        </div>

                        {/* 4. Email (Required for guests, optional for logged-in users) */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Email for Notifications <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)' }}></span>
                            </label>
                            <div style={{
                                padding: '4px', borderRadius: 16,
                                background: 'var(--bg-secondary)',
                                border: `1px solid ${email.trim() ? 'var(--accent)' : 'transparent'}`,
                            }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com — to receive complaint ID & updates"
                                    className="input-js"
                                    style={{
                                        background: 'transparent', border: 'none',
                                        padding: '12px 16px', width: '100%', boxSizing: 'border-box'
                                    }}
                                    readOnly={!!loggedInUser?.email}
                                />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                                {isGuest
                                    ? '📧 Optional: Get your complaint ID & status updates via email. Use the same email to register later and see full history.'
                                    : '📧 Status updates will be sent to your registered email.'}
                            </p>
                        </div>

                        {/* 5. Declaration */}
                        <div style={{
                            padding: '16px 20px', borderRadius: 16,
                            background: '#fffbeb', borderLeft: '3px solid var(--color-warning)',
                            marginBottom: 24
                        }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={declaration}
                                    onChange={(e) => setDeclaration(e.target.checked)}
                                    style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    I declare that the information provided is accurate. Submitting false complaints is a punishable offense.
                                </span>
                            </label>
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500, marginBottom: 20
                            }}>
                                ⚠️ {errorMsg}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submissionStatus === 'loading'}
                            style={{ width: '100%', opacity: submissionStatus === 'loading' ? 0.7 : 1 }}
                        >
                            {submissionStatus === 'loading' ? 'Processing...' : 'Submit Complaint'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
                            🔒 Secure & Encrypted Transmission
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterComplaint;
