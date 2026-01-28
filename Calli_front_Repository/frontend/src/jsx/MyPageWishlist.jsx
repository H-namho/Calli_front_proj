import React, { useEffect, useMemo, useState } from 'react';
import '../css/MyPageWishlist.css';

// ✅ 서버 호출용 axios 인스턴스 (baseURL="/api")
import { api } from './api';

import ImageModal from '../components/ImageModal';

// 아이콘들 (그대로 유지)
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const MagnifierIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

/**
 * ✅ 서버 응답 DTO 구조 (백에서 내려주는 형태)
 * WishResponseDto:
 * {
 *   wishlistId: number,
 *   calliId: number,
 *   imgPath: string,
 *   imgUrl: string,
 *   wishedAt: string(LocalDateTime)
 * }
 */
export default function MyPageWishlist({ wishlistItems, setWishlistItems }) {

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // ✅ 위시리스트 서버에서 불러오기
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // ✅ api.baseURL="/api" 이므로 "/wishlist" -> 최종 "/api/wishlist"
        const res = await api.get('/wishlist');
        setWishlistItems(res.data || []);
      } catch (err) {
        console.log('❌ 위시리스트 불러오기 실패:', err);
      }
    };

    fetchWishlist();
  }, [setWishlistItems]);

  const openPreviewModal = (imgSrc) => {
    setPreviewModalImage(imgSrc);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewModalImage(null);
  };

  // ✅ wishedAt 기준 날짜 그룹핑
  const groupedItems = useMemo(() => {
    return (wishlistItems || []).reduce((acc, item) => {
      const dateKey = item?.wishedAt
        ? new Date(item.wishedAt).toLocaleDateString()
        : '날짜없음';

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
  }, [wishlistItems]);

  const maxCount = 30;
  const currentCount = wishlistItems?.length || 0;

  // ✅ 선택 기준: wishlistId
  const toggleSelect = (wishlistId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(wishlistId)) newSelected.delete(wishlistId);
    else newSelected.add(wishlistId);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === (wishlistItems?.length || 0)) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set((wishlistItems || []).map(item => item.wishlistId));
      setSelectedIds(allIds);
    }
  };

  /**
   * ✅ 위시리스트 삭제
   * - 백: @DeleteMapping("/{callid}")  (컨트롤러에 @RequestMapping("/api")가 붙어있다고 가정)
   * - 프론트: api.baseURL="/api" → 여기서는 "/{calliId}"만 호출해야 최종 "/api/{calliId}"가 됨
   */
  const handleDelete = async (item) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      // ❌ await api.delete(`/api/${item.calliId}`);  -> /api/api/{id} (틀림)
      await api.delete(`/${item.calliId}`); // ✅ 최종: DELETE /api/{calliId}

      // UI 반영
      setWishlistItems(prev => prev.filter(x => x.wishlistId !== item.wishlistId));

      // 선택에서도 제거
      const newSelected = new Set(selectedIds);
      newSelected.delete(item.wishlistId);
      setSelectedIds(newSelected);

    } catch (err) {
      console.log('❌ 위시리스트 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  /**
   * ✅ 다운로드 호출
   * - GET /api/{calliId}/download (파일 자체 내려줌)
   */
  const handleDownload = async (item) => {
    try {
      // ✅ 최종: GET /api/{calliId}/download
      const res = await api.get(`/${item.calliId}/download`, {
        responseType: 'blob',
      });

      console.log("download headers =", res.headers);

      const disposition = res.headers['content-disposition'];
      let fileName = `calligraphy_${item.calliId}.png`;

      if (disposition && disposition.includes('filename')) {
        const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
        if (match?.[1]) {
          fileName = decodeURIComponent(match[1].replaceAll('"', '').trim());
        }
      }

      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/octet-stream',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.log('❌ 다운로드 실패:', err);
      alert(err?.response?.data?.msg || '다운로드에 실패했습니다.');
    }
  };

  // ✅ 선택 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;

    const targets = (wishlistItems || []).filter(item => selectedIds.has(item.wishlistId));

    try {
      // ❌ api.delete(`/api/${item.calliId}`) -> /api/api/{id}
      // ✅ 최종: DELETE /api/{calliId}
      await Promise.all(targets.map(item => api.delete(`/${item.calliId}`)));

      setWishlistItems(prev => prev.filter(item => !selectedIds.has(item.wishlistId)));
      setSelectedIds(new Set());

    } catch (err) {
      console.log('❌ 선택 삭제 실패:', err);
      alert('일부 삭제에 실패했습니다.');
    }
  };

  // ✅ 선택 다운로드(순차)
  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;

    const targets = (wishlistItems || []).filter(item => selectedIds.has(item.wishlistId));

    for (const item of targets) {
      await handleDownload(item);
    }
  };

  return (
    <div className="mypage-inner">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">위시리스트</h1>
          <div className="wishlist-count">
            저장한 캘리그라피 <strong>{currentCount}</strong> / {maxCount}
          </div>
        </div>

        <div className="wishlist-actions-bar">
          <div className="select-all-container" onClick={toggleSelectAll}>
            <input
              type="checkbox"
              className="select-checkbox"
              checked={currentCount > 0 && selectedIds.size === currentCount}
              readOnly
            />
            <span>전체 선택</span>
          </div>

          <div className="bulk-actions">
            <button
              className="bulk-btn download"
              onClick={handleBulkDownload}
              disabled={selectedIds.size === 0}
            >
              선택 다운로드
            </button>

            <button
              className="bulk-btn delete"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
            >
              선택 삭제
            </button>
          </div>
        </div>

        {currentCount > 0 ? (
          <div className="wishlist-gallery">
            {Object.entries(groupedItems).map(([date, items]) => (
              <div key={date} className="gallery-date-group">
                <h3 className="gallery-date-header">{date}</h3>

                <div className="gallery-grid">
                  {items.map(item => (
                    <div
                      key={item.wishlistId}
                      className={`gallery-item ${selectedIds.has(item.wishlistId) ? 'selected' : ''}`}
                      onClick={() => toggleSelect(item.wishlistId)}
                    >
                      <input
                        type="checkbox"
                        className="item-select-checkbox"
                        checked={selectedIds.has(item.wishlistId)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(item.wishlistId)}
                      />

                      {item.imgUrl ? (
                        <img src={item.imgUrl} alt={`calli-${item.calliId}`} className="gallery-img" />
                      ) : (
                        <div
                          className="gallery-img-wrapper"
                          style={{
                            width: '100%', height: '100%', backgroundColor: '#eee',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <span style={{ color: '#aaa', fontSize: '12px' }}>
                            이미지 없음
                          </span>
                        </div>
                      )}

                      <div className="gallery-overlay" onClick={(e) => e.stopPropagation()}>
                        <div className="overlay-title"></div>

                        <div className="overlay-actions">
                          <button
                            className="overlay-btn download-btn"
                            title="다운로드"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item);
                            }}
                          >
                            <DownloadIcon />
                          </button>

                          <button
                            className="overlay-btn preview-btn"
                            title="크게 보기"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreviewModal(item.imgUrl);
                            }}
                          >
                            <MagnifierIcon />
                          </button>

                          <button
                            className="overlay-btn delete-btn"
                            title="삭제"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-wishlist">
            <p>위시리스트가 비어있습니다.</p>
          </div>
        )}
      </div>

      <ImageModal
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        imageUrl={previewModalImage}
      />
    </div>
  );
}
