import React from 'react';
import './Header.css';

const Header = ({
    isSidebarOpen,
    toggleSidebar,
    goToMain,
    isLoggedIn,
    userName,
    goToLogin
}) => {
    return (
        <header className="top-bar">
            <button className="hamburger-menu" onClick={toggleSidebar}>☰</button>
            <div className="center-logo" onClick={goToMain} style={{ cursor: 'pointer' }}>Calli For You</div>
            {isLoggedIn ? (
                <div className="user-greeting" style={{ cursor: 'default' }}>{userName}님</div>
            ) : (
                <div className="login-link" onClick={goToLogin} style={{ cursor: 'pointer' }}>로그인</div>
            )}
        </header>
    );
};

export default Header;
