import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Services = () => {
    const services = [
        { title: "AI-Powered Grievance Redressal", icon: "🤖", desc: "Advanced NLP automatically categorizes and prioritizes complaints. Submit via text, voice, or image.", features: ["Multi-lingual Support", "Voice-to-Text Integration", "Smart Categorization"] },
        { title: "Real-Time Status Tracking", icon: "📍", desc: "Complete transparency from registration to resolution with live status updates and ETA.", features: ["SMS/Email Notifications", "Visual Timeline", "Estimated Resolution Time"] },
        { title: "Automated Department Routing", icon: "⚡", desc: "Zero manual intervention. AI instantly routes grievances to the exact responsible department.", features: ["Roads & Infrastructure", "Sanitation & Waste", "Water Supply", "Public Safety"] },
        { title: "Smart Verification System", icon: "🔍", desc: "Every resolution is verified using AI image analysis to ensure work is genuinely completed.", features: ["Before/After Comparison", "Geo-tagging Verification", "Anti-Fraud Detection"] },
        { title: "Citizen Feedback Loop", icon: "⭐", desc: "Rate the quality of service after every resolution to help improve municipal performance.", features: ["5-Star Rating System", "Performance Scorecards", "Direct Escalation"] },
        { title: "Open Data Analytics", icon: "📊", desc: "Publicly accessible dashboards showcasing city-wide performance and efficiency metrics.", features: ["City Health Index", "Department Leaderboards", "Transparency Reports"] },
    ];

    return (
        <div className="page-bg">
            {/* Hero */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '100px 0 60px',
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <div className="blob" style={{ width: 400, height: 400, background: 'rgba(43,107,255,0.06)', top: '-20%', right: '10%' }} />
                <div className="container-js" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="pill-js pill-js--accent" style={{ marginBottom: 16 }}>Our Platform</div>
                    <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 16 }}>Services</h1>
                    <p style={{ maxWidth: 560, margin: '0 auto', fontSize: 17 }}>
                        Comprehensive digital solutions bridging citizens and governance through AI, transparency, and accountability.
                    </p>
                </div>
            </section>

            {/* Service Grid */}
            <section style={{ padding: '64px 0 80px' }}>
                <div className="container-js">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 24
                    }}>
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                viewport={{ once: true }}
                                className="card-js"
                                style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}
                            >
                                <div className="icon-container icon-container--lg" style={{ fontSize: 28 }}>
                                    {service.icon}
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 600 }}>{service.title}</h3>
                                <p style={{ fontSize: 14, margin: 0, flex: 1 }}>{service.desc}</p>
                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {service.features.map((feat, i) => (
                                        <span key={i} className="pill-js" style={{ fontSize: 11, height: 28, padding: '0 12px' }}>
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '64px 0', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                <div className="container-js">
                    <h2 style={{ fontSize: 32, marginBottom: 12 }}>Ready to make a difference?</h2>
                    <p style={{ fontSize: 16, maxWidth: 480, margin: '0 auto 32px' }}>No queues, no paperwork. Report and track civic issues digitally.</p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register-complaint" className="btn-primary">Submit a Complaint</Link>
                        <Link to="/" className="btn-secondary">Back to Home</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Services;
