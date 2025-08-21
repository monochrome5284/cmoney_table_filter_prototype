// src/constants/config.js
// 專案配置檔案

export const APP_CONFIG = {
  // 開發者工具控制（生產環境設為 false）
  SHOW_DEV_TOOLS: true,
  
  // 應用程式設定
  APP_NAME: '投資分析平台',
  VERSION: '1.0.0',
  
  // Modal 設定
  MODAL: {
    MAX_HEIGHT: '90vh',
    Z_INDEX: {
      MAIN: 40,
      PREVIEW: 50,
      REPORT: 60,
    }
  },
  
  // 篩選器設定
  FILTER: {
    DEFAULT_MARKET: '台灣',
    DEFAULT_ASPECT: '基本面',
    DROPDOWN_MAX_HEIGHT: '48', // max-h-48 (12rem)
  },
  
  // 分頁路由
  PAGES: {
    MAIN: 'main',
    CONVERT: 'convert',
    MANAGE: 'manage',
  },
  
  // 檔案處理
  FILE: {
    ACCEPTED_FORMATS: ['.json', '.csv'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
  
  // 本地化設定
  LOCALE: {
    DATE_FORMAT: 'YYYY-MM-DD',
    TIMEZONE: 'Asia/Taipei',
  }
};

export const UI_CONFIG = {
  // 色彩主題 - 淺紫色方案
  COLORS: {
    PRIMARY: 'purple-600',    // 主要淺紫色
    SECONDARY: 'lavender-500', // 輔助淺薰衣草色
    SUCCESS: 'green-500',
    WARNING: 'yellow-500',
    DANGER: 'red-500',
    INFO: 'blue-500',
  },
  
  // 動畫設定
  ANIMATION: {
    DURATION: '300ms',
    EASING: 'ease-in-out',
  },
  
  // 響應式斷點
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  }
};

export default APP_CONFIG;