// src/components/TableSystem/PreviewModal.js
// 表格預覽Modal組件

import React, { useState } from 'react';  // 添加 useState
import { BarChart3, TrendingUp, Calendar, User, Image } from 'lucide-react';
import Modal from '../common/Modal';
import { APP_CONFIG } from '../../constants/config';

/**
 * 表格預覽Modal組件
 * @param {Object} props - 組件props
 * @param {boolean} props.isOpen - 是否開啟
 * @param {Function} props.onClose - 關閉回調
 * @param {Object} props.table - 表格數據
 * @param {Function} props.onGenerateReport - 生成報表回調
 * @returns {ReactNode}
 */
const PreviewModal = ({ 
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

  // 處理生成報表
  const handleGenerateReport = () => {
    onClose();
    onGenerateReport(table);
  };

  // Modal內容
  const modalContent = (
    <div className="h-full flex flex-col">
      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 表格資訊 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {table.name}
            </h3>
            
            {/* 分類標籤 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 text-sm rounded-full border ${getTagColor('market', table.market)}`}>
                📍 {table.market}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full border ${getTagColor('aspect', table.aspect)}`}>
                📊 {table.aspect}
              </span>
              
              {/* 顯示多類別 */}
              {displayClasses.map((cls, index) => (
                <span key={`class-${index}`} className={`px-3 py-1 text-sm rounded-full border ${getTagColor('class')}`}>
                  📂 {cls}
                </span>
              ))}
              
              {/* 顯示多樣本 */}
              {displaySamples.map((sample, index) => (
                <span key={`sample-${index}`} className={`px-3 py-1 text-sm rounded-full border ${getTagColor('sample')}`}>
                  📋 {sample}
                </span>
              ))}
            </div>
          </div>

          {/* 表格預覽區域 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                表格預覽示意圖
              </h4>
            </div>

            <div className="p-6">
              <TablePreview table={table} />  {/* 確保這行存在 */}
            </div>
            
          </div>

          {/* 功能說明 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">功能說明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 點擊「產生自訂報表」可以自動選取[{table.name}]使用自定義功能</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 底部操作區 */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            關閉
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-3 text-white rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#6366f1' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
          >
            <TrendingUp 
              className="w-4 h-4" 
              Style={{ backgroundColor: 'transparent', color: 'inherit' }}
            />
            <span
              Style={{ backgroundColor: 'transparent', color: 'inherit' }}
            >產生自訂報表</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="xl"
      zIndex={APP_CONFIG.MODAL.Z_INDEX.PREVIEW}
      className="h-[90vh] flex flex-col"
    >
      {modalContent}
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
 * 表格預覽組件
 */
const TablePreview = ({ table }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const displayClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
  const displaySamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);

  // 動態獲取圖片路徑 - GitHub Pages 兼容
  const getImagePath = () => {
    return '/cmoney_table_filter_prototype/assets/table-preview-demo.png';
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
                <p className="text-xs sm:text-sm text-gray-500">表格預覽示意圖</p>
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
            alt="表格預覽示意圖"
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

     

      {/* 響應式說明 */}
      <div className="bg-green-50 p-3 rounded-lg">
        <h5 className="text-sm font-medium text-green-900 mb-2">響應式設計</h5>
        <div className="text-xs text-green-700 space-y-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">手機</div>
              <div className="text-xs">192px</div>
            </div>
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">小平板</div>
              <div className="text-xs">224px</div>
            </div>
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">平板</div>
              <div className="text-xs">256px</div>
            </div>
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">筆電</div>
              <div className="text-xs">288px</div>
            </div>
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">桌機</div>
              <div className="text-xs">320px</div>
            </div>
            <div className="bg-white bg-opacity-60 px-2 py-1 rounded">
              <div className="font-medium">大螢幕</div>
              <div className="text-xs">384px</div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <em>圖片以原始大小顯示，超出容器部分自動裁切</em>
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

export default PreviewModal;