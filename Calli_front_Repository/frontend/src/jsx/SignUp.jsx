// ✅ SignUp.jsx (상태박스 제거 + 문구로 인한 레이아웃 흔들림 방지)

import React, { useMemo, useState } from "react";
import "../css/SignUp.css";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "./termsData";
import { api } from "./api";

export default function SignUp({ onGoLogin }) {
  // =========================
  // 1) 약관 모달
  // =========================
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  const openModal = (title, content) => setModalState({ isOpen: true, title, content });
  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  // =========================
  // 2) 폼 데이터
  // =========================
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
    phone: "",
  });

  // =========================
  // 3) 약관 동의
  // =========================
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  // =========================
  // 4) 필드 에러
  // =========================
  const [errors, setErrors] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });

  // =========================
  // 5) 아이디 중복확인 상태
  // - status: "idle" | "needCheck" | "checking" | "ok" | "dup" | "error"
  // - message: 고정 영역에 표시될 문구
  // =========================
  const [idCheck, setIdCheck] = useState({
    status: "idle",
    message: "", // ✅ 아예 빈 값으로 시작 (공간은 유지)
  });

  // ✅ 정규식
  const idRegex = useMemo(() => /^[a-zA-Z0-9]{4,}$/, []);
  const pwRegex = useMemo(() => /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, []);
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // =========================
  // 유효성 검사
  // =========================
  const runValidation = (name, value, currentFormData) => {
    const data = currentFormData || formData;
    const val = value !== undefined ? value : data[name];
    const newErrors = { ...errors };

    if (name === "userId") {
      if (!val) newErrors.userId = "";
      else if (!idRegex.test(val)) newErrors.userId = "아이디는 영문/숫자 4자 이상이어야 합니다.";
      else newErrors.userId = "";
    }

    if (name === "password" || name === "passwordConfirm") {
      const targetPw = name === "password" ? val : data.password;
      const targetConfirm = name === "passwordConfirm" ? val : data.passwordConfirm;

      if (name === "password") {
        if (!val) newErrors.password = "";
        else if (!pwRegex.test(val)) newErrors.password = "비밀번호는 영문+숫자 포함 8자 이상이어야 합니다.";
        else newErrors.password = "";
      }

      if (targetPw && targetConfirm && targetPw !== targetConfirm) {
        newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      } else {
        newErrors.passwordConfirm = "";
      }
    }

    if (name === "email") {
      if (!val) newErrors.email = "";
      else if (!emailRegex.test(val)) newErrors.email = "올바른 이메일 형식이 아닙니다.";
      else newErrors.email = "";
    }

    setErrors(newErrors);
    return newErrors;
  };

  // =========================
  // 입력 변경
  // =========================
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    // 체크박스
    if (type === "checkbox") {
      const key = id === "termsAgree" ? "terms" : "privacy";
      setAgreements((prev) => ({ ...prev, [key]: checked }));
      return;
    }

    const keyMap = {
      signupId: "userId",
      signupPw: "password",
      signupPwConfirm: "passwordConfirm",
      signupName: "name",
      signupEmail: "email",
      signupPhone: "phone",
    };

    const key = keyMap[id];
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // ✅ 아이디가 바뀌면 중복확인 상태 초기화 (문구도 비움)
    if (key === "userId") {
      if (!value) {
        setIdCheck({ status: "idle", message: "" });
      } else if (!idRegex.test(value)) {
        setIdCheck({ status: "idle", message: "" }); // 형식은 errors.userId가 보여주므로 여기서는 비워도 됨
      } else {
        setIdCheck({ status: "needCheck", message: "중복확인을 눌러주세요." });
      }
    }

    runValidation(key, value, newFormData);
  };

  // 제출 직전 전체 검사
  const validateAll = () => {
    let currentErrors = { ...errors };
    ["userId", "password", "passwordConfirm", "email"].forEach((field) => {
      currentErrors = runValidation(field, formData[field], formData);
    });
    return !Object.values(currentErrors).some((msg) => msg !== "");
  };

  // =========================
  // 아이디 중복확인
  // =========================
  const handleCheckId = async () => {
    const v = formData.userId?.trim();

    if (!v) {
      setErrors((prev) => ({ ...prev, userId: "아이디를 입력해주세요." }));
      setIdCheck({ status: "idle", message: "" });
      return;
    }

    if (!idRegex.test(v)) {
      setErrors((prev) => ({ ...prev, userId: "아이디는 영문/숫자 4자 이상이어야 합니다." }));
      setIdCheck({ status: "idle", message: "" });
      return;
    }

    try {
      setIdCheck({ status: "checking", message: "중복 확인 중..." });

      const res = await api.post("/checkid", { loginId: v });

      setErrors((prev) => ({ ...prev, userId: "" }));
      setIdCheck({
        status: "ok",
        message: res.data?.msg || "사용가능한 아이디입니다.",
      });
    } catch (err) {
      const msg = err?.response?.data?.msg || "아이디 중복확인 중 오류가 발생했습니다.";

      const isDup = msg.includes("이미") || msg.includes("사용중") || msg.includes("중복");

      setIdCheck({
        status: isDup ? "dup" : "error",
        message: msg,
      });

      setErrors((prev) => ({ ...prev, userId: msg }));
    }
  };

  // ✅ 중복확인 버튼 활성화 조건
  const canCheckId = formData.userId && idRegex.test(formData.userId) && idCheck.status !== "checking";

  // ✅ 가입 버튼 활성화 조건
  const isFormIncomplete =
    !formData.userId ||
    !formData.password ||
    !formData.passwordConfirm ||
    !formData.name ||
    !formData.email ||
    !agreements.terms ||
    !agreements.privacy ||
    Object.values(errors).some((msg) => msg !== "") ||
    idCheck.status !== "ok";

  // =========================
  // 회원가입 submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormIncomplete || !validateAll()) return;

    try {
      const body = {
        loginId: formData.userId,
        loginPw: formData.password,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
      };

      const res = await api.post("/join", body);

      alert(res.data?.msg || "회원가입 성공");
      onGoLogin?.();
    } catch (err) {
      const msg = err?.response?.data?.msg || "회원가입 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="signup-screen-inner">
      <div className="signup-card full-width">
        <div className="signup-content">
          <div className="signup-header">
            <h1 className="signup-logo-text">Calli For You</h1>
            <p className="signup-subtitle">make my calligraphy</p>
          </div>

          <p className="required-info-text" style={{ fontSize: 13, color: "#ff4d94", marginBottom: 14 }}>
            *표시는 필수 입력 항목입니다.
          </p>

          <form className="signup-form-full" onSubmit={handleSubmit} noValidate>
            <div className="signup-fields-grid">
              <div className="grid-column">
                {/* ✅ 아이디 */}
                <div className="signup-input-group">
                  <label htmlFor="signupId">
                    아이디 <span className="required">*</span>
                  </label>

                  <div className="input-with-button">
                    <input
                      type="text"
                      id="signupId"
                      placeholder="영문, 숫자 4자 이상"
                      value={formData.userId}
                      onChange={handleChange}
                      className={errors.userId ? "input-error" : ""}
                      required
                    />
                    <button
                      type="button"
                      className="check-btn"
                      onClick={handleCheckId}
                      disabled={!canCheckId}
                      style={{
                        opacity: canCheckId ? 1 : 0.6,
                        cursor: canCheckId ? "pointer" : "not-allowed",
                      }}
                    >
                      {idCheck.status === "checking" ? "확인중..." : "중복확인"}
                    </button>
                  </div>

                  {/* ✅ 메시지 영역 고정: 여기서 레이아웃 흔들림 방지 */}
                  <div style={{ minHeight: 18, marginTop: 6 }}>
                    {errors.userId ? (
                      <span className="error-msg">{errors.userId}</span>
                    ) : idCheck.message ? (
                      <span
                        className={idCheck.status === "ok" ? "success-msg" : "help-msg"}
                        style={{
                          color:
                            idCheck.status === "ok"
                              ? "#16a34a"
                              : idCheck.status === "dup" || idCheck.status === "error"
                              ? "#ef4444"
                              : "#6b7280",
                          fontSize: 12,
                        }}
                      >
                        {idCheck.message}
                      </span>
                    ) : (
                      // ✅ 아무것도 없을 때도 공간 유지(빈 문자열)
                      <span style={{ fontSize: 12, color: "transparent" }}>placeholder</span>
                    )}
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="signup-input-group">
                  <label htmlFor="signupPw">
                    비밀번호 <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="signupPw"
                    placeholder="영문, 숫자 포함 8자 이상"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "input-error" : ""}
                    required
                  />
                  <div style={{ minHeight: 18, marginTop: 6 }}>
                    {errors.password ? (
                      <span className="error-msg">{errors.password}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "transparent" }}>placeholder</span>
                    )}
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="signup-input-group">
                  <label htmlFor="signupPwConfirm">
                    비밀번호 확인 <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="signupPwConfirm"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={errors.passwordConfirm ? "input-error" : ""}
                    required
                  />
                  <div style={{ minHeight: 18, marginTop: 6 }}>
                    {errors.passwordConfirm ? (
                      <span className="error-msg">{errors.passwordConfirm}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "transparent" }}>placeholder</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽 컬럼은 기존 그대로(원하면 여기에도 동일한 방식으로 메시지 고정 가능) */}
              <div className="grid-column">
                <div className="signup-input-group">
                  <label htmlFor="signupName">
                    이름 <span className="required">*</span>
                  </label>
                  <input type="text" id="signupName" placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="signup-input-group">
                  <label htmlFor="signupEmail">
                    이메일 <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="signupEmail"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                    required
                  />
                  <div style={{ minHeight: 18, marginTop: 6 }}>
                    {errors.email ? (
                      <span className="error-msg">{errors.email}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "transparent" }}>placeholder</span>
                    )}
                  </div>
                </div>

                <div className="signup-input-group">
                  <label htmlFor="signupPhone">휴대폰 번호</label>
                  <input type="tel" id="signupPhone" placeholder="01012345678" value={formData.phone} onChange={handleChange} />
                  <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>* 하이픈(-) 제외 11자리 숫자만 입력해주세요.</p>
                </div>
              </div>
            </div>

            <div className="signup-bottom-area">
              <div className="signup-agreements-horizontal">
                <div className="agreement-item">
                  <label className="signup-checkbox-label">
                    <input type="checkbox" id="termsAgree" checked={agreements.terms} onChange={handleChange} required />
                    <span>이용약관 동의 <span className="required">*</span></span>
                  </label>
                  <button type="button" className="view-terms-btn" onClick={() => openModal("이용약관", TERMS_OF_SERVICE)}>
                    내용 보기
                  </button>
                </div>

                <div className="agreement-item">
                  <label className="signup-checkbox-label">
                    <input type="checkbox" id="privacyAgree" checked={agreements.privacy} onChange={handleChange} required />
                    <span>개인정보처리방침 동의 <span className="required">*</span></span>
                  </label>
                  <button type="button" className="view-terms-btn" onClick={() => openModal("개인정보처리방침", PRIVACY_POLICY)}>
                    내용 보기
                  </button>
                </div>
              </div>

              <button type="submit" className="signup-submit-button" disabled={isFormIncomplete}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalState.isOpen && (
        <div className="signup-modal-overlay" onClick={closeModal}>
          <div className="signup-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalState.title}</h3>
            </div>
            <div className="modal-body">
              <pre className="terms-text">{modalState.content}</pre>
            </div>
            <div className="modal-footer">
              <button className="modal-bottom-close-btn" onClick={closeModal}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
