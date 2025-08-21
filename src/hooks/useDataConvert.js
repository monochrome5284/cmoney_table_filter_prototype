// src/hooks/useDataConvert.js
// 數據轉換邏輯的自定義Hook

import { useState, useCallback, useMemo } from 'react';
import { 
  parseCSV, 
  validateCSVData, 
  convertCSVToSystemData, 
  generateDataStatistics 
} from '../utils/csvParser';
import { downloadJSON, copyToClipboard } from '../utils/fileUtils';

/**
 * 數據轉換Hook
 * @param {Function} onDataConverted - 數據轉換完成回調
 * @returns {Object} 轉換狀態和方法
 */
export const useDataConvert = (onDataConverted) => {
  // 轉換狀態
  const [csvInput, setCsvInput] = useState('');
  const [convertedData, setConvertedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  
  // 錯誤和成功狀態
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 清除狀態
  const clearState = useCallback(() => {
    setConvertedData(null);
    setValidationResult(null);
    setStatistics(null);
    setError('');
    setSuccessMessage('');
    setShowGeneratedCode(false);
  }, []);

  // 更新CSV輸入
  const updateCsvInput = useCallback((value) => {
    setCsvInput(value);
    clearState();
  }, [clearState]);

  // 清空CSV輸入
  const clearCsvInput = useCallback(() => {
    setCsvInput('');
    clearState();
  }, [clearState]);

  // 載入示範數據
  const loadSampleData = useCallback((sampleCsv) => {
    setCsvInput(sampleCsv);
    clearState();
    setSuccessMessage('示範數據已載入');
    
    // 3秒後清除成功訊息
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [clearState]);

  // 驗證CSV數據
  const validateData = useCallback((csvText) => {
    try {
      const parsedData = parseCSV(csvText);
      const validation = validateCSVData(parsedData);
      
      setValidationResult(validation);
      
      if (!validation.isValid) {
        setError(`數據驗證失敗: ${validation.errors.join(', ')}`);
        return null;
      }
      
      if (validation.warnings.length > 0) {
        console.warn('數據警告:', validation.warnings);
      }
      
      return parsedData;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // 轉換數據
  const convertData = useCallback(async () => {
    if (!csvInput.trim()) {
      setError('請輸入CSV數據');
      return false;
    }

    setIsConverting(true);
    setError('');
    setSuccessMessage('');

    try {
      // 驗證數據
      const parsedData = validateData(csvInput);
      if (!parsedData) {
        setIsConverting(false);
        return false;
      }

      // 轉換數據
      const converted = convertCSVToSystemData(parsedData);
      const stats = generateDataStatistics(converted);
      
      setConvertedData(converted);
      setStatistics(stats);
      setSuccessMessage('數據轉換成功！');
      
      // 3秒後清除成功訊息
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setIsConverting(false);
      return true;
    } catch (err) {
      setError(err.message);
      setIsConverting(false);
      return false;
    }
  }, [csvInput, validateData]);

  // 生成React代碼
  const generateReactCode = useCallback(() => {
    if (!convertedData) return '';
    
    return `// Generated at ${new Date().toISOString()}
const tableData = ${JSON.stringify(convertedData, null, 2)};

export default tableData;`;
  }, [convertedData]);

  // 生成JSON代碼
  const generateJsonCode = useCallback(() => {
    if (!convertedData) return '';
    return JSON.stringify(convertedData, null, 2);
  }, [convertedData]);

  // 下載JSON檔案
  const downloadJsonFile = useCallback(() => {
    if (!convertedData) {
      setError('沒有可下載的數據');
      return false;
    }

    try {
      const filename = `table_data_${new Date().toISOString().split('T')[0]}.json`;
      const result = downloadJSON(convertedData, filename);
      
      if (result.success) {
        setSuccessMessage('檔案下載成功');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message);
      }
      
      return result.success;
    } catch (err) {
      setError(`下載失敗: ${err.message}`);
      return false;
    }
  }, [convertedData]);

  // 複製代碼到剪貼簿
  const copyCodeToClipboard = useCallback(async (codeType = 'react') => {
    const code = codeType === 'react' ? generateReactCode() : generateJsonCode();
    
    if (!code) {
      setError('沒有可複製的代碼');
      return false;
    }

    try {
      const result = await copyToClipboard(code);
      
      if (result.success) {
        setSuccessMessage('代碼已複製到剪貼簿');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message);
      }
      
      return result.success;
    } catch (err) {
      setError(`複製失敗: ${err.message}`);
      return false;
    }
  }, [generateReactCode, generateJsonCode]);

  // 應用轉換後的數據
  const applyConvertedData = useCallback(() => {
    if (!convertedData) {
      setError('沒有可應用的數據');
      return false;
    }

    try {
      if (onDataConverted && typeof onDataConverted === 'function') {
        onDataConverted(convertedData);
        setSuccessMessage('數據已成功應用到系統');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        setError('無法應用數據：缺少回調函數');
        return false;
      }
    } catch (err) {
      setError(`應用數據失敗: ${err.message}`);
      return false;
    }
  }, [convertedData, onDataConverted]);

  // 切換代碼顯示
  const toggleCodeDisplay = useCallback(() => {
    setShowGeneratedCode(prev => !prev);
  }, []);

  // 檢查是否可以轉換
  const canConvert = useMemo(() => {
    return csvInput.trim().length > 0 && !isConverting;
  }, [csvInput, isConverting]);

  // 檢查是否有轉換結果
  const hasConvertedData = useMemo(() => {
    return convertedData !== null;
  }, [convertedData]);

  // 轉換進度狀態
  const conversionStatus = useMemo(() => {
    if (isConverting) return 'converting';
    if (error) return 'error';
    if (hasConvertedData) return 'success';
    return 'idle';
  }, [isConverting, error, hasConvertedData]);

  // 清除錯誤
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // 清除成功訊息
  const clearSuccess = useCallback(() => {
    setSuccessMessage('');
  }, []);

  return {
    // 狀態
    csvInput,
    convertedData,
    validationResult,
    statistics,
    isConverting,
    showGeneratedCode,
    error,
    successMessage,
    conversionStatus,
    
    // 計算狀態
    canConvert,
    hasConvertedData,
    reactCode: generateReactCode(),
    jsonCode: generateJsonCode(),
    
    // 方法
    updateCsvInput,
    clearCsvInput,
    loadSampleData,
    convertData,
    downloadJsonFile,
    copyCodeToClipboard,
    applyConvertedData,
    toggleCodeDisplay,
    clearError,
    clearSuccess,
    clearState,
    
    // 設定器
    setCsvInput,
    setShowGeneratedCode
  };
};