// src/App.js 主頁重新設計版本

import React, { useState, useEffect } from 'react';
import { Database, Upload, Settings, Filter, Search, X } from 'lucide-react';
import ExcelFieldConverterPage from './components/DataConvert/ExcelFieldConverterPage';


// 配置和數據
import { APP_CONFIG } from './constants/config';
import { DEFAULT_TABLE_DATA } from './constants/tableData';

// 主要組件
import FilterSection from './components/TableSystem/FilterSection';
import TableList from './components/TableSystem/TableList';
import PreviewModal from './components/TableSystem/PreviewModal';
import ReportModal from './components/TableSystem/ReportModal';
import DataConvertPage from './components/DataConvert/DataConvertPage';
import DataManageePage from './components/DataManage/DataManagePage';
import Modal from './components/common/Modal';

// 自定義Hooks
import { useTableFilter } from './hooks/useTableFilter';

// 引入搜尋工具
import { searchTables } from './utils/dataProcessor';

/**
 * 主要應用程式組件
 */
const App = () => {
  // ===== 全局狀態管理 =====
  const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);
  const [currentPage, setCurrentPage] = useState('main'); // main, convert, manage, excel-field-convert
  
  // Modal狀態
  const [showTableSystemModal, setShowTableSystemModal] = useState(true); // 預設開啟 表格查詢系統Modal 
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  
  // 側邊欄狀態（僅在表格系統Modal中使用）
  const [showSidebar, setShowSidebar] = useState(true);

  // 搜尋狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 開發者模式檢測
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  
  // ===== 使用自定義Hooks =====
  const filterState = useTableFilter(tableData);
  
  // 計算搜尋結果
  const searchResults = searchTables(tableData.tableList, searchTerm);

  // 開發者模式檢測
  useEffect(() => {
    const checkDeveloperMode = () => {
      // 檢測開發者模式的方法
      const isDevMode = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' ||
                       window.location.search.includes('dev=true');
      setIsDeveloperMode(isDevMode);
    };

    checkDeveloperMode();
  }, []);
  
  // ===== 事件處理函數 =====
  
  // 處理表格預覽 - 直接開啟報表
  const handleTablePreview = (table) => {
    setSelectedTable(table);
    setShowReportModal(true);
  };

  // 處理搜尋變更
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setIsSearchMode(true);
    } else {
      setIsSearchMode(false);
    }
  };

  // 處理數據更新
  const handleDataUpdate = (newData) => {
    setTableData(newData);
    console.log('數據已更新:', newData.metadata);
  };

  // 響應式處理
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  };

  // 監聽視窗大小變更
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始檢查
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 重設表格系統狀態
  const resetTableSystemState = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    filterState.resetAllFilters();
  };

  // ===== 渲染邏輯 =====
  
  // 數據轉換頁面
  if (currentPage === 'convert') {
    return (
      <DataConvertPage 
        onBack={() => setCurrentPage('main')}
        onDataConverted={handleDataUpdate}
      />
    );
  }

  // 數據管理頁面
  if (currentPage === 'manage') {
    return (
      <DataManageePage 
        onBack={() => setCurrentPage('main')}
        tableData={tableData}
        onDataUpdate={handleDataUpdate}
      />
    );
  }

  if (currentPage === 'excel-field-convert') {
    return (
      <ExcelFieldConverterPage 
        onBack={() => setCurrentPage('main')}
        onDataConverted={handleDataUpdate}
        tableData={tableData} // 重要：傳遞完整的 tableData 結構
      />
    );
  }

  // ===== 主頁面渲染 =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主頁面 - 功能選擇 */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* 頁面標題 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              資料查詢與管理系統
            </h1>
            <p className="text-lg text-gray-600">
              選擇您需要的功能開始使用
            </p>
            {isDeveloperMode && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  開發者模式
                </span>
              </div>
            )}
          </div>

          {/* 功能選擇卡片 */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {/* 表格查詢系統 - 主要功能 */}
            <div className="lg:col-span-2">
              <button
                onClick={() => {
                  resetTableSystemState();
                  setShowTableSystemModal(true);
                }}
                className="w-full h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 text-left group"
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Database className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                      表格查詢系統
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      搜尋和篩選表格資料，支援多層級篩選和關鍵字搜尋
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        表格搜尋
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        多層篩選
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        報表產生
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* 開發者工具區域 */}
            <div className="space-y-6">
              {/* 數據轉換工具 - 開發者模式 */}
              {isDeveloperMode && (
                <button
                  onClick={() => setCurrentPage('convert')}
                  className="w-full p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        數據轉換工具
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        CSV轉換為系統格式
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Excel欄位數據轉換工具 - 開發者模式 */}
              {isDeveloperMode && (
                <button
                  onClick={() => setCurrentPage('excel-field-convert')}
                  className="w-full p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        Excel欄位數據轉換工具
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Excel轉換為系統格式
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* 數據管理 - 開發者模式 */}
              {isDeveloperMode && (
                <button
                  onClick={() => setCurrentPage('manage')}
                  className="w-full p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                        數據管理
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        匯入、匯出和備份數據
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* 非開發者模式提示 */}
              {!isDeveloperMode && (
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      開發者工具
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      需要開發者模式才能使用
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 底部資訊 */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>© 2024 資料查詢與管理系統</p>
            <p className="mt-1">
              表格數量: {tableData.tableList.length} | 
              最後更新: {tableData.metadata.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* 表格查詢系統 Modal */}
      <Modal
        isOpen={showTableSystemModal}
        onClose={() => setShowTableSystemModal(false)}
        title=""
        size="full"
        showCloseButton={false}
        closeOnOverlayClick={false}
        closeOnEscape={true}
      >
        {/* 使用絕對定位確保滾動正常 */}
        <div className="absolute inset-0 flex">
          {/* 左側邊欄 */}
          <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            showSidebar ? 'w-80' : 'w-0'
          } overflow-hidden flex-shrink-0 h-full`}>
            <div className="h-full flex flex-col">
              {/* 側邊欄頭部 - 固定高度 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{height: '80px'}}>
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <span>篩選器</span>
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* 篩選器內容 - 可滾動區域 */}
              <div className="p-6 overflow-y-auto" style={{height: 'calc(100% - 80px)'}}>
                <FilterSection 
                  tableData={tableData}
                  filterState={filterState}
                  filterActions={{
                    handleMarketChange: filterState.handleMarketChange,
                    handleAspectChange: filterState.handleAspectChange,
                    handleClassToggle: filterState.handleClassToggle,
                    handleSampleToggle: filterState.handleSampleToggle,
                    handleSearchChange: filterState.handleSearchChange,
                    resetAllFilters: filterState.resetAllFilters,
                    selectAllClasses: filterState.selectAllClasses,
                    clearClassSelection: filterState.clearClassSelection,
                    selectAllSamples: filterState.selectAllSamples,
                    clearSampleSelection: filterState.clearSampleSelection
                  }}
                  isSearchMode={isSearchMode}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          </div>

          {/* 主內容區 */}
          <div className="flex-1 h-full flex flex-col">
            {/* 頂部工具列 - 固定高度 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4" style={{height: '80px'}}>
              <div className="flex items-center justify-between h-full">
                {/* 左側：切換側邊欄按鈕和關閉按鈕 */}
                <div className="flex items-center space-x-4">
                  {!showSidebar && (
                    <button
                      onClick={() => setShowSidebar(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="顯示篩選器"
                    >
                      <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">表格查詢系統</h1>
                  <button
                    onClick={() => setShowTableSystemModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                    title="關閉"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 右側：搜尋欄位 */}
                <div className="flex justify-end items-center">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="搜尋..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 表格列表區域 - 可滾動區域 */}
            <div className="p-6 overflow-y-auto" style={{height: 'calc(100% - 80px)'}}>
              <TableList 
                tables={isSearchMode ? searchResults : filterState.filteredTables}
                totalCount={tableData.tableList.length}
                onTablePreview={handleTablePreview}
                loading={false}
                searchTerm={searchTerm}
                isSearchMode={isSearchMode}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 報表Modal */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        table={selectedTable}
      />
    </div>
  );
};

export default App;