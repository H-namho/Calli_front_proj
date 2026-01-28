import React, { useEffect, useMemo, useState } from "react";
import "../css/CreateCalli.css";
import ImageModal from "../components/ImageModal";
import ReviewModal from "../components/ReviewModal";
import { api } from "./api";
import bgBlack from "../assets/bg_black.png";
import bgGray from "../assets/bg_gray.png";
import bgPastel from "../assets/bg_pastel.png";
import bgWhite from "../assets/bg_white.png";

export default function CreateCalli({
  onGoHome,
  tokenCount,
  setTokenCount,
  freeCredits,
  setFreeCredits,
  onGoToCharge,
  onAddReview,
  refreshUserStatus,
  onReviewSubmitted,
}) {
  // =========================
  // 1) 입력 상태
  // =========================
  const [text, setText] = useState("");
  const [styleInput, setStyleInput] = useState("");
  const [bgStyle, setBgStyle] = useState(""); // Black/Gray/Pastel/White
  const [selectedRatio, setSelectedRatio] = useState("1:1");

  // =========================
  // 2) 생성/프리뷰 상태
  // =========================
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generatedCalliId, setGeneratedCalliId] = useState(null);
  const [lastGeneratedText, setLastGeneratedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // =========================
  // 3) 히스토리 (sessionStorage)
  // =========================
  const HISTORY_KEY = "create_history_session_v1";
  const HISTORY_MAX = 5; // ✅ 5개 고정 (6번째 생성하면 가장 오래된 거 자동 삭제)

  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =========================
  // 4) 모달
  // =========================
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const openPreviewModal = (imgSrc) => {
    if (!imgSrc) return;
    setPreviewModalImage(imgSrc);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewModalImage(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // =========================
  // 5) 추천 프리셋
  // =========================
  const quickPhrases = useMemo(
    () => ["사랑합니다", "행복한 하루", "감사합니다", "축하합니다", "새해 복 많이 받으세요"],
    []
  );

  const stylePresets = useMemo(
    () => [
      "굵고 힘있는 붓터치, 강렬한 느낌",
      "가늘고 흐르는 듯한 곡선, 우아한 느낌",
      "튀는 듯한 필체, 생동감 있는 느낌",
      "먹의 번짐을 살린 전통 서예 스타일",
    ],
    []
  );

  // ✅ 배경 4개 선택(카드)
  // const backgroundOptions = useMemo(
  //   () => [
  //     { id: 1, label: "검은색 배경", value: "Black", image: "/assets/bg_black.png" },
  //     { id: 2, label: "그레이톤 배경", value: "Gray", image: "/assets/bg_gray.png" },
  //     { id: 3, label: "파스텔 배경", value: "Pastel", image: "/assets/bg_pastel.png" },
  //     { id: 4, label: "화이트톤 배경", value: "White", image: "/assets/bg_white.png" },
  //   ],
  //   []
  // );
  const backgroundOptions = useMemo(
    () => [
      { id: 1, label: "검은색 배경", value: "Black", image: bgBlack },
      { id: 2, label: "그레이톤 배경", value: "Gray", image: bgGray },
      { id: 3, label: "파스텔 배경", value: "Pastel", image: bgPastel },
      { id: 4, label: "화이트톤 배경", value: "White", image: bgWhite },
    ],
    []
  );

  const ratios = useMemo(() => ["1:1", "2:3", "3:2", "3:4", "4:3"], []);

  const handleQuickPhrase = (phrase) => setText(phrase);
  const handleStylePreset = (preset) => setStyleInput(preset);
  const handleBgSelect = (value) => setBgStyle(value);

  // =========================
  // 유틸
  // =========================
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ratioToSize = (ratio) => 1;

  /**
   * ✅ 프리뷰 폴링
   * - 대기: 409
   * - 완료: { url }
   */
  const pollPreviewUntilReady = async (calliId) => {
    const maxTry = 150;
    const intervalMs = 1500;

    for (let i = 0; i < maxTry; i++) {
      try {
        const res = await api.get(`/${calliId}/preview`);
        const url = res?.data?.url;

        if (url) return { ok: true, url };
        await sleep(intervalMs);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 409) {
          await sleep(intervalMs);
          continue;
        }
        const msg = err?.response?.data?.message || err?.response?.data?.msg || "프리뷰 조회 실패";
        return { ok: false, msg };
      }
    }

    return { ok: false, msg: "이미지 생성이 지연되고 있어요. 잠시 후 다시 시도해주세요." };
  };

  // ✅ sessionStorage 저장
  const saveHistoryToSession = (nextHistory) => {
    setHistory(nextHistory);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  };

  // =========================
  // ✅ 생성 버튼
  // =========================
  const handleGenerate = async () => {
    setErrorMsg("");

    if (!text.trim() || !styleInput.trim() || !bgStyle.trim()) {
      setErrorMsg("텍스트/스타일/배경을 모두 입력해주세요.");
      return;
    }

    // ✅ UI 선차감 (너 방식 유지)
    if (freeCredits > 0) {
      setFreeCredits((prev) => prev - 1);
    } else {
      if (Number(tokenCount) < 5) {
        if (window.confirm("토큰이 부족합니다. 충전 페이지로 이동하시겠습니까?")) {
          onGoToCharge?.();
        }
        return;
      }
      setTokenCount((prev) => prev - 5);
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGeneratedCalliId(null);

    try {
      const payload = {
        textPrompt: text,
        stylePrompt: styleInput,
        bgPrompt: bgStyle,
        size: ratioToSize(selectedRatio),
      };

      const genRes = await api.post("/generation", payload);
      const data = genRes?.data;
      const calliId = data?.calliId || data; // 백엔드 DTO 객체면 calliId 추출, 아니면 통째로(Legacy)

      if (!calliId) {
        setErrorMsg("생성 ID(calliId)를 받지 못했습니다.");
        return;
      }

      setGeneratedCalliId(calliId);
      setLastGeneratedText(text);

      const polled = await pollPreviewUntilReady(calliId);
      if (!polled.ok) {
        setErrorMsg(polled.msg);
        return;
      }

      setGeneratedImageUrl(polled.url);

      // ✅ 히스토리 저장 (최근순 + 5개 유지)
      const newItem = {
        calliId,
        imageUrl: polled.url,
        text: data?.textPrompt || data?.Textprompt || text,
        style: data?.stylePrompt || data?.Styleprompt || styleInput,
        bg: bgStyle,
        ratio: selectedRatio,
        createdAt: Date.now(),
      };

      // ✅ 최근 생성이 맨 앞 / 같은 calliId 있으면 제거 후 갱신
      const deduped = [newItem, ...history.filter((h) => h.calliId !== calliId)];
      // ✅ 5개까지만 유지 (6번째 생성하면 오래된거 탈락)
      const limited = deduped.slice(0, HISTORY_MAX);
      saveHistoryToSession(limited);

      // ✅ 생성 성공 시 토큰 정보 최신화
      refreshUserStatus?.();
    } catch (err) {
      console.log("❌ generation error:", err);
      setErrorMsg(err?.response?.data?.msg || err?.response?.data?.message || "이미지 생성 요청 실패");
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================
  // ✅ 다운로드
  // =========================
  const handleDownload = async () => {
    setErrorMsg("");

    if (!generatedCalliId) {
      setErrorMsg("다운로드할 이미지가 없습니다. 먼저 이미지를 생성하세요.");
      return;
    }
    if (!window.confirm("다운로드 하시겠습니까?\n(다운로드 시 토큰이 차감될 수 있습니다)")) return;

    try {
      // ✅ Axios로 Blob 데이터를 직접 받아옴
      const res = await api.get(`/${generatedCalliId}/download`, {
        responseType: "blob",
      });

      // ✅ 파일명 추출 (Content-Disposition 확인)
      let fileName = `calligraphy_${generatedCalliId}.png`;
      const disposition = res.headers["content-disposition"];
      if (disposition && disposition.indexOf("filename*=") !== -1) {
        const parts = disposition.split("filename*=");
        if (parts.length > 1) {
          fileName = decodeURIComponent(parts[1].split("''")[1] || "").replace(/%20/g, " ");
        }
      }

      // ✅ 브라우저 메모리에 Blob URL 생성 후 다운로드 트리거
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // ✅ 다운로드 트리거 후 정리 및 상태 업데이트
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);

        // ✅ 다운로드 성공 시 토큰 정보 실시간 최신화
        refreshUserStatus?.();

        // ✅ 리뷰 모달 표시 (localStorage 체크)
        const hideReview = localStorage.getItem('hideReviewModal');
        if (!hideReview) {
          setReviewModalOpen(true);
        }
      }, 100);
    } catch (err) {
      console.error("❌ download error:", err);

      // ✅ 만약 에러 메시지가 Blob 형태로 왔다면 텍스트로 변환해서 보여줌
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          alert(reader.result || "다운로드 중 오류가 발생했습니다.");
        };
        reader.readAsText(err.response.data);
      } else {
        alert(err.response?.data || "다운로드 요청 실패");
      }
    }
  };

  // =========================
  // ✅ 위시리스트
  // =========================
  const handleWishlistClick = async () => {
    setErrorMsg("");

    if (!generatedCalliId) {
      alert("생성된 이미지가 없습니다.");
      return;
    }

    try {
      await api.post(`/${generatedCalliId}`);
      alert("위시리스트에 담았습니다! 마이페이지 > 위시리스트에서 확인하세요.");
    } catch (err) {
      console.log("❌ wishlist error:", err);
      alert(err?.response?.data?.msg || "이미 위시리스트에 추가된 이미지 입니다.");
    }
  };

  // =========================
  // ✅ 히스토리 클릭: 상태 복원
  // =========================
  const handleHistoryClick = (item) => {
    if (!item) return;

    setGeneratedImageUrl(item.imageUrl || null);
    setGeneratedCalliId(item.calliId || null);

    setText(item.text || "");
    setStyleInput(item.style || "");
    setBgStyle(item.bg || "");
    setSelectedRatio(item.ratio || "1:1");
    setErrorMsg("");
  };

  // ✅ 히스토리 삭제
  const handleHistoryRemove = (keyToRemove) => {
    const next = history.filter((h) => String(h.calliId ?? h.createdAt) !== String(keyToRemove));
    saveHistoryToSession(next);

    if (String(generatedCalliId) === String(keyToRemove)) {
      setGeneratedCalliId(null);
      setGeneratedImageUrl(null);
    }
  };

  const getButtonText = () => {
    if (isGenerating) return "생성 중...";
    const baseText = lastGeneratedText && text === lastGeneratedText ? "재생성하기" : "생성하기";
    if (freeCredits <= 0) return `${baseText} (토큰 5개 차감)`;
    return baseText;
  };

  // ✅ 배경 value -> label 매핑
  const bgLabelMap = useMemo(() => {
    const map = {};
    backgroundOptions.forEach((b) => (map[b.value] = b.label));
    return map;
  }, [backgroundOptions]);

  // ✅ 히스토리 5칸 고정 (비어있는 칸 placeholder로 채움)
  const historySlots = useMemo(() => {
    const filled = [...history];
    while (filled.length < HISTORY_MAX) filled.push(null);
    return filled.slice(0, HISTORY_MAX);
  }, [history]);

  return (
    <div className="create-calli-page-inner">
      {/* ✅ 로딩 오버레이 */}
      {isGenerating && (
        <div className="calli-loading-overlay">
          <div className="calli-loading-box">
            <div className="calli-spinner" />
            <div className="calli-loading-text">
              AI가 캘리그라피를 그리고 있어요...<br />
              (서버 상황에 따라 10~60초 이상 걸릴 수 있어요)
            </div>
          </div>

          <style>{`
            .calli-loading-overlay{
              position: fixed; inset:0;
              background: rgba(0,0,0,0.35);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index: 9999;
            }
            .calli-loading-box{
              background: rgba(255,255,255,0.92);
              border-radius: 16px;
              padding: 22px 18px;
              width: min(340px, 86vw);
              text-align:center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.18);
            }
            .calli-spinner{
              width: 44px; height: 44px;
              border-radius: 50%;
              border: 5px solid rgba(0,0,0,0.12);
              border-top-color: rgba(0,0,0,0.65);
              margin: 0 auto 12px auto;
              animation: calliSpin 0.9s linear infinite;
            }
            @keyframes calliSpin { to { transform: rotate(360deg); } }
            .calli-loading-text{
              font-size: 14px;
              color: #222;
              line-height: 1.35;
              font-weight: 600;
            }
          `}</style>
        </div>
      )}

      <div className="create-container">
        {/* 좌측 입력 */}
        <div className="input-card">
          <div className="card-header">
            <div className="card-title">
              <span className="title-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </span>
              <h2>Create</h2>
            </div>

            <div className="card-info">
              {freeCredits > 0 && <span className="info-item pink">무료 {freeCredits}회</span>}
              <span className="info-item blue">잔여 토큰 : {tokenCount}</span>
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: "#ff4d4f", marginBottom: "10px", fontSize: "14px" }}>
              {errorMsg}
            </div>
          )}

          {/* 텍스트 */}
          <div className="input-section">
            <div className="section-label">
              <span>입력할 텍스트</span>
              <span className="limit">{text.length}/20</span>
            </div>

            <textarea
              className="phrase-textarea"
              placeholder="캘리그라피로 만들 텍스트를 입력하세요"
              value={text}
              maxLength={20}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="quick-tags">
              {quickPhrases.map((phrase) => (
                <button type="button" key={phrase} className="tag-btn" onClick={() => handleQuickPhrase(phrase)}>
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* 스타일 */}
          <div className="input-section">
            <div className="section-label">
              <span>캘리그라피 스타일</span>
              <span className="limit">{styleInput.length}/100</span>
            </div>

            <textarea
              className="style-input"
              placeholder="예: 힘있고 강렬한 느낌, 굵은 붓터치"
              value={styleInput}
              maxLength={100}
              onChange={(e) => setStyleInput(e.target.value)}
            />

            <div className="quick-tags">
              {stylePresets.map((preset) => (
                <button type="button" key={preset} className="tag-btn" onClick={() => handleStylePreset(preset)}>
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 배경 4개 선택 */}
          <div className="input-section">
            <div className="section-label">
              <span>배경 스타일</span>
              <span className="limit" style={{ marginLeft: "auto" }}>
                {bgStyle ? bgLabelMap[bgStyle] : "선택하세요"}
              </span>
            </div>

            <div className="bg-grid">
              {backgroundOptions.map((option) => (
                <div
                  key={option.id}
                  className={`bg-card ${bgStyle === option.value ? "selected" : ""}`}
                  onClick={() => handleBgSelect(option.value)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="bg-card-image">
                    <img src={option.image} alt={option.label} />
                  </div>
                  <div className="bg-card-label">{option.label}</div>
                  {bgStyle === option.value && <div className="bg-check-overlay">✔</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 비율 */}
          <div className="ratio-section">
            <div className="section-label">이미지 비율</div>
            <div className="ratio-buttons">
              {ratios.map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  className={`ratio-btn ${selectedRatio === ratio ? "active" : ""}`}
                  onClick={() => setSelectedRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="main-generate-btn"
            disabled={!text.trim() || !styleInput.trim() || !bgStyle.trim() || isGenerating}
            onClick={handleGenerate}
          >
            <span>{getButtonText()}</span>
          </button>
        </div>

        {/* 우측 프리뷰 + 히스토리 */}
        <div className="display-area">
          <div className="preview-card">
            <div className="preview-header">
              <h2>Preview</h2>
            </div>

            <div className="preview-body">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated Calligraphy"
                  className="preview-image"
                  style={{ aspectRatio: selectedRatio.replace(":", "/"), cursor: "pointer" }}
                  onClick={() => openPreviewModal(generatedImageUrl)}
                  title="클릭하여 크게 보기"
                />
              ) : (
                <p>캘리그라피를 생성하면 여기에 미리보기가 표시됩니다</p>
              )}
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="action-btn wishlist" onClick={handleWishlistClick} disabled={!generatedCalliId}>
              <span className="icon">♡</span> 위시리스트
            </button>

            <button type="button" className="action-btn download" onClick={handleDownload} disabled={!generatedCalliId}>
              <span className="icon">⬇</span> 다운로드
            </button>
          </div>

          {/* ✅ History */}
          <div className="history-card">
            <div className="history-header">
              <span className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>

              <h2>History</h2>

              {/* ✅ 2/5 표기 */}
              <span className="history-count">
                {Math.min(history.length, HISTORY_MAX)}/{HISTORY_MAX}
              </span>
            </div>

            <div className="history-body">
              <div className="history-list">
                {historySlots.map((item, idx) => {
                  // ✅ 빈칸 placeholder
                  if (!item) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="history-item history-empty-slot"
                        aria-hidden="true"
                      />
                    );
                  }

                  const key = item.calliId ? String(item.calliId) : String(item.createdAt);
                  const isSelected = String(item.calliId) === String(generatedCalliId);

                  return (
                    <div
                      key={key}
                      className={`history-item ${isSelected ? "selected" : ""}`}
                      title="클릭하여 불러오기"
                      onClick={() => handleHistoryClick(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={item.imageUrl} alt={`history-${key}`} />

                      <div className="history-overlay">
                        <div className="history-title">{item.text || "텍스트 없음"}</div>
                        <div className="history-sub">
                          {bgLabelMap[item.bg] || item.bg} · {item.ratio}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="history-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHistoryRemove(key);
                        }}
                        title="이 항목 삭제"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {history.length === 0 && (
                <div className="history-empty-text"></div>
              )}
            </div>
          </div>

          <ImageModal
            isOpen={previewModalOpen}
            onClose={closePreviewModal}
            imageUrl={previewModalImage}
            ratio={selectedRatio}
          />

          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            onSubmit={async ({ rating, content }) => {
              try {
                // ✅ 백엔드 DTO: { calliId, rating, content }
                await api.post('/write', {
                  calliId: generatedCalliId,
                  rating,
                  content
                });
                onReviewSubmitted?.();
              } catch (err) {
                console.error('❌ 리뷰 제출 실패:', err);
                throw err;
              }
            }}
            onNeverShowAgain={() => {
              localStorage.setItem('hideReviewModal', 'true');
              setReviewModalOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import "../css/CreateCalli.css";
// import ImageModal from "../components/ImageModal";
// import { api } from "./api";
// import bgBlack from "../assets/bg_black.png";
// import bgGray from "../assets/bg_gray.png";
// import bgPastel from "../assets/bg_pastel.png";
// import bgWhite from "../assets/bg_white.png";

// export default function CreateCalli({
//   onGoHome,
//   tokenCount,
//   setTokenCount,
//   freeCredits,
//   setFreeCredits,
//   onGoToCharge,
//   onAddReview,
//   refreshUserStatus,
// }) {
//   // =========================
//   // 1) 입력 상태
//   // =========================
//   const [text, setText] = useState("");
//   const [styleInput, setStyleInput] = useState("");
//   const [bgStyle, setBgStyle] = useState(""); // Black/Gray/Pastel/White
//   const [selectedRatio, setSelectedRatio] = useState("1:1");

//   // =========================
//   // 2) 생성/프리뷰 상태
//   // =========================
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
//   const [generatedCalliId, setGeneratedCalliId] = useState(null);
//   const [lastGeneratedText, setLastGeneratedText] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");

//   // =========================
//   // 3) 히스토리 (sessionStorage)
//   // =========================
//   const HISTORY_KEY = "create_history_session_v1";
//   const HISTORY_MAX = 5; // ✅ 5개 고정 (6번째 생성하면 가장 오래된 거 자동 삭제)

//   const [history, setHistory] = useState(() => {
//     try {
//       const saved = sessionStorage.getItem(HISTORY_KEY);
//       return saved ? JSON.parse(saved) : [];
//     } catch {
//       return [];
//     }
//   });

//   // =========================
//   // 4) 모달
//   // =========================
//   const [previewModalOpen, setPreviewModalOpen] = useState(false);
//   const [previewModalImage, setPreviewModalImage] = useState(null);

//   const openPreviewModal = (imgSrc) => {
//     if (!imgSrc) return;
//     setPreviewModalImage(imgSrc);
//     setPreviewModalOpen(true);
//   };

//   const closePreviewModal = () => {
//     setPreviewModalOpen(false);
//     setPreviewModalImage(null);
//   };

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // =========================
//   // 5) 추천 프리셋
//   // =========================
//   const quickPhrases = useMemo(
//     () => ["사랑합니다", "행복한 하루", "감사합니다", "축하합니다", "새해 복 많이 받으세요"],
//     []
//   );

//   const stylePresets = useMemo(
//     () => [
//       "굵고 힘있는 붓터치, 강렬한 느낌",
//       "가늘고 흐르는 듯한 곡선, 우아한 느낌",
//       "튀는 듯한 필체, 생동감 있는 느낌",
//       "먹의 번짐을 살린 전통 서예 스타일",
//     ],
//     []
//   );

//   // ✅ 배경 4개 선택(카드)
//   // const backgroundOptions = useMemo(
//   //   () => [
//   //     { id: 1, label: "검은색 배경", value: "Black", image: "/assets/bg_black.png" },
//   //     { id: 2, label: "그레이톤 배경", value: "Gray", image: "/assets/bg_gray.png" },
//   //     { id: 3, label: "파스텔 배경", value: "Pastel", image: "/assets/bg_pastel.png" },
//   //     { id: 4, label: "화이트톤 배경", value: "White", image: "/assets/bg_white.png" },
//   //   ],
//   //   []
//   // );
//   const backgroundOptions = useMemo(
//     () => [
//       { id: 1, label: "검은색 배경", value: "Black", image: bgBlack },
//       { id: 2, label: "그레이톤 배경", value: "Gray", image: bgGray },
//       { id: 3, label: "파스텔 배경", value: "Pastel", image: bgPastel },
//       { id: 4, label: "화이트톤 배경", value: "White", image: bgWhite },
//     ],
//     []
//   );

//   const ratios = useMemo(() => ["1:1", "2:3", "3:2", "3:4", "4:3"], []);

//   const handleQuickPhrase = (phrase) => setText(phrase);
//   const handleStylePreset = (preset) => setStyleInput(preset);
//   const handleBgSelect = (value) => setBgStyle(value);

//   // =========================
//   // 유틸
//   // =========================
//   const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
//   const ratioToSize = (ratio) => 1;

//   /**
//    * ✅ 프리뷰 폴링
//    * - 대기: 409
//    * - 완료: { url }
//    */
//   const pollPreviewUntilReady = async (calliId) => {
//     const maxTry = 150;
//     const intervalMs = 1500;

//     for (let i = 0; i < maxTry; i++) {
//       try {
//         const res = await api.get(`/${calliId}/preview`);
//         const url = res?.data?.url;

//         if (url) return { ok: true, url };
//         await sleep(intervalMs);
//       } catch (err) {
//         const status = err?.response?.status;
//         if (status === 409) {
//           await sleep(intervalMs);
//           continue;
//         }
//         const msg = err?.response?.data?.message || err?.response?.data?.msg || "프리뷰 조회 실패";
//         return { ok: false, msg };
//       }
//     }

//     return { ok: false, msg: "이미지 생성이 지연되고 있어요. 잠시 후 다시 시도해주세요." };
//   };

//   // ✅ sessionStorage 저장
//   const saveHistoryToSession = (nextHistory) => {
//     setHistory(nextHistory);
//     sessionStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
//   };

//   // =========================
//   // ✅ 생성 버튼
//   // =========================
//   const handleGenerate = async () => {
//     setErrorMsg("");

//     if (!text.trim() || !styleInput.trim() || !bgStyle.trim()) {
//       setErrorMsg("텍스트/스타일/배경을 모두 입력해주세요.");
//       return;
//     }

//     // ✅ UI 선차감 (너 방식 유지)
//     if (freeCredits > 0) {
//       setFreeCredits((prev) => prev - 1);
//     } else {
//       if (Number(tokenCount) < 5) {
//         if (window.confirm("토큰이 부족합니다. 충전 페이지로 이동하시겠습니까?")) {
//           onGoToCharge?.();
//         }
//         return;
//       }
//       setTokenCount((prev) => prev - 5);
//     }

//     setIsGenerating(true);
//     setGeneratedImageUrl(null);
//     setGeneratedCalliId(null);

//     try {
//       const payload = {
//         textPrompt: text,
//         stylePrompt: styleInput,
//         bgPrompt: bgStyle,
//         size: ratioToSize(selectedRatio),
//       };

//       const genRes = await api.post("/generation", payload);
//       const calliId = genRes?.data;

//       if (!calliId) {
//         setErrorMsg("생성 ID(calliId)를 받지 못했습니다.");
//         return;
//       }

//       setGeneratedCalliId(calliId);
//       setLastGeneratedText(text);

//       const polled = await pollPreviewUntilReady(calliId);
//       if (!polled.ok) {
//         setErrorMsg(polled.msg);
//         return;
//       }

//       setGeneratedImageUrl(polled.url);

//       // ✅ 히스토리 저장 (최근순 + 5개 유지)
//       const newItem = {
//         calliId,
//         imageUrl: polled.url,
//         text,
//         style: styleInput,
//         bg: bgStyle,
//         ratio: selectedRatio,
//         createdAt: Date.now(),
//       };

//       // ✅ 최근 생성이 맨 앞 / 같은 calliId 있으면 제거 후 갱신
//       const deduped = [newItem, ...history.filter((h) => h.calliId !== calliId)];
//       // ✅ 5개까지만 유지 (6번째 생성하면 오래된거 탈락)
//       const limited = deduped.slice(0, HISTORY_MAX);
//       saveHistoryToSession(limited);

//       // ✅ 생성 성공 시 토큰 정보 최신화
//       refreshUserStatus?.();
//     } catch (err) {
//       console.log("❌ generation error:", err);
//       setErrorMsg(err?.response?.data?.msg || err?.response?.data?.message || "이미지 생성 요청 실패");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // =========================
//   // ✅ 다운로드
//   // =========================
//   const handleDownload = async () => {
//     setErrorMsg("");

//     if (!generatedCalliId) {
//       setErrorMsg("다운로드할 이미지가 없습니다. 먼저 이미지를 생성하세요.");
//       return;
//     }
//     if (!window.confirm("다운로드 하시겠습니까?\n(다운로드 시 토큰이 차감될 수 있습니다)")) return;

//     try {
//       // ✅ Axios로 Blob 데이터를 직접 받아옴
//       const res = await api.get(`/${generatedCalliId}/download`, {
//         responseType: "blob",
//       });

//       // ✅ 파일명 추출 (Content-Disposition 확인)
//       let fileName = `calligraphy_${generatedCalliId}.png`;
//       const disposition = res.headers["content-disposition"];
//       if (disposition && disposition.indexOf("filename*=") !== -1) {
//         const parts = disposition.split("filename*=");
//         if (parts.length > 1) {
//           fileName = decodeURIComponent(parts[1].split("''")[1] || "").replace(/%20/g, " ");
//         }
//       }

//       // ✅ 브라우저 메모리에 Blob URL 생성 후 다운로드 트리거
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", fileName);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);

//       // ✅ 다운로드 성공 시 토큰 정보 실시간 최신화
//       refreshUserStatus?.();
//     } catch (err) {
//       console.error("❌ download error:", err);

//       // ✅ 만약 에러 메시지가 Blob 형태로 왔다면 텍스트로 변환해서 보여줌
//       if (err.response?.data instanceof Blob) {
//         const reader = new FileReader();
//         reader.onload = () => {
//           alert(reader.result || "다운로드 중 오류가 발생했습니다.");
//         };
//         reader.readAsText(err.response.data);
//       } else {
//         alert(err.response?.data || "다운로드 요청 실패");
//       }
//     }
//   };

//   // =========================
//   // ✅ 위시리스트
//   // =========================
//   const handleWishlistClick = async () => {
//     setErrorMsg("");

//     if (!generatedCalliId) {
//       alert("생성된 이미지가 없습니다.");
//       return;
//     }

//     try {
//       await api.post(`/${generatedCalliId}`);
//       alert("위시리스트에 담았습니다! 마이페이지 > 위시리스트에서 확인하세요.");
//     } catch (err) {
//       console.log("❌ wishlist error:", err);
//       alert(err?.response?.data?.msg || "이미 위시리스트에 추가된 이미지 입니다.");
//     }
//   };

//   // =========================
//   // ✅ 히스토리 클릭: 상태 복원
//   // =========================
//   const handleHistoryClick = (item) => {
//     if (!item) return;

//     setGeneratedImageUrl(item.imageUrl || null);
//     setGeneratedCalliId(item.calliId || null);

//     setText(item.text || "");
//     setStyleInput(item.style || "");
//     setBgStyle(item.bg || "");
//     setSelectedRatio(item.ratio || "1:1");
//     setErrorMsg("");
//   };

//   // ✅ 히스토리 삭제
//   const handleHistoryRemove = (keyToRemove) => {
//     const next = history.filter((h) => String(h.calliId ?? h.createdAt) !== String(keyToRemove));
//     saveHistoryToSession(next);

//     if (String(generatedCalliId) === String(keyToRemove)) {
//       setGeneratedCalliId(null);
//       setGeneratedImageUrl(null);
//     }
//   };

//   const getButtonText = () => {
//     if (isGenerating) return "생성 중...";
//     const baseText = lastGeneratedText && text === lastGeneratedText ? "재생성하기" : "생성하기";
//     if (freeCredits <= 0) return `${baseText} (토큰 5개 차감)`;
//     return baseText;
//   };

//   // ✅ 배경 value -> label 매핑
//   const bgLabelMap = useMemo(() => {
//     const map = {};
//     backgroundOptions.forEach((b) => (map[b.value] = b.label));
//     return map;
//   }, [backgroundOptions]);

//   // ✅ 히스토리 5칸 고정 (비어있는 칸 placeholder로 채움)
//   const historySlots = useMemo(() => {
//     const filled = [...history];
//     while (filled.length < HISTORY_MAX) filled.push(null);
//     return filled.slice(0, HISTORY_MAX);
//   }, [history]);

//   return (
//     <div className="create-calli-page-inner">
//       {/* ✅ 로딩 오버레이 */}
//       {isGenerating && (
//         <div className="calli-loading-overlay">
//           <div className="calli-loading-box">
//             <div className="calli-spinner" />
//             <div className="calli-loading-text">
//               AI가 캘리그라피를 그리고 있어요...<br />
//               (서버 상황에 따라 10~60초 이상 걸릴 수 있어요)
//             </div>
//           </div>

//           <style>{`
//             .calli-loading-overlay{
//               position: fixed; inset:0;
//               background: rgba(0,0,0,0.35);
//               display:flex;
//               align-items:center;
//               justify-content:center;
//               z-index: 9999;
//             }
//             .calli-loading-box{
//               background: rgba(255,255,255,0.92);
//               border-radius: 16px;
//               padding: 22px 18px;
//               width: min(340px, 86vw);
//               text-align:center;
//               box-shadow: 0 10px 30px rgba(0,0,0,0.18);
//             }
//             .calli-spinner{
//               width: 44px; height: 44px;
//               border-radius: 50%;
//               border: 5px solid rgba(0,0,0,0.12);
//               border-top-color: rgba(0,0,0,0.65);
//               margin: 0 auto 12px auto;
//               animation: calliSpin 0.9s linear infinite;
//             }
//             @keyframes calliSpin { to { transform: rotate(360deg); } }
//             .calli-loading-text{
//               font-size: 14px;
//               color: #222;
//               line-height: 1.35;
//               font-weight: 600;
//             }
//           `}</style>
//         </div>
//       )}

//       <div className="create-container">
//         {/* 좌측 입력 */}
//         <div className="input-card">
//           <div className="card-header">
//             <div className="card-title">
//               <span className="title-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
//                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
//                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M12 20h9"></path>
//                   <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
//                 </svg>
//               </span>
//               <h2>Create</h2>
//             </div>

//             <div className="card-info">
//               {freeCredits > 0 && <span className="info-item pink">무료 {freeCredits}회</span>}
//               <span className="info-item blue">잔여 토큰 : {tokenCount}</span>
//             </div>
//           </div>

//           {errorMsg && (
//             <div style={{ color: "#ff4d4f", marginBottom: "10px", fontSize: "14px" }}>
//               {errorMsg}
//             </div>
//           )}

//           {/* 텍스트 */}
//           <div className="input-section">
//             <div className="section-label">
//               <span>입력할 텍스트</span>
//               <span className="limit">{text.length}/20</span>
//             </div>

//             <textarea
//               className="phrase-textarea"
//               placeholder="캘리그라피로 만들 텍스트를 입력하세요"
//               value={text}
//               maxLength={20}
//               onChange={(e) => setText(e.target.value)}
//             />

//             <div className="quick-tags">
//               {quickPhrases.map((phrase) => (
//                 <button type="button" key={phrase} className="tag-btn" onClick={() => handleQuickPhrase(phrase)}>
//                   {phrase}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* 스타일 */}
//           <div className="input-section">
//             <div className="section-label">
//               <span>캘리그라피 스타일</span>
//               <span className="limit">{styleInput.length}/100</span>
//             </div>

//             <textarea
//               className="style-input"
//               placeholder="예: 힘있고 강렬한 느낌, 굵은 붓터치"
//               value={styleInput}
//               maxLength={100}
//               onChange={(e) => setStyleInput(e.target.value)}
//             />

//             <div className="quick-tags">
//               {stylePresets.map((preset) => (
//                 <button type="button" key={preset} className="tag-btn" onClick={() => handleStylePreset(preset)}>
//                   {preset}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* 배경 4개 선택 */}
//           <div className="input-section">
//             <div className="section-label">
//               <span>배경 스타일</span>
//               <span className="limit" style={{ marginLeft: "auto" }}>
//                 {bgStyle ? bgLabelMap[bgStyle] : "선택하세요"}
//               </span>
//             </div>

//             <div className="bg-grid">
//               {backgroundOptions.map((option) => (
//                 <div
//                   key={option.id}
//                   className={`bg-card ${bgStyle === option.value ? "selected" : ""}`}
//                   onClick={() => handleBgSelect(option.value)}
//                   role="button"
//                   tabIndex={0}
//                 >
//                   <div className="bg-card-image">
//                     <img src={option.image} alt={option.label} />
//                   </div>
//                   <div className="bg-card-label">{option.label}</div>
//                   {bgStyle === option.value && <div className="bg-check-overlay">✔</div>}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 비율 */}
//           <div className="ratio-section">
//             <div className="section-label">이미지 비율</div>
//             <div className="ratio-buttons">
//               {ratios.map((ratio) => (
//                 <button
//                   type="button"
//                   key={ratio}
//                   className={`ratio-btn ${selectedRatio === ratio ? "active" : ""}`}
//                   onClick={() => setSelectedRatio(ratio)}
//                 >
//                   {ratio}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <button
//             type="button"
//             className="main-generate-btn"
//             disabled={!text.trim() || !styleInput.trim() || !bgStyle.trim() || isGenerating}
//             onClick={handleGenerate}
//           >
//             <span>{getButtonText()}</span>
//           </button>
//         </div>

//         {/* 우측 프리뷰 + 히스토리 */}
//         <div className="display-area">
//           <div className="preview-card">
//             <div className="preview-header">
//               <h2>Preview</h2>
//             </div>

//             <div className="preview-body">
//               {generatedImageUrl ? (
//                 <img
//                   src={generatedImageUrl}
//                   alt="Generated Calligraphy"
//                   className="preview-image"
//                   style={{ aspectRatio: selectedRatio.replace(":", "/"), cursor: "pointer" }}
//                   onClick={() => openPreviewModal(generatedImageUrl)}
//                   title="클릭하여 크게 보기"
//                 />
//               ) : (
//                 <p>캘리그라피를 생성하면 여기에 미리보기가 표시됩니다</p>
//               )}
//             </div>
//           </div>

//           <div className="action-row">
//             <button type="button" className="action-btn wishlist" onClick={handleWishlistClick} disabled={!generatedCalliId}>
//               <span className="icon">♡</span> 위시리스트
//             </button>

//             <button type="button" className="action-btn download" onClick={handleDownload} disabled={!generatedCalliId}>
//               <span className="icon">⬇</span> 다운로드
//             </button>
//           </div>

//           {/* ✅ History */}
//           <div className="history-card">
//             <div className="history-header">
//               <span className="icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
//                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
//                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <circle cx="12" cy="12" r="10"></circle>
//                   <polyline points="12 6 12 12 16 14"></polyline>
//                 </svg>
//               </span>

//               <h2>History</h2>

//               {/* ✅ 2/5 표기 */}
//               <span className="history-count">
//                 {Math.min(history.length, HISTORY_MAX)}/{HISTORY_MAX}
//               </span>
//             </div>

//             <div className="history-body">
//               <div className="history-list">
//                 {historySlots.map((item, idx) => {
//                   // ✅ 빈칸 placeholder
//                   if (!item) {
//                     return (
//                       <div
//                         key={`empty-${idx}`}
//                         className="history-item history-empty-slot"
//                         aria-hidden="true"
//                       />
//                     );
//                   }

//                   const key = item.calliId ? String(item.calliId) : String(item.createdAt);
//                   const isSelected = String(item.calliId) === String(generatedCalliId);

//                   return (
//                     <div
//                       key={key}
//                       className={`history-item ${isSelected ? "selected" : ""}`}
//                       title="클릭하여 불러오기"
//                       onClick={() => handleHistoryClick(item)}
//                       role="button"
//                       tabIndex={0}
//                     >
//                       <img src={item.imageUrl} alt={`history-${key}`} />

//                       <div className="history-overlay">
//                         <div className="history-title">{item.text || "텍스트 없음"}</div>
//                         <div className="history-sub">
//                           {bgLabelMap[item.bg] || item.bg} · {item.ratio}
//                         </div>
//                       </div>

//                       <button
//                         type="button"
//                         className="history-remove-btn"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleHistoryRemove(key);
//                         }}
//                         title="이 항목 삭제"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>

//               {history.length === 0 && (
//                 <div className="history-empty-text"></div>
//               )}
//             </div>
//           </div>

//           <ImageModal
//             isOpen={previewModalOpen}
//             onClose={closePreviewModal}
//             imageUrl={previewModalImage}
//             ratio={selectedRatio}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
