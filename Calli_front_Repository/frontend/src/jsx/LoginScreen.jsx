import React, { useState, useEffect } from "react";
import "../css/LoginScreen.css";

// 디자인 및 슬라이드 자산 이미지 임포트
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import kakaoIcon from "../assets/kakao.png";
import naverIcon from "../assets/naver.png";
import googleIcon from "../assets/google.png";

// ✅ 전역 axios 인스턴스 (baseURL: "/api")
import { api } from "./api";

/**
 * 로그인 화면 컴포넌트
 * @param {Function} onLoginSuccess - /me 응답 객체 전달
 */
export default function LoginScreen({ onGoHome, onFindAccount, onSignUp, onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  /**
   * ✅ 소셜 로그인 시작
   * - 운영(서버): http://49.50.128.91/oauth2/authorization/{provider}
   * - 로컬(개발): http://localhost:5173/oauth2/authorization/{provider} 로 요청되는데,
   *   백이 8083이라면 Vite proxy로 /oauth2도 백으로 보내줘야 함(아래 주석 참고)
   */
  const oauthLogin = (provider) => {
    // ✅ 운영(통합 서버)에서는 같은 도메인에서 바로 백으로 프록시되도록 "상대경로" 사용
    window.location.href = `/oauth2/authorization/${provider}`;

    // ✅ (로컬에서 절대주소로만 테스트하고 싶다면 이렇게도 가능)
    // window.location.href = `http://localhost:8083/oauth2/authorization/${provider}`;
  };

  /**
   * ✅ 일반 로그인 (Spring Security formLogin)
   * - SecurityConfig: loginProcessingUrl("/api/login")
   * - api.baseURL = "/api" 이므로 여기서는 "/login"만 호출해야 최종 "/api/login"이 됨
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !userPw.trim()) {
      setErrorMsg("아이디 또는 비밀번호를 입력해주세요.");
      return;
    }

    try {
      // ✅ formLogin은 x-www-form-urlencoded 형태가 가장 안전
      const params = new URLSearchParams();
      params.append("loginId", userId); // usernameParameter("loginId")
      params.append("loginPw", userPw); // passwordParameter("loginPw")

      // ❌ api.post("/api/login") 하면 /api/api/login 됨
      // ✅ api.baseURL="/api" 이므로 "/login" 호출 → 최종 "/api/login"
      await api.post("/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      // ✅ 로그인 직후 내 정보 조회
      // ❌ api.get("/api/me") 하면 /api/api/me 됨
      const meRes = await api.get("/me", { withCredentials: true });

      if (meRes.data?.msg === "OK") {
        setErrorMsg("");
        onLoginSuccess?.(meRes.data);
      } else {
        setErrorMsg("로그인 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.msg || "아이디 또는 비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <div className="login-screen-inner">
      <div className="login-card">
        {/* 1. 왼쪽: 로그인 입력 폼 및 SNS 버튼 영역 */}
        <div className="login-left">
          <div className="login-header">
            <h1 className="login-logo-text">Calli For You</h1>
            <p className="login-subtitle">make my calligraphy</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="userId">아이디</label>
              <input
                type="text"
                id="userId"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>

            <div className="input-group">
              <label htmlFor="userPw">비밀번호</label>
              <input
                type="password"
                id="userPw"
                placeholder="비밀번호를 입력하세요"
                value={userPw}
                onChange={(e) => {
                  setUserPw(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>

            {errorMsg && <div className="error-message">{errorMsg}</div>}

            <button type="submit" className="login-main-button">
              Login
            </button>
          </form>

          <div className="login-footer-links">
            <button className="text-button" onClick={onFindAccount}>
              아이디/비밀번호 찾기
            </button>
            <button className="text-button" onClick={onSignUp}>
              회원가입
            </button>
          </div>

          <div className="sns-login-divider">
            <span>또는</span>
          </div>

          <div className="sns-login-group">
            <button className="sns-button kakao" type="button" onClick={() => oauthLogin("kakao")}>
              <img src={kakaoIcon} alt="Kakao" />
            </button>
            <button className="sns-button naver" type="button" onClick={() => oauthLogin("naver")}>
              <img src={naverIcon} alt="Naver" />
            </button>
            <button className="sns-button google" type="button" onClick={() => oauthLogin("google")}>
              <img src={googleIcon} alt="Google" />
            </button>
          </div>
        </div>

        {/* 2. 오른쪽: 슬라이드쇼 */}
        <div className="login-right">
          <div className="login-slideshow-container">
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide}
                alt={`Sample ${index + 1}`}
                className={`login-slide-img ${index === currentSlide ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
