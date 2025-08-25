// src/utils/dataProcessor.js
// 數據處理和篩選邏輯

/**
 * 篩選表格數據（第3、4層使用AND邏輯）
 * @param {Array} tableList - 表格清單
 * @param {Object} filters - 篩選條件
 * @returns {Array} 篩選後的表格清單
 */
export const filterTables = (tableList, filters) => {
  const { market, aspect, classes, samples, searchTerm } = filters;
  
  return tableList.filter(table => {
    // 市場篩選
    if (market && table.market !== market) return false;
    
    // 面向篩選
    if (aspect && table.aspect !== aspect) return false;
    
    // 類別篩選（AND邏輯：所選類別都必須包含在表格的類別中）
    if (classes && classes.length > 0) {
      const tableClasses = Array.isArray(table.classes) ? table.classes : [table.class];
      const hasAllClasses = classes.every(selectedClass => 
        tableClasses.includes(selectedClass)
      );
      if (!hasAllClasses) return false;
    }
    
    // 樣本篩選（AND邏輯：所選樣本都必須包含在表格的樣本中）
    if (samples && samples.length > 0) {
      const tableSamples = Array.isArray(table.samples) ? table.samples : [table.sample];
      const hasAllSamples = samples.every(selectedSample => 
        tableSamples.includes(selectedSample)
      );
      if (!hasAllSamples) return false;
    }
    
    // 關鍵字搜尋 - 新增欄位搜尋支援
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      // 原有搜尋範圍
      const nameMatch = table.name.toLowerCase().includes(searchLower);
      const marketMatch = table.market.toLowerCase().includes(searchLower);
      const aspectMatch = table.aspect.toLowerCase().includes(searchLower);
      
      // 搜尋類別（支援多類別）
      const tableClasses = Array.isArray(table.classes) ? table.classes : [table.class];
      const classMatch = tableClasses.some(cls => 
        cls && cls.toLowerCase().includes(searchLower)
      );
      
      // 搜尋樣本（支援多樣本）
      const tableSamples = Array.isArray(table.samples) ? table.samples : [table.sample];
      const sampleMatch = tableSamples.some(sample => 
        sample && sample.toLowerCase().includes(searchLower)
      );
      
      // 搜尋欄位名稱
      const fieldsMatch = table.fields && table.fields.some(field => 
        (field.name && field.name.toLowerCase().includes(searchLower)) ||
        (field.description && field.description.toLowerCase().includes(searchLower))
      );

      
      if (!nameMatch && !marketMatch && !aspectMatch && !classMatch && !sampleMatch && !fieldsMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 純搜尋函數（不依賴篩選器）
 * @param {Array} tableList - 表格清單
 * @param {string} searchTerm - 搜尋關鍵字
 * @returns {Array} 搜尋結果
 */
export const searchTables = (tableList, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return tableList;
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  return tableList.filter(table => {
    // 搜尋資料表名稱
    const nameMatch = table.name.toLowerCase().includes(searchLower);
    
    // 搜尋市場
    const marketMatch = table.market.toLowerCase().includes(searchLower);
    
    // 搜尋面向
    const aspectMatch = table.aspect.toLowerCase().includes(searchLower);
    
    // 搜尋類別
    const tableClasses = Array.isArray(table.classes) ? table.classes : [table.class];
    const classMatch = tableClasses.some(cls => 
      cls && cls.toLowerCase().includes(searchLower)
    );
    
    // 搜尋樣本
    const tableSamples = Array.isArray(table.samples) ? table.samples : [table.sample];
    const sampleMatch = tableSamples.some(sample => 
      sample && sample.toLowerCase().includes(searchLower)
    );
    
    // 搜尋欄位（包含欄位名稱和描述）
    const fieldsMatch = table.fields && table.fields.some(field => 
      (field.name && field.name.toLowerCase().includes(searchLower)) ||
      (field.description && field.description.toLowerCase().includes(searchLower))
    );
    
    return nameMatch || marketMatch || aspectMatch || classMatch || sampleMatch || fieldsMatch;
  });
};


// 搜尋高亮函數
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

/**
 * 根據篩選條件獲取可用的類別選項
 * @param {Object} classOptions - 類別選項結構
 * @param {string} market - 選定的市場
 * @param {string} aspect - 選定的面向
 * @returns {Array} 可用的類別清單
 */
export const getAvailableClasses = (classOptions, market, aspect) => {
  if (!market || !aspect || !classOptions[market]) {
    return [];
  }
  
  return classOptions[market][aspect] || [];
};

/**
 * 根據篩選條件獲取可用的樣本選項（支援多類別）
 * @param {Object} sampleOptions - 樣本選項結構
 * @param {Array} selectedClasses - 已選擇的類別
 * @returns {Array} 可用的樣本清單
 */
export const getAvailableSamples = (sampleOptions, selectedClasses) => {
  if (!selectedClasses || selectedClasses.length === 0) {
    return [];
  }
  
  // 獲取所有選中類別的樣本，並去重
  const samples = selectedClasses.flatMap(cls => sampleOptions[cls] || []);
  return [...new Set(samples)]; // 去重
};

/**
 * 驗證篩選器層級依賴關係（支援多類別）
 * @param {Object} filters - 當前篩選器狀態
 * @param {Object} dataStructure - 數據結構
 * @returns {Object} 修正後的篩選器狀態
 */
export const validateFilterDependencies = (filters, dataStructure) => {
  const { market, aspect, classes, samples } = filters;
  const { classOptions, sampleOptions } = dataStructure;
  
  const correctedFilters = { ...filters };
  
  // 檢查類別是否在當前市場和面向下有效
  if (market && aspect && classes && classes.length > 0) {
    const availableClasses = getAvailableClasses(classOptions, market, aspect);
    correctedFilters.classes = classes.filter(cls => availableClasses.includes(cls));
  }
  
  // 檢查樣本是否在當前類別下有效
  if (correctedFilters.classes && correctedFilters.classes.length > 0 && samples && samples.length > 0) {
    const availableSamples = getAvailableSamples(sampleOptions, correctedFilters.classes);
    correctedFilters.samples = samples.filter(sample => availableSamples.includes(sample));
  }
  
  return correctedFilters;
};

/**
 * 重置下層篩選器
 * @param {string} changedLevel - 變更的層級 ('market', 'aspect', 'class')
 * @param {Object} currentFilters - 當前篩選器狀態
 * @param {Object} defaults - 預設值
 * @returns {Object} 重置後的篩選器狀態
 */
export const resetSubsequentFilters = (changedLevel, currentFilters, defaults = {}) => {
  const resetRules = {
    market: {
      aspect: defaults.aspect || '',
      classes: [],
      samples: []
    },
    aspect: {
      classes: [],
      samples: []
    },
    class: {
      samples: []
    }
  };
  
  return {
    ...currentFilters,
    ...resetRules[changedLevel]
  };
};

/**
 * 生成篩選摘要
 * @param {Object} filters - 篩選條件
 * @param {number} totalCount - 總表格數
 * @param {number} filteredCount - 篩選後數量
 * @returns {Object} 篩選摘要
 */
export const generateFilterSummary = (filters, totalCount, filteredCount, isSearchMode = false) => {
  const { market, aspect, classes, samples, searchTerm } = filters;
  
  const activeFilters = [];
  
  if (isSearchMode) {
    // 搜尋模式下只顯示搜尋資訊
    if (searchTerm && searchTerm.trim()) {
      activeFilters.push(`搜尋: "${searchTerm}"`);
    }
  } else {
    // 篩選模式下顯示篩選器資訊
    if (market) activeFilters.push(`市場: ${market}`);
    if (aspect) activeFilters.push(`面向: ${aspect}`);
    if (classes && classes.length > 0) {
      activeFilters.push(`類別: ${classes.length} 項`);
    }
    if (samples && samples.length > 0) {
      activeFilters.push(`樣本: ${samples.length} 項`);
    }
  }
  
  return {
    activeFilters,
    activeCount: activeFilters.length,
    totalCount,
    filteredCount,
    filterRate: totalCount > 0 ? (filteredCount / totalCount * 100).toFixed(1) : 0,
    mode: isSearchMode ? 'search' : 'filter'
  };
};

/**
 * 排序表格數據
 * @param {Array} tables - 表格陣列
 * @param {string} sortBy - 排序欄位
 * @param {string} order - 排序方向 ('asc' | 'desc')
 * @returns {Array} 排序後的表格陣列
 */
export const sortTables = (tables, sortBy = 'name', order = 'asc') => {
  const sortedTables = [...tables].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // 處理日期
    if (sortBy.includes('At')) {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    // 處理字串
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sortedTables;
};

/**
 * 分頁處理
 * @param {Array} data - 數據陣列
 * @param {number} currentPage - 當前頁碼（從1開始）
 * @param {number} pageSize - 每頁數量
 * @returns {Object} 分頁結果
 */
export const paginateData = (data, currentPage = 1, pageSize = 10) => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  return {
    data: currentData,
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    }
  };
};

/**
 * 深度複製物件
 * @param {any} obj - 要複製的物件
 * @returns {any} 複製後的物件
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * 檢查數據結構完整性
 * @param {Object} data - 要檢查的數據
 * @returns {Object} 檢查結果
 */
export const validateDataStructure = (data) => {
  const errors = [];
  const warnings = [];
  
  // 檢查必要屬性
  const requiredProps = ['markets', 'aspects', 'classOptions', 'sampleOptions', 'tableList', 'metadata'];
  requiredProps.forEach(prop => {
    if (!data[prop]) {
      errors.push(`缺少必要屬性: ${prop}`);
    }
  });
  
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }
  
  // 檢查陣列類型
  if (!Array.isArray(data.markets)) errors.push('markets 必須是陣列');
  if (!Array.isArray(data.aspects)) errors.push('aspects 必須是陣列');
  if (!Array.isArray(data.tableList)) errors.push('tableList 必須是陣列');
  
  // 檢查物件類型
  if (typeof data.classOptions !== 'object') errors.push('classOptions 必須是物件');
  if (typeof data.sampleOptions !== 'object') errors.push('sampleOptions 必須是物件');
  if (typeof data.metadata !== 'object') errors.push('metadata 必須是物件');
  
  // 檢查數據一致性
  if (data.tableList.length !== data.metadata.totalTables) {
    warnings.push('tableList 長度與 metadata.totalTables 不一致');
  }
  
  // 檢查表格數據完整性
  data.tableList.forEach((table, index) => {
    const requiredTableProps = ['id', 'name', 'market', 'aspect', 'class', 'sample'];
    requiredTableProps.forEach(prop => {
      if (!table[prop]) {
        warnings.push(`表格 ${index + 1} 缺少屬性: ${prop}`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalTables: data.tableList.length,
      totalMarkets: data.markets.length,
      totalAspects: data.aspects.length
    }
  };
};