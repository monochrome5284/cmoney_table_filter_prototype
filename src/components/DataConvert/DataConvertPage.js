// src/components/DataConvert/DataConvertPage.js
// 數據轉換頁面組件

import React from 'react';
import { ArrowLeft, Upload, Download, Code, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useDataConvert } from '../../hooks/useDataConvert';
import { SAMPLE_CSV_DATA } from '../../constants/tableData';

/**
 * 數據轉換頁面組件
 * @param {Object} props - 組件props
 * @param {Function} props.onBack - 返回回調
 * @param {Function} props.onDataConverted - 數據轉換完成回調
 * @returns {ReactNode}
 */
const DataConvertPage = ({ onBack, onDataConverted }) => {
  const {
    csvInput,
    convertedData,
    statistics,
    isConverting,
    showGeneratedCode,
    error,
    successMessage,
    conversionStatus,
    canConvert,
    hasConvertedData,
    reactCode,
    jsonCode,
    updateCsvInput,
    clearCsvInput,
    loadSampleData,
    convertData,
    downloadJsonFile,
    copyCodeToClipboard,
    applyConvertedData,
    toggleCodeDisplay,
    clearError,
    clearSuccess
  } = useDataConvert(onDataConverted);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頁面標題 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-purple-600 hover:text-purple-700 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回主頁</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">數據轉換工具</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              conversionStatus === 'success' ? 'bg-green-500' :
              conversionStatus === 'error' ? 'bg-red-500' :
              conversionStatus === 'converting' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600">
              {conversionStatus === 'success' ? '轉換完成' :
               conversionStatus === 'error' ? '轉換失敗' :
               conversionStatus === 'converting' ? '轉換中' :
               '待轉換'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* 頁面說明 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">CSV/Excel 數據轉換工具</h3>
              <p className="text-sm text-gray-600">將您的Excel或CSV數據轉換為系統可用的格式，支援批量匯入表格資訊</p>
            </div>

            {/* 消息提示 */}
            <MessageBanner 
              error={error} 
              success={successMessage} 
              onClearError={clearError}
              onClearSuccess={clearSuccess}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左側：輸入區域 */}
              <div className="space-y-6">
                <CSVInputSection 
                  csvInput={csvInput}
                  updateCsvInput={updateCsvInput}
                  clearCsvInput={clearCsvInput}
                  loadSampleData={() => loadSampleData(SAMPLE_CSV_DATA)}
                  isConverting={isConverting}
                />

                <FormatGuideSection />

                <ConversionActionsSection 
                  canConvert={canConvert}
                  isConverting={isConverting}
                  hasConvertedData={hasConvertedData}
                  onConvert={convertData}
                  onToggleCode={toggleCodeDisplay}
                  onDownload={downloadJsonFile}
                  onApply={applyConvertedData}
                  showGeneratedCode={showGeneratedCode}
                />
              </div>

              {/* 右側：結果區域 */}
              <div className="space-y-6">
                {hasConvertedData && (
                  <>
                    <StatisticsSection statistics={statistics} />
                    <ConversionResultSection 
                      convertedData={convertedData}
                      statistics={statistics}
                    />
                  </>
                )}

                {showGeneratedCode && hasConvertedData && (
                  <CodeDisplaySection 
                    reactCode={reactCode}
                    jsonCode={jsonCode}
                    onCopyCode={copyCodeToClipboard}
                  />
                )}

                {!hasConvertedData && !isConverting && (
                  <PlaceholderSection />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 消息橫幅組件
 */
const MessageBanner = ({ error, success, onClearError, onClearSuccess }) => {
  if (!error && !success) return null;

  return (
    <div className="mb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">轉換錯誤</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button 
            onClick={onClearError}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-800">操作成功</h4>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
          <button 
            onClick={onClearSuccess}
            className="text-green-400 hover:text-green-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * CSV輸入區域組件
 */
const CSVInputSection = ({ 
  csvInput, 
  updateCsvInput, 
  clearCsvInput, 
  loadSampleData, 
  isConverting 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">CSV數據輸入</label>
    <textarea
      value={csvInput}
      onChange={(e) => updateCsvInput(e.target.value)}
      placeholder="請貼上CSV數據，或點擊下方載入示範數據"
      className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
      disabled={isConverting}
    />
    <div className="mt-3 flex space-x-3">
      <button
        onClick={loadSampleData}
        disabled={isConverting}
        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        載入示範數據
      </button>
      <button
        onClick={clearCsvInput}
        disabled={isConverting || !csvInput}
        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        清空
      </button>
      <div className="text-xs text-gray-500 self-center">
        {csvInput.length} 字符
      </div>
    </div>
  </div>
);

/**
 * 格式說明區域組件
 */
const FormatGuideSection = () => (
  <div className="p-4 bg-blue-50 rounded-lg">
    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
      <Info className="w-4 h-4 mr-2" />
      CSV格式要求
    </h4>
    <div className="text-sm text-blue-700 space-y-2">
      <p>請確保CSV包含以下欄位（順序可以不同）：</p>
      <div className="bg-blue-100 p-2 rounded font-mono text-xs">
        Table名稱,市場,面向,類別,樣本,描述
      </div>
      <ul className="space-y-1 text-xs">
        <li>• Table名稱：表格的顯示名稱（必填）</li>
        <li>• 市場：台灣/美國/中國/香港（必填）</li>
        <li>• 面向：基本面/技術面/籌碼面/消息面（必填）</li>
        <li>• 類別：具體分類名稱（必填）</li>
        <li>• 樣本：更詳細的子分類（必填）</li>
        <li>• 描述：表格說明（選填）</li>
      </ul>
    </div>
  </div>
);

/**
 * 轉換操作區域組件
 */
const ConversionActionsSection = ({ 
  canConvert, 
  isConverting, 
  hasConvertedData, 
  onConvert, 
  onToggleCode, 
  onDownload, 
  onApply,
  showGeneratedCode 
}) => (
  <div className="flex flex-wrap gap-3">
    <button
      onClick={onConvert}
      disabled={!canConvert}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
        isConverting 
          ? 'bg-yellow-500 text-white cursor-not-allowed' 
          : canConvert
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Upload className="w-4 h-4" />
      <span>{isConverting ? '轉換中...' : '轉換數據'}</span>
    </button>
    
    {hasConvertedData && (
      <>
        <button
          onClick={onToggleCode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Code className="w-4 h-4" />
          <span>{showGeneratedCode ? '隱藏' : '顯示'}代碼</span>
        </button>
        
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>下載JSON</span>
        </button>
        
        <button
          onClick={onApply}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          應用到系統
        </button>
      </>
    )}
  </div>
);

/**
 * 統計資訊區域組件
 */
const StatisticsSection = ({ statistics }) => {
  if (!statistics) return null;

  const { overview } = statistics;

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">轉換統計</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-purple-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{overview.totalTables}</div>
          <div className="text-sm text-gray-600">總表格數</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{overview.totalMarkets}</div>
          <div className="text-sm text-gray-600">市場數</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{overview.totalAspects}</div>
          <div className="text-sm text-gray-600">面向數</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{overview.totalClasses}</div>
          <div className="text-sm text-gray-600">類別數</div>
        </div>
      </div>
    </div>
  );
};

/**
 * 轉換結果區域組件
 */
const ConversionResultSection = ({ convertedData, statistics }) => {
  if (!convertedData || !statistics) return null;

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">轉換結果預覽</h4>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="text-sm font-medium text-gray-700">表格清單 (前5筆)</div>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {convertedData.tableList.slice(0, 5).map((table, index) => (
            <div key={index} className="px-4 py-2 border-b border-gray-100 last:border-b-0">
              <div className="font-medium text-sm text-gray-900">{table.name}</div>
              <div className="text-xs text-gray-500">
                {table.market} • {table.aspect} • {table.class} • {table.sample}
              </div>
            </div>
          ))}
          {convertedData.tableList.length > 5 && (
            <div className="px-4 py-2 text-xs text-gray-500 text-center">
              還有 {convertedData.tableList.length - 5} 筆數據...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 代碼顯示區域組件
 */
const CodeDisplaySection = ({ reactCode, jsonCode, onCopyCode }) => (
  <div>
    <h4 className="font-medium text-gray-900 mb-3">生成的代碼</h4>
    <div className="space-y-4">
      {/* React代碼 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">React數據結構</label>
          <button
            onClick={() => onCopyCode('react')}
            className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-1 hover:bg-purple-50"
          >
            複製React代碼
          </button>
        </div>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-32">
          {reactCode}
        </pre>
      </div>

      {/* JSON代碼 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">JSON格式</label>
          <button
            onClick={() => onCopyCode('json')}
            className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
          >
            複製JSON代碼
          </button>
        </div>
        <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-xs overflow-x-auto max-h-32">
          {jsonCode}
        </pre>
      </div>
    </div>
  </div>
);

/**
 * 佔位符區域組件
 */
const PlaceholderSection = () => (
  <div className="text-center py-12">
    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">開始轉換數據</h3>
    <p className="text-gray-500 mb-4">輸入CSV數據並點擊轉換按鈕</p>
    <div className="text-sm text-gray-400">
      <p>轉換完成後，這裡將顯示：</p>
      <ul className="mt-2 space-y-1">
        <li>• 數據統計資訊</li>
        <li>• 轉換結果預覽</li>
        <li>• 生成的代碼</li>
        <li>• 下載和應用選項</li>
      </ul>
    </div>
  </div>
);

export default DataConvertPage;