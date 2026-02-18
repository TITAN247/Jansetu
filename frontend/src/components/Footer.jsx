import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: '#0E1A33', color: '#94a3b8', paddingTop: 80, paddingBottom: 32 }}>
            <div className="container-js">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 48,
                    marginBottom: 64
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontFamily: 'var(--font-heading)',
                                fontWeight: 700, fontSize: 14
                            }}>JS</div>
                            <span style={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 600, fontSize: 18, color: 'white'
                            }}>
                                JanSetu<span style={{ color: 'var(--accent)' }}>AI</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', maxWidth: 280 }}>
                            AI-powered civic complaint redressal platform bridging citizens and governance for transparent, efficient public service delivery.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-heading)', fontWeight: 600,
                            fontSize: 14, color: 'white', marginBottom: 20,
                            letterSpacing: '0.08em', textTransform: 'uppercase'
                        }}>Quick Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Services', to: '/services' },
                                { label: 'About Us', to: '/about' },
                                { label: 'Track Complaint', to: '/track' },
                            ].map(link => (
                                <Link key={link.to} to={link.to} style={{
                                    color: '#64748b', textDecoration: 'none', fontSize: 14,
                                    transition: 'color 0.2s ease'
                                }}
                                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={e => e.target.style.color = '#64748b'}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-heading)', fontWeight: 600,
                            fontSize: 14, color: 'white', marginBottom: 20,
                            letterSpacing: '0.08em', textTransform: 'uppercase'
                        }}>Important Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'National Portal of India', href: 'https://www.india.gov.in/' },
                                { label: 'Digital India', href: 'https://www.digitalindia.gov.in/' },
                                { label: 'MyGov', href: 'https://www.mygov.in/' },
                                { label: 'RTI Portal', href: 'https://rtionline.gov.in/' },
                            ].map(link => (
                                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{
                                    color: '#64748b', textDecoration: 'none', fontSize: 14,
                                    transition: 'color 0.2s ease'
                                }}
                                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={e => e.target.style.color = '#64748b'}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-heading)', fontWeight: 600,
                            fontSize: 14, color: 'white', marginBottom: 20,
                            letterSpacing: '0.08em', textTransform: 'uppercase'
                        }}>Contact</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
                                <strong style={{ color: 'white' }}>Municipal Corporation</strong><br />
                                Sector 12, Civil Lines, New City - 110001
                            </p>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
                                Helpline: <strong style={{ color: 'white' }}>1800-11-2345</strong>
                            </p>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
                                Email: <span style={{ color: 'var(--accent)' }}>helpdesk@jansetu.gov.in</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 12, color: '#475569'
                }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                        © 2026 JanSetu AI. All Rights Reserved. Built with ❤️ for India.
                    </p>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {['Privacy Policy', 'Terms of Service', 'Accessibility'].map(item => (
                            <a key={item} href="#" style={{
                                color: '#475569', textDecoration: 'none', fontSize: 12,
                                transition: 'color 0.2s'
                            }}
                                onMouseEnter={e => e.target.style.color = 'white'}
                                onMouseLeave={e => e.target.style.color = '#475569'}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
