// src/components/TableSystem/TableList.js 修正版本

import React, { useState } from 'react';
import { List, FileText, Database } from 'lucide-react';

/**
 * 表格列表組件
 * @param {Object} props - 組件props
 * @param {Array} props.tables - 表格陣列
 * @param {number} props.totalCount - 總表格數
 * @param {Function} props.onTablePreview - 表格預覽回調
 * @param {boolean} props.loading - 載入狀態
 * @param {string} props.searchTerm - 搜尋關鍵字
 * @param {boolean} props.isSearchMode - 搜尋模式
 * @param {number} props.fieldsDisplayCount - 欄位顯示數量
 * @returns {ReactNode}
 */
const TableList = ({ 
  tables = [], 
  totalCount = 0, 
  onTablePreview,
  loading = false,
  searchTerm = '',
  isSearchMode = false,
  fieldsDisplayCount = 5  // 預設顯示 5 個欄位
}) => {
  // 修正：將 useState 移到組件內部
  const [expandedFields, setExpandedFields] = useState(new Set());

  // 欄位展開/收合函數
  const toggleFieldsExpansion = (tableId) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableId)) {
        newSet.delete(tableId);
      } else {
        newSet.add(tableId);
      }
      return newSet;
    });
  };
  
  // 獲取標籤顏色
  const getTagColor = (type, value) => {
    const colorMaps = {
      market: {
        '台灣': 'bg-blue-100 text-blue-700',
        '美國': 'bg-green-100 text-green-700',
        '中國': 'bg-red-100 text-red-700',
        '香港': 'bg-purple-100 text-purple-700'
      },
      aspect: {
        '基本面': 'bg-emerald-100 text-emerald-700',
        '技術面': 'bg-amber-100 text-amber-700',
        '籌碼面': 'bg-pink-100 text-pink-700',
        '消息面': 'bg-cyan-100 text-cyan-700'
      },
      class: 'bg-purple-100 text-purple-700',
      sample: 'bg-orange-100 text-orange-700'
    };
    
    if (type === 'market' || type === 'aspect') {
      return colorMaps[type][value] || 'bg-gray-100 text-gray-700';
    }
    
    return colorMaps[type] || 'bg-gray-100 text-gray-700';
  };

  // 載入狀態
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">列表視圖</span>
          </div>
        </div>
        
        {/* 載入骨架 */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="flex space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            顯示 <span className="font-medium text-gray-900">{tables.length}</span> / <span className="font-medium text-gray-900">{totalCount}</span> 個表格
          </span>
          {isSearchMode && searchTerm && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              搜尋: "{searchTerm}"
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">列表視圖</span>
        </div>
      </div>

      {/* 表格清單 */}
      {tables.length === 0 ? (
        <EmptyState searchTerm={searchTerm} isSearchMode={isSearchMode} />
      ) : (
        <div className="space-y-3">
          {tables.map(table => (
            <TableCard 
              key={table.id} 
              table={table} 
              onPreview={onTablePreview}
              getTagColor={getTagColor}
              fieldsDisplayCount={fieldsDisplayCount}
              expandedFields={expandedFields}
              toggleFieldsExpansion={toggleFieldsExpansion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 表格卡片組件
 */
const TableCard = ({ 
  table, 
  onPreview, 
  getTagColor, 
  fieldsDisplayCount,
  expandedFields,
  toggleFieldsExpansion
}) => {
  // 處理多類別和多樣本顯示
  const displayClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
  const displaySamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* 表格名稱 */}
          <h3 className="font-medium text-gray-900 mb-2 truncate group-hover:text-purple-700 transition-colors">
            {table.name}
          </h3>
          
          {/* 標籤區 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {/* 市場標籤 */}
            <span className={`px-2 py-1 text-xs rounded ${getTagColor('market', table.market)}`}>
              {table.market}
            </span>
            {/* 面向標籤 */}
            <span className={`px-2 py-1 text-xs rounded ${getTagColor('aspect', table.aspect)}`}>
              {table.aspect}
            </span>
            {/* 類別標籤 */}
            {displayClasses.length > 0 && (
                displayClasses.map((cls, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getTagColor('class', cls)}`}
                  >
                    {cls}
                  </span>
                ))
            )}
            {/* 樣本標籤 */}
            {displaySamples.length > 0 && (
                displaySamples.map((sample, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getTagColor('sample', sample)}`}
                  >
                    {sample}
                  </span>
                ))
            )} 
          </div>

          {/* 欄位預覽 - 新增 */}
          {table.fields && table.fields.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">
                欄位（共 {table.fields.length} 個）：
              </div>
              <div className="flex flex-wrap gap-1">
                {table.fields
                  .slice(0, expandedFields.has(table.id) ? table.fields.length : fieldsDisplayCount)
                  .map((field, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded"
                      title={field.description || field.name}
                    >
                      {field.name}
                    </span>
                  ))}
                
                {/* 展開/收合按鈕 */}
                {table.fields.length > fieldsDisplayCount && (
                  <button
                    onClick={() => toggleFieldsExpansion(table.id)}
                    className="px-2 py-1 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                  >
                    {expandedFields.has(table.id) 
                      ? `收合 (${table.fields.length - fieldsDisplayCount})` 
                      : `更多 +${table.fields.length - fieldsDisplayCount}`
                    }
                  </button>
                )}
              </div>
            </div>
          )}
           
          {/* 時間資訊 
          <div className="mt-2 text-xs text-gray-500">
            建立：{table.createdAt} | 更新：{table.updatedAt}
          </div>
          */}
        </div>
        
        {/* 產生報表按鈕 - 修改 */}
        <button
          onClick={() => onPreview(table)}
          className="ml-6 flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-transparent"
          style={{ 
            backgroundColor: '#6366f1',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4f46e5';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6366f1';
            e.target.style.color = 'white';
          }}
          aria-label={`產生 ${table.name} 自訂報表`}
        >
          <FileText
            className="w-4 h-4" 
            style={{ backgroundColor: 'transparent', color: 'inherit' }} 
          />
          <span 
            className="text-sm font-medium"
            style={{ backgroundColor: 'transparent', color: 'inherit' }}
          >
            產生自訂報表  {/* 修改按鈕文字 */}
          </span>
        </button>
      </div>
    </div>
  );
};

/**
 * 空狀態組件
 */
const EmptyState = ({ searchTerm, isSearchMode }) => {
  return (
    <div className="text-center py-12">
      <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {isSearchMode ? '沒有符合搜尋條件的表格' : '沒有符合條件的表格'}
      </h3>
      <p className="text-gray-500 mb-4">
        {isSearchMode 
          ? `找不到包含 "${searchTerm}" 的表格`
          : '請調整篩選條件或重設篩選器'
        }
      </p>
      <div className="text-sm text-gray-400">
        <p>建議：</p>
        <ul className="mt-2 space-y-1">
          {isSearchMode ? (
            <>
              <li>• 嘗試使用不同的關鍵字</li>
              <li>• 檢查搜尋字詞的拼寫</li>
              <li>• 嘗試搜尋相關的欄位名稱</li>
              <li>• 清空搜尋關鍵字重新開始</li>
            </>
          ) : (
            <>
              <li>• 嘗試選擇不同的市場或面向</li>
              <li>• 減少類別或樣本的選擇</li>
              <li>• 嘗試搜尋相關的欄位名稱</li>
              <li>• 點擊「重設所有篩選」重新開始</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TableList;