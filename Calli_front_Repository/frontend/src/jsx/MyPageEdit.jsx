import React, { useState, useEffect } from 'react';
import '../css/MyPageEdit.css';

// ✅ [유지] 전역 axios 인스턴스
import { api } from './api';

export default function MyPageEdit({
  // ✅ [권장] 상위에서 /api/me 로 받은 값 내려주는 구조
  loginId,
  userName,
  userEmail,
  userPhone,
  onCancel,
  onSave,
  onWithdraw
}) {
  /**
   * ✅ [수정] 하드코딩 제거
   * - userId: 'user1' 삭제
   * - 특정 유저(명수마을깡패) 예외처리 삭제
   *
   * ✅ [수정] 백 필드명에 맞게 formData 키 통일
   */
  const [formData, setFormData] = useState({
    loginId: loginId || '',
    password: '',
    passwordConfirm: '',
    userName: userName || '',
    userPhone: userPhone || '',
    userEmail: userEmail || ''
  });

  /**
   * ✅ [추가] props가 바뀌면(새로고침 후 세션복구 등) formData도 동기화
   * - 비밀번호 입력값은 사용자가 치는 값이라 유지
   */
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      loginId: loginId ?? prev.loginId,
      userName: userName ?? prev.userName,
      userPhone: userPhone ?? prev.userPhone,
      userEmail: userEmail ?? prev.userEmail,
    }));
  }, [loginId, userName, userEmail, userPhone]);

  // ✅ [추가] 저장 상태/에러 메시지
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 탈퇴 모달 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaveError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * ✅ [추가] 유효성 검사
   * - 비밀번호는 입력했을 때만 검사
   */
  const validate = () => {
    if (!formData.userName?.trim()) {
      setSaveError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.userEmail?.trim()) {
      setSaveError('이메일을 입력해주세요.');
      return false;
    }

    // ✅ 비밀번호 변경 원할 때만 검사
    if (formData.password) {
      const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!pwRegex.test(formData.password)) {
        setSaveError('비밀번호는 영문+숫자 포함 8자 이상이어야 합니다.');
        return false;
      }
      if (formData.password !== formData.passwordConfirm) {
        setSaveError('비밀번호가 일치하지 않습니다.');
        return false;
      }
    }
    return true;
  };

  /**
   * ✅ [핵심 수정] axios를 try 안에서 "딱 1번"만 호출
   * ✅ [수정] 엔드포인트 통일: /api/updateme
   * ✅ [삭제] api.post()를 변수에 넣어서 2번 호출되던 구조 제거
   */
  const handleSubmit = async () => {
    setSaveError('');
    if (!validate()) return;

    setSaving(true);
    try {
      // ✅ [수정] 네가 말한 엔드포인트로 통일
      const url = "/updateme";

      // ✅ [수정] payload는 UpdateDto 필드명에 맞춰 보내기
      // - 비밀번호는 입력했을 때만 전송 (undefined는 JSON에서 빠짐)
      const payload = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        loginPw: formData.password ? formData.password : undefined,
      };

      // ✅ axios 호출 1회만!
      await api.post(url, payload);

      // ✅ [추가] 저장 성공 시 비밀번호 입력칸 초기화 + 상위 상태 갱신
      setFormData(prev => ({
        ...prev,
        password: '',
        passwordConfirm: ''
      }));

      // ✅ 상위로는 "프로필 정보만" 전달 (상위 상태 꼬임 방지)
      const updatedProfile = {
        loginId: formData.loginId,
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
      };

      if (onSave) onSave(updatedProfile);



    } catch (err) {
      setSaveError(err?.response?.data?.msg || "회원정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
    setWithdrawStep(1);
    setWithdrawReason('');
    setCustomReason('');
  };

  const handleCloseWithdraw = () => setShowWithdrawModal(false);

  const handleNextStep = () => {
    if (!withdrawReason) {
      alert("탈퇴 사유를 선택해주세요.");
      return;
    }
    if (withdrawReason === 'direct' && !customReason.trim()) {
      alert("탈퇴 사유를 입력해주세요.");
      return;
    }
    setWithdrawStep(2);
  };

  /**
   * ✅ [정리] 탈퇴 API도 /api/...로 통일할 예정이면 여기만 바꾸면 됨
   * - 아직 백 엔드포인트 확정 전이라 TODO 유지
   */
  const handleFinalWithdraw = async () => {
    try {
      // ✅ [TODO] 너가 정한 탈퇴 엔드포인트로 바꿔
      const url = "/withdraw";

      const reasonPayload = {
        reason: withdrawReason === 'direct' ? customReason : withdrawReason,
      };

      await api.post(url, reasonPayload);

      if (onWithdraw) onWithdraw();
      handleCloseWithdraw();
    } catch (err) {
      alert(err?.response?.data?.msg || "회원 탈퇴에 실패했습니다.");
    }
  };

  return (
    <div className="mypage-inner">
      <div className="edit-container">
        <div className="edit-header">
          <h1 className="edit-title">회원 정보 수정</h1>
        </div>

        <div className="edit-form">
          {/* 아이디 */}


          {/* 비밀번호 */}
          <div className="edit-row">
            <label className="edit-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="edit-input"
              placeholder="변경할 비밀번호를 입력하세요(선택)"
              value={formData.password}
              onChange={handleChange}
            />
            <p className="edit-helper-text">8자 이상의 영문과 숫자를 조합해주세요</p>
          </div>

          {/* 비밀번호 확인 */}
          <div className="edit-row">
            <label className="edit-label">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              className="edit-input"
              placeholder="비밀번호를 한번 더 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            {formData.passwordConfirm && (
              <p className={`validation-msg ${formData.password === formData.passwordConfirm ? 'success' : 'error'}`}>
                {formData.password === formData.passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="edit-row">
            <label className="edit-label">이름</label>
            <div className="edit-input-wrapper">
              <input
                type="text"
                name="userName"
                className="edit-input"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 휴대폰 */}
          <div className="edit-row">
            <label className="edit-label">휴대폰 번호</label>
            <div className="edit-input-wrapper">
              <input
                type="text"
                name="userPhone"
                className="edit-input"
                placeholder="숫자만 입력해주세요"
                value={formData.userPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className="edit-row">
            <label className="edit-label">이메일</label>
            <div className="edit-input-wrapper">
              <input
                type="email"
                name="userEmail"
                className="edit-input"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="변경할 이메일을 입력하세요"
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {saveError && (
            <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 8, textAlign: 'left' }}>
              {saveError}
            </div>
          )}
        </div>

        <div className="edit-actions">
          <div className="edit-btn-group">
            <button className="cancel-btn" onClick={onCancel} disabled={saving}>취소</button>
            <button className="save-btn" onClick={handleSubmit} disabled={saving}>
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
          <button className="withdraw-btn" onClick={handleWithdrawClick} disabled={saving}>회원 탈퇴</button>
        </div>
      </div>

      {/* 탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="withdraw-modal-overlay" onClick={handleCloseWithdraw}>
          <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
            {withdrawStep === 1 ? (
              <>
                <h3 className="withdraw-title">회원 탈퇴</h3>
                <div className="withdraw-warning-box">
                  <strong>⚠ 탈퇴 시 유의사항</strong><br />
                  탈퇴 시 보유 중인 토큰이 모두 소멸되며, 다운로드 내역과 보관함의 작품들이 삭제되어 복구할 수 없습니다.
                </div>
                <div className="withdraw-reason-group">
                  <label>탈퇴 사유</label>
                  <select
                    className="withdraw-select"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                  >
                    <option value="">사유를 선택해주세요</option>
                    <option value="low_usage">사용 빈도가 낮음</option>
                    <option value="inconvenient">서비스 이용이 불편함</option>
                    <option value="better_service">타 서비스 이용 예정</option>
                    <option value="content_dissatisfied">컨텐츠 만족도 낮음</option>
                    <option value="direct">기타 (직접 입력)</option>
                  </select>

                  {withdrawReason === 'direct' && (
                    <textarea
                      className="withdraw-textarea"
                      placeholder="탈퇴 사유를 입력해주세요."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="withdraw-modal-actions">
                  <button className="withdraw-btn-prev" onClick={handleCloseWithdraw}>취소</button>
                  <button className="withdraw-btn-next" onClick={handleNextStep}>다음</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="withdraw-title">정말 탈퇴하시겠습니까?</h3>
                <div className="withdraw-desc">
                  지금 탈퇴하시면 <strong>모든 데이터가 영구적으로 삭제</strong>됩니다.<br />
                  그래도 탈퇴하시겠습니까?
                </div>
                <div className="withdraw-modal-actions">
                  <button className="withdraw-btn-prev" onClick={() => setWithdrawStep(1)}>이전</button>
                  <button className="withdraw-btn-final" onClick={handleFinalWithdraw}>탈퇴하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
