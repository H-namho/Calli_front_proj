import React, { useState } from 'react';
import '../css/MyPageAuth.css';
import { api } from './api';

export default function MyPageAuth({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setError('');
    setChecking(true);

    try {
      // ✅ 네 엔드포인트: POST /api/chkpw
      const chkpw = '/chkpw';

      // ✅ 백 DTO가 loginPw 받는다고 했으니 그대로
      const payload = { loginPw: password };

      const res = await api.post(chkpw, payload);

      // ✅ 성공 판정: msg="OK"를 최우선으로
      // (백이 그냥 200만 주는 경우도 있을 수 있어 보조로 200도 허용)
      const ok = res?.data?.msg === 'OK' || res?.status === 200;

      if (ok) {
        onSuccess?.();
      } else {
        setError(res?.data?.msg || '비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      setError(err?.response?.data?.msg || '비밀번호 확인에 실패했습니다.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mypage-inner">
      <div className="auth-container">
        <div className="auth-title-section">
          <h1 className="auth-title">본인 확인</h1>
          <p className="auth-subtitle">회원정보 수정을 위해 비밀번호를 입력해주세요</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">비밀번호</label>
            <input
              type="password"
              className="auth-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={checking}
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="auth-guide">
            <p>🔒 회원님의 정보를 안전하게 보호하기 위해</p>
            <p>비밀번호 확인이 필요합니다.</p>
          </div>

          <button type="submit" className="auth-btn" disabled={checking}>
            {checking ? '확인 중...' : '확인'}
          </button>
        </form>
      </div>
    </div>
  );
}
