import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on home page
    if (location.pathname === '/') return null;

    return (
        <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
                position: 'fixed',
                top: 84,
                left: 16,
                zIndex: 900,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 4px 16px rgba(14,26,51,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,26,51,0.15)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,26,51,0.1)';
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
            </svg>
        </button>
    );
};

export default BackButton;
