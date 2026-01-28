import React, { useState } from 'react';
import './Footer.css';
// import logo from '../assets/logo.png'; // 로고 이미지 없음 -> 텍스트로 대체
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../jsx/termsData';

const Footer = ({ onGoToService, onGoToNotice, onGoToFAQ, onGoToInquiry }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        content: ''
    });

    const openModal = (title, content) => {
        setModalState({ isOpen: true, title, content });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-logo">
                        <span className="footer-logo-text">Calli For You</span>
                    </div>
                    <p className="footer-desc">
                        AI가 그려주는 나만의 감성 캘리그라피.<br />
                        당신의 소중한 메시지를 아름다운 글씨로 담아드립니다.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>Service</h4>
                        <span className="footer-link-span" onClick={() => onGoToService && onGoToService('intro')}>서비스 소개</span>
                        <span className="footer-link-span" onClick={() => onGoToService && onGoToService('guide')}>이용 가이드</span>
                        <span className="footer-link-span">요금 안내</span>
                    </div>
                    <div className="link-column">
                        <h4>Support</h4>
                        <span className="footer-link-span" onClick={onGoToNotice}>공지사항</span>
                        <span className="footer-link-span" onClick={onGoToFAQ}>자주 묻는 질문</span>
                        <span className="footer-link-span" onClick={onGoToInquiry}>문의하기</span>
                    </div>
                    <div className="link-column">
                        <h4>Policy</h4>
                        <span className="footer-link-span" onClick={() => openModal('이용약관', TERMS_OF_SERVICE)}>이용약관</span>
                        <span className="footer-link-span" onClick={() => openModal('개인정보처리방침', PRIVACY_POLICY)}>개인정보처리방침</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Calli For You. All rights reserved.</p>
            </div>

            {/* Footer Modal */}
            {modalState.isOpen && (
                <div className="footer-modal-overlay" onClick={closeModal}>
                    <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="footer-modal-header">
                            <h3>{modalState.title}</h3>
                        </div>
                        <div className="footer-modal-body">
                            <pre className="footer-terms-text">{modalState.content}</pre>
                        </div>
                        <div className="footer-modal-footer">
                            <button className="footer-modal-close-btn" onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
