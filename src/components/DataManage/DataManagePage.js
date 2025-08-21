// src/components/DataManage/DataManagePage.js
// 數據管理頁面組件

import React, { useState } from 'react';
import { 
  ArrowLeft, Upload, Download, Database, History, 
  AlertCircle, CheckCircle, Trash2, RefreshCw, 
  FileText, BarChart3, Settings, Clock
} from 'lucide-react';
import { readUploadedFile, validateFile, downloadJSON, formatFileSize } from '../../utils/fileUtils';
import { validateDataStructure } from '../../utils/dataProcessor';

/**
 * 數據管理頁面組件
 * @param {Object} props - 組件props
 * @param {Function} props.onBack - 返回回調
 * @param {Object} props.tableData - 當前表格數據
 * @param {Function} props.onDataUpdate - 數據更新回調
 * @returns {ReactNode}
 */
const DataManageePage = ({ onBack, tableData, onDataUpdate }) => {
  // 狀態管理
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [dataHistory, setDataHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 文件上傳處理
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadError('');
    setUploadSuccess('');

    try {
      // 驗證文件
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // 讀取文件
      const fileContent = await readUploadedFile(file);
      
      if (fileContent.type !== 'json') {
        throw new Error('僅支援JSON格式文件');
      }

      // 驗證數據結構
      const dataValidation = validateDataStructure(fileContent.data);
      if (!dataValidation.isValid) {
        throw new Error(`數據結構驗證失敗: ${dataValidation.errors.join(', ')}`);
      }

      // 備份當前數據
      const backup = {
        data: tableData,
        timestamp: new Date().toISOString(),
        version: tableData.metadata?.dataVersion || '1.0',
        source: 'manual_backup_before_import'
      };
      setDataHistory(prev => [...prev, backup]);

      // 更新數據
      onDataUpdate(fileContent.data);
      
      setUploadStatus('success');
      setUploadSuccess(`成功導入 ${fileContent.filename}，包含 ${fileContent.data.tableList.length} 個表格`);
      
      // 3秒後清除成功消息
      setTimeout(() => {
        setUploadSuccess('');
        setUploadStatus('idle');
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setUploadError(error.message);
    }

    // 清空文件輸入
    event.target.value = '';
  };

  // 手動備份數據
  const handleManualBackup = () => {
    const backup = {
      data: tableData,
      timestamp: new Date().toISOString(),
      version: tableData.metadata?.dataVersion || '1.0',
      source: 'manual_backup'
    };
    
    setDataHistory(prev => [...prev, backup]);
    setUploadSuccess('數據已成功備份');
    
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  // 導出數據
  const handleExportData = () => {
    const filename = `table_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    const result = downloadJSON(tableData, filename);
    
    if (result.success) {
      setUploadSuccess('數據導出成功');
    } else {
      setUploadError(result.message);
    }
    
    setTimeout(() => {
      setUploadSuccess('');
      setUploadError('');
    }, 3000);
  };

  // 恢復數據
  const handleRestoreData = (backup) => {
    if (!window.confirm('確定要恢復到此備份嗎？當前數據將被替換。')) {
      return;
    }

    setIsProcessing(true);
    
    // 模擬處理時間
    setTimeout(() => {
      onDataUpdate(backup.data);
      setUploadSuccess('數據已成功恢復');
      setIsProcessing(false);
      
      setTimeout(() => setUploadSuccess(''), 3000);
    }, 1000);
  };

  // 刪除備份
  const handleDeleteBackup = (index) => {
    if (!window.confirm('確定要刪除此備份嗎？')) {
      return;
    }

    setDataHistory(prev => prev.filter((_, i) => i !== index));
    setUploadSuccess('備份已刪除');
    
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  // 重設數據
  const handleResetData = () => {
    if (!window.confirm('確定要重設為初始數據嗎？此操作不可恢復。')) {
      return;
    }

    setIsProcessing(true);
    
    // 備份當前數據
    const backup = {
      data: tableData,
      timestamp: new Date().toISOString(),
      version: tableData.metadata?.dataVersion || '1.0',
      source: 'backup_before_reset'
    };
    setDataHistory(prev => [...prev, backup]);

    // 模擬重設處理
    setTimeout(() => {
      // 這裡可以重設為初始數據
      setUploadSuccess('數據已重設為初始狀態');
      setIsProcessing(false);
      
      setTimeout(() => setUploadSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頁面標題 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-purple-600 hover:text-purple-700 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回主頁</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">數據管理</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              uploadStatus === 'success' ? 'bg-green-500' :
              uploadStatus === 'error' ? 'bg-red-500' :
              uploadStatus === 'uploading' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600">
              {uploadStatus === 'success' ? '操作成功' :
               uploadStatus === 'error' ? '操作失敗' :
               uploadStatus === 'uploading' ? '處理中' :
               '就緒'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：當前數據狀態 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 消息提示 */}
            <MessageBanner 
              error={uploadError} 
              success={uploadSuccess}
              onClearError={() => setUploadError('')}
              onClearSuccess={() => setUploadSuccess('')}
            />

            {/* 當前數據狀態 */}
            <CurrentDataStatus tableData={tableData} />

            {/* 數據操作 */}
            <DataOperations 
              onFileUpload={handleFileUpload}
              onManualBackup={handleManualBackup}
              onExportData={handleExportData}
              onResetData={handleResetData}
              isProcessing={isProcessing}
              uploadStatus={uploadStatus}
            />

            {/* 數據詳情 */}
            <DataDetails tableData={tableData} />
          </div>

          {/* 右側：備份歷史 */}
          <div>
            <BackupHistory 
              dataHistory={dataHistory}
              onRestore={handleRestoreData}
              onDelete={handleDeleteBackup}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 消息橫幅組件
 */
const MessageBanner = ({ error, success, onClearError, onClearSuccess }) => {
  if (!error && !success) return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">操作失敗</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button 
            onClick={onClearError}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-800">操作成功</h4>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
          <button 
            onClick={onClearSuccess}
            className="text-green-400 hover:text-green-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 當前數據狀態組件
 */
const CurrentDataStatus = ({ tableData }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Database className="w-5 h-5 mr-2" />
      當前數據狀態
    </h3>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {tableData.metadata?.totalTables || tableData.tableList?.length || 0}
        </div>
        <div className="text-sm text-gray-600">總表格</div>
      </div>
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {tableData.markets?.length || 0}
        </div>
        <div className="text-sm text-gray-600">市場</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {tableData.aspects?.length || 0}
        </div>
        <div className="text-sm text-gray-600">面向</div>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">
          {tableData.metadata?.dataVersion || '1.0'}
        </div>
        <div className="text-sm text-gray-600">版本</div>
      </div>
    </div>
    
    <div className="text-sm text-gray-600 border-t pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>最後更新：{tableData.metadata?.lastUpdated || '未知'}</div>
        <div>數據來源：{tableData.metadata?.source || '未知'}</div>
      </div>
    </div>
  </div>
);

/**
 * 數據操作組件
 */
const DataOperations = ({ 
  onFileUpload, 
  onManualBackup, 
  onExportData, 
  onResetData, 
  isProcessing, 
  uploadStatus 
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Settings className="w-5 h-5 mr-2" />
      數據操作
    </h3>
    
    {/* 文件上傳 */}
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3">導入數據</h4>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">拖拽JSON文件到此處，或點擊選擇文件</p>
        <input
          type="file"
          accept=".json"
          onChange={onFileUpload}
          className="hidden"
          id="jsonUpload"
          disabled={isProcessing || uploadStatus === 'uploading'}
        />
        <label
          htmlFor="jsonUpload"
          className={`cursor-pointer px-4 py-2 rounded-lg inline-block transition-colors ${
            isProcessing || uploadStatus === 'uploading'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {uploadStatus === 'uploading' ? '上傳中...' : '選擇JSON文件'}
        </label>
        <p className="text-xs text-gray-500 mt-2">支援JSON格式，最大5MB</p>
      </div>
    </div>

    {/* 操作按鈕 */}
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">數據管理</h4>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onManualBackup}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Database className="w-4 h-4" />
          <span>備份數據</span>
        </button>
        
        <button
          onClick={onExportData}
          disabled={isProcessing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>導出數據</span>
        </button>
        
        <button
          onClick={onResetData}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>{isProcessing ? '處理中...' : '重設數據'}</span>
        </button>
      </div>
    </div>
  </div>
);

/**
 * 數據詳情組件
 */
const DataDetails = ({ tableData }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2" />
      數據分布
    </h3>
    
    <div className="space-y-4">
      {/* 市場分布 */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">市場分布</h4>
        <div className="space-y-2">
          {tableData.markets?.map(market => {
            const count = tableData.tableList?.filter(table => table.market === market).length || 0;
            const percentage = tableData.tableList?.length ? (count / tableData.tableList.length * 100).toFixed(1) : 0;
            
            return (
              <div key={market} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{market}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 面向分布 */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">面向分布</h4>
        <div className="space-y-2">
          {tableData.aspects?.map(aspect => {
            const count = tableData.tableList?.filter(table => table.aspect === aspect).length || 0;
            const percentage = tableData.tableList?.length ? (count / tableData.tableList.length * 100).toFixed(1) : 0;
            
            return (
              <div key={aspect} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{aspect}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 備份歷史組件
 */
const BackupHistory = ({ dataHistory, onRestore, onDelete, isProcessing }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <History className="w-5 h-5 mr-2" />
      備份歷史 ({dataHistory.length})
    </h3>
    
    {dataHistory.length === 0 ? (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">尚無備份記錄</p>
        <p className="text-gray-400 text-xs mt-1">建立備份以保護您的數據</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {dataHistory.map((backup, index) => (
          <BackupItem 
            key={index}
            backup={backup}
            index={index}
            onRestore={onRestore}
            onDelete={onDelete}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    )}
  </div>
);

/**
 * 備份項目組件
 */
const BackupItem = ({ backup, index, onRestore, onDelete, isProcessing }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSourceIcon = (source) => {
    if (source.includes('import')) return <Upload className="w-4 h-4" />;
    if (source.includes('reset')) return <RefreshCw className="w-4 h-4" />;
    return <Database className="w-4 h-4" />;
  };

  const getSourceLabel = (source) => {
    if (source.includes('import')) return '導入前備份';
    if (source.includes('reset')) return '重設前備份';
    if (source.includes('manual')) return '手動備份';
    return '自動備份';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {getSourceIcon(backup.source)}
            <span className="text-sm font-medium text-gray-900">
              備份 #{index + 1}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getSourceLabel(backup.source)}
            </span>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div>時間：{formatTimestamp(backup.timestamp)}</div>
            <div>版本：{backup.version}</div>
            <div>表格：{backup.data.tableList?.length || 0} 個</div>
          </div>
        </div>
        
        <div className="flex space-x-1 ml-2">
          <button
            onClick={() => onRestore(backup)}
            disabled={isProcessing}
            className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="恢復此備份"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            disabled={isProcessing}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="刪除此備份"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManageePage;