// src/components/TableSystem/ReportModal.js
// 自訂報表Modal組件

import React, { useState } from 'react';
import { Download, FileText, Calendar, Settings, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { APP_CONFIG } from '../../constants/config';

/**
 * 自訂報表Modal組件
 * @param {Object} props - 組件props
 * @param {boolean} props.isOpen - 是否開啟
 * @param {Function} props.onClose - 關閉回調
 * @param {Object} props.table - 選中的表格
 * @returns {ReactNode}
 */
const ReportModal = ({ isOpen, onClose, table }) => {
  // 報表設定狀態
  const [reportConfig, setReportConfig] = useState({
    dateRange: {
      startDate: '',
      endDate: ''
    },
    fields: ['股價', '成交量', '技術指標', '基本面數據', '籌碼分析'],
    selectedFields: ['股價', '成交量', '技術指標'],
    format: 'PDF',
    includeCharts: true,
    includeAnalysis: true,
    includeComparison: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // 處理欄位選擇
  const handleFieldToggle = (field) => {
    setReportConfig(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(field)
        ? prev.selectedFields.filter(f => f !== field)
        : [...prev.selectedFields, field]
    }));
  };

  // 處理日期變更
  const handleDateChange = (type, value) => {
    setReportConfig(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value
      }
    }));
  };

  // 處理格式變更
  const handleFormatChange = (format) => {
    setReportConfig(prev => ({
      ...prev,
      format
    }));
  };

  // 處理選項切換
  const handleOptionToggle = (option) => {
    setReportConfig(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // 生成報表
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    // 模擬報表生成步驟
    const steps = [
      '準備數據...',
      '生成圖表...',
      '編譯報表...',
      '準備下載...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setGenerationStep(steps.length);
    
    // 模擬下載
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
      onClose();
      
      // 顯示成功消息
      alert(`${reportConfig.format} 報表已成功生成並開始下載！`);
    }, 1000);
  };

  // 重設設定
  const resetConfig = () => {
    setReportConfig({
      dateRange: { startDate: '', endDate: '' },
      fields: ['股價', '成交量', '技術指標', '基本面數據', '籌碼分析'],
      selectedFields: ['股價', '成交量', '技術指標'],
      format: 'PDF',
      includeCharts: true,
      includeAnalysis: true,
      includeComparison: false
    });
  };

  // 檢查配置是否完整
  const isConfigValid = () => {
    return reportConfig.selectedFields.length > 0 && 
           reportConfig.dateRange.startDate && 
           reportConfig.dateRange.endDate;
  };

  const modalContent = (
    <div className="h-full flex flex-col">
      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 表格資訊 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">報表來源</h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{table?.name}</p>
              <p>{table?.market} • {table?.aspect} • {table?.class}</p>
            </div>
          </div>

          {/* 時間區間設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              時間區間
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">開始日期</label>
                <input
                  type="date"
                  value={reportConfig.dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">結束日期</label>
                <input
                  type="date"
                  value={reportConfig.dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 欄位選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Settings className="w-4 h-4 inline mr-2" />
              包含欄位 ({reportConfig.selectedFields.length} / {reportConfig.fields.length} 已選擇)
            </label>
            <div className="space-y-2">
              {reportConfig.fields.map(field => (
                <label key={field} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportConfig.selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="mr-3 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{field}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {getFieldDescription(field)}
                  </span>
                </label>
              ))}
            </div>
            
            {/* 快速選擇按鈕 */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => setReportConfig(prev => ({ ...prev, selectedFields: [...prev.fields] }))}
                className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-1 hover:bg-purple-50"
              >
                全選
              </button>
              <button
                onClick={() => setReportConfig(prev => ({ ...prev, selectedFields: [] }))}
                className="text-xs text-gray-600 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
              >
                清空
              </button>
              <button
                onClick={() => setReportConfig(prev => ({ ...prev, selectedFields: ['股價', '成交量'] }))}
                className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
              >
                基本
              </button>
            </div>
          </div>

          {/* 匯出格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">匯出格式</label>
            <div className="grid grid-cols-3 gap-3">
              {['PDF', 'Excel', 'CSV'].map(format => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    reportConfig.format === format
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{format}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getFormatDescription(format)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 進階選項 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">進階選項</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={() => handleOptionToggle('includeCharts')}
                  className="mr-3 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">包含圖表和視覺化</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeAnalysis}
                  onChange={() => handleOptionToggle('includeAnalysis')}
                  className="mr-3 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">包含分析和解讀</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeComparison}
                  onChange={() => handleOptionToggle('includeComparison')}
                  className="mr-3 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">包含同業比較</span>
              </label>
            </div>
          </div>

          {/* 報表預覽 */}
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">報表預覽</h4>
            </div>
            <div className="p-4">
              <ReportPreview config={reportConfig} table={table} />
            </div>
          </div>

          {/* 生成進度 */}
          {isGenerating && (
            <GenerationProgress step={generationStep} />
          )}
        </div>
      </div>

      {/* 底部操作區 */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-between">
          <button
            onClick={resetConfig}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 text-sm"
            disabled={isGenerating}
          >
            重設設定
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isGenerating}
            >
              取消
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={!isConfigValid() || isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? '生成中...' : '匯出報表'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="自訂報表設定"
      size="lg"
      zIndex={APP_CONFIG.MODAL.Z_INDEX.REPORT}
      className="h-[90vh] flex flex-col"
      closeOnOverlayClick={!isGenerating}
      closeOnEscape={!isGenerating}
    >
      {modalContent}
    </Modal>
  );
};

/**
 * 報表預覽組件
 */
const ReportPreview = ({ config, table }) => {
  const { selectedFields, format, includeCharts, includeAnalysis } = config;
  
  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <FileText className="w-12 h-12 text-purple-500 mx-auto mb-2" />
        <h5 className="font-medium text-gray-900">
          {table?.name} - {format} 報表
        </h5>
        <p className="text-sm text-gray-600 mt-1">
          包含 {selectedFields.length} 個數據欄位
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="font-medium text-green-700">資料完整度</div>
          <div className="text-green-600">95%</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="font-medium text-blue-700">預估頁數</div>
          <div className="text-blue-600">
            {selectedFields.length * 2 + (includeCharts ? 3 : 0) + (includeAnalysis ? 2 : 0)} 頁
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 生成進度組件
 */
const GenerationProgress = ({ step }) => {
  const steps = [
    '準備數據...',
    '生成圖表...',
    '編譯報表...',
    '準備下載...',
    '完成！'
  ];

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-3">正在生成報表</h4>
      <div className="space-y-2">
        {steps.map((stepName, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              index <= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {index < step ? (
                <CheckCircle className="w-3 h-3" />
              ) : index === step ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-sm ${
              index <= step ? 'text-blue-700 font-medium' : 'text-gray-500'
            }`}>
              {stepName}
            </span>
          </div>
        ))}
      </div>
      
      {/* 進度條 */}
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// 輔助函數
const getFieldDescription = (field) => {
  const descriptions = {
    '股價': '開高低收價格',
    '成交量': '交易量資訊',
    '技術指標': 'RSI、MACD等',
    '基本面數據': '財務指標',
    '籌碼分析': '主力動向'
  };
  return descriptions[field] || '';
};

const getFormatDescription = (format) => {
  const descriptions = {
    'PDF': '完整版面',
    'Excel': '可編輯數據',
    'CSV': '純數據格式'
  };
  return descriptions[format] || '';
};

export default ReportModal;