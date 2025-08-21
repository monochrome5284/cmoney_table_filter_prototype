// src/index.js
// React 應用程式入口點

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 錯誤邊界組件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 在生產環境中，您可以將錯誤發送到錯誤追蹤服務
    console.error('應用程式錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              應用程式發生錯誤
            </h1>
            <p className="text-gray-600 mb-6">
              很抱歉，應用程式遇到了意外錯誤。請重新整理頁面或聯繫技術支援。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                重新整理頁面
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                重試
              </button>
            </div>
            
            {/* 開發環境顯示錯誤詳情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  錯誤詳情 (開發模式)
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto">
                  <div className="font-mono text-red-600 mb-2">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  <div className="font-mono text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 載入提示組件
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-lg font-medium text-gray-900">載入中...</h2>
      <p className="text-gray-500 text-sm mt-2">正在準備投資分析平台</p>
    </div>
  </div>
);

// 應用程式初始化
const initializeApp = () => {
  // 設置全局錯誤處理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason);
    // 可以在這裡發送錯誤到監控服務
  });

  window.addEventListener('error', (event) => {
    console.error('全局錯誤:', event.error);
    // 可以在這裡發送錯誤到監控服務
  });

  // 設置應用程式配置
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 投資分析平台 - 開發模式');
    console.log('React 版本:', React.version);
    console.log('環境變數:', {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_SHOW_DEV_TOOLS: process.env.REACT_APP_SHOW_DEV_TOOLS
    });
  }

  // 檢查瀏覽器支援
  if (!window.fetch) {
    console.warn('瀏覽器不支援 fetch API，某些功能可能無法正常運作');
  }

  if (!window.FileReader) {
    console.warn('瀏覽器不支援 FileReader API，文件上傳功能可能無法正常運作');
  }
};

// 主要渲染邏輯
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // 在嚴格模式下渲染應用程式（開發模式）
  const AppWrapper = process.env.NODE_ENV === 'development' 
    ? React.StrictMode 
    : React.Fragment;

  root.render(
    <AppWrapper>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingScreen />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </AppWrapper>
  );
};

// 初始化並渲染應用程式
try {
  initializeApp();
  renderApp();
} catch (error) {
  console.error('應用程式初始化失敗:', error);
  
  // 降級渲染錯誤頁面
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
        <div className="text-red-500 text-6xl mb-4">💥</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          應用程式初始化失敗
        </h1>
        <p className="text-gray-600 mb-6">
          無法載入投資分析平台。請檢查網路連線或重新整理頁面。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          重新載入
        </button>
      </div>
    </div>
  );
}

// 效能監控（可選）
if (process.env.NODE_ENV === 'production') {
  // 可以在這裡添加效能監控代碼
  // 例如：Google Analytics、Sentry 等
}

// 開發工具（僅開發模式）
if (process.env.NODE_ENV === 'development') {
  // 可以在這裡添加開發工具
  // 例如：React Developer Tools 相關配置
}