import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

/* ──────────────────────────────
   HELPER: Counter Animation
   ────────────────────────────── */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const startTime = Date.now();
                const tick = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(eased * end));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                tick();
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ──────────────────────────────
   HELPER: Scroll Reveal
   ────────────────────────────── */
const Reveal = ({ children, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        }, { threshold: 0.15 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            ...style
        }}>
            {children}
        </div>
    );
};

/* ══════════════════════════════
   HOME PAGE
   ══════════════════════════════ */
const Home = () => {
    const [autoScrollPaused, setAutoScrollPaused] = useState(false);
    const storiesRef = useRef(null);

    // Auto-scroll for success stories
    useEffect(() => {
        const el = storiesRef.current;
        if (!el) return;
        let animId;
        const scroll = () => {
            if (!autoScrollPaused && el) {
                el.scrollLeft += 0.5;
                if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
            }
            animId = requestAnimationFrame(scroll);
        };
        animId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animId);
    }, [autoScrollPaused]);

    return (
        <div style={{ background: 'var(--bg-primary)' }}>

            {/* ═══════════════════════════
               SECTION 1: HERO
               ═══════════════════════════ */}
            <section className="section-pinned dot-grid" style={{
                background: 'var(--bg-primary)',
                position: 'relative'
            }}>
                {/* Soft blob */}
                <div className="blob" style={{
                    width: 500, height: 500, background: 'var(--bg-secondary)',
                    top: '-10%', right: '-5%'
                }} />
                <div className="blob" style={{
                    width: 300, height: 300, background: 'rgba(43,107,255,0.08)',
                    bottom: '10%', left: '5%'
                }} />

                <div className="container-js" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 60, flexWrap: 'wrap', minHeight: '100vh', paddingTop: 100, paddingBottom: 60
                }}>
                    {/* Left */}
                    <div style={{ flex: '1 1 500px', maxWidth: 640 }}>
                        <Reveal>
                            <div className="pill-js pill-js--accent" style={{ marginBottom: 24, fontSize: 13 }}>
                                ✦ Trusted by 24 Municipal Corporations
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h1 style={{ marginBottom: 24 }}>
                                Every complaint.<br />
                                <span style={{ color: 'var(--accent)' }}>Heard. Resolved. Verified.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p style={{ fontSize: 18, maxWidth: 480, marginBottom: 40, lineHeight: 1.7 }}>
                                An AI-powered civic platform that bridges citizens and governance for transparent, efficient, and accountable public service delivery.
                            </p>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Link to="/register-complaint" className="btn-primary">
                                    Submit a Complaint
                                </Link>
                                <Link to="/track" className="btn-secondary">
                                    Track Status
                                </Link>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right: Floating UI Mockup */}
                    <Reveal delay={0.2} style={{ flex: '1 1 360px', maxWidth: 440 }}>
                        <div className="animate-float" style={{ position: 'relative' }}>
                            {/* Phone mockup */}
                            <div className="card-js" style={{
                                padding: 24, borderRadius: 32,
                                background: 'white', maxWidth: 320, margin: '0 auto'
                            }}>
                                <div style={{
                                    background: 'var(--bg-secondary)', borderRadius: 20,
                                    padding: 20, marginBottom: 16
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>LIVE</span>
                                    </div>
                                    <div style={{
                                        height: 40, borderRadius: 8,
                                        background: 'linear-gradient(90deg, var(--accent) 0%, rgba(43,107,255,0.3) 50%, transparent 100%)',
                                        marginBottom: 12, opacity: 0.6
                                    }} />
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                        🎤 "Road near sector 12 has a large pothole..."
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div className="pill-js pill-js--success" style={{ fontSize: 11, height: 28, padding: '0 12px' }}>
                                        ✓ Located
                                    </div>
                                    <div className="pill-js pill-js--accent" style={{ fontSize: 11, height: 28, padding: '0 12px' }}>
                                        📷 Photo Added
                                    </div>
                                </div>
                            </div>

                            {/* Floating status cards */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="card-js"
                                style={{
                                    position: 'absolute', top: -20, right: -40,
                                    padding: '12px 16px', borderRadius: 16,
                                    fontSize: 12, fontWeight: 600, background: 'white',
                                    boxShadow: '0 8px 30px rgba(14,26,51,0.12)'
                                }}
                            >
                                <span style={{ color: 'var(--color-success)' }}>● </span>
                                Resolved in 2.4 days
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="card-js"
                                style={{
                                    position: 'absolute', bottom: 20, left: -50,
                                    padding: '12px 16px', borderRadius: 16,
                                    fontSize: 12, fontWeight: 600, background: 'white',
                                    boxShadow: '0 8px 30px rgba(14,26,51,0.12)'
                                }}
                            >
                                🤖 AI Match: <span style={{ color: 'var(--accent)' }}>98%</span>
                            </motion.div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 2: FOR CITIZENS
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container-js" style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>FOR CITIZENS</span>
                        <h2 style={{ marginBottom: 16 }}>Report in your way.<br />In any language.</h2>
                        <p style={{ maxWidth: 520, margin: '0 auto 48px', fontSize: 17 }}>
                            Submit civic issues through text, image, voice, or location — all processed by AI in any Indian language.
                        </p>
                    </Reveal>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 24, maxWidth: 1000, margin: '0 auto'
                    }}>
                        {[
                            { icon: '✍️', title: 'Text', desc: 'Type in any language — Hindi, English, Tamil, or Hinglish. AI understands all.' },
                            { icon: '📷', title: 'Image', desc: 'Click a photo of the issue. AI identifies and classifies it automatically.' },
                            { icon: '🎤', title: 'Voice', desc: 'Describe the problem hands-free. Speech-to-text in your mother tongue.' },
                            { icon: '📍', title: 'Location', desc: 'Auto-detect your GPS or pin on map for precise complaint placement.' },
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="card-js" style={{
                                    padding: 32, textAlign: 'center',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                                }}>
                                    <div className="icon-container icon-container--lg" style={{ fontSize: 28 }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{ fontSize: 20, fontWeight: 600 }}>{item.title}</h3>
                                    <p style={{ fontSize: 14, margin: 0 }}>{item.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 3: AI AT WORK
               ═══════════════════════════ */}
            <section className="section-pinned dot-grid" style={{ background: 'var(--bg-primary)' }}>
                <div className="container-js" style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>AI ENGINE</span>
                        <h2 style={{ marginBottom: 16 }}>Intelligent Processing</h2>
                        <p style={{ maxWidth: 520, margin: '0 auto 56px' }}>
                            Every complaint is processed through three AI stages for accurate routing and fast resolution.
                        </p>
                    </Reveal>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 0, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto'
                    }}>
                        {[
                            { icon: '🌐', title: 'Normalization', desc: 'Any language → Hinglish', color: '#EAF2FF' },
                            { icon: '🏷️', title: 'Classification', desc: 'Pothole, Garbage, Water…', color: '#e6f4ea' },
                            { icon: '🏢', title: 'Assignment', desc: 'Routed to right department', color: '#fef7e0' },
                        ].map((stage, i) => (
                            <Reveal key={i} delay={i * 0.15} style={{ display: 'flex', alignItems: 'center' }}>
                                {i > 0 && (
                                    <div style={{
                                        width: 60, height: 2, borderTop: '2px dashed var(--accent)',
                                        opacity: 0.3, margin: '0 -4px'
                                    }} className="hidden md:block" />
                                )}
                                <div className="card-js" style={{
                                    padding: 28, textAlign: 'center', width: 220, position: 'relative'
                                }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16,
                                        background: stage.color, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: 24, margin: '0 auto 16px'
                                    }}>
                                        {stage.icon}
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{stage.title}</h3>
                                    <p style={{ fontSize: 13, margin: 0 }}>{stage.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 4: LIVE TRACKING
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'white' }}>
                <div className="container-js" style={{
                    display: 'flex', alignItems: 'center', gap: 60,
                    flexWrap: 'wrap', padding: '80px 24px'
                }}>
                    {/* Timeline */}
                    <div style={{ flex: '1 1 360px' }}>
                        <Reveal>
                            <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>REAL-TIME TRACKING</span>
                            <h2 style={{ marginBottom: 40 }}>Follow every step</h2>
                        </Reveal>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {[
                                { icon: '📝', label: 'Submitted', status: 'done', time: '10:24 AM' },
                                { icon: '🤖', label: 'AI Verified', status: 'done', time: '10:25 AM' },
                                { icon: '👷', label: 'Worker Assigned', status: 'done', time: '11:02 AM' },
                                { icon: '🔧', label: 'In Progress', status: 'active', time: '2:30 PM' },
                                { icon: '✅', label: 'Resolved & Verified', status: 'pending', time: '—' },
                            ].map((step, i) => (
                                <Reveal key={i} delay={i * 0.1}>
                                    <div className="timeline-step">
                                        <div className={`timeline-dot timeline-dot--${step.status}`}>
                                            {step.icon}
                                        </div>
                                        <div style={{ paddingTop: 8 }}>
                                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: 'var(--text-primary)' }}>{step.label}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step.time}</div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* Mini Map Illustration */}
                    <Reveal delay={0.2} style={{ flex: '1 1 360px' }}>
                        <div className="card-js" style={{
                            padding: 32, borderRadius: 24, background: 'var(--bg-secondary)',
                            minHeight: 320, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Worker En Route</h3>
                            <p style={{ fontSize: 14, margin: 0 }}>ETA: 15 minutes • 2.3 km away</p>
                            <div style={{
                                marginTop: 20, width: '80%', height: 6, borderRadius: 3,
                                background: '#dbeafe', overflow: 'hidden'
                            }}>
                                <motion.div
                                    animate={{ width: ['30%', '70%', '30%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
                                />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 5: FOR WORKERS
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container-js" style={{ padding: '80px 24px' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>FOR FIELD WORKERS</span>
                            <h2>Simple. Guided. Efficient.</h2>
                        </div>
                    </Reveal>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                        gap: 24, maxWidth: 900, margin: '0 auto'
                    }}>
                        {/* Task List Card */}
                        <Reveal delay={0.1}>
                            <div className="card-js" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    📋 Assigned Tasks
                                </h3>
                                {[
                                    { id: 'CMP-4521', issue: 'Pothole on MG Road', priority: 'High', color: 'var(--color-danger)' },
                                    { id: 'CMP-4518', issue: 'Garbage pile, Sector 7', priority: 'Medium', color: 'var(--color-warning)' },
                                    { id: 'CMP-4515', issue: 'Broken streetlight', priority: 'Low', color: 'var(--color-success)' },
                                ].map((task, i) => (
                                    <div key={i} style={{
                                        padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{task.issue}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.id}</div>
                                        </div>
                                        <div className="pill-js" style={{
                                            fontSize: 11, height: 26, padding: '0 10px',
                                            background: `${task.color}15`, color: task.color, fontWeight: 600
                                        }}>
                                            {task.priority}
                                        </div>
                                    </div>
                                ))}
                                <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '12px 24px', fontSize: 12 }}>
                                    🧭 Navigate to Location
                                </button>
                            </div>
                        </Reveal>

                        {/* Verification Card */}
                        <Reveal delay={0.2}>
                            <div className="card-js" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    📸 AI Verification
                                </h3>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                    <div style={{
                                        flex: 1, height: 140, borderRadius: 12,
                                        background: '#fee2e2', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexDirection: 'column', gap: 4
                                    }}>
                                        <span style={{ fontSize: 32 }}>🕳️</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-danger)' }}>BEFORE</span>
                                    </div>
                                    <div style={{
                                        flex: 1, height: 140, borderRadius: 12,
                                        background: '#dcfce7', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexDirection: 'column', gap: 4
                                    }}>
                                        <span style={{ fontSize: 32 }}>✨</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)' }}>AFTER</span>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', background: '#e6f4ea', borderRadius: 12
                                }}>
                                    <span style={{ fontSize: 20 }}>✅</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-success)' }}>AI Match: 98%</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Work verified successfully</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 6: AI VERIFICATION
               ═══════════════════════════ */}
            <section className="section-pinned dot-grid" style={{ background: 'var(--bg-primary)' }}>
                <div className="container-js" style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>COMPUTER VISION</span>
                        <h2 style={{ marginBottom: 16 }}>No false closures. Ever.</h2>
                        <p style={{ maxWidth: 520, margin: '0 auto 48px' }}>
                            Our AI compares before and after images to ensure work is genuinely completed before closing a complaint.
                        </p>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="card-js" style={{
                            maxWidth: 700, margin: '0 auto', padding: 32, borderRadius: 24
                        }}>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div style={{
                                    flex: '1 1 250px', height: 200, borderRadius: 16,
                                    background: 'linear-gradient(135deg, #fecaca, #fed7aa)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column', gap: 8
                                }}>
                                    <span style={{ fontSize: 48 }}>🕳️</span>
                                    <span className="pill-js pill-js--danger" style={{ fontSize: 11, height: 26, padding: '0 12px' }}>Before</span>
                                </div>
                                <div style={{
                                    flex: '1 1 250px', height: 200, borderRadius: 16,
                                    background: 'linear-gradient(135deg, #bbf7d0, #a7f3d0)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column', gap: 8
                                }}>
                                    <span style={{ fontSize: 48 }}>🛣️</span>
                                    <span className="pill-js pill-js--success" style={{ fontSize: 11, height: 26, padding: '0 12px' }}>After</span>
                                </div>
                            </div>
                            <div className="confidence-meter" style={{ marginBottom: 12 }}>
                                <div className="confidence-meter__fill" style={{ width: '98%' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI Confidence Score</span>
                                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-heading)' }}>98%</span>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 7: FOR ADMINISTRATORS
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'white' }}>
                <div className="container-js" style={{ padding: '80px 24px' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>FOR ADMINISTRATORS</span>
                            <h2>City-wide oversight</h2>
                        </div>
                    </Reveal>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24, maxWidth: 1000, margin: '0 auto'
                    }}>
                        {/* Map Card */}
                        <Reveal delay={0.1}>
                            <div className="card-js" style={{ padding: 24, gridColumn: 'span 1' }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📍 Complaint Map</h3>
                                <div style={{
                                    height: 200, borderRadius: 16, background: 'var(--bg-secondary)',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    {/* Simulated map dots */}
                                    {[
                                        { top: '20%', left: '30%', color: 'var(--color-danger)' },
                                        { top: '45%', left: '60%', color: 'var(--color-warning)' },
                                        { top: '60%', left: '25%', color: 'var(--color-success)' },
                                        { top: '30%', left: '75%', color: 'var(--color-danger)' },
                                        { top: '70%', left: '50%', color: 'var(--color-success)' },
                                        { top: '15%', left: '55%', color: 'var(--color-warning)' },
                                    ].map((dot, i) => (
                                        <div key={i} style={{
                                            position: 'absolute', top: dot.top, left: dot.left,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: dot.color, border: '2px solid white',
                                            boxShadow: `0 0 0 3px ${dot.color}30`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* Stats Panel */}
                        <Reveal delay={0.2}>
                            <div className="card-js" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 Status Breakdown</h3>
                                {[
                                    { label: 'Resolved', pct: 68, color: 'var(--color-success)' },
                                    { label: 'In Progress', pct: 22, color: 'var(--color-warning)' },
                                    { label: 'Pending', pct: 10, color: 'var(--color-danger)' },
                                ].map((item, i) => (
                                    <div key={i} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.pct}%</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 3,
                                                background: item.color, width: `${item.pct}%`,
                                                transition: 'width 1s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 12, background: 'var(--bg-secondary)' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Avg. Resolution Time</div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>2.4 days</div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 8: FOR AUTHORITIES
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container-js" style={{ padding: '80px 24px' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>FOR GOVERNANCE AUTHORITIES</span>
                            <h2>Data-driven decisions</h2>
                        </div>
                    </Reveal>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24, maxWidth: 1000, margin: '0 auto'
                    }}>
                        {/* Heatmap */}
                        <Reveal delay={0.1}>
                            <div className="card-js" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🔥 Issue Heatmap</h3>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
                                    gap: 4, marginBottom: 12
                                }}>
                                    {Array.from({ length: 48 }, (_, i) => {
                                        const colors = ['#dcfce7', '#bbf7d0', '#fef9c3', '#fed7aa', '#fecaca', '#fca5a5'];
                                        return (
                                            <div key={i} style={{
                                                aspectRatio: '1', borderRadius: 4,
                                                background: colors[Math.floor(Math.random() * colors.length)]
                                            }} />
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                                    <span>Low</span><span>Medium</span><span>High</span>
                                </div>
                            </div>
                        </Reveal>

                        {/* Category Chart */}
                        <Reveal delay={0.2}>
                            <div className="card-js" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 Top Categories</h3>
                                {[
                                    { label: 'Potholes', value: 340, pct: 85 },
                                    { label: 'Garbage', value: 280, pct: 70 },
                                    { label: 'Streetlights', value: 195, pct: 49 },
                                    { label: 'Water Supply', value: 150, pct: 38 },
                                    { label: 'Drainage', value: 120, pct: 30 },
                                ].map((item, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.value}</span>
                                        </div>
                                        <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 4,
                                                background: `linear-gradient(90deg, var(--accent), #60a5fa)`,
                                                width: `${item.pct}%`
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 9: TRANSPARENCY (Flowing)
               ═══════════════════════════ */}
            <section className="section-flowing" style={{ background: 'white', padding: '80px 0' }}>
                <div className="container-js" style={{ textAlign: 'center' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>TRUST & SECURITY</span>
                        <h2 style={{ marginBottom: 48 }}>Built for transparency</h2>
                    </Reveal>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 24, maxWidth: 900, margin: '0 auto'
                    }}>
                        {[
                            { icon: '🔒', title: 'End-to-End Encryption', desc: 'All data is encrypted at rest and in transit with AES-256 encryption.' },
                            { icon: '🏛️', title: 'Government Grade Security', desc: 'Certified compliance with national data protection standards.' },
                            { icon: '🛡️', title: 'Privacy by Design', desc: 'Personal data is anonymized. Users control what information they share.' },
                        ].map((card, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="card-js" style={{
                                    padding: 32, textAlign: 'center',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                                }}>
                                    <div className="icon-container icon-container--lg" style={{ fontSize: 28 }}>{card.icon}</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{card.title}</h3>
                                    <p style={{ fontSize: 14, margin: 0 }}>{card.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 10: IMPACT METRICS (Flowing)
               ═══════════════════════════ */}
            <section className="section-flowing" style={{ background: 'var(--bg-secondary)', padding: '80px 0' }}>
                <div className="container-js" style={{ textAlign: 'center' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>IMPACT</span>
                        <h2 style={{ marginBottom: 56 }}>Making a difference, daily</h2>
                    </Reveal>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 32, maxWidth: 800, margin: '0 auto'
                    }}>
                        {[
                            { value: 10342, suffix: '+', label: 'Complaints Resolved' },
                            { value: 2.4, suffix: ' days', label: 'Avg. Resolution Time', isDecimal: true },
                            { value: 98, suffix: '%', label: 'AI Verification Accuracy' },
                        ].map((metric, i) => (
                            <Reveal key={i} delay={i * 0.15}>
                                <div style={{ padding: 24 }}>
                                    <div style={{
                                        fontFamily: 'var(--font-heading)', fontWeight: 700,
                                        fontSize: 56, color: 'var(--accent)', lineHeight: 1, marginBottom: 8
                                    }}>
                                        {metric.isDecimal ? (
                                            <span>2.4<span style={{ fontSize: 28 }}>{metric.suffix}</span></span>
                                        ) : (
                                            <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                                        )}
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>
                                        {metric.label}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 11: SUCCESS STORIES (Flowing)
               ═══════════════════════════ */}
            <section className="section-flowing" style={{ background: 'white', padding: '80px 0' }}>
                <div className="container-js" style={{ marginBottom: 40, textAlign: 'center' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>STORIES</span>
                        <h2>Voices of change</h2>
                    </Reveal>
                </div>
                <div
                    ref={storiesRef}
                    className="scroll-container"
                    style={{ paddingLeft: 40, paddingRight: 40 }}
                    onMouseEnter={() => setAutoScrollPaused(true)}
                    onMouseLeave={() => setAutoScrollPaused(false)}
                >
                    {[
                        { name: 'Priya Sharma', area: 'Sector 12', issue: 'Pothole repair', quote: 'Reported at 10 AM, fixed by evening. Incredible speed!', emoji: '👩' },
                        { name: 'Rajesh Kumar', area: 'MG Road', issue: 'Garbage clearance', quote: 'The AI verification gave me confidence it was truly resolved.', emoji: '👨' },
                        { name: 'Anita Devi', area: 'Ward 7', issue: 'Streetlight repair', quote: 'Voice reporting in Hindi made it so easy for my mother.', emoji: '👵' },
                        { name: 'Mohammed Ali', area: 'Civil Lines', issue: 'Water supply', quote: 'Live tracking let me see the worker was on the way. Very transparent.', emoji: '👤' },
                        { name: 'Sunita Bai', area: 'New Colony', issue: 'Drainage overflow', quote: 'Submitted with a photo and location. Got resolved in 2 days.', emoji: '👩‍🦱' },
                    ].map((story, i) => (
                        <div key={i} className="card-js scroll-card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24
                                }}>{story.emoji}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{story.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{story.area} • {story.issue}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                                "{story.quote}"
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 12: GET STARTED (Flowing)
               ═══════════════════════════ */}
            <section className="section-flowing" style={{ background: 'var(--bg-secondary)', padding: '80px 0' }}>
                <div className="container-js" style={{ textAlign: 'center' }}>
                    <Reveal>
                        <span className="label-meta" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>GET STARTED</span>
                        <h2 style={{ marginBottom: 16 }}>Your voice matters</h2>
                        <p style={{ maxWidth: 480, margin: '0 auto 40px' }}>
                            Ready to make a difference? Submit your complaint or sign up for updates.
                        </p>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="card-js" style={{
                            maxWidth: 560, margin: '0 auto', padding: '40px 32px',
                            textAlign: 'center'
                        }}>
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🙌</div>
                                <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Report a civic issue</h3>
                                <p style={{ fontSize: 14, margin: 0 }}>
                                    Text, voice, image, or location — choose your way to report.
                                </p>
                            </div>
                            <Link to="/register-complaint" className="btn-primary" style={{ marginBottom: 16 }}>
                                Submit a Complaint
                            </Link>
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <Link to="/track" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                                    Track Existing →
                                </Link>
                                <Link to="/register" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                                    Create Account →
                                </Link>
                            </div>
                            <div style={{
                                marginTop: 32, paddingTop: 24,
                                borderTop: '1px solid var(--border-light)',
                                display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Helpline</div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>1800-11-2345</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)' }}>helpdesk@jansetu.gov.in</div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default Home;
