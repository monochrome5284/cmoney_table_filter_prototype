// src/App.js
// 主要應用程式組件

import React, { useState, useEffect } from 'react';
import { Database, Upload, Settings, Filter } from 'lucide-react';

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

/**
 * 主要應用程式組件
 */
const App = () => {
  // ===== 全局狀態管理 =====
  const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);
  const [currentPage, setCurrentPage] = useState('main'); // main, convert, manage
  
  // Modal狀態
  const [showMainModal, setShowMainModal] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  
  // 側邊欄狀態
  const [showSidebar, setShowSidebar] = useState(true);
  
  // ===== 使用自定義Hooks =====
  const filterState = useTableFilter(tableData);
  
  // ===== 事件處理函數 =====
  
  // 處理表格預覽
  const handleTablePreview = (table) => {
    setSelectedTable(table);
    setShowPreview(true);
  };

  // 處理生成報表
  const handleGenerateReport = (table) => {
    setSelectedTable(table);
    setShowReportModal(true);
  };

  // 處理數據更新
  const handleDataUpdate = (newData) => {
    setTableData(newData);
    console.log('數據已更新:', newData.metadata);
  };

  // 處理頁面切換
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 關閉所有Modal
    setShowMainModal(false);
    setShowPreview(false);
    setShowReportModal(false);
  };

  // 返回主頁
  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  // ===== 初始化效果 =====
  useEffect(() => {
    // 組件掛載時的初始化邏輯
    console.log('應用程式已載入，表格數據:', tableData.metadata);
  }, []);

  // 監聽數據變化
  useEffect(() => {
    // 當表格數據變化時執行的邏輯
    if (tableData.metadata) {
      document.title = `${APP_CONFIG.APP_NAME} - ${tableData.metadata.totalTables} 個表格`;
    }
  }, [tableData]);

  // ===== 組件渲染 =====

  // 根據當前頁面渲染對應組件
  if (currentPage === 'convert') {
    return (
      <DataConvertPage 
        onBack={handleBackToMain}
        onDataConverted={handleDataUpdate}
      />
    );
  }

  if (currentPage === 'manage') {
    return (
      <DataManageePage 
        onBack={handleBackToMain}
        tableData={tableData}
        onDataUpdate={handleDataUpdate}
      />
    );
  }

  // 主頁面
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 主網站模擬頁面 */}
      <HeaderSection 
        onShowMainModal={() => setShowMainModal(true)}
        onPageChange={handlePageChange}
      />

      <MainContentSection tableData={tableData} />

      {/* 表格查詢系統Modal */}
      <TableSystemModal 
        showMainModal={showMainModal}
        onClose={() => setShowMainModal(false)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        tableData={tableData}
        filterState={filterState}
        onTablePreview={handleTablePreview}
      />

      {/* 預覽Modal */}
      <PreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        table={selectedTable}
        onGenerateReport={handleGenerateReport}
      />

      {/* 自訂報表Modal */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        table={selectedTable}
      />
    </div>
  );
};

/**
 * 頁面標題區域組件
 */
const HeaderSection = ({ onShowMainModal, onPageChange }) => (
  <div className="bg-white border-b border-gray-200 p-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{APP_CONFIG.APP_NAME}</h1>
      <div className="flex items-center space-x-3">
        {/* 開發者工具按鈕（可控制顯示） */}
        {APP_CONFIG.SHOW_DEV_TOOLS && (
          <>
            <button
              onClick={() => onPageChange('convert')}
              className="px-4 py-3 text-white rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#0ea5e9' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
            >
              <Upload 
                className="w-4 h-4" 
                Style={{ backgroundColor: 'transparent', color: 'inherit' }}
              />
              <span
                Style={{ backgroundColor: 'transparent', color: 'inherit' }}
              >數據轉換</span>
            </button>
            <button
              onClick={() => onPageChange('manage')}
              className="px-4 py-3 text-white rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#10b981' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              <Settings 
                className="w-4 h-4" 
                Style={{ backgroundColor: 'transparent', color: 'inherit' }}
              />
              <span
                Style={{ backgroundColor: 'transparent', color: 'inherit' }}
              >數據管理</span>
            </button>
          </>
        )}
        <button
          onClick={onShowMainModal}
          className="px-4 py-3 text-white rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
          style={{ backgroundColor: '#6366f1' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
        >
          <Database 
            className="w-4 h-4"
            Style={{ backgroundColor: 'transparent', color: 'inherit' }} 
          />
          <span
            Style={{ backgroundColor: 'transparent', color: 'inherit' }}
          >表格查詢系統</span>
        </button>
      </div>
    </div>
  </div>
);

/**
 * 主要內容區域組件
 */
const MainContentSection = ({ tableData }) => (
  <div className="max-w-7xl mx-auto p-6">
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        歡迎使用{APP_CONFIG.APP_NAME}
      </h2>
      <p className="text-gray-600 mb-6">
        這是一個功能完整的投資數據分析平台。點擊右上角的「表格查詢系統」按鈕開啟主要功能。
      </p>
      
      {/* 功能介紹卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="4層級篩選"
          description="支援市場、面向、類別、樣本的層級聯動篩選"
          icon={<Filter className="w-6 h-6 text-purple-600" />}
        />
        
        {APP_CONFIG.SHOW_DEV_TOOLS && (
          <>
            <FeatureCard 
              title="數據轉換"
              description="將Excel/CSV數據轉換為網頁可用格式"
              icon={<Upload className="w-6 h-6 text-blue-600" />}
            />
            <FeatureCard 
              title="數據管理"
              description="完整的數據匯入、匯出和備份功能"
              icon={<Settings className="w-6 h-6 text-green-600" />}
            />
          </>
        )}
      </div>

      {/* 數據概況 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">當前數據概況</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {tableData.metadata.totalTables}
            </div>
            <div className="text-sm text-gray-600">總表格數</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {tableData.markets.length}
            </div>
            <div className="text-sm text-gray-600">市場數</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {tableData.aspects.length}
            </div>
            <div className="text-sm text-gray-600">分析面向</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {tableData.metadata.dataVersion}
            </div>
            <div className="text-sm text-gray-600">數據版本</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          最後更新：{tableData.metadata.lastUpdated} | 來源：{tableData.metadata.source}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 功能卡片組件
 */
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="font-medium text-gray-900 ml-3">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

/**
 * 表格系統Modal組件
 */
const TableSystemModal = ({ 
  showMainModal, 
  onClose, 
  showSidebar, 
  onToggleSidebar, 
  tableData, 
  filterState, 
  onTablePreview 
}) => {
  if (!showMainModal) return null;

  return (
    <Modal
      isOpen={showMainModal}
      onClose={onClose}
      title="表格查詢系統"
      size="xl"
      zIndex={APP_CONFIG.MODAL.Z_INDEX.MAIN}
      className="h-[90vh] flex flex-col"
    >
      <div className="flex-1 overflow-hidden flex">
        {/* 側邊篩選器 */}
        <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
          showSidebar ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          <div className="w-80 p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">篩選器</h3>
              <button
                onClick={onToggleSidebar}
                className="text-gray-400 hover:text-gray-600"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="dropdown-container">
              <FilterSection 
                tableData={tableData}
                filterState={filterState}
                filterActions={filterState}
              />
            </div>
          </div>
        </div>

        {/* 主內容區 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {!showSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mb-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>顯示篩選器</span>
              </button>
            )}
            <TableList 
              tables={filterState.filteredTables}
              totalCount={tableData.tableList.length}
              onTablePreview={onTablePreview}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default App;