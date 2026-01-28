import React from 'react';
import '../css/ImageModal.css';

const ImageModal = ({ isOpen, onClose, imageUrl, altText, ratio }) => {
    if (!isOpen || !imageUrl) return null;

    const style = ratio ? {
        aspectRatio: ratio.replace(':', '/'),
        objectFit: 'fill'
    } : {};

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>&times;</button>
                <img
                    src={imageUrl}
                    alt={altText || 'Preview'}
                    className="image-modal-img"
                    style={style}
                />
            </div>
        </div>
    );
};

export default ImageModal;
