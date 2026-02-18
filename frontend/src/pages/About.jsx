import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div className="page-bg">
            {/* Hero */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '100px 0 60px',
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <div className="blob" style={{ width: 400, height: 400, background: 'rgba(43,107,255,0.06)', top: '-20%', left: '10%' }} />
                <div className="container-js" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="pill-js pill-js--accent" style={{ marginBottom: 16 }}>Our Mission</div>
                    <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 16 }}>About JanSetu AI</h1>
                    <p style={{ maxWidth: 560, margin: '0 auto', fontSize: 17 }}>
                        Bridging the gap between citizens and governance through AI-powered civic technology.
                    </p>
                </div>
            </section>

            {/* Vision */}
            <section style={{ padding: '80px 0' }}>
                <div className="container-js" style={{ maxWidth: 800 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 style={{ fontSize: 32, marginBottom: 16 }}>Our Vision</h2>
                        <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 24 }}>
                            JanSetu AI envisions a future where every civic complaint is heard, processed, and resolved efficiently.
                            We leverage artificial intelligence to eliminate bureaucratic delays, ensure transparency, and create
                            accountability at every level of municipal governance.
                        </p>
                        <p style={{ fontSize: 17, lineHeight: 1.8 }}>
                            Our platform empowers citizens to report issues through text, voice, or image in any Indian language,
                            while providing administrators with real-time dashboards and AI-verified resolution tracking.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
                <div className="container-js">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 style={{ fontSize: 32, marginBottom: 12 }}>How It Works</h2>
                        <p style={{ maxWidth: 480, margin: '0 auto' }}>A seamless pipeline powered by AI at every step.</p>
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 24, maxWidth: 1000, margin: '0 auto'
                    }}>
                        {[
                            { step: '01', icon: '📝', title: 'Citizen Reports', desc: 'Submit via text, voice, image, or GPS in any language.' },
                            { step: '02', icon: '🤖', title: 'AI Processes', desc: 'Normalizes, classifies, and routes to the right department.' },
                            { step: '03', icon: '👷', title: 'Worker Resolves', desc: 'Assigned worker handles the issue and uploads proof.' },
                            { step: '04', icon: '✅', title: 'AI Verifies', desc: 'Before/after images compared for genuine resolution.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="card-js"
                                style={{ padding: 28, textAlign: 'center' }}
                            >
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                                    marginBottom: 12, letterSpacing: '0.1em'
                                }}>STEP {item.step}</div>
                                <div className="icon-container icon-container--lg" style={{ fontSize: 28, margin: '0 auto 16px' }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                                <p style={{ fontSize: 13, margin: 0 }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / Tech */}
            <section style={{ padding: '80px 0' }}>
                <div className="container-js">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 style={{ fontSize: 32, marginBottom: 12 }}>Technology Stack</h2>
                        <p style={{ maxWidth: 480, margin: '0 auto' }}>Built with cutting-edge AI and modern web technologies.</p>
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 20, maxWidth: 900, margin: '0 auto'
                    }}>
                        {[
                            { icon: '🧠', label: 'NLP & Text AI', desc: 'Multi-lingual processing' },
                            { icon: '👁️', label: 'Computer Vision', desc: 'YOLO-based verification' },
                            { icon: '🗺️', label: 'Geospatial', desc: 'GPS & heatmap analytics' },
                            { icon: '🔐', label: 'JWT Auth', desc: 'Role-based access control' },
                            { icon: '⚛️', label: 'React + Vite', desc: 'Fast, modern frontend' },
                            { icon: '🐍', label: 'Flask + MongoDB', desc: 'Scalable backend' },
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.06 }}
                                viewport={{ once: true }}
                                style={{
                                    padding: 24, borderRadius: 20,
                                    background: 'var(--bg-secondary)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 8 }}>{tech.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{tech.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tech.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '64px 0', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                <div className="container-js">
                    <h2 style={{ fontSize: 32, marginBottom: 12 }}>Join the movement</h2>
                    <p style={{ maxWidth: 480, margin: '0 auto 32px' }}>Be part of transparent, AI-powered governance.</p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register-complaint" className="btn-primary">Submit a Complaint</Link>
                        <Link to="/register" className="btn-secondary">Create Account</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
