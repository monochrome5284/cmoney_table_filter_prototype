// src/hooks/useTableFilter.js
// 表格篩選邏輯的自定義Hook

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAvailableClasses, 
  getAvailableSamples,
  validateFilterDependencies,
  generateFilterSummary,
  searchTables
} from '../utils/dataProcessor';
import { APP_CONFIG } from '../constants/config';

/**
 * 表格篩選Hook
 * @param {Object} tableData - 表格數據
 * @returns {Object} 篩選狀態和方法
 */
export const useTableFilter = (tableData) => {
  // 篩選狀態
  const [selectedMarket, setSelectedMarket] = useState(APP_CONFIG.FILTER.DEFAULT_MARKET);
  const [selectedAspect, setSelectedAspect] = useState(APP_CONFIG.FILTER.DEFAULT_ASPECT);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // UI狀態
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [savedFilterState, setSavedFilterState] = useState(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);

  // 計算可用選項
  const availableClasses = useMemo(() => {
    return tableData.classOptions?.[selectedMarket]?.[selectedAspect] || [];
  }, [tableData.classOptions, selectedMarket, selectedAspect]);


  
  const availableSamples = useMemo(() => {
    // 先根據前3層篩選出符合條件的表格
    const filteredByFirst3Layers = tableData.tableList.filter(table => {
      // 市場篩選
      if (selectedMarket && table.market !== selectedMarket) return false;
      
      // 面向篩選
      if (selectedAspect && table.aspect !== selectedAspect) return false;
      
      // 類別篩選 (AND邏輯)
      if (selectedClasses.length > 0) {
        const tableClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
        const hasAllClasses = selectedClasses.every(selectedClass => 
          tableClasses.includes(selectedClass)
        );
        if (!hasAllClasses) return false;
      }
      
      return true;
    });
    
    // 從這些符合前3層條件的表格中收集所有實際存在的樣本
    const samples = new Set();
    filteredByFirst3Layers.forEach(table => {
      const tableSamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);
      tableSamples.forEach(sample => samples.add(sample));
    });
    
    return Array.from(samples).sort(); // 排序讓選項更整齊
  }, [tableData.tableList, selectedMarket, selectedAspect, selectedClasses]);

  // 篩選表格
  const filteredTables = useMemo(() => {
    // 搜尋模式：使用純搜尋邏輯
    if (isSearchMode) {
      return searchTables(tableData.tableList, searchTerm);
    }
    return tableData.tableList.filter(table => {
      // 市場篩選
      if (selectedMarket && table.market !== selectedMarket) return false;
      
      // 面向篩選
      if (selectedAspect && table.aspect !== selectedAspect) return false;
      
      // 類別篩選 (AND邏輯) - 修正陣列處理
      if (selectedClasses.length > 0) {
        const tableClasses = Array.isArray(table.classes) ? table.classes : [table.class].filter(Boolean);
        const hasAllClasses = selectedClasses.every(selectedClass => 
          tableClasses.includes(selectedClass)
        );
        if (!hasAllClasses) return false;
      }
      
      // 樣本篩選 (AND邏輯) - 修正陣列處理
      if (selectedSamples.length > 0) {
        const tableSamples = Array.isArray(table.samples) ? table.samples : [table.sample].filter(Boolean);
        const hasAllSamples = selectedSamples.every(selectedSample => 
          tableSamples.includes(selectedSample)
        );
        if (!hasAllSamples) return false;
      }
      
      // 關鍵字搜尋 - 修正陣列處理
      if (searchTerm.trim()) {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = table.name.toLowerCase().includes(searchTermLower);
        const descriptionMatch = table.description?.toLowerCase().includes(searchTermLower);
        const classMatch = Array.isArray(table.classes) 
          ? table.classes.some(cls => cls.toLowerCase().includes(searchTermLower))
          : table.class?.toLowerCase().includes(searchTermLower);
        const sampleMatch = Array.isArray(table.samples)
          ? table.samples.some(sample => sample.toLowerCase().includes(searchTermLower))
          : table.sample?.toLowerCase().includes(searchTermLower);
        
        if (!nameMatch && !descriptionMatch && !classMatch && !sampleMatch) return false;
      }
      
      return true;
    });
  }, [tableData.tableList, selectedMarket, selectedAspect, selectedClasses, selectedSamples, searchTerm, isSearchMode]);

  // 篩選摘要
  const filterSummary = useMemo(() => {
    const filters = {
      market: selectedMarket,
      aspect: selectedAspect,
      classes: selectedClasses,
      samples: selectedSamples,
      searchTerm
    };
    
    return generateFilterSummary(
      filters, 
      tableData.tableList.length, 
      filteredTables.length,
      isSearchMode  // 新增：搜尋模式參數
    );
  }, [selectedMarket, selectedAspect, selectedClasses, selectedSamples, searchTerm, tableData.tableList.length, filteredTables.length, isSearchMode]);

  // 市場變更處理(搜尋模式時禁用)
  const handleMarketChange = useCallback((market) => {
    if (isSearchMode) return;  // 搜尋模式時直接返回
    setSelectedMarket(market);
    
    // 重置下層篩選器
    const defaultAspect = tableData.aspects[0] || '';
    setSelectedAspect(defaultAspect);
    setSelectedClasses([]);
    setSelectedSamples([]);
    
    // 關閉下拉選單
    setShowClassDropdown(false);
    setShowSampleDropdown(false);
  }, [tableData.aspects, isSearchMode]);

  // 面向變更處理
  const handleAspectChange = useCallback((aspect) => {
    setSelectedAspect(aspect);
    
    // 重置下層篩選器
    setSelectedClasses([]);
    setSelectedSamples([]);
    
    // 關閉下拉選單
    setShowClassDropdown(false);
    setShowSampleDropdown(false);
  }, []);

  // 類別切換處理
  const handleClassToggle = useCallback((cls) => {
    setSelectedClasses(prev => {
      const newClasses = prev.includes(cls)
        ? prev.filter(c => c !== cls)
        : [...prev, cls];
      
      // 如果類別變更，清空樣本選擇
      setSelectedSamples([]);
      setShowSampleDropdown(false);
      
      return newClasses;
    });
  }, []);

  // 樣本切換處理
  const handleSampleToggle = useCallback((sample) => {
    setSelectedSamples(prev => 
      prev.includes(sample)
        ? prev.filter(s => s !== sample)
        : [...prev, sample]
    );
  }, []);

  // 搜尋處理
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      // 進入搜尋模式
      if (!isSearchMode) {
        // 保存當前篩選狀態
        setSavedFilterState({
          market: selectedMarket,
          aspect: selectedAspect,
          classes: selectedClasses,
          samples: selectedSamples
        });
        
        // 清空篩選器
        setSelectedMarket('');
        setSelectedAspect('');
        setSelectedClasses([]);
        setSelectedSamples([]);
      }
      setIsSearchMode(true);
    } else {
      // 退出搜尋模式
      setIsSearchMode(false);
      
      // 恢復篩選狀態
      if (savedFilterState) {
        setSelectedMarket(savedFilterState.market);
        setSelectedAspect(savedFilterState.aspect);
        setSelectedClasses(savedFilterState.classes);
        setSelectedSamples(savedFilterState.samples);
        setSavedFilterState(null);
      } else {
        // 如果沒有保存狀態，回到預設值
        setSelectedMarket(APP_CONFIG.FILTER.DEFAULT_MARKET);
        setSelectedAspect(APP_CONFIG.FILTER.DEFAULT_ASPECT);
      }
    }
  }, [isSearchMode, savedFilterState, selectedMarket, selectedAspect, selectedClasses, selectedSamples]);

  // 重設所有篩選器
  const resetAllFilters = useCallback(() => {
    setSelectedMarket(APP_CONFIG.FILTER.DEFAULT_MARKET);
    setSelectedAspect(APP_CONFIG.FILTER.DEFAULT_ASPECT);
    setSelectedClasses([]);
    setSelectedSamples([]);
    setSearchTerm('');
    setIsSearchMode(false);  
    setSavedFilterState(null); 
    setShowClassDropdown(false);
    setShowSampleDropdown(false);
  }, []);

  // 重設搜尋
  const resetSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // 清空搜尋函數
  const clearSearch = useCallback(() => {
    handleSearchChange('');
  }, [handleSearchChange]);

  // 批量選擇類別
  const selectAllClasses = useCallback(() => {
    setSelectedClasses([...availableClasses]);
    setSelectedSamples([]); // 清空樣本選擇
  }, [availableClasses]);

  // 清空類別選擇
  const clearClassSelection = useCallback(() => {
    setSelectedClasses([]);
    setSelectedSamples([]);
  }, []);

  // 批量選擇樣本
  const selectAllSamples = useCallback(() => {
    setSelectedSamples([...availableSamples]);
  }, [availableSamples]);

  // 清空樣本選擇
  const clearSampleSelection = useCallback(() => {
    setSelectedSamples([]);
  }, []);

  // 關閉所有下拉選單
  const closeAllDropdowns = useCallback(() => {
    setShowClassDropdown(false);
    setShowSampleDropdown(false);
  }, []);

  // 切換類別下拉選單
  const toggleClassDropdown = useCallback(() => {
    setShowClassDropdown(prev => !prev);
    setShowSampleDropdown(false);
  }, []);

  // 切換樣本下拉選單
  const toggleSampleDropdown = useCallback(() => {
    setShowSampleDropdown(prev => !prev);
    setShowClassDropdown(false);
  }, []);

  // 檢查是否有活躍篩選器
  const hasActiveFilters = useMemo(() => {
    return selectedMarket !== APP_CONFIG.FILTER.DEFAULT_MARKET ||
           selectedAspect !== APP_CONFIG.FILTER.DEFAULT_ASPECT ||
           selectedClasses.length > 0 ||
           selectedSamples.length > 0 ||
           searchTerm.trim() !== '';
  }, [selectedMarket, selectedAspect, selectedClasses, selectedSamples, searchTerm]);

  // 驗證篩選器依賴關係（當數據變更時）
  useEffect(() => {
    const currentFilters = {
      market: selectedMarket,
      aspect: selectedAspect,
      classes: selectedClasses,
      samples: selectedSamples
    };

    const validatedFilters = validateFilterDependencies(currentFilters, tableData);
    
    // 如果有無效的選項，更新狀態
    if (validatedFilters.classes.length !== selectedClasses.length) {
      setSelectedClasses(validatedFilters.classes);
    }
    if (validatedFilters.samples.length !== selectedSamples.length) {
      setSelectedSamples(validatedFilters.samples);
    }
  }, [tableData, selectedMarket, selectedAspect, selectedClasses, selectedSamples]);

  // 自動關閉下拉選單（點擊外部時）
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  return {
    // 篩選狀態
    selectedMarket,
    selectedAspect,
    selectedClasses,
    selectedSamples,
    searchTerm,

    // 搜尋相關狀態
    isSearchMode,
    savedFilterState,
    
    // UI狀態
    showClassDropdown,
    showSampleDropdown,
    
    // 計算狀態
    availableClasses: isSearchMode ? [] : availableClasses,  // 搜尋模式時清空
    availableSamples: isSearchMode ? [] : availableSamples,  // 搜尋模式時清空
    filteredTables,
    filterSummary,
    hasActiveFilters: hasActiveFilters || isSearchMode,
    
    // 事件處理器
    handleMarketChange,
    handleAspectChange,
    handleClassToggle,
    handleSampleToggle,
    handleSearchChange,
    
    // 控制方法
    resetAllFilters,
    resetSearch,
    clearSearch,
    selectAllClasses,
    clearClassSelection,
    selectAllSamples,
    clearSampleSelection,
    closeAllDropdowns,
    toggleClassDropdown,
    toggleSampleDropdown,
    
    // 設定器（如果需要直接控制）
    setSelectedMarket,
    setSelectedAspect,
    setSelectedClasses,
    setSelectedSamples,
    setSearchTerm,
    setShowClassDropdown,
    setShowSampleDropdown
  };
};