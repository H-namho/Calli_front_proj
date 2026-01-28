import React, { useState } from 'react';
import '../css/Admin.css';

export default function AdminLayout({ onLogout, currentView, setCurrentView, children }) {

    // 메뉴 아이템 정의
    const menuItems = [
        { id: 'inquiry', label: '문의 사항 관리', icon: '📋' },
        { id: 'member', label: '회원 정보 관리', icon: '👥' },
    ];

    return (
        <div className="admin-container">
            {/* Admin Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <h2>관리자</h2>
                </div>

                <div className="admin-menu">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-menu-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="admin-footer">
                    <button className="admin-logout-btn" onClick={onLogout}>
                        <span>로그아웃</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-content">
                <header className="admin-header">
                    <h1 className="page-title">
                        {currentView === 'inquiry' ? '문의 사항 관리' : '회원 정보 관리'}
                    </h1>
                </header>

                <main className="content-body">
                    {children}
                </main>
            </div>
        </div>
    );
}
