// ========================================================================================
// src/hooks/useExcelFieldConverter.js
// Excel 欄位轉換 Hook
// ========================================================================================
import { useState, useCallback, useRef } from 'react';
import { parseExcelFile, matchTableData, generateMergedData } from '../utils/excelFieldUtils';

export const useExcelFieldConverter = (onDataConverted) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [tableData, setTableData] = useState(null); // 接收完整的數據結構
  const [matchResults, setMatchResults] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [finalResults, setFinalResults] = useState(null);
  
  const fileInputRef = useRef(null);

  // 初始化 - 從App.js接收完整的tableData
  useState(() => {
    // 如果沒有tableData，使用DEFAULT_TABLE_DATA
    import('../constants/tableData').then(({ DEFAULT_TABLE_DATA }) => {
      if (!tableData) {
        setTableData(DEFAULT_TABLE_DATA);
      }
    });
  }, []);

  // 處理檔案上傳
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage('請上傳有效的Excel檔案 (.xlsx 或 .xls)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('檔案大小不能超過 20MB');
      return;
    }

    setUploadedFile(file);
    setProcessingStatus('processing');
    setErrorMessage('');
    
    try {
      const parsedData = await parseExcelFile(file);
      setExcelData(parsedData);
      setProcessingStatus('success');
      setCurrentStep(2);
    } catch (error) {
      console.error('檔案處理錯誤:', error);
      setErrorMessage(error.message || '檔案處理失敗，請檢查檔案格式');
      setProcessingStatus('error');
    }
  }, []);

  // 執行資料匹配
  const performMatching = useCallback(() => {
    if (!excelData || !tableData || !tableData.tableList) {
      setErrorMessage('缺少必要的資料進行匹配');
      setProcessingStatus('error');
      return;
    }
    
    setProcessingStatus('processing');
    
    try {
      // 使用 tableData.tableList 進行匹配
      const results = matchTableData(excelData.tables, tableData.tableList);
      setMatchResults(results);
      setProcessingStatus('success');
      setCurrentStep(3);
    } catch (error) {
      setErrorMessage('匹配處理失敗：' + error.message);
      setProcessingStatus('error');
    }
  }, [excelData, tableData]);

  // 選擇匹配結果
  const selectMatch = useCallback((resultIndex, selectedTable) => {
    const updatedResults = [...matchResults];
    updatedResults[resultIndex].selectedMatch = selectedTable;
    updatedResults[resultIndex].status = selectedTable ? 'matched' : 'pending';
    setMatchResults(updatedResults);
  }, [matchResults]);

  // 生成最終結果
  const generateFinalResults = useCallback(() => {
    if (!tableData || !tableData.tableList) {
      setErrorMessage('缺少表格數據');
      setProcessingStatus('error');
      return;
    }

    setProcessingStatus('processing');
    
    try {
      // 生成合併後的完整數據結構
      const results = generateMergedData(matchResults, tableData);
      setFinalResults(results);
      
      // 通知父組件數據已更新
      if (onDataConverted && results.mergedData) {
        onDataConverted(results.mergedData);
      }
      
      setProcessingStatus('success');
      setCurrentStep(4);
    } catch (error) {
      console.error('生成結果失敗：', error);
      setErrorMessage('生成結果失敗：' + error.message);
      setProcessingStatus('error');
    }
  }, [matchResults, tableData, onDataConverted]);

  // 匯出結果
  const exportResults = useCallback(() => {
    if (!finalResults || !finalResults.exportData) {
      setErrorMessage('沒有可匯出的結果');
      return;
    }
    
    try {
      const blob = new Blob([finalResults.exportData.content], { 
        type: 'application/json;charset=utf-8' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalResults.exportData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('檔案匯出成功:', finalResults.exportData.fileName);
    } catch (error) {
      console.error('匯出失敗:', error);
      setErrorMessage('匯出失敗：' + error.message);
    }
  }, [finalResults]);

  // 重置工具
  const resetTool = useCallback(() => {
    setCurrentStep(1);
    setUploadedFile(null);
    setExcelData(null);
    setMatchResults([]);
    setFinalResults(null);
    setProcessingStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 接收外部的 tableData 更新
  const updateTableData = useCallback((newTableData) => {
    setTableData(newTableData);
  }, []);

  return {
    currentStep,
    uploadedFile,
    excelData,
    matchResults,
    finalResults,
    processingStatus,
    errorMessage,
    tableData, // 暴露tableData供debugging
    handleFileUpload,
    performMatching,
    selectMatch,
    generateFinalResults,
    exportResults,
    resetTool,
    updateTableData,
    fileInputRef
  };
};