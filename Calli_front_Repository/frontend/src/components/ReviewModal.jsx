import React, { useState } from 'react';
import '../css/ReviewModal.css';

export default function ReviewModal({ isOpen, onClose, onSubmit, onNeverShowAgain }) {
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("별점을 선택해주세요!");
            return;
        }
        if (content.trim().length < 5) {
            alert("후기는 5글자 이상 작성해주세요!");
            return;
        }

        try {
            await onSubmit({ rating, content });
            setIsSuccess(true);
        } catch (err) {
            // 에러는 onSubmit에서 처리
        }
    };

    const handleClose = () => {
        setRating(0);
        setContent('');
        setIsSuccess(false);
        onClose();
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-container">
                <button className="review-modal-close" onClick={handleClose}>&times;</button>

                {isSuccess ? (
                    // ✅ 성공 UI
                    <>
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                            <h2 className="review-title">리뷰 작성 완료!</h2>
                            <p className="review-subtitle">
                                소중한 후기 감사합니다.<br />
                                더 나은 서비스를 위해 노력하겠습니다.
                            </p>
                            <button
                                className="submit-btn"
                                onClick={handleClose}
                                style={{ marginTop: '30px' }}
                            >
                                확인
                            </button>
                        </div>
                    </>
                ) : (
                    // ✅ 기존 입력 UI
                    <>
                        <h2 className="review-title">첫 작품 다운로드를 축하해요~!</h2>
                        <p className="review-subtitle">
                            서비스가 마음에 드셨나요?<br />
                            소중한 후기는 서비스 개선에 큰 도움이 됩니다.
                        </p>

                        <div className="stars-container">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`star-btn ${star <= rating ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <div className="review-input-area">
                            <textarea
                                className="review-textarea"
                                placeholder="서비스 이용 경험이나 바라는 점을 자유롭게 적어주세요. (5글자 이상)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="review-actions">
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={rating === 0 || content.trim().length < 5}
                            >
                                후기 제출하기
                            </button>

                            <div className="secondary-actions">
                                <button className="text-btn" onClick={onNeverShowAgain}>
                                    다신 보지 않기
                                </button>
                                <button className="text-btn" onClick={handleClose}>
                                    나중에 하기
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
