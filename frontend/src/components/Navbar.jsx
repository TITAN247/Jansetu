import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setUser(JSON.parse(userStr)); } catch { setUser(null); }
        } else {
            setUser(null);
        }
    }, [location]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'citizen': return '/user-dashboard';
            case 'worker': return '/worker-dashboard';
            case 'dept_officer': return '/dept-officer-dashboard';
            case 'admin': return '/admin-dashboard';
            case 'governance': return '/governance-dashboard';
            default: return '/';
        }
    };

    const isHome = location.pathname === '/';

    // Public navigation links are only shown when no user is logged in.
    const navLinks = !user ? [
        { label: 'Home', to: '/' },
        { label: 'Services', to: '/services' },
        { label: 'About', to: '/about' },
        { label: 'Track', to: '/track' },
    ] : [];

    return (
        <>
            <nav className={`nav-js ${scrolled || !isHome ? 'nav-js--solid' : 'nav-js--transparent'}`}>
                <div className="container-js">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '72px'
                    }}>
                        {/* Logo */}
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontFamily: 'var(--font-heading)',
                                fontWeight: 700, fontSize: 16
                            }}>JS</div>
                            <span style={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 600, fontSize: 20,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                JanSetu<span style={{ color: 'var(--accent)' }}>AI</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Links (only for public visitors) */}
                        {!user && (
                            <div className="nav-desktop-links">
                                {navLinks.map(link => (
                                    <Link key={link.to} to={link.to} style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 14, fontWeight: 500,
                                        color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s ease',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Desktop Right Actions */}
                        <div className="nav-desktop-actions">
                            {user ? (
                                <>
                                    <Link to={getDashboardLink()} className="pill-js pill-js--accent" style={{
                                        textDecoration: 'none', fontSize: 13, fontWeight: 600, height: 36, padding: '0 16px'
                                    }}>
                                        Dashboard
                                    </Link>
                                    {/* Only citizens see direct Submit Complaint shortcut */}
                                    {user.role === 'citizen' && (
                                        <Link to="/register-complaint" className="btn-primary" style={{
                                            padding: '10px 24px', fontSize: 13, textDecoration: 'none'
                                        }}>
                                            Submit Complaint
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} style={{
                                        background: 'none', border: '1.5px solid var(--border-light)',
                                        borderRadius: 'var(--radius-pill)', padding: '8px 20px',
                                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                        color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" style={{
                                        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                                        color: 'var(--text-secondary)', textDecoration: 'none'
                                    }}>
                                        Login
                                    </Link>
                                    <Link to="/register-complaint" className="btn-primary" style={{
                                        padding: '10px 24px', fontSize: 13
                                    }}>
                                        Submit Complaint
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="nav-mobile-toggle"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span style={{
                                width: 22, height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 0.3s ease',
                                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                                display: 'block'
                            }} />
                            <span style={{
                                width: 22, height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 0.3s ease',
                                opacity: menuOpen ? 0 : 1,
                                display: 'block'
                            }} />
                            <span style={{
                                width: 22, height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 0.3s ease',
                                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                                display: 'block'
                            }} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Overlay */}
            <div
                className="nav-mobile-overlay"
                style={{
                    opacity: menuOpen ? 1 : 0,
                    pointerEvents: menuOpen ? 'auto' : 'none',
                }}
                onClick={() => setMenuOpen(false)}
            />

            {/* Mobile Drawer */}
            <div
                className="nav-mobile-drawer"
                style={{
                    transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
                }}
            >
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Mobile Links (only for public visitors) */}
                    {!user && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                            {navLinks.map(link => (
                                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{
                                    fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600,
                                    color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-primary)',
                                    textDecoration: 'none', padding: '14px 0',
                                    borderBottom: '1px solid var(--border-light)',
                                    display: 'flex', alignItems: 'center', gap: 12
                                }}>
                                    {link.label}
                                    {location.pathname === link.to && (
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: 'var(--accent)', display: 'inline-block'
                                        }} />
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Mobile Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
                        {user ? (
                            <>
                                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}
                                    className="btn-primary" style={{ textAlign: 'center', width: '100%' }}>
                                    Dashboard
                                </Link>
                                {/* Show "Submit Complaint" button only for citizens */}
                                {user.role === 'citizen' && (
                                    <Link to="/register-complaint" onClick={() => setMenuOpen(false)}
                                        className="btn-primary" style={{ textAlign: 'center', width: '100%' }}>
                                        Submit Complaint
                                    </Link>
                                )}
                                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                                    className="btn-secondary" style={{ width: '100%' }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="btn-secondary" style={{ textAlign: 'center', width: '100%' }}>
                                    Login
                                </Link>
                                <Link to="/register-complaint" onClick={() => setMenuOpen(false)}
                                    className="btn-primary" style={{ textAlign: 'center', width: '100%' }}>
                                    Submit Complaint
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer for fixed nav */}
            <div style={{ height: isHome ? 0 : 72 }} />
        </>
    );
};

export default Navbar;
