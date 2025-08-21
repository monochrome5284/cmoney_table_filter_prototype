// src/utils/csvParser.js
// CSV 解析和處理工具

/**
 * 解析CSV文字為物件陣列
 * @param {string} csvText - CSV文字內容
 * @returns {Array} 解析後的資料陣列
 */
export const parseCSV = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV格式不正確：至少需要標題行和一行數據');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map((line, index) => {
      // 處理包含逗號的欄位（用引號包圍）
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      
      if (values.length === 0) {
        console.warn(`第${index + 2}行為空行，已跳過`);
        return null;
      }

      const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (cleanValues.length !== headers.length) {
        console.warn(`第${index + 2}行欄位數量不匹配，預期${headers.length}個，實際${cleanValues.length}個`);
      }

      const obj = {};
      headers.forEach((header, headerIndex) => {
        obj[header] = cleanValues[headerIndex] || '';
      });
      return obj;
    }).filter(row => row !== null); // 過濾掉空行

    return data;
  } catch (error) {
    throw new Error(`CSV解析失敗: ${error.message}`);
  }
};

/**
 * 驗證CSV數據結構
 * @param {Array} data - 解析後的數據
 * @returns {Object} 驗證結果
 */
export const validateCSVData = (data) => {
  const requiredFields = ['Table名稱', '市場', '面向', '類別', '樣本'];
  const errors = [];
  const warnings = [];

  // 檢查數據是否為空
  if (!data || data.length === 0) {
    errors.push('數據為空');
    return { isValid: false, errors, warnings };
  }

  // 檢查必要欄位
  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));
  
  if (missingFields.length > 0) {
    errors.push(`缺少必要欄位: ${missingFields.join(', ')}`);
  }

  // 檢查數據完整性
  const tableNames = new Set();
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        warnings.push(`第${index + 2}行缺少 ${field} 欄位值`);
      }
    });

    // 檢查表格名稱重複
    const tableName = row['Table名稱'];
    if (tableName) {
      if (tableNames.has(tableName)) {
        warnings.push(`表格名稱重複: ${tableName}`);
      } else {
        tableNames.add(tableName);
      }
    }

    // 檢查市場值是否有效
    const validMarkets = ['台灣', '美國', '中國', '香港'];
    if (row['市場'] && !validMarkets.includes(row['市場'])) {
      warnings.push(`第${index + 2}行市場值無效: ${row['市場']}`);
    }

    // 檢查面向值是否有效
    const validAspects = ['基本面', '技術面', '籌碼面', '消息面'];
    if (row['面向'] && !validAspects.includes(row['面向'])) {
      warnings.push(`第${index + 2}行面向值無效: ${row['面向']}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount: data.length,
    columnCount: Object.keys(firstRow).length,
    uniqueTableNames: tableNames.size
  };
};

/**
 * 解析多類別字串（支援逗號分隔）
 * @param {string} classString - 類別字串，如 "001, 002, 003"
 * @returns {Array} 類別陣列
 */
const parseMultipleClasses = (classString) => {
  if (!classString || typeof classString !== 'string') {
    return [];
  }
  return classString.split(',').map(cls => cls.trim()).filter(Boolean);
};

/**
 * 解析多樣本字串（支援逗號分隔）
 * @param {string} sampleString - 樣本字串，如 "RSI, MACD, KD"
 * @returns {Array} 樣本陣列
 */
const parseMultipleSamples = (sampleString) => {
  if (!sampleString || typeof sampleString !== 'string') {
    return [];
  }
  return sampleString.split(',').map(sample => sample.trim()).filter(Boolean);
};

/**
 * 將CSV數據轉換為系統數據格式
 * @param {Array} csvData - CSV解析後的數據
 * @returns {Object} 系統數據格式
 */
export const convertCSVToSystemData = (csvData) => {
  try {
    // 建立基本結構
    const markets = [...new Set(csvData.map(row => row['市場']).filter(Boolean))];
    const aspects = [...new Set(csvData.map(row => row['面向']).filter(Boolean))];
    
    // 收集所有類別（展開多類別）
    const allClassesSet = new Set();
    csvData.forEach(row => {
      const classes = parseMultipleClasses(row['類別']);
      classes.forEach(cls => allClassesSet.add(cls));
    });
    
    // 建立類別選項結構
    const classOptions = {};
    markets.forEach(market => {
      classOptions[market] = {};
      aspects.forEach(aspect => {
        const classesSet = new Set();
        csvData
          .filter(row => row['市場'] === market && row['面向'] === aspect)
          .forEach(row => {
            const classes = parseMultipleClasses(row['類別']);
            classes.forEach(cls => classesSet.add(cls));
          });
        
        const classes = Array.from(classesSet).filter(Boolean);
        if (classes.length > 0) {
          classOptions[market][aspect] = classes;
        }
      });
    });

    // 建立樣本選項結構
    const sampleOptions = {};
    Array.from(allClassesSet).forEach(cls => {
      const samplesSet = new Set();
      csvData.forEach(row => {
        const classes = parseMultipleClasses(row['類別']);
        if (classes.includes(cls)) {
          const samples = parseMultipleSamples(row['樣本']);
          samples.forEach(sample => samplesSet.add(sample));
        }
      });
      
      const samples = Array.from(samplesSet).filter(Boolean);
      if (samples.length > 0) {
        sampleOptions[cls] = samples;
      }
    });

    // 建立表格清單（支援多類別和多樣本）
    const tableList = csvData.map((row, index) => ({
      id: `table-${index + 1}`,
      name: row['Table名稱'] || row['名稱'] || `表格${index + 1}`,
      market: row['市場'] || '',
      aspect: row['面向'] || '',
      classes: parseMultipleClasses(row['類別']), // 改為陣列
      samples: parseMultipleSamples(row['樣本']), // 改為陣列
      description: row['描述'] || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }));

    const converted = {
      markets,
      aspects,
      classOptions,
      sampleOptions,
      tableList,
      metadata: {
        totalTables: tableList.length,
        lastUpdated: new Date().toISOString().split('T')[0],
        dataVersion: '1.0',
        source: 'csv_import',
        importTimestamp: new Date().toISOString()
      }
    };

    return converted;
  } catch (error) {
    throw new Error(`數據轉換失敗: ${error.message}`);
  }
};

/**
 * 生成統計資訊
 * @param {Object} systemData - 系統數據
 * @returns {Object} 統計資訊
 */
export const generateDataStatistics = (systemData) => {
  const { markets, aspects, classOptions, sampleOptions, tableList } = systemData;
  
  // 計算各市場的表格數量
  const marketStats = markets.map(market => ({
    name: market,
    count: tableList.filter(table => table.market === market).length,
    percentage: ((tableList.filter(table => table.market === market).length / tableList.length) * 100).toFixed(1)
  }));

  // 計算各面向的表格數量
  const aspectStats = aspects.map(aspect => ({
    name: aspect,
    count: tableList.filter(table => table.aspect === aspect).length,
    percentage: ((tableList.filter(table => table.aspect === aspect).length / tableList.length) * 100).toFixed(1)
  }));

  // 計算類別分布（考慮多類別）
  const classStats = {};
  Object.values(classOptions).forEach(marketClasses => {
    Object.values(marketClasses).forEach(classes => {
      classes.forEach(cls => {
        const count = tableList.filter(table => 
          Array.isArray(table.classes) ? table.classes.includes(cls) : table.class === cls
        ).length;
        if (count > 0) {
          classStats[cls] = count;
        }
      });
    });
  });

  // 計算樣本分布（考慮多樣本）
  const sampleStats = {};
  Object.values(sampleOptions).forEach(samples => {
    samples.forEach(sample => {
      const count = tableList.filter(table => 
        Array.isArray(table.samples) ? table.samples.includes(sample) : table.sample === sample
      ).length;
      if (count > 0) {
        sampleStats[sample] = count;
      }
    });
  });

  // 計算總數
  const totalClasses = Object.keys(classStats).length;
  const totalSamples = Object.keys(sampleStats).length;

  return {
    overview: {
      totalTables: tableList.length,
      totalMarkets: markets.length,
      totalAspects: aspects.length,
      totalClasses,
      totalSamples
    },
    distribution: {
      byMarket: marketStats,
      byAspect: aspectStats,
      byClass: Object.entries(classStats).map(([name, count]) => ({ name, count })),
      bySample: Object.entries(sampleStats).map(([name, count]) => ({ name, count }))
    },
    dataQuality: {
      completeTables: tableList.filter(table => 
        table.name && table.market && table.aspect && 
        (Array.isArray(table.classes) ? table.classes.length > 0 : table.class) &&
        (Array.isArray(table.samples) ? table.samples.length > 0 : table.sample)
      ).length,
      incompleteTables: tableList.filter(table => 
        !table.name || !table.market || !table.aspect || 
        (Array.isArray(table.classes) ? table.classes.length === 0 : !table.class) ||
        (Array.isArray(table.samples) ? table.samples.length === 0 : !table.sample)
      ).length,
      duplicateNames: tableList.length - new Set(tableList.map(t => t.name)).size,
      multiClassTables: tableList.filter(table => 
        Array.isArray(table.classes) && table.classes.length > 1
      ).length
    },
    coverage: {
      marketCoverage: (marketStats.filter(m => m.count > 0).length / markets.length * 100).toFixed(1),
      aspectCoverage: (aspectStats.filter(a => a.count > 0).length / aspects.length * 100).toFixed(1)
    }
  };
};

/**
 * 生成CSV範本
 * @returns {string} CSV範本內容
 */
export const generateCSVTemplate = () => {
  const template = `Table名稱,市場,面向,類別,樣本,描述
台股資產負債表分析,台灣,基本面,001,RSI,分析台股上市櫃公司的資產負債狀況
美股季度財報分析,美國,基本面,002,季度財報,美股標普500公司季度財務表現分析
A股技術指標分析,中國,技術面,"001, 003",資金流向,A股市場技術分析和資金流向追蹤（多類別範例）
港股南向資金分析,香港,技術面,004,"資金流向, 成交量",港股通南向資金流入流出分析（多樣本範例）
台股外資持股分析,台灣,籌碼面,"001, 002, 005","外資持股, 持股變化",外資在台股市場的持股變化追蹤（多類別多樣本範例）
美股機構持股分析,美國,籌碼面,006,投資銀行,美股機構投資者持股分析
A股政策影響分析,中國,消息面,007,貨幣政策,央行政策對A股市場的影響評估
港股IPO分析,香港,消息面,008,新股上市,港股新股上市表現和投資機會分析`;

  return template;
};

/**
 * 匯出表格數據為CSV格式（支援多類別）
 * @param {Array} tableList - 表格數據陣列
 * @returns {string} CSV格式字串
 */
export const exportTableListToCSV = (tableList) => {
  const headers = ['Table名稱', '市場', '面向', '類別', '樣本', '描述', '建立時間', '更新時間'];
  
  const csvContent = [
    headers.join(','),
    ...tableList.map(table => [
      `"${table.name}"`,
      table.market,
      table.aspect,
      // 處理多類別：如果是陣列則用逗號分隔，否則直接使用
      Array.isArray(table.classes) ? `"${table.classes.join(', ')}"` : (table.class || ''),
      // 處理多樣本：如果是陣列則用逗號分隔，否則直接使用
      Array.isArray(table.samples) ? `"${table.samples.join(', ')}"` : (table.sample || ''),
      `"${table.description || ''}"`,
      table.createdAt,
      table.updatedAt
    ].join(','))
  ].join('\n');

  return csvContent;
};

/**
 * 驗證單筆表格數據
 * @param {Object} tableData - 表格數據物件
 * @returns {Object} 驗證結果
 */
export const validateTableData = (tableData) => {
  const errors = [];
  const warnings = [];

  // 必要欄位檢查
  const requiredFields = ['name', 'market', 'aspect', 'class', 'sample'];
  requiredFields.forEach(field => {
    if (!tableData[field] || tableData[field].trim() === '') {
      errors.push(`缺少必要欄位: ${field}`);
    }
  });

  // 市場值檢查
  const validMarkets = ['台灣', '美國', '中國', '香港'];
  if (tableData.market && !validMarkets.includes(tableData.market)) {
    warnings.push(`市場值可能無效: ${tableData.market}`);
  }

  // 面向值檢查
  const validAspects = ['基本面', '技術面', '籌碼面', '消息面'];
  if (tableData.aspect && !validAspects.includes(tableData.aspect)) {
    warnings.push(`面向值可能無效: ${tableData.aspect}`);
  }

  // 名稱長度檢查
  if (tableData.name && tableData.name.length > 100) {
    warnings.push('表格名稱過長，建議控制在100字元以內');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};