import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({
    isSidebarOpen,
    toggleSidebar,
    goToMain,
    currentScreen,
    goToCreate,
    handleInquiryMenuClick,
    isLoggedIn,
    handleMyPageClick,
    handleLogout
}) => {
    const [isMyPageSubOpen, setIsMyPageSubOpen] = useState(false);

    return (
        <>
            <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-top">
                        <span className="sidebar-logo-text" onClick={goToMain} style={{ cursor: 'pointer' }}>Calli For You</span>
                        <button className="close-sidebar" onClick={toggleSidebar}>✕</button>
                    </div>
                    <nav className="sidebar-nav">
                        <button className={`nav-button ${currentScreen === 'main' ? 'active' : ''}`} onClick={goToMain}>
                            <span className="nav-icon">🏠</span><span className="nav-text">메인화면</span>
                        </button>
                        <button className={`nav-button ${currentScreen === 'create' ? 'active' : ''}`} onClick={goToCreate}>
                            <span className="nav-icon">🖌️</span><span className="nav-text">캘리그라피 생성</span>
                        </button>
                        <button className={`nav-button ${currentScreen === 'inquiry' ? 'active' : ''}`} onClick={handleInquiryMenuClick}>
                            <span className="nav-icon">❓</span><span className="nav-text">문의사항</span>
                        </button>
                        <div
                            className="nav-item-group"
                            onMouseEnter={() => isLoggedIn && setIsMyPageSubOpen(true)}
                            onMouseLeave={() => setIsMyPageSubOpen(false)}
                        >
                            <button className={`nav-button ${currentScreen === 'mypage' ? 'active' : ''}`} onClick={() => handleMyPageClick('dashboard')}>
                                <span className="nav-icon">👤</span><span className="nav-text">마이페이지</span>
                                <span className={`arrow-icon ${isMyPageSubOpen ? 'up' : 'down'}`}>{isMyPageSubOpen ? '⌃' : '⌄'}</span>
                            </button>
                            {isMyPageSubOpen && (
                                <div className="sub-menu">
                                    <button className="sub-nav-button" onClick={() => handleMyPageClick('auth')}>회원 정보 수정</button>
                                    <button className="sub-nav-button" onClick={() => handleMyPageClick('charge')}>토큰 충전하기</button>
                                    <button className="sub-nav-button" onClick={() => handleMyPageClick('history')}>다운로드 내역</button>
                                    <button className="sub-nav-button" onClick={() => handleMyPageClick('wishlist')}>위시리스트</button>
                                </div>
                            )}
                        </div>
                    </nav>
                    <button className="logout-button" onClick={handleLogout}><span className="nav-icon">🚪</span><span>로그아웃</span></button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
