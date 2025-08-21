// src/components/TableSystem/FilterSection.js
// 篩選器區域組件

import React from 'react';
import { Search } from 'lucide-react';
import Dropdown from '../common/Dropdown';

/**
 * 篩選器區域組件
 * @param {Object} props - 組件props
 * @param {Object} props.tableData - 表格數據
 * @param {Object} props.filterState - 篩選狀態
 * @param {Object} props.filterActions - 篩選操作方法
 * @returns {ReactNode}
 */
const FilterSection = ({ tableData, filterState, filterActions }) => {
  const {
    selectedMarket,
    selectedAspect,
    selectedClasses,
    selectedSamples,
    searchTerm,
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
    handleSearchChange,
    resetAllFilters,
    selectAllClasses,
    clearClassSelection,
    selectAllSamples,
    clearSampleSelection
  } = filterActions;

  return (
    <div className="space-y-6">
      {/* 市場類型篩選 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市場類型
        </label>
        <div className="flex flex-wrap gap-2">
          {tableData.markets.map(market => (
            <button
              key={market}
              onClick={() => handleMarketChange(market)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                selectedMarket === market
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedMarket === market ? '#4f46e5' : undefined // 使用 primary-600
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
              onClick={() => handleAspectChange(aspect)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                selectedAspect === aspect
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedAspect === aspect ? '#7c3aed' : undefined // 使用 secondary-700
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
          disabled={availableClasses.length === 0}
        />
        
        {/* 類別操作按鈕 */}
        {availableClasses.length > 0 && (
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
          disabled={availableSamples.length === 0}
        />
        
        {/* 樣本操作按鈕 */}
        {availableSamples.length > 0 && (
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

      {/* 搜尋框 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          搜尋表格
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="輸入表格名稱..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 篩選摘要 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>市場：</span>
            <span className="font-medium">{selectedMarket || '未選擇'}</span>
          </div>
          <div className="flex justify-between">
            <span>面向：</span>
            <span className="font-medium">{selectedAspect || '未選擇'}</span>
          </div>
          <div className="flex justify-between">
            <span>類別：</span>
            <span className="font-medium">{selectedClasses.length} 項</span>
          </div>
          <div className="flex justify-between">
            <span>樣本：</span>
            <span className="font-medium">{selectedSamples.length} 項</span>
          </div>
          
          {/* 搜尋關鍵字 */}
          {searchTerm && (
            <div className="flex justify-between">
              <span>搜尋：</span>
              <span className="font-medium text-purple-600">"{searchTerm}"</span>
            </div>
          )}
          
          {/* 結果統計 */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span>符合條件：</span>
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
        
        {/* 重設按鈕 */}
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="mt-3 w-full text-sm text-purple-600 hover:text-purple-700 py-1 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
          >
            重設所有篩選
          </button>
        )}
      </div>

      {/* 活躍篩選器標籤 */}
      {filterSummary.activeFilters.length > 0 && (
        <div>
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
    </div>
  );
};

export default FilterSection;