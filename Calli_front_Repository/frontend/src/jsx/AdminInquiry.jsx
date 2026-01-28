import React, { useEffect, useMemo, useState } from "react";
import "../css/Admin.css";
import { api } from "./api";

const DEFAULT_ANSWER_TEMPLATE = `안녕하세요, Calli For You입니다.
우선 사용에 불편을 드려서 죄송합니다.
문의 주셨던 내용에 대하여 아래 답변 드리니 확인 부탁드리겠습니다.

`;

export default function AdminInquiry() {
  // ✅ 서버에서 받아온 문의 목록
  const [inquiries, setInquiries] = useState([]);

  // ✅ 선택된 문의
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // ✅ 답변 입력
  const [replyContent, setReplyContent] = useState("");

  // ✅ 탭
  const [activeTab, setActiveTab] = useState("all"); // all, waiting, processing, completed

  // ✅ UX 상태
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ 상태 정규화
  const normalizeStatus = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "completed") return "completed";
    if (s === "processing") return "processing";
    return "waiting";
  };

  // ✅ LocalDateTime 포맷
  const formatDate = (v) => {
    if (!v) return "-";
    return String(v).replace("T", " ").slice(0, 16);
  };

  // ✅ 상태 뱃지
  const renderStatusBadge = (status) => {
    const s = normalizeStatus(status);
    let label = "";
    let className = "";

    switch (s) {
      case "completed":
        label = "답변 완료";
        className = "badge-completed";
        break;
      case "processing":
        label = "답변 중";
        className = "badge-processing";
        break;
      default:
        label = "답변 대기";
        className = "badge-waiting";
        break;
    }

    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  // ✅ 서버에서 목록 불러오기
  const fetchInquiries = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      /**
       * ✅ 백엔드:
       * GET /api/Admin/show
       *
       * api baseURL이 "/api"면 => "/Admin/show"
       */
      const res = await api.get("/Admin/show");
      const data = res?.data ?? [];

      const sorted = [...data].sort((a, b) => (b.qid || 0) - (a.qid || 0));

      const normalized = sorted.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      }));

      setInquiries(normalized);
    } catch (err) {
      console.log("❌ Admin/show error:", err);
      setErrorMsg("문의 목록을 불러오지 못했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 첫 로딩
  useEffect(() => {
    fetchInquiries();
  }, []);

  // ✅ 탭별 필터
  const filteredInquiries = useMemo(() => {
    const list = inquiries.filter((item) => {
      if (activeTab === "all") return true;
      return normalizeStatus(item.status) === activeTab;
    });

    return list.sort((a, b) => (b.qid || 0) - (a.qid || 0));
  }, [inquiries, activeTab]);

  // ✅ 탭 개수 표시
  const tabCount = useMemo(() => {
    const total = inquiries.length;
    const waiting = inquiries.filter((x) => normalizeStatus(x.status) === "waiting").length;
    const processing = inquiries.filter((x) => normalizeStatus(x.status) === "processing").length;
    const completed = inquiries.filter((x) => normalizeStatus(x.status) === "completed").length;
    return { total, waiting, processing, completed };
  }, [inquiries]);

  // ✅ 상세보기 진입
  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);

    const ans = inquiry?.answer?.trim();
    setReplyContent(ans ? inquiry.answer : DEFAULT_ANSWER_TEMPLATE);
  };

  // ✅ 템플릿
  const REPLY_TEMPLATES = [
    {
      title: "확인 중입니다",
      icon: "🕒",
      content: "문의 주신 내용을 확인 중입니다. 빠른 시일 내에 답변드리겠습니다. 감사합니다.",
    },
    {
      title: "업데이트 예정",
      icon: "🛠️",
      content:
        "소중한 의견 감사합니다. 말씀하신 기능/문제는 다음 업데이트에 반영될 예정입니다. 더 나은 서비스를 제공할 수 있도록 노력하겠습니다. 감사합니다.",
    },
    {
      title: "문제 해결됨",
      icon: "✅",
      content:
        "해당 문제가 해결되었습니다. 불편을 드려 죄송합니다. 추가 문의사항이 있으시면 언제든지 연락 주세요.",
    },
  ];

  // ✅ 템플릿 추가 UX (뒤에 붙이기)
  const handleTemplateClick = (text) => {
    setReplyContent((prev) => {
      const base = prev?.trim() ? prev : DEFAULT_ANSWER_TEMPLATE;
      // 마지막 줄이 너무 붙지 않게 한 줄 띄우기
      return base + (base.endsWith("\n") ? "" : "\n") + text;
    });
  };

  // ✅ 상세 화면 닫기
  const handleCloseDetail = () => {
    setSelectedInquiry(null);
    setReplyContent("");
    setSaving(false);
    setErrorMsg("");
  };

  // ✅ 임시저장 (UX용: 서버 저장 X)
  const handleTempSave = () => {
    if (!selectedInquiry) return;

    if (!replyContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 템플릿만 있으면 waiting, 내용 추가되면 processing
    const isTemplateOnly = replyContent.trim() === DEFAULT_ANSWER_TEMPLATE.trim();
    const nextStatus = isTemplateOnly ? "waiting" : "processing";

    // ✅ 화면 즉시 반영
    setInquiries((prev) =>
      prev.map((x) =>
        x.qid === selectedInquiry.qid
          ? { ...x, answer: replyContent, status: nextStatus }
          : x
      )
    );

    setSelectedInquiry((prev) => ({
      ...prev,
      answer: replyContent,
      status: nextStatus,
    }));

    alert("임시 저장 완료! (현재는 화면에만 반영됨)");
  };

  // ✅ 답변 등록 (✅ 서버 POST 저장)
  const handleReplySubmit = async () => {
    if (!selectedInquiry) return;

    if (!replyContent.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    if (!window.confirm("답변을 등록하시겠습니까? 등록 후에는 수정할 수 없습니다.")) return;

    setSaving(true);
    setErrorMsg("");

    try {
      /**
       * ✅ 너 백엔드:
       * POST /api/{qId}/Admin/answer
       * body: { answer: "..." }
       */
      const qId = selectedInquiry.qid;

      await api.post(`/${qId}/Admin/answer`, {
        answer: replyContent,
      });

      // ✅ 성공하면 UI도 completed로 즉시 반영
      setInquiries((prev) =>
        prev.map((x) =>
          x.qid === qId ? { ...x, answer: replyContent, status: "completed" } : x
        )
      );

      setSelectedInquiry((prev) => ({
        ...prev,
        answer: replyContent,
        status: "completed",
      }));


      alert("답변 등록 완료 ✅");

      // ✅ 서버 최신 상태 반영하려면 새로고침 (추천)
      fetchInquiries();
    } catch (err) {
      console.log("❌ answer submit error:", err);
      setErrorMsg("답변 등록에 실패했습니다. 서버/권한/엔드포인트를 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 상세 화면 UX: 레이아웃(2컬럼)
  const detailLayoutStyle = {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "16px",
  };

  // ✅ 반응형 (모바일이면 1컬럼)
  const isMobile = window.innerWidth < 900;

  return (
    <div className="admin-inquiry-container">
      {/* ✅ 상단 UX 메시지 */}
      {errorMsg && (
        <div
          style={{
            padding: 12,
            marginBottom: 10,
            borderRadius: 12,
            background: "rgba(255,77,79,0.08)",
            color: "#ff4d4f",
            fontWeight: 800,
          }}
        >
          {errorMsg}
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: 12,
            marginBottom: 10,
            borderRadius: 12,
            background: "rgba(99,102,241,0.08)",
            color: "#333",
            fontWeight: 800,
          }}
        >
          문의 목록 불러오는 중...
        </div>
      )}

      {/* =========================
          ✅ 상세 화면
      ========================= */}
      {selectedInquiry ? (
        <div>
          {/* ✅ 상단 바 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <button
              className="cancel-btn"
              onClick={handleCloseDetail}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                fontWeight: 900,
              }}
            >
              ← 목록
            </button>

            <div style={{ fontWeight: 900, fontSize: 18 }}>
              문의 #{selectedInquiry.qid}
            </div>

            <div style={{ marginLeft: "auto" }}>
              {renderStatusBadge(selectedInquiry.status)}
            </div>
          </div>

          {/* ✅ 2컬럼 상세 레이아웃 */}
          <div style={isMobile ? { display: "grid", gap: 16 } : detailLayoutStyle}>
            {/* ✅ 왼쪽: 문의 내용 */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #edf1f5",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>문의 내용</div>
                <span style={{ marginLeft: "auto", color: "#999", fontWeight: 800 }}>
                  작성일: {formatDate(selectedInquiry.qat)}
                </span>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888", fontWeight: 900 }}>제목</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>
                    {selectedInquiry.qtitle}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 900 }}>작성자</div>
                    <div style={{ fontWeight: 800 }}>{selectedInquiry.writer || "-"}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 900 }}>카테고리</div>
                    <div style={{ fontWeight: 800 }}>{selectedInquiry.qcategory || "-"}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#888", fontWeight: 900 }}>내용</div>
                  <div
                    style={{
                      marginTop: 6,
                      background: "#f7f8fa",
                      border: "1px solid #eef1f4",
                      borderRadius: 14,
                      padding: 14,
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                      fontWeight: 700,
                      color: "#333",
                      minHeight: 160,
                    }}
                  >
                    {selectedInquiry.qcontent}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ 오른쪽: 답변 작성 */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #edf1f5",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>답변 작성</div>
                <span style={{ marginLeft: "auto", color: "#999", fontWeight: 800 }}>
                  상태: {normalizeStatus(selectedInquiry.status)}
                </span>
              </div>

              {/* ✅ 템플릿 */}
              {normalizeStatus(selectedInquiry.status) !== "completed" && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  {REPLY_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateClick(tpl.content)}
                      style={{
                        border: "1px solid #eef1f4",
                        borderRadius: 999,
                        padding: "8px 12px",
                        background: "#f7f8ff",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                      title={tpl.content}
                    >
                      {tpl.icon} {tpl.title}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="reply-textarea"
                placeholder="답변 내용을 입력하세요..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={normalizeStatus(selectedInquiry.status) === "completed" || saving}
                style={{
                  minHeight: 220,
                  width: "100%",
                  borderRadius: 14,
                  padding: 12,
                  fontWeight: 700,
                }}
              />

              {/* ✅ 액션 버튼 */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <button
                  className="cancel-btn"
                  onClick={handleCloseDetail}
                  disabled={saving}
                  style={{ flex: 1, borderRadius: 14, fontWeight: 900 }}
                >
                  닫기
                </button>

                {normalizeStatus(selectedInquiry.status) !== "completed" && (
                  <>
                    <button
                      className="temp-save-btn"
                      onClick={handleTempSave}
                      disabled={saving}
                      style={{ flex: 1, borderRadius: 14, fontWeight: 900 }}
                    >
                      임시저장
                    </button>

                    <button
                      className="submit-btn"
                      onClick={handleReplySubmit}
                      disabled={saving}
                      style={{ flex: 1, borderRadius: 14, fontWeight: 900 }}
                    >
                      {saving ? "등록 중..." : "답변등록"}
                    </button>
                  </>
                )}
              </div>

              {/* ✅ 완료 상태일 때 안내 */}
              {normalizeStatus(selectedInquiry.status) === "completed" && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(16,185,129,0.10)",
                    color: "#065f46",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  ✅ 이 문의는 답변 완료 상태입니다. (수정 불가)
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // =========================
        // ✅ 목록 화면
        // =========================
        <>
          {/* ✅ 탭 + 새로고침 */}
          <div className="filter-tabs">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              전체 ({tabCount.total})
            </button>
            <button className={`tab-btn ${activeTab === "waiting" ? "active" : ""}`} onClick={() => setActiveTab("waiting")}>
              답변 대기 ({tabCount.waiting})
            </button>
            <button className={`tab-btn ${activeTab === "processing" ? "active" : ""}`} onClick={() => setActiveTab("processing")}>
              답변 중 ({tabCount.processing})
            </button>
            <button className={`tab-btn ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
              답변 완료 ({tabCount.completed})
            </button>

            <button
              className="tab-btn"
              style={{ marginLeft: "auto" }}
              onClick={fetchInquiries}
              title="서버에서 다시 불러오기"
            >
              🔄 새로고침
            </button>
          </div>

          {/* ✅ 테이블 */}
          <div className="inquiry-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th width="70">No</th>
                  <th width="120">카테고리</th>
                  <th width="380">제목</th>
                  <th width="120">작성자</th>
                  <th width="160">작성일</th>
                  <th width="120">상태</th>
                </tr>
              </thead>

              <tbody>
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((item) => (
                    <tr
                      key={item.qid}
                      onClick={() => handleRowClick(item)}
                      style={{ cursor: "pointer" }}
                      title="클릭하여 상세보기"
                    >
                      <td>{item.qid}</td>
                      <td>{item.qcategory || "-"}</td>
                      <td style={{ fontWeight: 900 }}>{item.qtitle}</td>
                      <td>{item.writer || "-"}</td>
                      <td>{formatDate(item.qat)}</td>
                      <td>{renderStatusBadge(item.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      문의 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
