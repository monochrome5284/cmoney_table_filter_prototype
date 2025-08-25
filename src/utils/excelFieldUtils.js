// ========================================================================================
// src/utils/excelFieldUtils.js
// Excel 欄位處理工具函數
// ========================================================================================

// 解析Excel檔案
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        
        // 載入XLSX庫
        let XLSX;
        try {
          if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              setTimeout(reject, 10000);
            });
          }
          XLSX = window.XLSX;
        } catch (cdnError) {
          throw new Error('Excel處理庫載入失敗，請檢查網路連線');
        }
        
        // 解析工作簿
        const workbook = XLSX.read(data, { 
          type: 'array', 
          cellStyles: false,
          cellFormulas: false,
          cellDates: true,
          raw: false
        });
        
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel檔案中沒有發現工作表');
        }
        
        const parsedData = parseExcelData(workbook, XLSX);
        
        if (!parsedData || !parsedData.tables || parsedData.tables.length === 0) {
          throw new Error('Excel檔案中沒有發現有效的表格資料');
        }
        
        resolve(parsedData);
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsArrayBuffer(file);
  });
};

// 解析Excel數據
const parseExcelData = (workbook, XLSX) => {
  const sheets = workbook.SheetNames;
  const parsedTables = [];
  let totalProcessedRows = 0;

  sheets.forEach((sheetName) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return;
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd',
        defval: '',
        blankrows: false
      });
      
      if (!jsonData || jsonData.length === 0) return;
      
      const tableMap = new Map();
      let validRowCount = 0;
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        if (!row || !Array.isArray(row) || row.length < 3) continue;
        
        const tableId = row[0]?.toString().trim();
        const tableName = row[1]?.toString().trim();  
        let fieldName = row[2]?.toString().trim();
        
        if (!tableId || !tableName || !fieldName || 
            tableId === 'ID' || tableName === '資料表' || fieldName === '欄位名稱') {
          continue;
        }
        
        // 移除[]符號
        fieldName = fieldName.replace(/^\[|\]$/g, '');
        if (!fieldName.trim()) continue;
        
        const key = `${tableId}_${tableName}`;
        
        if (!tableMap.has(key)) {
          tableMap.set(key, {
            tableId,
            tableName: cleanTableName(tableName),
            originalTableName: tableName,
            fields: []
          });
        }
        
        tableMap.get(key).fields.push({
          name: fieldName.trim(),
          type: inferFieldType(fieldName),
          description: '',
          searchable: true
        });
        
        validRowCount++;
      }
      
      totalProcessedRows += validRowCount;
      
      tableMap.forEach((tableInfo) => {
        if (tableInfo.fields.length > 0) {
          tableInfo.fields = sortFields(tableInfo.fields);
          
          parsedTables.push({
            sheetName,
            tableId: tableInfo.tableId,
            tableName: tableInfo.tableName,
            originalTableName: tableInfo.originalTableName,
            fields: tableInfo.fields,
            fieldCount: tableInfo.fields.length
          });
        }
      });
      
    } catch (sheetError) {
      console.error(`處理工作表 ${sheetName} 時發生錯誤:`, sheetError);
    }
  });

  if (parsedTables.length === 0) {
    throw new Error('沒有找到有效的表格資料，請確認Excel格式');
  }

  return {
    fileName: 'uploaded_file.xlsx',
    sheets: sheets.length,
    tables: parsedTables,
    totalFields: parsedTables.reduce((sum, table) => sum + table.fieldCount, 0),
    processingDetails: {
      totalRowsProcessed: totalProcessedRows,
      sheetsProcessed: sheets.length,
      tablesFound: parsedTables.length
    }
  };
};

// 清理表格名稱
const cleanTableName = (tableName) => {
  return tableName
    .replace(/[^\w\u4e00-\u9fff\s]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

// 推斷欄位類型
const inferFieldType = (fieldName) => {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('日期') || lowerName.includes('時間') || 
      lowerName.includes('date') || lowerName.includes('time') ||
      lowerName === 'rtime') {
    return 'date';
  }
  
  if (lowerName.includes('價') || lowerName.includes('量') || 
      lowerName.includes('率') || lowerName.includes('%') ||
      lowerName.includes('金額') || lowerName.includes('數量') ||
      lowerName.includes('比例') || lowerName.includes('指數')) {
    return 'number';
  }
  
  if (lowerName.includes('是否') || lowerName.includes('標記')) {
    return 'boolean';
  }
  
  return 'string';
};

// 排序欄位
const sortFields = (fields) => {
  const priorityFieldsToEnd = [
    '代號', '名稱', '股票代號', '股票名稱', '日期', '年月', '年季', '年度', 'RTIME'
  ];
  
  const normalFields = [];
  const endFields = [];
  
  fields.forEach(field => {
    const isEndField = priorityFieldsToEnd.some(priority => 
      field.name.includes(priority) || field.name === priority
    );
    
    if (isEndField) {
      endFields.push(field);
    } else {
      normalFields.push(field);
    }
  });
  
  endFields.sort((a, b) => {
    const aIndex = priorityFieldsToEnd.findIndex(p => 
      a.name.includes(p) || a.name === p
    );
    const bIndex = priorityFieldsToEnd.findIndex(p => 
      b.name.includes(p) || b.name === p
    );
    return aIndex - bIndex;
  });
  
  return [...normalFields, ...endFields];
};

// 匹配表格資料
export const matchTableData = (excelTables, tableData) => {
  return excelTables.map(excelTable => {
    // 精確匹配
    const exactMatch = tableData.find(table => 
      cleanTableName(table.name) === cleanTableName(excelTable.tableName) ||
      table.name === excelTable.tableName ||
      table.name === excelTable.originalTableName
    );
    
    // 模糊匹配
    let fuzzyMatches = [];
    if (!exactMatch) {
      fuzzyMatches = tableData
        .map(table => {
          const similarity1 = calculateSimilarity(
            cleanTableName(table.name), 
            cleanTableName(excelTable.tableName)
          );
          const similarity2 = calculateSimilarity(
            table.name, 
            excelTable.originalTableName
          );
          const similarity3 = calculateSimilarity(
            table.name, 
            excelTable.tableName
          );
          
          const maxSimilarity = Math.max(similarity1, similarity2, similarity3);
          
          return {
            table,
            similarity: maxSimilarity
          };
        })
        .filter(match => match.similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
    }
    
    return {
      excelTable,
      exactMatch,
      fuzzyMatches,
      matchType: exactMatch ? 'exact' : fuzzyMatches.length > 0 ? 'fuzzy' : 'none',
      selectedMatch: exactMatch || null,
      status: exactMatch ? 'matched' : 'pending'
    };
  });
};

// 計算字符串相似度
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const clean1 = str1.toLowerCase().trim();
  const clean2 = str2.toLowerCase().trim();
  
  if (clean1 === clean2) return 1;
  
  const len1 = clean1.length;
  const len2 = clean2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = [];
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (clean2.charAt(i - 1) === clean1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(len1, len2);
  const distance = matrix[len2][len1];
  return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
};

// 生成合併後的資料
export const generateMergedData = (matchResults, fullTableData) => {
  console.log('開始生成合併數據...');
  console.log('matchResults:', matchResults);
  console.log('fullTableData結構:', {
    hasTableList: !!fullTableData.tableList,
    tableListLength: fullTableData.tableList?.length,
    hasMetadata: !!fullTableData.metadata,
    hasMarkets: !!fullTableData.markets
  });

  if (!fullTableData || !fullTableData.tableList) {
    throw new Error('無效的表格數據結構');
  }

  // 更新 tableList 中的表格，添加 fields 屬性
  const mergedTableList = fullTableData.tableList.map(table => {
    const matchedResult = matchResults.find(result => 
      result.selectedMatch && result.selectedMatch.id === table.id
    );
    
    if (matchedResult) {
      console.log(`為表格 ${table.name} 添加 ${matchedResult.excelTable.fields.length} 個欄位`);
      return {
        ...table,
        fields: matchedResult.excelTable.fields
      };
    }
    
    return table; // 沒有匹配的表格保持原樣
  });

  // 生成完整的數據結構
  const mergedData = {
    ...fullTableData, // 保持原有的所有屬性
    tableList: mergedTableList, // 使用更新後的tableList
    metadata: {
      ...fullTableData.metadata,
      lastUpdated: new Date().toISOString(),
      dataVersion: (parseFloat(fullTableData.metadata?.dataVersion || '1.0') + 0.1).toFixed(1),
      fieldsAdded: true,
      fieldsAddedTimestamp: new Date().toISOString()
    }
  };

  // 計算統計資訊
  const summary = {
    totalTables: fullTableData.tableList.length,
    matchedTables: matchResults.filter(r => r.status === 'matched').length,
    unmatchedTables: matchResults.filter(r => r.status === 'pending').length,
    totalFieldsAdded: matchResults
      .filter(r => r.status === 'matched')
      .reduce((sum, r) => sum + r.excelTable.fieldCount, 0),
    tablesWithFields: mergedTableList.filter(table => table.fields && table.fields.length > 0).length
  };

  console.log('合併統計:', summary);

  const exportData = {
    fileName: `updated_table_data_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`,
    content: JSON.stringify(mergedData, null, 2)
  };

  console.log('生成結果完成，檔案大小:', exportData.content.length, '字符');

  return {
    mergedData,
    summary,
    exportData
  };
};