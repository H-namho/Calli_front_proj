import React, { useState, useEffect } from "react";
import "../css/FindAccount.css";

import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";

import { api } from "./api";

/**
 * ✅ 백엔드 엔드포인트(유지)
 * - POST /api/findid
 * - POST /api/changepw  ✅ (loginId, userName, userEmail, newPw) 전송 (프론트 변경)
 */
export default function FindAccount({ onGoLogin }) {
  // 탭 상태
  const [recoveryType, setRecoveryType] = useState("id");

  // 입력값
  const [userId, setUserId] = useState("");       // loginId
  const [userName, setUserName] = useState("");   // userName
  const [userEmail, setUserEmail] = useState(""); // userEmail

  // ✅ [수정] PW 찾기에서 "한 번에 변경"이므로 비번 입력도 항상 state로 유지
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // 서버 메시지
  const [serverMsg, setServerMsg] = useState("");
  const [serverError, setServerError] = useState("");

  // 유효성 에러
  const [idError, setIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pwError, setPwError] = useState("");
  const [matchError, setMatchError] = useState("");

  // 슬라이드
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const clearServerMessages = () => {
    setServerMsg("");
    setServerError("");
  };

  // 아이디 유효성
  const handleIdChange = (e) => {
    const val = e.target.value;
    setUserId(val);
    clearServerMessages();

    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (koreanRegex.test(val)) {
      setIdError("아이디는 영문, 숫자, 특수문자만 입력 가능합니다.");
    } else {
      setIdError("");
    }
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    clearServerMessages();
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setUserEmail(val);
    clearServerMessages();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) setEmailError("");
    else if (!emailRegex.test(val)) setEmailError("올바른 이메일 형식이 아닙니다.");
    else setEmailError("");
  };

  // 비밀번호 규칙
  const handlePwChange = (e) => {
    const val = e.target.value;
    setNewPw(val);
    clearServerMessages();

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (!val) setPwError("");
    else if (!pwRegex.test(val)) setPwError("영문+숫자 포함 8자 이상이어야 합니다.");
    else setPwError("");

    if (confirmPw && val !== confirmPw) setMatchError("비밀번호가 일치하지 않습니다.");
    else setMatchError("");
  };

  const handleConfirmPwChange = (e) => {
    const val = e.target.value;
    setConfirmPw(val);
    clearServerMessages();

    if (!val) setMatchError("");
    else if (newPw && val !== newPw) setMatchError("비밀번호가 일치하지 않습니다.");
    else setMatchError("");
  };

  // ID 찾기 (기존 유지)
  const requestFindId = async () => {
    const res = await api.post("/findid", { userEmail });
    return res.data; // loginId 문자열
  };

  // ✅ [수정] PW 변경 요청: 한 번에 변경 호출
  const requestChangePw = async () => {
    const body = {
      loginId: userId,
      userName,
      userEmail,
      newPw, // ✅ [수정] 새 비밀번호 포함 (백 DTO에도 필드 필요)
    };

    const res = await api.post("/changepw", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    setServerError("");

    // ✅ 공통 유효성
    if (!userName.trim()) return setServerError("이름을 입력해주세요.");
    if (!userEmail.trim()) return setServerError("이메일을 입력해주세요.");
    if (emailError) return;

    // =========================
    // ✅ ID 찾기
    // =========================
    if (recoveryType === "id") {
      try {
        const loginId = await requestFindId();
        setServerMsg(`찾은 아이디: ${loginId}`);
      } catch (err) {
        const msg = err?.response?.data?.msg || "아이디 찾기에 실패했습니다.";
        setServerError(msg);
      }
      return;
    }

    // =========================
    // ✅ PW 변경 (한 번에)
    // =========================
    // ✅ [수정] PW 탭이면 아이디+비번까지 전부 검사
    if (!userId.trim()) return setServerError("아이디를 입력해주세요.");
    if (idError) return;

    if (!newPw || !confirmPw) return setServerError("새 비밀번호를 입력해주세요.");
    if (pwError || matchError) return;

    try {
      const data = await requestChangePw();
      const okMsg =
        typeof data === "string" ? data : (data?.msg || "비밀번호 변경 완료");
      setServerMsg(okMsg);
         // ✅ [추가] 성공 시 알림 + 메인/로그인 이동
      alert("변경이 완료되었습니다");
      onGoLogin?.(); // ✅ 메인 화면(또는 로그인)으로 이동
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data ||
        "비밀번호 변경에 실패했습니다.";
      setServerError(typeof msg === "string" ? msg : "비밀번호 변경에 실패했습니다.");
    }
  };

  const handleTabChange = (type) => {
    setRecoveryType(type);

    // 초기화
    setUserId("");
    setUserName("");
    setUserEmail("");

    // ✅ [수정] 비밀번호 입력도 함께 초기화
    setNewPw("");
    setConfirmPw("");
    setPwError("");
    setMatchError("");

    setIdError("");
    setEmailError("");

    setServerMsg("");
    setServerError("");
  };

  return (
    <div className="recovery-screen-inner">
      <div className="recovery-card">
        {/* 왼쪽 */}
        <div className="recovery-left">
          <div className="recovery-header">
            <h1 className="recovery-logo-text">Calli For You</h1>
            <p className="recovery-subtitle">make my calligraphy</p>
          </div>

          <div className="recovery-tabs">
            <button
              className={`tab-button ${recoveryType === "id" ? "active" : ""}`}
              onClick={() => handleTabChange("id")}
              type="button"
            >
              아이디 찾기
            </button>
            <button
              className={`tab-button ${recoveryType === "pw" ? "active" : ""}`}
              onClick={() => handleTabChange("pw")}
              type="button"
            >
              비밀번호 변경
            </button>
          </div>

          <form className="recovery-form" onSubmit={handleSubmit}>
            <div className="recovery-inputs-area">
              {/* ✅ [수정] PW 탭이면 아이디 입력도 항상 표시 */}
              {recoveryType === "pw" && (
                <div className="input-group">
                  <label htmlFor="recoveryId">아이디</label>
                  <input
                    type="text"
                    id="recoveryId"
                    placeholder="아이디를 입력하세요"
                    value={userId}
                    onChange={handleIdChange}
                  />
                  {idError && (
                    <span style={{ color: "#ff4d4f", fontSize: 13, marginTop: 4, textAlign: "left" }}>
                      {idError}
                    </span>
                  )}
                </div>
              )}

              <div className="input-group">
                <label htmlFor="recoveryName">이름</label>
                <input
                  type="text"
                  id="recoveryName"
                  placeholder="이름을 입력하세요"
                  value={userName}
                  onChange={handleNameChange}
                />
              </div>

              <div className="input-group">
                <label htmlFor="recoveryEmail">이메일</label>
                <input
                  type="email"
                  id="recoveryEmail"
                  placeholder="이메일을 입력하세요"
                  value={userEmail}
                  onChange={handleEmailChange}
                />
                {emailError && (
                  <span style={{ color: "#ff4d4f", fontSize: 13, marginTop: 4, textAlign: "left" }}>
                    {emailError}
                  </span>
                )}
              </div>

              {/* ✅ [수정] PW 탭이면 비밀번호 입력도 같은 화면에서 바로 받음 */}
              {recoveryType === "pw" && (
                <>
                  <div className="input-group">
                    <label htmlFor="newPw">새 비밀번호</label>
                    <input
                      type="password"
                      id="newPw"
                      autoComplete="new-password"
                      placeholder="영문, 숫자 포함 8자 이상"
                      value={newPw}
                      onChange={handlePwChange}
                    />
                    {pwError && (
                      <span style={{ color: "#ff4d4f", fontSize: 13, marginTop: 4, textAlign: "left" }}>
                        {pwError}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmNewPw">새 비밀번호 확인</label>
                    <input
                      type="password"
                      id="confirmNewPw"
                      autoComplete="new-password"
                      placeholder="새 비밀번호를 다시 입력하세요"
                      value={confirmPw}
                      onChange={handleConfirmPwChange}
                    />
                    {matchError && (
                      <span style={{ color: "#ff4d4f", fontSize: 13, marginTop: 4, textAlign: "left" }}>
                        {matchError}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 서버 메시지 */}
            {serverError && (
              <div style={{ color: "#ff4d4f", fontSize: 13, marginTop: 8, textAlign: "left" }}>
                {serverError}
              </div>
            )}
            {serverMsg && (
              <div style={{ color: "#2ecc71", fontSize: 13, marginTop: 8, textAlign: "left" }}>
                {serverMsg}
              </div>
            )}

            <button type="submit" className="recovery-submit-button">
              {recoveryType === "id" ? "아이디 찾기" : "비밀번호 변경"}
            </button>

            {/* 아이디 찾기 성공 시 로그인 버튼 */}
            {recoveryType === "id" && serverMsg && (
              <button
                type="button"
                className="recovery-submit-button"
                style={{ marginTop: 10, background: "#333" }}
                onClick={onGoLogin}
              >
                로그인으로
              </button>
            )}
          </form>
        </div>

        {/* 오른쪽 */}
        <div className="recovery-right">
          <div className="recovery-slideshow-container">
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide}
                alt={`Sample ${index + 1}`}
                className={`recovery-slide-img ${index === currentSlide ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
