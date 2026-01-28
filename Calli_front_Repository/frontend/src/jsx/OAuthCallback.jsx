import React, { useEffect, useState } from "react";

// ✅ [추가] 전역 axios 인스턴스
import { api } from "./api";

/**
 * ✅ 소셜 로그인 콜백
 * - 백 OAuth2 성공 시: http://localhost:5173/oauth/callback 로 redirect
 * - 여기서 /user/me 호출 → 성공이면 App에 me 객체 전달(onLoginSuccess)
 */
export default function OAuthCallback({ onLoginSuccess, onGoHome }) {
  const [msg, setMsg] = useState("소셜 로그인 처리 중...");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const res = await api.get("/me");

        if (!mounted) return;

        if (res.data?.msg === "OK") {
          // ✅ [핵심] me 객체를 App으로 전달 → App에서 userName(userName 우선) 세팅
          onLoginSuccess?.(res.data);
          return;
        }

        setMsg("소셜 로그인 정보를 불러오지 못했습니다.");
      } catch (e) {
        if (!mounted) return;
        setMsg("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    };

    run();
    return () => { mounted = false; };
  }, [onLoginSuccess]);

  return (
    <div style={{ padding: 24 }}>
      <p>{msg}</p>
      <button onClick={onGoHome} style={{ marginTop: 12 }}>
        홈으로
      </button>
    </div>
  );
}
