import React, { useState, useEffect } from 'react';
import '../css/ServiceInfo.css';
import '../css/LoginScreen.css';
import '../css/CreateCalli.css';

// Assets for Real UI Clones
import slide1 from '../assets/slide1.png';
import kakaoIcon from '../assets/kakao.png';
import naverIcon from '../assets/naver.png';
import googleIcon from '../assets/google.png';

const ServiceInfo = ({ initialTab = 'intro' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    return (
        <div className="service-info-page">
            <div className="service-tabs">
                <button
                    className={`tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
                    onClick={() => setActiveTab('intro')}
                >
                    서비스 소개
                </button>
                <button
                    className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                    onClick={() => setActiveTab('guide')}
                >
                    이용 가이드
                </button>
                <button
                    className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    요금 안내
                </button>
            </div>

            <div className="service-content-wrapper">
                {activeTab === 'intro' && (
                    <div className="tab-pane fade-in intro-pane">
                        <section className="service-hero">
                            <h1>당신의 언어를 예술로 바꿉니다</h1>
                            <p>
                                Calli For You는 AI 기술로 누구나 쉽게<br />
                                세상에 하나뿐인 캘리그라피를 만드는 플랫폼입니다.
                            </p>
                        </section>

                        <section className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">✨</div>
                                <h3>Easy & Fast</h3>
                                <p>복잡한 도구 없이<br />클릭 한 번으로 완성하세요.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Unique Style</h3>
                                <p>매번 새로운 구도와 스타일로<br />나만의 작품을 만드세요.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">💝</div>
                                <h3>Valuable</h3>
                                <p>소중한 마음을 담아<br />특별한 선물을 전하세요.</p>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="tab-pane fade-in guide-pane">
                        <div className="guide-header">
                            <h2>Calli For You 이용 가이드</h2>
                            <p>멋진 작품을 만드는 4단계 여정</p>
                        </div>

                        <div className="guide-steps-container">
                            {/* Step 1: 회원가입 & 로그인 (Real UI Clone) */}
                            <div className="guide-card">
                                <div className="guide-visual-area">
                                    <div className="ui-clone-wrapper login-clone">
                                        <div className="login-card" style={{ width: '100%', height: '100%', boxShadow: 'none', animation: 'none' }}>
                                            <div className="login-left" style={{ padding: '30px' }}>
                                                <div className="login-header" style={{ marginTop: 0, marginBottom: '20px' }}>
                                                    <h1 className="login-logo-text" style={{ fontSize: '28px' }}>Calli For You</h1>
                                                    <p className="login-subtitle" style={{ fontSize: '12px' }}>make my calligraphy</p>
                                                </div>
                                                <div className="login-form" style={{ gap: '15px' }}>
                                                    <div className="input-group">
                                                        <label style={{ fontSize: '12px' }}>아이디</label>
                                                        <input type="text" placeholder="아이디" style={{ height: '40px', fontSize: '12px' }} disabled />
                                                    </div>
                                                    <div className="input-group">
                                                        <label style={{ fontSize: '12px' }}>비밀번호</label>
                                                        <input type="password" placeholder="비밀번호" style={{ height: '40px', fontSize: '12px' }} disabled />
                                                    </div>
                                                    <button className="login-main-button" style={{ height: '45px', fontSize: '14px', marginTop: '5px' }}>Login</button>
                                                </div>
                                                <div className="sns-login-divider" style={{ margin: '20px 0', fontSize: '10px' }}>
                                                    <span>또는</span>
                                                </div>
                                                <div className="sns-login-group" style={{ gap: '15px' }}>
                                                    <button className="sns-button kakao" style={{ width: '40px', height: '40px' }}><img src={kakaoIcon} alt="k" /></button>
                                                    <button className="sns-button naver" style={{ width: '40px', height: '40px' }}><img src={naverIcon} alt="n" /></button>
                                                    <button className="sns-button google" style={{ width: '40px', height: '40px' }}><img src={googleIcon} alt="g" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="guide-text-area">
                                    <div className="step-number">01</div>
                                    <h3>회원가입 & 로그인</h3>
                                    <p>간단한 정보 입력으로 회원이 되어<br />나만의 작품 보관함을 만드세요.</p>
                                </div>
                            </div>

                            {/* Step 2: 문구 & 스타일 입력 (Real UI Clone) */}
                            <div className="guide-card">
                                <div className="guide-visual-area">
                                    <div className="ui-clone-wrapper create-clone">
                                        <div className="input-card" style={{ boxShadow: 'none', border: 'none', padding: '20px' }}>
                                            <div className="card-header" style={{ marginBottom: '15px' }}>
                                                <div className="card-title">
                                                    <span className="title-icon" style={{ fontSize: '20px' }}>✨</span>
                                                    <h2 style={{ fontSize: '20px' }}>Create</h2>
                                                </div>
                                            </div>
                                            <div className="input-section" style={{ marginBottom: '15px' }}>
                                                <div className="section-label" style={{ fontSize: '12px' }}>
                                                    <span className="icon">📝</span><span>입력할 텍스트</span>
                                                </div>
                                                <textarea className="phrase-textarea" value="사랑합니다" readOnly style={{ height: '35px', fontSize: '12px', padding: '8px' }} />
                                                <div className="quick-tags" style={{ marginTop: '8px' }}>
                                                    <button className="tag-btn" style={{ fontSize: '10px', padding: '3px 8px' }}>사랑합니다</button>
                                                    <button className="tag-btn" style={{ fontSize: '10px', padding: '3px 8px' }}>감사합니다</button>
                                                </div>
                                            </div>
                                            <div className="input-section" style={{ marginBottom: '15px' }}>
                                                <div className="section-label" style={{ fontSize: '12px' }}>
                                                    <span className="icon">🎨</span><span>스타일</span>
                                                </div>
                                                <input type="text" className="style-input" value="힘있는 붓터치" readOnly style={{ height: '35px', fontSize: '12px', padding: '0 10px' }} />
                                            </div>
                                            <button className="main-generate-btn" style={{ height: '45px', fontSize: '14px', background: '#007aff', color: 'white', cursor: 'default' }}>
                                                <span className="icon">✨</span><span>생성하기</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="guide-text-area">
                                    <div className="step-number">02</div>
                                    <h3>문구 & 스타일 입력</h3>
                                    <p>원하는 메시지를 입력하고<br />'힘있는', '부드러운' 등 스타일을 고르세요.</p>
                                </div>
                            </div>

                            {/* Step 3: AI 생성 & 선택 (Real UI Clone) */}
                            <div className="guide-card">
                                <div className="guide-visual-area">
                                    <div className="ui-clone-wrapper preview-clone">
                                        <div className="preview-card" style={{ boxShadow: 'none', border: 'none', padding: '20px', height: '100%' }}>
                                            <div className="preview-header">
                                                <h2 style={{ fontSize: '18px' }}>Preview</h2>
                                            </div>
                                            <div className="preview-body" style={{ margin: '10px 0', padding: '0', background: 'transparent' }}>
                                                <img src={slide1} alt="Generated" className="preview-image" style={{ width: 'auto', height: '100%', maxHeight: '180px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="guide-text-area">
                                    <div className="step-number">03</div>
                                    <h3>AI 생성 & 선택</h3>
                                    <p>AI가 그려준 여러 시안 중<br />가장 마음에 드는 것을 선택하세요.</p>
                                </div>
                            </div>

                            {/* Step 4: 소장 및 공유 (Real UI Clone) */}
                            <div className="guide-card">
                                <div className="guide-visual-area">
                                    <div className="ui-clone-wrapper history-clone">
                                        <div className="preview-card" style={{ boxShadow: 'none', border: 'none', padding: '20px', height: '100%' }}>
                                            <div className="action-row" style={{ marginBottom: '20px' }}>
                                                <button className="action-btn wishlist" style={{ height: '40px', fontSize: '12px' }}>
                                                    <span className="icon">♡</span> 위시리스트
                                                </button>
                                                <button className="action-btn download" style={{ height: '40px', fontSize: '12px' }}>
                                                    <span className="icon">⬇</span> 다운로드
                                                </button>
                                            </div>
                                            <div className="history-card" style={{ padding: '0', boxShadow: 'none' }}>
                                                <div className="history-header" style={{ marginBottom: '10px' }}>
                                                    <span className="icon">🕒</span><h2 style={{ fontSize: '16px' }}>History</h2>
                                                </div>
                                                <div className="history-list" style={{ padding: '0 0 10px 0', justifyContent: 'flex-start' }}>
                                                    <div className="history-item" style={{ width: '90px', minWidth: '90px', height: '110px' }}>
                                                        <img src={slide1} alt="h1" />
                                                    </div>
                                                    <div className="history-item" style={{ width: '90px', minWidth: '90px', height: '110px' }}>
                                                        <div style={{ width: '100%', height: '100%', background: '#eee', borderRadius: '8px' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="guide-text-area">
                                    <div className="step-number">04</div>
                                    <h3>소장 및 공유</h3>
                                    <p>위시리스트에 담거나 다운로드하여<br />소중한 사람들과 공유하세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="tab-pane fade-in pricing-pane">
                        <section className="pricing-header">
                            <h2>Plan & Pricing</h2>
                            <p>부담 없는 가격으로 나만의 작품을 소장하세요.</p>
                        </section>

                        <div className="pricing-grid">
                            {/* Welcome Benefit */}
                            <div className="pricing-card free">
                                <div className="badge">WELCOME</div>
                                <h3>신규 회원 혜택</h3>
                                <div className="price">
                                    <span className="amount">3</span>
                                    <span className="unit">회 무료</span>
                                </div>
                                <p className="desc">가입 시 즉시 제공</p>
                                <ul className="features">
                                    <li><span className="check">✔</span> <b>가입 직후</b> 3회 생성 무료</li>
                                    <li><span className="check">✔</span> 체험해보고 결정하세요</li>
                                    <li><span className="check">✔</span> (다운로드는 토큰 필요)</li>
                                </ul>
                            </div>

                            {/* Service Usage Cost */}
                            <div className="pricing-card basic">
                                <div className="badge popular">이용 안내</div>
                                <h3>서비스 이용료</h3>
                                <div className="price">
                                    <span className="unit">토큰 차감 시스템</span>
                                </div>
                                <p className="desc">필요한 만큼만 사용하세요</p>
                                <ul className="features">
                                    <li><span className="check">✔</span> <b>이미지 생성</b> : 5 토큰 / 회</li>
                                    <li><span className="check">✔</span> <b>다운로드</b> &nbsp;&nbsp;&nbsp;: 20 토큰 / 회</li>
                                    <li><span className="check">✔</span> 고해상도 + 워터마크 제거</li>
                                </ul>
                            </div>

                            {/* Token Charging */}
                            <div className="pricing-card pro">
                                <div className="badge">CHARGE</div>
                                <h3>토큰 충전</h3>
                                <div className="price">
                                    <span className="unit">1,000원 ~</span>
                                </div>
                                <p className="desc">간편하고 합리적인 충전</p>
                                <ul className="features">
                                    <li><span className="check">✔</span> 최소 1,000원부터 충전 가능</li>
                                    <li><span className="check">✔</span> 언제든 사용 가능한 영구 토큰</li>
                                    <li><span className="check">✔</span> 다양한 결제 수단 지원</li>
                                </ul>
                                <button className="pricing-btn primary">충전하러 가기</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceInfo;
