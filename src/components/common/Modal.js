// src/components/common/Modal.js
// 通用Modal組件

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { APP_CONFIG } from '../../constants/config';

/**
 * 通用Modal組件
 * @param {Object} props - 組件props
 * @param {boolean} props.isOpen - 是否開啟
 * @param {Function} props.onClose - 關閉回調
 * @param {string} props.title - 標題
 * @param {ReactNode} props.children - 子組件
 * @param {string} props.size - 大小 ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.showCloseButton - 是否顯示關閉按鈕
 * @param {boolean} props.closeOnOverlayClick - 點擊背景是否關閉
 * @param {boolean} props.closeOnEscape - 按ESC是否關閉
 * @param {string} props.zIndex - z-index值
 * @param {ReactNode} props.footer - 底部內容
 * @param {string} props.maxHeight - 最大高度
 * @returns {ReactNode}
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  zIndex = APP_CONFIG.MODAL.Z_INDEX.MAIN,
  footer,
  maxHeight = APP_CONFIG.MODAL.MAX_HEIGHT,
  className = ''
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // 大小對應的CSS類別
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };

  // ESC鍵關閉處理
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // 焦點管理
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;
    
    // 聚焦到Modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // 組件卸載時恢復焦點
    return () => {
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  // 背景滾動鎖定
  useEffect(() => {
    if (isOpen) {
      // 鎖定背景滾動
      document.body.style.overflow = 'hidden';
    } else {
      // 恢復背景滾動
      document.body.style.overflow = '';
    }

    // 清理函數
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 點擊背景關閉
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  // Modal未開啟時不渲染
  if (!isOpen) return null;

  return (
    <div
    ref={overlayRef}
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`}  // 移除 p-4
    style={{ zIndex }}
    onClick={handleOverlayClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "modal-title" : undefined}
  >
    <div
      ref={modalRef}
      className={`bg-white rounded-lg shadow-xl w-full mx-auto outline-none flex flex-col ${
        size === 'full'
          ? 'h-full max-w-none max-h-none m-0 rounded-none'
          : `${sizeClasses[size]} mx-4`
      } ${className}`}
      style={{
        maxHeight: size === 'full' ? '100vh' : '90vh'  // 外框最高不超過螢幕
      }}
      tabIndex={-1}
    >
      {/* 標題欄 */}
      {title && size !== 'full' && (
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="關閉對話框"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* 內容區域 (可捲動) */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {children}
      </div>

      {/* 底部區域 (固定在最底) */}
      {footer && size !== 'full' && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  </div>
  );
};

export default Modal;