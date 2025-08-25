// src/components/TableSystem/FilterSection.js 修正版本

import React from 'react';
import { Search } from 'lucide-react';
import Dropdown from '../common/Dropdown';

/**
 * 篩選器區域組件
 * @param {Object} props - 組件props
 * @param {Object} props.tableData - 表格數據
 * @param {Object} props.filterState - 篩選狀態
 * @param {Object} props.filterActions - 篩選操作方法
 * @param {boolean} props.isSearchMode - 搜尋模式
 * @param {string} props.searchTerm - 搜尋關鍵字 (移除重複宣告)
 * @returns {ReactNode}
 */
const FilterSection = ({ 
  tableData, 
  filterState, 
  filterActions,
  isSearchMode = false,
  searchTerm = ''  // 修正：移除重複宣告，這裡是參數解構
}) => {
  const {
    selectedMarket,
    selectedAspect,
    selectedClasses,
    selectedSamples,
    availableClasses,
    availableSamples,
    filterSummary,
    hasActiveFilters
  } = filterState;

  const {
    handleMarketChange,
    handleAspectChange,
    handleClassToggle,
    handleSampleToggle,
    resetAllFilters,
    selectAllClasses,
    clearClassSelection,
    selectAllSamples,
    clearSampleSelection
  } = filterActions;

  return (
    <div className="space-y-6">
      {/* 搜尋模式提示 */}
      {isSearchMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              搜尋模式：正在搜尋 "{searchTerm}"
            </span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            篩選器已暫時停用，清空搜尋可重新啟用篩選功能
          </p>
        </div>
      )}

      {/* 市場類型篩選 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市場類型
        </label>
        <div className="flex flex-wrap gap-2">
          {tableData.markets.map(market => (
            <button
              key={market}
              onClick={() => !isSearchMode && handleMarketChange(market)}
              disabled={isSearchMode}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                isSearchMode ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                selectedMarket === market
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedMarket === market && !isSearchMode ? '#4f46e5' : undefined
              }}
            >
              {market}
            </button>
          ))}
        </div>
      </div>

      {/* 分析面向篩選 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分析面向
        </label>
        <div className="flex flex-wrap gap-2">
          {tableData.aspects.map(aspect => (
            <button
              key={aspect}
              onClick={() => !isSearchMode && handleAspectChange(aspect)}
              disabled={isSearchMode}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                isSearchMode ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                selectedAspect === aspect
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedAspect === aspect && !isSearchMode ? '#7c3aed' : undefined
              }}
            >
              {aspect}
            </button>
          ))}
        </div>
      </div>

      {/* 類別篩選 */}
      <div>
        <Dropdown
          label={`類別 ${selectedClasses.length > 0 ? `(已選 ${selectedClasses.length})` : ''}`}
          options={availableClasses}
          value={selectedClasses}
          onChange={(value) => {
            if (isSearchMode) return; // 搜尋模式時禁用
            
            // 處理單個類別的切換
            if (typeof value === 'string') {
              handleClassToggle(value);
            } else {
              // 處理批量選擇的情況
              const currentSet = new Set(selectedClasses);
              const newSet = new Set(value);
              
              // 找出差異並逐一切換
              const allValues = new Set([...currentSet, ...newSet]);
              allValues.forEach(val => {
                if (currentSet.has(val) !== newSet.has(val)) {
                  handleClassToggle(val);
                }
              });
            }
          }}
          placeholder="請選擇類別"
          multiple={true}
          searchable={availableClasses.length > 5}
          disabled={availableClasses.length === 0 || isSearchMode}
        />
        
        {/* 類別操作按鈕 */}
        {availableClasses.length > 0 && !isSearchMode && (
          <div className="mt-2 flex space-x-2">
            <button
              onClick={selectAllClasses}
              className="text-xs text-purple-600 hover:text-purple-700"
              disabled={selectedClasses.length === availableClasses.length}
            >
              全選
            </button>
            <button
              onClick={clearClassSelection}
              className="text-xs text-gray-600 hover:text-gray-700"
              disabled={selectedClasses.length === 0}
            >
              清空
            </button>
          </div>
        )}
      </div>

      {/* 樣本篩選 */}
      <div>
        <Dropdown
          label={`樣本 ${selectedSamples.length > 0 ? `(已選 ${selectedSamples.length})` : ''}`}
          options={availableSamples}
          value={selectedSamples}
          onChange={(value) => {
            if (isSearchMode) return; // 搜尋模式時禁用
            
            // 處理單個樣本的切換
            if (typeof value === 'string') {
              handleSampleToggle(value);
            } else {
              // 處理批量選擇的情況
              const currentSet = new Set(selectedSamples);
              const newSet = new Set(value);
              
              // 找出差異並逐一切換
              const allValues = new Set([...currentSet, ...newSet]);
              allValues.forEach(val => {
                if (currentSet.has(val) !== newSet.has(val)) {
                  handleSampleToggle(val);
                }
              });
            }
          }}
          placeholder="請選擇樣本"
          multiple={true}
          searchable={availableSamples.length > 5}
          disabled={availableSamples.length === 0 || isSearchMode}
        />
        
        {/* 樣本操作按鈕 */}
        {availableSamples.length > 0 && !isSearchMode && (
          <div className="mt-2 flex space-x-2">
            <button
              onClick={selectAllSamples}
              className="text-xs text-purple-600 hover:text-purple-700"
              disabled={selectedSamples.length === availableSamples.length}
            >
              全選
            </button>
            <button
              onClick={clearSampleSelection}
              className="text-xs text-gray-600 hover:text-gray-700"
              disabled={selectedSamples.length === 0}
            >
              清空
            </button>
          </div>
        )}
      </div>

      {/* 篩選摘要 */}
      {filterSummary && (
        <div className="bg-gray-50 rounded-lg p-4">
          {/* 活躍篩選器 */}
          {filterSummary.activeFilters.length > 0 && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活躍篩選器
              </label>
              <div className="flex flex-wrap gap-2">
                {filterSummary.activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 結果統計 */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">符合條件：</span>
              <span className="font-bold text-purple-600">
                {filterSummary.filteredCount} / {filterSummary.totalCount} 個表格
              </span>
            </div>
            {filterSummary.filteredCount !== filterSummary.totalCount && (
              <div className="text-xs text-gray-500 mt-1">
                篩選率：{filterSummary.filterRate}%
              </div>
            )}
          </div>
        </div>
      )}
        
      {/* 重設按鈕 */}
      {hasActiveFilters && !isSearchMode && (
        <button
          onClick={resetAllFilters}
          className="mt-3 w-full text-sm text-purple-600 hover:text-purple-700 py-1 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
        >
          重設所有篩選
        </button>
      )}
    </div>
  );
};

export default FilterSection;