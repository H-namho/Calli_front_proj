import React, { useEffect, useMemo, useState } from 'react';
import '../css/MyPageHistory.css';
import ShareModal from './ShareModal';
import ImageModal from '../components/ImageModal';
import { api } from './api';

/**
 * ✅ 백에서 내려주는 DownloadHistoryDto (요약형)
 * {
 *   calliId: number,
 *   imgUrl: string,                // 썸네일/미리보기용 presigned
 *   downloadCount: number,         // 0~3
 *   lastDownloadedAt: string       // ISO LocalDateTime
 * }
 */

export default function MyPageHistory({ onGoToCreate }) {
  const [historyList, setHistoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareItem, setSelectedShareItem] = useState(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // ✅ [추가] 서버에서 다운로드 내역(요약형) 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/showDown');
        // 최근 내역이 먼저 오도록 정렬 (혹시 백엔드에서 안 해줄 경우를 대비)
        const sorted = (res.data || []).sort((a, b) =>
          new Date(b.downloadedAt || 0) - new Date(a.downloadedAt || 0)
        );
        setHistoryList(sorted);
      } catch (err) {
        console.log('❌ 다운로드 내역 불러오기 실패:', err);
      }
    };

    fetchHistory();
  }, []);

  const openPreviewModal = (imgSrc) => {
    if (!imgSrc) return;
    setPreviewModalImage(imgSrc);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewModalImage(null);
  };

  // ✅ 날짜/시간 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ✅ 페이징 계산
  const totalPages = Math.ceil(historyList.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return historyList.slice(startIndex, startIndex + itemsPerPage);
  }, [historyList, currentPage]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo(0, 0);
  };

  const handleDownload = async (item) => {
    if (item.downloadCount >= 3) {
      alert('다운로드 가능 횟수(3회)를 초과했습니다.');
      return;
    }

    const downloadUrl = `/${item.calliId}/download`;

    try {
      const res = await api.get(downloadUrl, { responseType: "blob" });

      let fileName = `calligraphy_${item.calliId}.png`;
      const disposition = res.headers?.["content-disposition"];
      if (disposition && disposition.includes("filename*=")) {
        const parts = disposition.split("filename*=");
        const raw = parts[1]?.split("''")[1] || "";
        if (raw) fileName = decodeURIComponent(raw).replace(/%20/g, " ");
      }

      const blobUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      link.target = "_blank"; // 새 탭에서 열어 페이지 이동 방지
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      // ✅ 다운로드 성공 후 내역 새로고침
      try {
        const refreshRes = await api.get('/showDown');
        const sorted = (refreshRes.data || []).sort((a, b) =>
          new Date(b.downloadedAt || 0) - new Date(a.downloadedAt || 0)
        );
        setHistoryList(sorted);
      } catch (refreshErr) {
        console.log('❌ 내역 새로고침 실패:', refreshErr);
      }

    } catch (err) {
      console.error("❌ download error:", err);

      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          alert(reader.result || "다운로드 중 오류가 발생했습니다.");
        };
        reader.readAsText(err.response.data);
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.msg || "다운로드 요청 실패";
        alert(errorMsg);
      }
    }
  };


  const handleShare = (item) => {
    setSelectedShareItem(item);
    setIsShareModalOpen(true);
  };

  return (
    <div className="mypage-inner">
      <div className="history-container">
        <div className="history-header">
          <h1 className="history-title">다운로드 내역</h1>
          <p className="history-subtitle">이미지별 다운로드 횟수(최대 3회) 요약 내역입니다.</p>
        </div>

        {historyList.length > 0 ? (
          <>
            <div className="mypage-history-list">
              {currentItems.map(item => (
                <div key={item.calliId} className="history-item-card">
                  <div
                    className="history-thumbnail-wrapper"
                    onClick={() => openPreviewModal(item.imgUrl)}
                    style={{ cursor: 'pointer' }}
                    title="클릭하여 크게 보기"
                  >
                    {item.imgUrl ? (
                      <img
                        src={item.imgUrl}
                        alt={`calli-${item.calliId}`}
                        className="history-thumbnail"
                      />
                    ) : (
                      <div className="history-no-image">이미지</div>
                    )}
                  </div>

                  <div className="history-info">
                    <div className="history-text">
                      {/* {item.textPrompt || item.Textprompt || item.inputText || item.text || "제목 없음"} */}
                    </div>
                    <div className="history-meta">
                      <div className="history-date-time">
                        <span className="history-date">{formatDate(item.downloadedAt)}</span>
                        <span className="history-time">{formatTime(item.downloadedAt)}</span>
                      </div>
                      <span className="history-count">

                      </span>
                    </div>
                  </div>

                  <div className="history-actions">
                    <button
                      className="action-btn download"
                      onClick={() => handleDownload(item)}
                      disabled={item.downloadCount >= 3}
                    >
                      {item.downloadCount >= 3 ? '횟수 초과' : `재다운로드 (${item.downloadCount}/3)`}
                    </button>

                    <button
                      className="action-btn share"
                      onClick={() => handleShare(item)}
                      disabled={item.downloadCount >= 3}
                      style={item.downloadCount >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      공유하기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="history-pagination">
                <button
                  className="page-btn prev"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  이전
                </button>
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="page-btn next"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-history">
            <p>다운로드 내역이 없습니다.</p>
            {onGoToCreate && (
              <button className="charge-link-btn" onClick={onGoToCreate}>
                이미지 만들러 가기 →
              </button>
            )}
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={selectedShareItem?.imgUrl}
        prompt={selectedShareItem?.textPrompt || selectedShareItem?.Textprompt || selectedShareItem?.inputText || selectedShareItem?.text || "캘리그라피 작품"}
        style={selectedShareItem?.stylePrompt || selectedShareItem?.Styleprompt || "기본 스타일"}
      />

      <ImageModal
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        imageUrl={previewModalImage}
      />
    </div>
  );
}
