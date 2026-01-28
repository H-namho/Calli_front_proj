import React, { useState, useMemo } from 'react';
import '../css/ShareModal.css';

export default function ShareModal({ isOpen, onClose, imageUrl, prompt, style }) {
    const [copied, setCopied] = useState(false);

    const shareLink = useMemo(() => {
        if (!isOpen) return '';
        const params = new URLSearchParams({
            prompt: prompt || '',
            style: style || '',
            imageUrl: imageUrl || ''
        });
        return `${window.location.origin}/share/${Date.now()}?${params.toString()}`;
    }, [isOpen, prompt, style, imageUrl]);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Clipboard API failed, trying fallback', err);
            // Fallback for older browsers or non-secure contexts
            try {
                const textArea = document.createElement("textarea");
                textArea.value = shareLink;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed', fallbackErr);
                alert('링크 복사에 실패했습니다. 수동으로 복사해주세요.');
            }
        }
    };



    const handleOpenLink = () => {
        window.open(shareLink, '_blank');
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>미리보기</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="share-modal-body">
                    <p className="preview-desc">방문자에게는 아래와 같은 화면이 보여집니다.</p>

                    {/* 미리보기 프레임 (모바일 화면 흉내) */}
                    <div className="preview-frame-container">
                        <div className="preview-mobile-frame">
                            {/* SharedView의 축소판 UI */}
                            <div className="preview-page-content">
                                <header className="preview-header">
                                    <span className="preview-brand">Calli for you</span>
                                </header>
                                <div className="preview-card">
                                    <div className="preview-img-wrapper">
                                        <img src={imageUrl} alt="Preview" />
                                    </div>
                                    <div className="preview-info">
                                        <p className="preview-highlight">"{prompt}"</p>
                                        <p className="preview-style">{style}</p>
                                    </div>
                                </div>
                                <div className="preview-cta">
                                    <p>나도 만들기</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="share-modal-footer">
                    <div className="link-box">
                        <input type="text" value={shareLink} readOnly />
                        <button
                            className={`copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? '복사됨!' : '링크 복사'}
                        </button>
                        <button className="open-link-btn" onClick={handleOpenLink}>
                            새 탭에서 열기
                        </button>
                    </div>
                </div>

                {/* Toast Notification */}
                <div className={`toast-notification ${copied ? 'show' : ''}`}>
                    <div className="toast-icon">✅</div>
                    <div className="toast-message">
                        링크가 복사되었습니다.
                    </div>
                </div>
            </div>
        </div>
    );
}
