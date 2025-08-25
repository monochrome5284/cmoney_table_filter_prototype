// ========================================================================================
// src/components/DataConvert/ExcelFieldConverterPage.js
// Excel 欄位轉換頁面組件
// ========================================================================================

import React, { useEffect } from 'react';
import { ArrowLeft, Upload, Download, Search, Eye, RefreshCw, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';
import { useExcelFieldConverter } from '../../hooks/useExcelFieldConverter';

const ExcelFieldConverterPage = ({ onBack, onDataConverted, tableData }) => {
  const converterHook = useExcelFieldConverter(onDataConverted);
  
  // 當外部 tableData 更新時，通知 Hook
  useEffect(() => {
    if (tableData) {
      converterHook.updateTableData(tableData);
    }
  }, [tableData]);

  const {
    setErrorMessage,
    setProcessingStatus,
    setCurrentStep,
    setExcelData,
    currentStep,
    uploadedFile,
    fileInputRef,
    excelData,
    matchResults,
    finalResults,
    processingStatus,
    sortFields,
    errorMessage,
    handleFileUpload,
    performMatching,
    selectMatch,
    generateFinalResults,
    exportResults,
    resetTool
  } = converterHook;

  // 拖拽上傳處理
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };


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
            <h1 className="text-2xl font-bold text-gray-900">Excel 欄位轉換工具</h1>
          </div>

          {/* Debug 資訊 - 可選 */}
          {process.env.NODE_ENV === 'development' && tableData && (
            <div className="text-xs text-gray-500">
              Debug: 載入了 {tableData.tableList?.length || 0} 個表格
            </div>
          )}
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 標題和進度條 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Excel 欄位轉換工具
        </h1>
        <p className="text-gray-600 mb-6">
          上傳Excel檔案，自動匹配並添加欄位資訊到現有表格資料中
        </p>
        
        {/* 步驟進度條 */}
        <div className="flex items-center space-x-4 mb-6">
          {[
            { step: 1, label: '上傳檔案', icon: Upload },
            { step: 2, label: '解析數據', icon: FileSpreadsheet },
            { step: 3, label: '匹配預覽', icon: Search },
            { step: 4, label: '匯出結果', icon: Download }
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {currentStep > step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= step ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 步驟1: 檔案上傳 */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">步驟 1: 上傳 Excel 檔案</h2>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              拖拽檔案到這裡，或點擊選擇檔案
            </h3>
            <p className="text-gray-500 mb-4">
              支援 .xlsx 和 .xls 格式，檔案大小限制 20MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              選擇檔案
            </button>
          </div>

          {/* 檔案格式說明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Excel 檔案格式要求：</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 三欄格式：ID | 資料表 | 欄位名稱</li>
              <li>• 欄位名稱中的 [] 符號會自動移除</li>
              <li>• 系統會保留欄位名稱中的空白、()、% 等特殊符號</li>
              <li>• 特定欄位會自動排序至末尾：代號、名稱、股票代號、股票名稱、日期、年月、年季、年度、RTIME</li>
              <li>• 資料類型會根據欄位名稱自動推斷（價、量、率 → number；日期、時間 → date）</li>
            </ul>
            <div className="mt-2 p-2 bg-white rounded border text-xs font-mono">
              <strong>範例格式：</strong><br/>
              M001 | 日分價量表統計 | [日期]<br/>
              M001 | 日分價量表統計 | [股票代號]<br/>
              M001 | 日分價量表統計 | [收盤價]<br/>
              M001 | 日分價量表統計 | [成交量]
            </div>
          </div>

          {/* 錯誤訊息 */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-red-700 font-medium">處理失敗</span>
                  <div className="text-red-600 text-sm mt-1">{errorMessage}</div>
                  
                  {/* 常見問題解決方案 */}
                  <details className="mt-2">
                    <summary className="text-red-600 text-sm cursor-pointer hover:text-red-700">
                      常見問題解決方案 ▼
                    </summary>
                    <div className="mt-2 text-xs text-red-600 space-y-1">
                      <div>• <strong>網路問題：</strong>請檢查網路連線，重新整理頁面後再試</div>
                      <div>• <strong>檔案格式：</strong>確認是.xlsx或.xls格式，不是.csv或其他格式</div>
                      <div>• <strong>檔案損壞：</strong>嘗試在Excel中重新保存檔案</div>
                      <div>• <strong>資料格式：</strong>確認包含 ID、資料表、欄位名稱 三個欄位</div>
                      <div>• <strong>檔案大小：</strong>確認檔案小於20MB</div>
                    </div>
                  </details>
                  
                  {/* 重試按鈕 */}
                  <button 
                    onClick={() => {
                      setErrorMessage('');
                      setProcessingStatus('idle');
                      if (uploadedFile) {
                        handleFileUpload(uploadedFile);
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
                  >
                    重新處理檔案
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 處理狀態 */}
          {processingStatus === 'processing' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
              <RefreshCw className="w-5 h-5 text-yellow-500 mr-2 animate-spin" />
              <span className="text-yellow-700">正在解析Excel檔案...</span>
            </div>
          )}
          
          {/* 測試功能按鈕 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">沒有Excel檔案？</h4>
              <p className="text-sm text-gray-600 mb-3">
                您可以使用測試數據來體驗轉換功能
              </p>
              <button 
                onClick={() => {
                  // 創建模擬的Excel數據用於測試
                  const mockExcelData = {
                    fileName: 'test_data.xlsx',
                    sheets: 1,
                    tables: [
                      {
                        sheetName: 'Sheet1',
                        tableId: 'M001',
                        tableName: '日分價量表統計',
                        originalTableName: '日分價量表統計',
                        fields: [
                          { name: '開盤價', type: 'number', description: '', searchable: true },
                          { name: '最高價', type: 'number', description: '', searchable: true },
                          { name: '最低價', type: 'number', description: '', searchable: true },
                          { name: '收盤價', type: 'number', description: '', searchable: true },
                          { name: '成交量', type: 'number', description: '', searchable: true },
                          { name: '股票代號', type: 'string', description: '', searchable: true },
                          { name: '股票名稱', type: 'string', description: '', searchable: true },
                          { name: '日期', type: 'date', description: '', searchable: true }
                        ],
                        fieldCount: 8
                      },
                      {
                        sheetName: 'Sheet1',
                        tableId: 'M002',
                        tableName: '財報基本資料',
                        originalTableName: '財報基本資料',
                        fields: [
                          { name: '營收', type: 'number', description: '', searchable: true },
                          { name: '毛利率', type: 'number', description: '', searchable: true },
                          { name: 'EPS', type: 'number', description: '', searchable: true },
                          { name: '股票代號', type: 'string', description: '', searchable: true },
                          { name: '年季', type: 'string', description: '', searchable: true }
                        ],
                        fieldCount: 5
                      }
                    ],
                    totalFields: 13,
                    processingDetails: {
                      totalRowsProcessed: 13,
                      sheetsProcessed: 1,
                      tablesFound: 2
                    }
                  };
                  
                  // 應用排序
                  mockExcelData.tables.forEach(table => {
                    table.fields = sortFields(table.fields);
                  });
                  
                  setExcelData(mockExcelData);
                  setProcessingStatus('success');
                  setCurrentStep(2);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🧪 使用測試資料
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步驟2: 解析結果預覽 */}
      {currentStep === 2 && excelData && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">步驟 2: Excel 解析結果</h2>
          
          {/* 解析摘要 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{excelData.sheets}</div>
              <div className="text-sm text-blue-800">工作表數量</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{excelData.tables.length}</div>
              <div className="text-sm text-green-800">發現的表格</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{excelData.totalFields}</div>
              <div className="text-sm text-purple-800">總欄位數</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{tableData.tableList.length}</div>
              <div className="text-sm text-orange-800">現有表格</div>
            </div>
          </div>

          {/* 表格詳細資訊 */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">解析的表格資訊：</h3>
            {excelData.tables.map((table, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{table.tableName}</h4>
                    {table.originalTableName !== table.tableName && (
                      <div className="text-xs text-gray-500">
                        原始名稱: {table.originalTableName}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {table.fieldCount} 個欄位
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {table.tableId}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  工作表：{table.sheetName}
                </div>
                
                {/* 欄位預覽 - 顯示排序後的結果 */}
                <div>
                  <div className="text-xs text-gray-600 mb-2">欄位預覽（已排序）：</div>
                  <div className="flex flex-wrap gap-1">
                    {table.fields.slice(0, 8).map((field, fieldIndex) => {
                      // 檢查是否為排序到末尾的欄位
                      const isEndField = ['代號', '名稱', '股票代號', '股票名稱', '日期', '年月', '年季', '年度', 'RTIME']
                        .some(priority => field.name.includes(priority) || field.name === priority);
                      
                      return (
                        <span 
                          key={fieldIndex}
                          className={`px-2 py-1 text-xs rounded-full ${
                            isEndField 
                              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                              : field.type === 'number' 
                                ? 'bg-green-100 text-green-700'
                                : field.type === 'date'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                          }`}
                          title={`類型: ${field.type}${isEndField ? ' (排序至末尾)' : ''}`}
                        >
                          {field.name}
                        </span>
                      );
                    })}
                    {table.fields.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{table.fields.length - 8} 更多
                      </span>
                    )}
                  </div>
                  
                  {/* 顯示排序到末尾的欄位統計 */}
                  {(() => {
                    const endFieldCount = table.fields.filter(field => 
                      ['代號', '名稱', '股票代號', '股票名稱', '日期', '年月', '年季', '年度', 'RTIME']
                        .some(priority => field.name.includes(priority) || field.name === priority)
                    ).length;
                    
                    return endFieldCount > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        ⚡ {endFieldCount} 個欄位已自動排序至末尾
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={performMatching}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              開始匹配現有表格
            </button>
            <button 
              onClick={resetTool}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              重新上傳
            </button>
          </div>
        </div>
      )}

      {/* 步驟3: 匹配結果和手動調整 */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">步驟 3: 匹配結果預覽</h2>
          
          {/* 匹配統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {matchResults.filter(r => r.matchType === 'exact').length}
              </div>
              <div className="text-sm text-green-800">精確匹配</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {matchResults.filter(r => r.matchType === 'fuzzy').length}
              </div>
              <div className="text-sm text-yellow-800">模糊匹配</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {matchResults.filter(r => r.matchType === 'none').length}
              </div>
              <div className="text-sm text-red-800">無法匹配</div>
            </div>
          </div>

          {/* 匹配詳細結果 */}
          <div className="space-y-4 mb-6">
            {matchResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{result.excelTable.tableName}</h4>
                    <div className="text-sm text-gray-600">
                      {result.excelTable.fieldCount} 個欄位
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    result.matchType === 'exact' ? 'bg-green-100 text-green-700' :
                    result.matchType === 'fuzzy' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.matchType === 'exact' ? '精確匹配' :
                     result.matchType === 'fuzzy' ? '模糊匹配' :
                     '無匹配'}
                  </div>
                </div>

                {/* 精確匹配 */}
                {result.exactMatch && (
                  <div className="p-3 bg-green-50 rounded-lg mb-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">
                        已匹配：{result.exactMatch.name}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      {result.exactMatch.market} | {result.exactMatch.aspect}
                    </div>
                  </div>
                )}

                {/* 模糊匹配選項 */}
                {result.matchType === 'fuzzy' && (
                  <div className="space-y-2 mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      建議的匹配選項：
                    </label>
                    {result.fuzzyMatches.map((fuzzyMatch, fuzzyIndex) => (
                      <label key={fuzzyIndex} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name={`match-${index}`}
                          checked={result.selectedMatch?.id === fuzzyMatch.table.id}
                          onChange={() => selectMatch(index, fuzzyMatch.table)}
                          className="text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{fuzzyMatch.table.name}</div>
                          <div className="text-sm text-gray-600">
                            相似度: {(fuzzyMatch.similarity * 100).toFixed(1)}% | 
                            {fuzzyMatch.table.market} | {fuzzyMatch.table.aspect}
                          </div>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name={`match-${index}`}
                        checked={!result.selectedMatch}
                        onChange={() => selectMatch(index, null)}
                        className="text-purple-600"
                      />
                      <span className="text-gray-600">不匹配任何表格</span>
                    </label>
                  </div>
                )}

                {/* 無匹配的處理 */}
                {result.matchType === 'none' && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-800">
                        無法找到相似的表格，此表格將被跳過
                      </span>
                    </div>
                  </div>
                )}

                {/* 欄位預覽 */}
                <div className="mt-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700">
                      <Eye className="w-4 h-4 inline mr-1" />
                      查看欄位詳細資訊 ({result.excelTable.fieldCount} 個欄位)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded max-h-48 overflow-y-auto">
                      <div className="text-xs text-gray-600 mb-2">
                        欄位排序：一般欄位在前，系統欄位在後
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {result.excelTable.fields.map((field, fieldIndex) => {
                          const isEndField = ['代號', '名稱', '股票代號', '股票名稱', '日期', '年月', '年季', '年度', 'RTIME']
                            .some(priority => field.name.includes(priority) || field.name === priority);
                          
                          return (
                            <div key={fieldIndex} className={`flex items-center justify-between p-2 rounded ${
                              isEndField ? 'bg-orange-50 border border-orange-200' : 'bg-white'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-medium min-w-0 truncate">
                                  {field.name}
                                </span>
                                {isEndField && (
                                  <span className="text-orange-600 text-xs">📌</span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                field.type === 'string' ? 'bg-blue-100 text-blue-700' :
                                field.type === 'number' ? 'bg-green-100 text-green-700' :
                                field.type === 'date' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {field.type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        📌 標記的欄位已排序至末尾
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={generateFinalResults}
              disabled={matchResults.filter(r => r.status === 'matched').length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              生成最終結果
            </button>
            <button 
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              返回上一步
            </button>
          </div>
        </div>
      )}

      {/* 步驟4: 最終結果和匯出 */}
      {currentStep === 4 && finalResults && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">步驟 4: 轉換完成</h2>
          
          {/* 最終統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {finalResults.summary.totalTables}
              </div>
              <div className="text-sm text-blue-800">總表格數</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {finalResults.summary.matchedTables}
              </div>
              <div className="text-sm text-green-800">成功匹配</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {finalResults.summary.unmatchedTables}
              </div>
              <div className="text-sm text-red-800">未匹配</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {finalResults.summary.totalFields}
              </div>
              <div className="text-sm text-purple-800">新增欄位</div>
            </div>
          </div>

          {/* 成功提示 */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center mb-6">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <div className="font-medium text-green-800">轉換完成！</div>
              <div className="text-sm text-green-700">
                已成功為 {finalResults.summary.matchedTables} 個表格添加了欄位資訊
              </div>
            </div>
          </div>

          {/* 匯出選項 */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">匯出結果：</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">完整 JSON 資料</h4>
                  <p className="text-sm text-gray-600">
                    包含所有表格的完整資料結構，含新增的欄位資訊
                  </p>
                </div>
                <button 
                  onClick={exportResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>下載 JSON</span>
                </button>
              </div>
              <div className="text-xs text-gray-500">
                檔案名稱：{finalResults.exportData.fileName}
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex space-x-4">
            <button 
              onClick={resetTool}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>處理新檔案</span>
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              返回修改匹配
            </button>
          </div>

          {/* 預覽區域 */}
          <div className="mt-8">
            <details className="group">
              <summary className="cursor-pointer text-lg font-medium text-purple-600 hover:text-purple-700 mb-4">
                <Eye className="w-5 h-5 inline mr-2" />
                預覽更新後的資料結構
              </summary>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify({
                    ...finalResults.mergedData,
                    tableList: finalResults.mergedData.tableList.slice(0, 2)
                    }, null, 2)
                  }
                  {finalResults.mergedData.length > 2 && '\n... 更多資料 ...'}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

// 步驟進度條組件
const StepProgressBar = ({ currentStep }) => {
  const steps = [
    { step: 1, label: '上傳檔案', icon: Upload },
    { step: 2, label: '解析數據', icon: FileSpreadsheet },
    { step: 3, label: '匹配預覽', icon: Search },
    { step: 4, label: '匯出結果', icon: Download }
  ];

  return (
    <div className="flex items-center space-x-4 mb-8">
      {steps.map(({ step, label, icon: Icon }) => (
        <div key={step} className="flex items-center">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full border-2 
            ${currentStep >= step 
              ? 'bg-purple-600 border-purple-600 text-white' 
              : 'border-gray-300 text-gray-400'
            }
          `}>
            {currentStep > step ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Icon className="w-5 h-5" />
            )}
          </div>
          <span className={`ml-2 text-sm ${
            currentStep >= step ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ExcelFieldConverterPage;