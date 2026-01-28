import React from 'react';
import '../css/WelcomeModal.css';

/**
 * 신규 사용자 환영 모달 컴포넌트
 * @param {string} userName - 사용자 이름
 * @param {Function} onStart - '시작하기' 버튼 클릭 핸들러
 */
export default function WelcomeModal({ userName, onStart }) {
    return (
        <div className="modal-backdrop">
            <div className="welcome-modal-card">
                <h1 className="welcome-header">Welcome!</h1>
                <h2 className="welcome-sub-header">
                    <span className="user-name-highlight">{userName}</span> 님, 환영합니다! 🎉
                </h2>

                <div className="info-box-container">
                    {/* 1. 무료 체험 혜택 (Gray) */}
                    <div className="info-box box-gray">
                        <div className="box-title">✨ 무료 체험 혜택</div>
                        <p className="box-content">
                            회원가입을 축하드립니다! 첫 <span className="highlight-blue">3회 생성은 무료</span>로 제공됩니다.
                        </p>
                    </div>


                    {/* 2. 토큰 시스템 안내 (Gray) */}
                    <div className="info-box box-gray">
                        <div className="box-title">💰 토큰 시스템 안내</div>
                        <ul className="box-list">
                            <li>캘리그라피 생성 : <span className="highlight-blue">토큰 5개</span> 차감</li>
                            <li>이미지 다운로드 : <span className="highlight-blue">토큰 20개</span> 차감</li>
                        </ul>
                    </div>

                    {/* 3. 토큰 충전 방법 (Gray) */}
                    <div className="info-box box-gray">
                        <div className="box-title">💳 토큰 충전 방법</div>
                        <p className="box-content">
                            마이페이지 → 토큰 충전하기에서 편리하게 충전할 수 있습니다.
                        </p>
                    </div>
                </div>

                <button className="welcome-start-btn" onClick={onStart}>
                    시작하기
                </button>
            </div>
        </div>
    );
}
