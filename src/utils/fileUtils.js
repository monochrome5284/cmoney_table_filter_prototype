// src/utils/fileUtils.js
// 檔案操作工具函數

/**
 * 下載JSON檔案
 * @param {Object} data - 要下載的數據
 * @param {string} filename - 檔案名稱
 * @returns {Object} 操作結果
 */
export const downloadJSON = (data, filename = 'table_data.json') => {
  try {
    // 確保檔案名稱有正確的副檔名
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // 添加到DOM並觸發下載
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { 
      success: true, 
      message: `檔案 ${filename} 下載成功`,
      filename,
      size: formatFileSize(jsonString.length)
    };
  } catch (error) {
    console.error('JSON下載失敗:', error);
    return { 
      success: false, 
      message: `下載失敗: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * 下載CSV檔案
 * @param {Array} data - 表格數據陣列
 * @param {string} filename - 檔案名稱
 * @param {Array} headers - 自訂標題（可選）
 * @returns {Object} 操作結果
 */
export const downloadCSV = (data, filename = 'table_data.csv', headers = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('沒有數據可下載');
    }

    // 確保檔案名稱有正確的副檔名
    if (!filename.endsWith('.csv')) {
      filename += '.csv';
    }

    // 產生CSV標題
    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => csvHeaders.map(header => {
        const value = row[header] || '';
        const stringValue = String(value);
        // 如果包含逗號、引號或換行符，需要用引號包圍並轉義引號
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ].join('\n');

    // 添加BOM以支援中文字符
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // 添加到DOM並觸發下載
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { 
      success: true, 
      message: `CSV檔案 ${filename} 下載成功`,
      filename,
      size: formatFileSize(csvContent.length),
      rowCount: data.length
    };
  } catch (error) {
    console.error('CSV下載失敗:', error);
    return { 
      success: false, 
      message: `CSV下載失敗: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * 讀取上傳的檔案
 * @param {File} file - 檔案物件
 * @returns {Promise<Object>} 檔案內容和信息
 */
export const readUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('沒有選擇檔案'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const extension = getFileExtension(file.name);
        
        let parsedData = null;
        let dataType = 'text';

        // 根據檔案類型處理
        if (extension === 'json') {
          try {
            parsedData = JSON.parse(content);
            dataType = 'json';
          } catch (parseError) {
            reject(new Error(`JSON格式錯誤: ${parseError.message}`));
            return;
          }
        } else if (extension === 'csv') {
          parsedData = content;
          dataType = 'csv';
        } else {
          reject(new Error(`不支援的檔案格式: ${extension}`));
          return;
        }

        resolve({
          type: dataType,
          data: parsedData,
          filename: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
          extension,
          mimeType: file.type
        });
      } catch (error) {
        reject(new Error(`檔案處理失敗: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * 驗證檔案大小和格式
 * @param {File} file - 檔案物件
 * @param {Object} options - 驗證選項
 * @returns {Object} 驗證結果
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedExtensions = ['json', 'csv'],
    allowedMimeTypes = [
      'application/json',
      'text/json',
      'text/csv',
      'application/csv',
      'text/plain'
    ]
  } = options;

  const errors = [];
  const warnings = [];
  
  // 檢查檔案是否存在
  if (!file) {
    errors.push('請選擇檔案');
    return { isValid: false, errors, warnings };
  }

  // 檢查檔案大小
  if (file.size > maxSize) {
    errors.push(`檔案大小超過限制 (${formatFileSize(maxSize)})`);
  }

  // 檢查檔案是否為空
  if (file.size === 0) {
    errors.push('檔案為空');
  }

  // 檢查檔案副檔名
  const extension = getFileExtension(file.name);
  if (!allowedExtensions.includes(extension)) {
    errors.push(`不支援的檔案格式，請使用: ${allowedExtensions.join(', ')}`);
  }

  // 檢查MIME類型
  const mimeType = file.type;
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    warnings.push(`MIME類型警告: ${mimeType}`);
  }

  // 檢查檔案名稱
  if (file.name.length > 255) {
    warnings.push('檔案名稱過長');
  }

  // 檢查特殊字符
  if (!/^[a-zA-Z0-9\u4e00-\u9fa5._-]+$/.test(file.name.replace(/\.[^.]+$/, ''))) {
    warnings.push('檔案名稱包含特殊字符，可能影響處理');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo: {
      name: file.name,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      type: file.type,
      extension,
      lastModified: new Date(file.lastModified),
      isRecent: (Date.now() - file.lastModified) < 24 * 60 * 60 * 1000 // 24小時內
    }
  };
};

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組數
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 獲取檔案副檔名
 * @param {string} filename - 檔案名稱
 * @returns {string} 副檔名（小寫，不含點）
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * 生成備份檔案名稱
 * @param {string} prefix - 前綴
 * @param {string} extension - 副檔名
 * @param {boolean} includeTime - 是否包含時間
 * @returns {string} 檔案名稱
 */
export const generateBackupFilename = (prefix = 'backup', extension = 'json', includeTime = true) => {
  const now = new Date();
  
  if (includeTime) {
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5); // 移除毫秒部分
    return `${prefix}_${timestamp}.${extension}`;
  } else {
    const date = now.toISOString().split('T')[0];
    return `${prefix}_${date}.${extension}`;
  }
};

/**
 * 複製文字到剪貼簿
 * @param {string} text - 要複製的文字
 * @returns {Promise<Object>} 複製結果
 */
export const copyToClipboard = async (text) => {
  try {
    // 現代瀏覽器的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { 
        success: true, 
        message: '已複製到剪貼簿',
        method: 'clipboard-api'
      };
    } else {
      // 降級方案：使用 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        return { 
          success: true, 
          message: '已複製到剪貼簿',
          method: 'exec-command'
        };
      } else {
        throw new Error('execCommand 複製失敗');
      }
    }
  } catch (error) {
    console.error('複製失敗:', error);
    return { 
      success: false, 
      message: `複製失敗: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * 創建下載連結元素
 * @param {string} url - 檔案URL
 * @param {string} filename - 檔案名稱
 * @returns {HTMLAnchorElement} 下載連結元素
 */
export const createDownloadLink = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  return link;
};

/**
 * 檢查瀏覽器功能支援
 * @returns {Object} 支援狀況
 */
export const checkBrowserSupport = () => {
  return {
    fileReader: typeof FileReader !== 'undefined',
    clipboard: typeof navigator.clipboard !== 'undefined',
    download: typeof document.createElement('a').download !== 'undefined',
    blob: typeof Blob !== 'undefined',
    url: typeof URL !== 'undefined',
    json: typeof JSON !== 'undefined'
  };
};

/**
 * 驗證JSON數據結構
 * @param {any} data - 要驗證的數據
 * @param {Object} schema - 驗證結構
 * @returns {Object} 驗證結果
 */
export const validateJSONStructure = (data, schema = {}) => {
  const errors = [];
  const warnings = [];

  // 基本類型檢查
  if (data === null || data === undefined) {
    errors.push('數據為空');
    return { isValid: false, errors, warnings };
  }

  if (typeof data !== 'object') {
    errors.push('數據必須是物件格式');
    return { isValid: false, errors, warnings };
  }

  // 檢查必要欄位
  const requiredFields = schema.required || [
    'markets', 'aspects', 'classOptions', 'sampleOptions', 'tableList', 'metadata'
  ];

  requiredFields.forEach(field => {
    if (!(field in data)) {
      errors.push(`缺少必要欄位: ${field}`);
    }
  });

  // 檢查陣列類型
  const arrayFields = schema.arrays || ['markets', 'aspects', 'tableList'];
  arrayFields.forEach(field => {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`${field} 必須是陣列類型`);
    }
  });

  // 檢查物件類型
  const objectFields = schema.objects || ['classOptions', 'sampleOptions', 'metadata'];
  objectFields.forEach(field => {
    if (data[field] && typeof data[field] !== 'object') {
      errors.push(`${field} 必須是物件類型`);
    }
  });

  // 檢查表格清單結構
  if (data.tableList && Array.isArray(data.tableList)) {
    data.tableList.forEach((table, index) => {
      const requiredTableFields = ['id', 'name', 'market', 'aspect', 'class', 'sample'];
      requiredTableFields.forEach(field => {
        if (!table[field]) {
          warnings.push(`表格 ${index + 1} 缺少欄位: ${field}`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      hasData: Boolean(data),
      totalFields: Object.keys(data).length,
      tableCount: data.tableList ? data.tableList.length : 0
    }
  };
};

/**
 * 壓縮JSON數據（移除不必要的空白）
 * @param {Object} data - 要壓縮的數據
 * @returns {string} 壓縮後的JSON字串
 */
export const compressJSON = (data) => {
  return JSON.stringify(data);
};

/**
 * 美化JSON數據（添加縮排）
 * @param {Object} data - 要美化的數據
 * @param {number} indent - 縮排空格數
 * @returns {string} 美化後的JSON字串
 */
export const prettifyJSON = (data, indent = 2) => {
  return JSON.stringify(data, null, indent);
};

/**
 * 批量下載檔案
 * @param {Array} files - 檔案清單 [{data, filename, type}]
 * @returns {Promise<Object>} 下載結果
 */
export const batchDownload = async (files) => {
  const results = [];
  
  for (const file of files) {
    try {
      let result;
      if (file.type === 'json') {
        result = downloadJSON(file.data, file.filename);
      } else if (file.type === 'csv') {
        result = downloadCSV(file.data, file.filename);
      } else {
        throw new Error(`不支援的檔案類型: ${file.type}`);
      }
      
      results.push({
        filename: file.filename,
        success: result.success,
        message: result.message
      });
      
      // 添加延遲避免瀏覽器阻擋多檔案下載
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({
        filename: file.filename,
        success: false,
        message: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  return {
    success: successCount === files.length,
    results,
    summary: `成功下載 ${successCount}/${files.length} 個檔案`
  };
};