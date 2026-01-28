import React, { useEffect, useMemo, useState } from "react";
import "../css/QA.css";

// ✅ 전역 axios 인스턴스 (baseURL = "/api", withCredentials = true)
import { api } from "./api";

export default function QA({ userName }) {
  // view: 'list', 'create', 'detail'
  const [view, setView] = useState("list");

  // ✅ 서버에서 불러온 질문 목록
  const [questions, setQuestions] = useState([]);

  // ✅ 로딩/에러
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 상세 선택
  const [selectedQid, setSelectedQid] = useState(null);

  // 작성 폼
  const [formData, setFormData] = useState({
    qcategory: "기능 문의",
    qtitle: "",
    qcontent: "",
  });

  // 검색/필터
  const [searchType, setSearchType] = useState("all"); // all (제목+내용), author(현재 백에 작성자 필드 없음 → UI만 유지)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // ✅ 백 DTO에 작성자/내 질문 여부가 없음
  // -> "내 질문만 보기"는 서버에 userId/작성자 필드가 있어야 가능.
  // 지금은 UI/기능 제거(또는 항상 false)하는 게 맞아서 제거했음.

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // =========================
  // ✅ 목록 조회: GET /api/showqeustion
  // =========================
  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/showqeustion");
      const list = Array.isArray(res.data) ? res.data : [];

      // ✅ 최신순 정렬(qat 기준)
      list.sort((a, b) => new Date(b.qat || 0) - new Date(a.qat || 0));

      setQuestions(list);
    } catch (err) {
      setErrorMsg(err?.response?.data?.msg || "문의 목록을 불러오지 못했습니다.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =========================
  // ✅ 화면 전환
  // =========================
  const goToList = () => {
    setView("list");
    setSelectedQid(null);
    setFormData({ qcategory: "기능 문의", qtitle: "", qcontent: "" });
  };

  const goToCreate = () => {
    setFormData({ qcategory: "기능 문의", qtitle: "", qcontent: "" });
    setView("create");
  };

  const goToDetail = (qid) => {
    setSelectedQid(qid);
    setView("detail");
  };

  // =========================
  // ✅ 작성: POST /api/question
  // =========================
  const handleSubmit = async () => {
    if (!formData.qtitle.trim() || !formData.qcontent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      // ✅ QuestionDto 필드명에 맞춰서 보내기
      // 너 service.showquestion()에서 qcategory/qtitle/qcontent 쓰고 있으니 그대로 보냄
      const payload = {
        qcategory: formData.qcategory,
        qtitle: formData.qtitle,
        qcontent: formData.qcontent,
      };

      await api.post("/question", payload);

      alert("등록이 완료되었습니다.");
      // ✅ 등록 후 목록 다시 불러오고, 리스트로 이동
      await fetchQuestions();
      goToList();
    } catch (err) {
      alert(err?.response?.data?.msg || "등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ 필터링/검색 (프론트 단)
  // =========================
  const filteredItems = useMemo(() => {
    return questions
      .filter((item) => {
        // 카테고리
        if (selectedCategory !== "전체" && item.qcategory !== selectedCategory) return false;

        // 검색
        if (searchTerm.trim()) {
          const term = searchTerm.trim();
          if (searchType === "author") {
            // ✅ 백에 작성자 필드가 없어서 동작 불가 → 항상 false 처리
            // (원하면 maskedUserName 같은 필드 추가하면 여기에 붙이면 됨)
            return false;
          } else {
            return (
              (item.qtitle || "").includes(term) ||
              (item.qcontent || "").includes(term)
            );
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.qat || 0) - new Date(a.qat || 0));
  }, [questions, selectedCategory, searchTerm, searchType]);

  // =========================
  // ✅ 페이지네이션
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, searchType]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const formatDate = (dt) => {
    if (!dt) return "-";
    // LocalDateTime("2026-01-20T12:34:56")도 OK
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return String(dt).slice(0, 10);
    return d.toISOString().slice(0, 10);
  };

  // 현재 선택된 항목
  const currentItem = questions.find((q) => q.qid === selectedQid);

  // =========================
  // ✅ 렌더: 목록
  // =========================
  const renderList = () => (
    <div className="inquiry-container">
      <div className="inquiry-header">
        <div className="header-title">
          <h2>문의사항</h2>
        </div>
        <div className="header-actions">
          <button className="create-btn" onClick={goToCreate} disabled={loading}>
            <span>✏️</span> 새 질문 작성
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div
          className="filter-left-group"
          style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}
        >
          <select
            className="search-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="전체">전체 카테고리</option>
            <option value="기능 문의">기능 문의</option>
            <option value="사용 방법">사용 방법</option>
            <option value="오류 신고">오류 신고</option>
            <option value="기타">기타</option>
          </select>

          <div className="search-box">
            <select
              className="search-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              title="작성자 검색은 백에서 작성자 필드가 있어야 가능합니다."
            >
              <option value="all">제목 + 내용</option>
              <option value="author"></option>
            </select>

            <input
              type="text"
              className="search-input"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-cancel" onClick={fetchQuestions} disabled={loading}>
            새로고침
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: "#ff4d4f", marginBottom: 10, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      <div className="inquiry-list-body">
        <table className="inquiry-table">
          <thead>
            <tr>
              <th width="10%">번호</th>
              <th width="15%">카테고리</th>
              <th width="45%">제목</th>
              <th width="10%">상태</th>
              <th width="20%">날짜</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">불러오는 중...</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => {
                const status = item.answer && String(item.answer).trim() ? "completed" : "waiting";
                return (
                  <tr
                    key={item.qid}
                    className="inquiry-row"
                    onClick={() => goToDetail(item.qid)}
                  >
                    <td>{item.qid}</td>
                    <td>{item.qcategory}</td>
                    <td>{item.qtitle}</td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status === "waiting" ? "답변 대기" : "답변 완료"}
                      </span>
                    </td>
                    <td>{formatDate(item.qat)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">문의 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn nav-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn nav-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );

  // =========================
  // ✅ 렌더: 작성
  // =========================
  const renderCreate = () => (
    <div className="inquiry-container">
      <div className="inquiry-header">
        <div className="header-title">
          <h2>작성하기</h2>
        </div>
      </div>

      <div className="write-container">
        <div className="form-group">
          <label className="form-label">카테고리</label>
          <select
            className="form-select short-select"
            value={formData.qcategory}
            onChange={(e) => setFormData({ ...formData, qcategory: e.target.value })}
          >
            <option>기능 문의</option>
            <option>사용 방법</option>
            <option>오류 신고</option>
            <option>기타</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            placeholder="제목을 입력하세요"
            value={formData.qtitle}
            onChange={(e) => setFormData({ ...formData, qtitle: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">내용</label>
          <div className="textarea-wrapper">
            <textarea
              className="form-textarea"
              value={formData.qcontent}
              onChange={(e) => setFormData({ ...formData, qcontent: e.target.value })}
            />

            {!formData.qcontent && (
              <div className="placeholder-tip">
                <div className="tip-title">💡 작성 팁</div>
                <ul className="tip-list">
                  <li>구체적인 상황을 설명해주시면 더 정확한 답변을 받을 수 있습니다</li>
                  <li>오류 화면이나 예시가 있다면 함께 공유해주세요</li>
                  <li>질문하기 전에 기존 Q&A를 먼저 확인해보세요</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="btn-group">
          <button className="btn-cancel" onClick={goToList} disabled={loading}>
            취소
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );

  // =========================
  // ✅ 렌더: 상세
  // =========================
  const renderDetail = () => {
    if (!currentItem) {
      return (
        <div className="inquiry-container">
          <div className="detail-container">
            <p>선택된 문의를 찾을 수 없습니다.</p>
            <div className="btn-group">
              <button className="btn-cancel" onClick={goToList}>목록으로</button>
            </div>
          </div>
        </div>
      );
    }

    const hasAnswer = currentItem.answer && String(currentItem.answer).trim();
    const status = hasAnswer ? "completed" : "waiting";

    return (
      <div className="inquiry-container">
        <div className="inquiry-header">
          <div className="header-title">
            <h2>{currentItem.qtitle}</h2>
            <span className="category-label">{currentItem.qcategory}</span>
            <span className={`status-badge ${status}`}>
              {status === "waiting" ? "답변 대기" : "답변 완료"}
            </span>
          </div>
        </div>

        <div className="detail-container">
          <div className="form-group">
            <div
              className="detail-meta"
              style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}
            >
              {/* ✅ 백에 작성자 필드가 없어서 userName만 표시하면 오해 생김 → 날짜만 표시 */}
              작성일: {formatDate(currentItem.qat)}
              {currentItem.aat ? ` | 답변일: ${formatDate(currentItem.aat)}` : ""}
            </div>

            <div className="detail-content">{currentItem.qcontent}</div>
          </div>

          {hasAnswer && (
            <div className="answer-section">
              <div className="answer-header">
                <span>💬 답변 내용</span>
              </div>
              <div className="answer-content">{currentItem.answer}</div>
            </div>
          )}

          <div className="btn-group">
            <button className="btn-cancel" onClick={goToList}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inquiry-page-inner">
      {view === "list" && renderList()}
      {view === "create" && renderCreate()}
      {view === "detail" && renderDetail()}
    </div>
  );
}
