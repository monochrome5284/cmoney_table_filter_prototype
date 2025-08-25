// src/components/TableSystem/ReportModal.js
// 自訂報表Modal組件 - 修正Modal結構

import React, { useState } from 'react';
import { BarChart3, TrendingUp, FileText, Calendar, Database, Image } from 'lucide-react';
import Modal from '../common/Modal';
import { APP_CONFIG } from '../../constants/config';

/**
 * 自訂報表Modal組件
 * @param {Object} props - 組件props
 * @param {boolean} props.isOpen - 是否開啟
 * @param {Function} props.onClose - 關閉回調
 * @param {Object} props.table - 選中的表格
 * @param {Function} props.onGenerateReport - 生成報表回調
 * @returns {ReactNode}
 */
const ReportModal = ({ 
  isOpen, 
  onClose, 
  table, 
  onGenerateReport 
}) => {
  if (!table) return null;

  // 處理多類別和多樣本顯示
  const displayClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
  const displaySamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);

  // 獲取標籤顏色
  const getTagColor = (type, value) => {
    const colorMaps = {
      market: {
        '台灣': 'bg-blue-100 text-blue-700 border-blue-200',
        '美國': 'bg-green-100 text-green-700 border-green-200',
        '中國': 'bg-red-100 text-red-700 border-red-200',
        '香港': 'bg-purple-100 text-purple-700 border-purple-200'
      },
      aspect: {
        '基本面': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        '技術面': 'bg-amber-100 text-amber-700 border-amber-200',
        '籌碼面': 'bg-pink-100 text-pink-700 border-pink-200',
        '消息面': 'bg-cyan-100 text-cyan-700 border-cyan-200'
      },
      class: 'bg-purple-100 text-purple-700 border-purple-200',
      sample: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    
    if (type === 'market' || type === 'aspect') {
      return colorMaps[type][value] || 'bg-gray-100 text-gray-700 border-gray-200';
    }
    
    return colorMaps[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`自訂報表 - ${table.name}`}
      size="xl"
      zIndex={APP_CONFIG.MODAL.Z_INDEX.REPORT}
      maxHeight="90vh"
      footer={
        // 底部操作按鈕
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            關閉
          </button>
        </div>
      }
    >
      {/* 內容區域 - 使用padding讓內容不貼邊 */}
      <div className="p-6 space-y-6">
        {/* 分類標籤 */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-sm rounded-full border ${getTagColor('market', table.market)}`}>
            📍 {table.market}
          </span>
          <span className={`px-3 py-1 text-sm rounded-full border ${getTagColor('aspect', table.aspect)}`}>
            🎯 {table.aspect}
          </span>
          {displayClasses.map(cls => (
            <span key={cls} className={`px-2 py-1 text-sm rounded-full border ${getTagColor('class')}`}>
              📊 {cls}
            </span>
          ))}
          {displaySamples.map(sample => (
            <span key={sample} className={`px-2 py-1 text-sm rounded-full border ${getTagColor('sample')}`}>
              🔍 {sample}
            </span>
          ))}
        </div>

        {/* 表格描述 */}
        {table.description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">表格說明</h4>
            <p className="text-gray-600 text-sm">
              {table.description}
            </p>
          </div>
        )}

        {/* 報表預覽示意圖 */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              報表預覽示意圖
            </h4>
          </div>
          <div className="p-4">
            <ReportPreviewDiagram table={table} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

/**
 * 資訊項目組件
 */
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="text-gray-400">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

/**
 * 報表預覽示意圖組件
 */
const ReportPreviewDiagram = ({ table }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const displayClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
  const displaySamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);

  // 模擬示意圖載入狀態
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // 模擬載入成功/失敗
      const success = Math.random() > 0.1; // 90% 成功率
      setImageLoaded(success);
      setImageError(!success);
    }, 1000);

    return () => clearTimeout(timer);
  }, [table.id]);

  // 動態獲取圖片路徑 - GitHub Pages 兼容
  const getImagePath = () => {
    return '/cmoney_table_filter_prototype/assets/report-table-preview-demo.png';
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      {/* 響應式圖片預覽區域 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-88 xl:h-96 2xl:h-96 overflow-hidden bg-gray-100">
          
          {/* 預設顯示內容 - 當圖片未載入或載入失敗時顯示 */}
          {(!imageLoaded || imageError) && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center z-10">
              <div className="text-center px-4">
                <BarChart3 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium text-sm sm:text-base md:text-lg mb-1">📊 {table.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">報表預覽示意圖</p>
                <div className="mt-3 px-3 py-2 bg-white bg-opacity-70 rounded-lg">
                  <p className="text-xs text-gray-600">
                    {table.market} • {table.aspect} • {displaySamples.join(', ')}
                  </p>
                </div>
                {imageError && (
                  <p className="text-xs text-red-500 mt-2">
                    圖片載入失敗，顯示預設內容
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* 實際圖片 - 原始大小顯示，超出部分裁切，左上角定位 */}
          <img
            src={getImagePath()}
            alt="報表預覽示意圖"
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{
              imageRendering: 'crisp-edges',
              objectPosition: 'left top',
              objectFit: 'cover'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* 浮水印 - 只在有圖片時顯示，響應式大小 */}
          {imageLoaded && !imageError && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium backdrop-blur-sm shadow-lg">
                示意圖
              </div>
            </div>
          )}
        </div>
        
        {/* 圖片資訊 */}
        <div className="p-2 sm:p-3 bg-white border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {imageLoaded && !imageError ? (
              <>圖片模式 | {table.aspect} | {displaySamples.join(', ')}</>
            ) : (
              <>預設模式 | {table.aspect} | {displaySamples.join(', ')} | {displayClasses.join(', ')}</>
            )}
          </div>
        </div>
      </div>

      {/* 開發調試資訊 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
          <div>圖片路徑: {getImagePath()}</div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              圖片狀態: 
              {imageLoaded && !imageError && <span className="text-green-600 ml-1">✓ 已載入</span>}
              {imageError && <span className="text-red-600 ml-1">✗ 載入失敗</span>}
              {!imageLoaded && !imageError && <span className="text-yellow-600 ml-1">⏳ 載入中</span>}
            </div>
            <div className="text-right">
              當前斷點: <span className="font-mono">
                <span className="sm:hidden">手機</span>
                <span className="hidden sm:inline md:hidden">SM</span>
                <span className="hidden md:inline lg:hidden">MD</span>
                <span className="hidden lg:inline xl:hidden">LG</span>
                <span className="hidden xl:inline 2xl:hidden">XL</span>
                <span className="hidden 2xl:inline">2XL</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportModal;