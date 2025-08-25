// src/components/TableSystem/PreviewModal.js 修正版本

import React, { useState } from 'react';  
import { BarChart3, TrendingUp, Calendar, User, Image } from 'lucide-react';
import Modal from '../common/Modal';
import { APP_CONFIG } from '../../constants/config';

// 功能開關控制
const PREVIEW_MODAL_ENABLED = false; // 設置為 false 來隱藏功能

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
  // 如果功能被禁用，直接返回 null
  if (!PREVIEW_MODAL_ENABLED) {
    return null;
  }

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
              {displayClasses.length > 0 && displayClasses.map((cls, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 text-sm rounded-full border ${getTagColor('class', cls)}`}
                >
                  🏷️ {cls}
                </span>
              ))}
              {displaySamples.length > 0 && displaySamples.map((sample, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 text-sm rounded-full border ${getTagColor('sample', sample)}`}
                >
                  📝 {sample}
                </span>
              ))}
            </div>
            
            {/* 表格描述 */}
            {table.description && (
              <p className="text-gray-600 leading-relaxed mb-6">
                {table.description}
              </p>
            )}
          </div>

          {/* 表格統計資訊 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">數據類型</span>
              </div>
              <p className="text-blue-700 text-sm">{table.aspect}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">市場範圍</span>
              </div>
              <p className="text-green-700 text-sm">{table.market}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">建立日期</span>
              </div>
              <p className="text-purple-700 text-sm">{table.createdAt || '未知'}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">更新日期</span>
              </div>
              <p className="text-orange-700 text-sm">{table.updatedAt || '未知'}</p>
            </div>
          </div>

          {/* 數據預覽示意圖 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Image className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">數據預覽</span>
            </div>
            <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-500 text-sm">
                表格數據預覽將在此顯示
              </p>
              <p className="text-center text-gray-400 text-xs mt-2">
                包含圖表、統計資訊等內容
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按鈕 */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            關閉
          </button>
          <button
            onClick={handleGenerateReport}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            生成自訂報表
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="表格預覽"
      size="xl"
      maxHeight="90vh"
    >
      {modalContent}
    </Modal>
  );
};

/**
 * PreviewModal 組件目前已暫時禁用
 * 要重新啟用，請將 PREVIEW_MODAL_ENABLED 設為 true
 * 
 * 禁用原因：主管要求直接從 TableList 開啟 ReportModal
 * 未來可能會重新啟用此功能
 */

export default PreviewModal;