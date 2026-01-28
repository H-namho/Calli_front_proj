import React from 'react';
import './ScrollToTopButton.css';

const ScrollToTopButton = () => {
    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

    return (
        <button className="scroll-top-button" onClick={scrollToTop}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
        </button>
    );
};

export default ScrollToTopButton;
