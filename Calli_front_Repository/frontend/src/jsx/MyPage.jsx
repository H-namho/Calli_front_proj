// MyPage.jsx ✅ 최종본 (최근 이용내역 페이징 안정화 버전)
// - GET /api/showpage?page=0&size=10 호출 (page는 0부터)
// - 백 응답 키가 totalpage / totalPages 둘 다 대응
// - 다음/이전 버튼 disabled 조건 정확히 처리
// - 페이지 이동은 함수형 업데이트로 안정화
// - (주의) 화면 렌더링에서 map은 필수라 유지

import React, { useState, useEffect } from "react";
import "../css/MyPage.css";
import MyPageAuth from "./MyPageAuth";
import MyPageEdit from "./MyPageEdit";
import MyPageCharge from "./MyPageCharge";
import MyPageHistory from "./MyPageHistory";
import MyPageWishlist from "./MyPageWishlist";

import { api } from "./api";

export default function MyPage({
  loginId,
  userName,
  userEmail,
  userPhone = "010-0000-0000",

  onUpdateProfile,
  tokenCount = 0,
  setTokenCount,

  initialView = "dashboard",
  historyList,
  setHistoryList,
  wishlistItems,
  setWishlistItems,

  // ✅ 부모가 들고 있는 리스트 그대로 사용
  paymentHistory,
  setPaymentHistory,
}) {
  const [currentView, setCurrentView] = useState(initialView);

  // ✅ 페이징 상태
  const [payPage, setPayPage] = useState(0); // 0부터
  const [paySize, setPaySize] = useState(10);
  const [payTotalPages, setPayTotalPages] = useState(1); // ✅ 기본 1로(0이면 UI가 0/0처럼 보일 수 있음)

  // 로딩/에러
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  /**
   * ✅ 최근 이용 내역 페이징 조회
   * - GET /api/showpage?page={payPage}&size={paySize}
   * - 백 응답(예상):
   *   {
   *     content: [...],
   *     page: 0,
   *     size: 10,
   *     totalelement(or totalElements),
   *     totalpage(or totalPages),
   *     first,
   *     last
   *   }
   */
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setPayLoading(true);
      setPayError("");

      try {
        const res = await api.get("/showpage", {
          params: {
            page: payPage,
            size: paySize,
          },
        });

        const data = res && res.data ? res.data : {};

        // ✅ content
        const content = data && Array.isArray(data.content) ? data.content : [];

        // ✅ totalPages 키가 totalPages / totalpage 둘 다 대응
        let totalPagesValue = 1; // ✅ 최소 1
        if (typeof data.totalPages === "number") {
          totalPagesValue = data.totalPages;
        } else if (typeof data.totalpage === "number") {
          totalPagesValue = data.totalpage;
        } else if (typeof data.totalPage === "number") {
          // 혹시 키가 다르면 대비
          totalPagesValue = data.totalPage;
        }

        // ✅ totalPages가 0일 수도 있으니 최소 1 처리
        if (!totalPagesValue || totalPagesValue < 1) totalPagesValue = 1;

        setPayTotalPages(totalPagesValue);

        // ✅ 현재 페이지가 총 페이지 범위를 넘어가면 마지막 페이지로 보정
        if (payPage > totalPagesValue - 1) {
          setPayPage(totalPagesValue - 1);
          // 여기서 return하면 2번 호출처럼 보일 수 있어서, 그냥 아래도 수행 가능
        }

        // ✅ 프론트 표시 형태로 정규화(date/usage/credits)
        const normalized = [];
        for (let i = 0; i < content.length; i++) {
          const item = content[i];

          // 날짜 처리
          let dateText = "-";
          if (item && item.createdAt) {
            const d = new Date(item.createdAt);
            if (!isNaN(d.getTime())) {
              dateText = d.toLocaleDateString();
            } else {
              // LocalDateTime 파싱 실패 대비(문자열 앞 10자리)
              dateText = String(item.createdAt).slice(0, 10);
            }
          }

          // amount 처리
          let creditsNum = 0;
          if (item && typeof item.amount === "number") {
            creditsNum = item.amount;
          } else if (item && item.amount != null) {
            creditsNum = Number(item.amount);
          }

          normalized.push({
            date: dateText,
            usage: item && item.description ? item.description : "-",
            credits: creditsNum,
          });
        }

        setPaymentHistory(normalized);
      } catch (err) {
        console.log("❌ 결제/이용내역(페이징) 불러오기 실패:", err);
        setPayError("결제/이용내역을 불러오지 못했습니다.");
        setPaymentHistory([]);
        setPayTotalPages(1);
      } finally {
        setPayLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [payPage, paySize, setPaymentHistory]);

  // --------------------------
  // 핸들러
  // --------------------------
  const handleAuthSuccess = () => setCurrentView("edit");
  const handleEditCancel = () => setCurrentView("dashboard");

  const handleEditSave = (newData) => {
    if (onUpdateProfile) onUpdateProfile(newData);
    setCurrentView("dashboard");
  };

  const handleChargeComplete = (tokenAmount, price, method) => {
    setTokenCount(function (prev) {
      return prev + tokenAmount;
    });

    // ✅ UX: 현재 페이지가 0이면 상단에 즉시 추가 (정석은 재조회)
    if (payPage === 0) {
      const newHistory = {
        date: new Date().toLocaleDateString(),
        usage: method || "충전",
        credits: tokenAmount,
      };

      setPaymentHistory(function (prev) {
        const prevList = prev || [];
        return [newHistory, ...prevList];
      });
    }

    setCurrentView("dashboard");
  };

  const handleInfoEditClick = () => setCurrentView("auth");
  const handleChargeClick = () => setCurrentView("charge");

  const handleWishlistDownload = (items) => {
    const requiredTokens = items.length * 20;

    if (tokenCount < requiredTokens) {
      alert(
        `토큰이 부족합니다. (필요: ${requiredTokens}, 보유: ${tokenCount})\n충전 페이지로 이동하시겠습니까?`
      );
      return false;
    }

    setTokenCount(function (prev) {
      return prev - requiredTokens;
    });

    const newHistoryItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      newHistoryItems.push({
        id: Date.now() + Math.random(),
        imageUrl: item.imageUrl,
        inputText: item.title,
        createdAt: new Date().toISOString(),
        downloadCount: 1,
        maxDownload: 3,
      });
    }

    setHistoryList(function (prev) {
      const prevList = prev || [];
      return [...newHistoryItems, ...prevList];
    });

    alert(`${items.length}개 항목을 다운로드했습니다. (총 -${requiredTokens} 토큰)`);
    return true;
  };

  // ✅ 페이지 이동(이전/다음) - 함수형 업데이트
  const goPrevPayPage = () => {
    setPayPage(function (prev) {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  };

  const goNextPayPage = () => {
    setPayPage(function (prev) {
      // totalPages가 1이면 다음 없음
      if (payTotalPages <= 1) return prev;
      if (prev >= payTotalPages - 1) return prev;
      return prev + 1;
    });
  };

  // ✅ 버튼 disabled 계산(가독성)
  const isPrevDisabled = payPage <= 0;
  const isNextDisabled = payTotalPages <= 1 || payPage >= payTotalPages - 1;

  // --------------------------
  // 뷰 분기
  // --------------------------
  if (currentView === "auth") {
    return <MyPageAuth onSuccess={handleAuthSuccess} />;
  }

  if (currentView === "edit") {
    return (
      <MyPageEdit
        loginId={loginId}
        userName={userName}
        userEmail={userEmail}
        userPhone={userPhone}
        onCancel={handleEditCancel}
        onSave={handleEditSave}
      />
    );
  }

  if (currentView === "charge") {
    return (
      <MyPageCharge
        onCancel={() => setCurrentView("dashboard")}
        onChargeComplete={handleChargeComplete}
        currentTokens={tokenCount}
      />
    );
  }

  if (currentView === "history") {
    return <MyPageHistory historyList={historyList} setHistoryList={setHistoryList} />;
  }

  if (currentView === "wishlist") {
    return (
      <MyPageWishlist
        wishlistItems={wishlistItems}
        setWishlistItems={setWishlistItems}
        onDownloadRequest={handleWishlistDownload}
      />
    );
  }

  // --------------------------
  // 기본 대시보드
  // --------------------------
  return (
    <div className="mypage-inner">
      <div className="mypage-container">
        <div className="user-info-section">
          <h1 className="greeting-text">{userName}님, 안녕하세요!</h1>
          <div className="user-meta-info">
            <div className="meta-item"></div>
          </div>
        </div>

        <div className="mypage-card">
          <div className="card-header-row">
            <h3 className="card-title">내 정보</h3>
            <button className="edit-btn" onClick={handleInfoEditClick}>
              정보 수정
            </button>
          </div>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">이름</span>
              <span className="info-value">{userName}</span>
            </div>

            <div className="info-item">
              <span className="info-label">이메일</span>
              <span className="info-value">{userEmail}</span>
            </div>

            <div className="info-item">
              <span className="info-label">휴대폰 번호</span>
              <span className="info-value">{userPhone}</span>
            </div>

            <div className="info-item">
              <span className="info-label">보유 토큰</span>
              <span className="info-value">{tokenCount} 토큰</span>
            </div>
          </div>
        </div>

        <div className="mypage-card">
          <div className="card-header-row">
            <h3 className="card-title">최근 이용 내역</h3>

            {/* size 선택 */}
            <div className="pay-size-box">
              <span className="pay-size-label">표시</span>
              <select
                className="pay-size-select"
                value={paySize}
                onChange={(e) => {
                  // size 바꾸면 첫 페이지로
                  setPaySize(Number(e.target.value));
                  setPayPage(0);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="payment-history-container">
            {payLoading && <p className="empty-history-text">불러오는 중...</p>}

            {!payLoading && payError && (
              <p className="empty-history-text" style={{ color: "#ff4d4f" }}>
                {payError}
              </p>
            )}

            {!payLoading && !payError && paymentHistory && paymentHistory.length > 0 ? (
              <>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>이용내역</th>
                      <th>토큰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td className="history-date">{item.date}</td>
                        <td className="history-method">{item.usage}</td>
                        <td className="history-amount">{item.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 페이징 */}
                <div className="pay-pagination">
                  <button
                    type="button"
                    className="pay-page-btn"
                    onClick={goPrevPayPage}
                    disabled={isPrevDisabled}
                  >
                    이전
                  </button>

                  <span className="pay-page-info">
                    {payPage + 1} / {payTotalPages}
                  </span>

                  <button
                    type="button"
                    className="pay-page-btn"
                    onClick={goNextPayPage}
                    disabled={isNextDisabled}
                  >
                    다음
                  </button>
                </div>
              </>
            ) : (
              !payLoading &&
              !payError && (
                <>
                  <p className="empty-history-text">아직 이용 내역이 없습니다</p>
                  <button className="charge-link-btn" onClick={handleChargeClick}>
                    토큰 충전하기 →
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
