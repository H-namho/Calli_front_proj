import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../css/MainScreen.css';

import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';

import { api } from './api';

const MainScreen = forwardRef(({ onStart }, ref) => {
  // =========================
  // 1) 슬라이드
  // =========================
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // =========================
  // 2) 리뷰: GET /review (baseURL=/api)
  // =========================
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/review'); // ✅ /api/review 아님!
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews(list);
      } catch (err) {
        console.log('❌ 리뷰 불러오기 실패:', err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, []);

  // =========================
  // 3) FAQ
  // =========================
  const faqData = [
    { q: "캘리그라피 생성은 무료인가요?", a: "회원가입 후 무료 생성 3회가 제공되며, 생성/다운로드를 위한 추가 토큰은 결제를 통해 구매하실 수 있습니다." },
    { q: "생성된 캘리그라피의 저작권은 누구에게 있나요?", a: "생성된 캘리그라피의 저작권은 생성한 사용자에게 있으며, 개인 및 상업적 용도로 자유롭게 사용하실 수 있습니다." },
    { q: "여러 번 추가 다운로드가 가능한가요?", a: "첫 다운로드 후 마이페이지의 다운로드 내역에서 총 3회 추가 다운로드가 가능합니다. (단, 추가 다운로드 또한 토큰이 필요합니다.)" },
    { q: "생성 시간은 얼마나 걸리나요?", a: "일반적으로 10~30초 정도 소요되며, 서버 상황에 따라 다소 차이가 있을 수 있습니다." },
    { q: "마음에 드는 결과가 나오지 않으면 어떻게 하나요?", a: "감정 설명에 좀 더 구체적으로 작성하거나 재생성하기 버튼을 눌러 새로운 스타일을 시도해보세요. (단, 재생성 또한 토큰이 필요합니다.)" }
  ];

  // =========================
  // 4) 스크롤 애니메이션
  // =========================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
          else entry.target.classList.remove('visible');
        });
      },
      { threshold: 0.15 }
    );

    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach((target) => observer.observe(target));

    return () => targets.forEach((target) => observer.unobserve(target));
  }, []);

  // =========================
  // 5) 리뷰 Marquee 가공 (ReviewResponseDto 기준)
  // =========================
  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  // ✅ 네 DTO에 맞춘 normalize
  const normalizeReview = (r) => {
    const name = r?.maskedUserName || "익명";
    const rating = Number(r?.rating ?? 0);
    const text = r?.content || "";
    const initial = name?.slice(0, 1) || "U";

    // 간단 아바타 색상: reviewId/calliId로 결정(랜덤처럼 보이게)
    const seed = Number(r?.reviewId ?? r?.calliId ?? 0);
    const colors = ["avatar-blue", "avatar-pink", "avatar-green"];
    const color = colors[Math.abs(seed) % colors.length];

    return { name, rating, text, initial, color };
  };

  // 4점 이상만
  const bestReviews = (reviews || []).filter(r => Number(r?.rating ?? 0) >= 4);

  // 최소 5개 확보 후 무한흐름용 2배
  let displayReviews = [...bestReviews];
  if (displayReviews.length > 0) {
    while (displayReviews.length < 5) {
      displayReviews = [...displayReviews, ...bestReviews];
    }
  }
  const marqueeReviews = [...displayReviews, ...displayReviews];

  // =========================
  // 섹션 이동
  // =========================
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <div className="figma-main-screen">
      {/* 상단 배경 슬라이드쇼 */}
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
      </div>

      {/* 1. 히어로 */}
      <section className="main-section" id="intro">
        <div className="section-inner hero-section animate-on-scroll hero-animate">
          <span className="hero-label">당신의 감성을 담은</span>
          <h1 className="hero-title">아름다운 캘리그라피를 만들어보세요</h1>
          <p className="hero-description">
            텍스트와 원하는 분위기, 배경색을 입력하면<br />
            AI가 당신만의 독특한 캘리그라피를 생성합니다.
          </p>

          <div className="hero-nav-links">
            <button onClick={() => scrollToSection('how-to')} className="small-link-btn">이용 방법</button>
            <button onClick={() => scrollToSection('features')} className="small-link-btn">주요 기능</button>
            <button onClick={() => scrollToSection('reviews')} className="small-link-btn">사용자 평가</button>
            <button onClick={() => scrollToSection('faq')} className="small-link-btn">자주 묻는 질문</button>
          </div>

          <button className="cta-button large-cta" onClick={onStart}>
            <span>지금 시작하기 →</span>
          </button>
        </div>
      </section>

      {/* 2. 이용 방법 */}
      <section className="main-section colored-bg" id="how-to">
        <div className="section-inner info-section">
          <div className="section-header">
            <h2 className="section-title">이용 방법</h2>
            <p className="section-subtitle">간단한 3단계로 나만의 캘리그라피를 생성하세요</p>
          </div>

          <div className="info-grid usage-grid animate-on-scroll">
            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3 className="card-title">텍스트 입력</h3>
              <p className="card-text">캘리그라피로 만들고 싶은 문구를 자유롭게 입력하세요!</p>
            </div>

            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <h3 className="card-title">감성 선택</h3>
              <p className="card-text">원하는 분위기와 느낌을 자세하게 설명해주세요!</p>
            </div>

            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h3 className="card-title">배경 설정</h3>
              <p className="card-text">캘리그라피와 어울리는 배경색을 선택해주세요!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 주요 기능 */}
      <section className="main-section" id="features">
        <div className="section-inner info-section">
          <div className="section-header">
            <h2 className="section-title">주요 기능</h2>
            <p className="section-subtitle">Calli For You만의 특별한 기능들을 만나보세요</p>
          </div>

          <div className="info-grid features-grid animate-on-scroll">
            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 9v2a7 7 0 0 1-14 0V9"></path>
                  <path d="M12 18v4"></path>
                  <path d="M8 22h8"></path>
                </svg>
              </div>
              <h3 className="card-title">AI 기반 캘리그라피 생성</h3>
              <p className="card-text">최신 AI 기술은 당신의 감성을 담은 독특한 캘리그라피를 자동으로 생성합니다.</p>
            </div>

            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <h3 className="card-title">다양한 스타일 선택</h3>
              <p className="card-text">분위기, 배경색 등을 자유롭게 설정하여 원하는 스타일의 캘리그라피를 만들 수 있습니다.</p>
            </div>

            <div className="info-card">
              <div className="card-icon-large blue-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="card-title">고해상도 다운로드</h3>
              <p className="card-text">생성된 결과 이미지를 고해상도 이미지 파일로 다운로드하여 어디서나 활용하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 사용자 평가 */}
      <section className="main-section colored-bg scroll-section" id="reviews" style={{ overflow: 'hidden' }}>
        <div style={{ width: '100%' }}>
          <div className="section-header">
            <h2 className="section-title">사용자 평가</h2>
            <p className="section-subtitle">실제 사용자들의 생생한 후기를 확인해보세요</p>
          </div>

          <div className="marquee-wrapper">
            <div className="marquee-track">
              {marqueeReviews.length > 0 ? (
                marqueeReviews.map((r, index) => {
                  const review = normalizeReview(r);

                  // ✅ key는 reviewId가 있으면 그걸 우선 사용
                  const key = r?.reviewId ?? `${index}`;

                  return (
                    <div className="review-card marquee-item" key={key}>
                      <div className="user-info">
                        <div className={`user-avatar ${review.color}`}>{review.initial}</div>
                        <div>
                          <div className="username">{review.name}</div>
                          <div className="stars">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <p className="review-text">"{review.text}"</p>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 24, opacity: 0.7 }}> 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="main-section" id="faq">
        <div className="section-inner faq-section animate-on-scroll">
          <div className="section-header">
            <h2 className="section-title">자주 묻는 질문</h2>
          </div>

          <div className="faq-list">
            {faqData.map((item, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question">
                  <span className="q-label">Q.</span> {item.q}
                </div>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>

          <div className="bottom-nav-area">
            <button className="cta-button" onClick={onStart}>
              <span>지금 시작하기 →</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
);

export default MainScreen;
