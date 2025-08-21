# 完整專案架構說明

## 📁 檔案結構總覽

```
investment-table-system/
├── public/
│   ├── index.html              # HTML模板
│   ├── favicon.ico             # 網站圖標
│   └── manifest.json           # PWA配置
├── src/
│   ├── components/             # React組件目錄
│   │   ├── TableSystem/        # 表格系統相關組件
│   │   │   ├── FilterSection.js    # 篩選器區域組件
│   │   │   ├── TableList.js        # 表格列表組件  
│   │   │   ├── PreviewModal.js     # 表格預覽Modal
│   │   │   └── ReportModal.js      # 自訂報表Modal
│   │   ├── DataConvert/        # 數據轉換相關組件
│   │   │   └── DataConvertPage.js  # 數據轉換頁面
│   │   ├── DataManage/         # 數據管理相關組件
│   │   │   └── DataManagePage.js   # 數據管理頁面
│   │   └── common/             # 通用組件
│   │       ├── Modal.js            # 通用Modal組件
│   │       └── Dropdown.js         # 通用下拉選單組件
│   ├── hooks/                  # 自定義React Hooks
│   │   ├── useTableFilter.js       # 表格篩選邏輯Hook
│   │   └── useDataConvert.js       # 數據轉換邏輯Hook
│   ├── utils/                  # 工具函數目錄
│   │   ├── csvParser.js            # CSV解析和驗證工具
│   │   ├── fileUtils.js            # 檔案操作工具
│   │   └── dataProcessor.js       # 數據處理和篩選工具
│   ├── constants/              # 常數和配置
│   │   ├── config.js               # 應用程式配置
│   │   └── tableData.js            # 預設表格數據
│   ├── App.js                  # 主要應用程式組件
│   ├── index.js                # React應用程式入口
│   └── index.css               # 全局樣式文件
├── package.json                # NPM依賴和腳本配置
├── tailwind.config.js          # Tailwind CSS配置
├── postcss.config.js           # PostCSS配置
├── README.md                   # 專案說明文檔
└── PROJECT_STRUCTURE.md       # 本檔案
```

## 🏗️ 架構設計原則

### 1. 模組化設計
- **組件分離**：按功能領域分組組件（TableSystem、DataConvert、DataManage）
- **邏輯分離**：業務邏輯提取到自定義Hooks中
- **工具分離**：通用工具函數獨立成模組

### 2. 可維護性
- **單一職責**：每個組件和函數都有明確的單一職責
- **低耦合**：組件之間通過props和事件通信，避免直接依賴
- **高內聚**：相關功能集中在同一模組中

### 3. 可擴展性
- **配置驅動**：通過config.js控制功能開關
- **數據驅動**：通過tableData.js定義數據結構
- **主題系統**：通過Tailwind配置支援主題自訂

## 📦 核心模組說明

### 🎯 Components 組件層

#### TableSystem - 表格系統核心
```javascript
FilterSection.js     # 4層級篩選器實現
├── 市場類型選擇 (Chip)
├── 分析面向選擇 (Chip)  
├── 類別多選 (Dropdown)
├── 樣本多選 (Dropdown)
├── 搜尋功能
└── 篩選摘要

TableList.js        # 表格列表展示
├── List視圖展示
├── 表格卡片組件
├── 空狀態處理
└── 載入狀態

PreviewModal.js     # 表格預覽彈窗
├── 表格詳細資訊
├── 屬性標籤展示
├── 預覽圖表區域
└── 報表生成入口

ReportModal.js      # 自訂報表彈窗
├── 時間區間設定
├── 欄位選擇
├── 格式選擇
├── 進階選項
└── 生成進度
```

#### DataConvert - 數據轉換工具
```javascript
DataConvertPage.js  # 數據轉換主頁面
├── CSV輸入區域
├── 格式驗證
├── 轉換統計
├── 代碼生成
└── 結果匯出
```

#### DataManage - 數據管理系統  
```javascript
DataManagePage.js   # 數據管理主頁面
├── 當前數據狀態
├── 文件上傳功能
├── 備份管理
├── 數據分布視圖
└── 操作歷史
```

#### Common - 通用組件
```javascript
Modal.js           # 通用Modal組件
├── 多尺寸支援
├── 鍵盤導航
├── 焦點管理
├── 動畫效果
└── 可及性支援

Dropdown.js        # 通用下拉選單
├── 單選/多選模式
├── 搜尋功能
├── 虛擬滾動
├── 鍵盤導航
└── 自訂渲染
```

### 🎣 Hooks 狀態管理層

#### useTableFilter - 篩選邏輯Hook
```javascript
狀態管理:
├── selectedMarket     # 選中的市場
├── selectedAspect     # 選中的面向  
├── selectedClasses    # 選中的類別陣列
├── selectedSamples    # 選中的樣本陣列
├── searchTerm         # 搜尋關鍵字

計算狀態:
├── availableClasses   # 可用類別清單
├── availableSamples   # 可用樣本清單
├── filteredTables     # 篩選後的表格
└── filterSummary      # 篩選摘要統計

事件處理:
├── handleMarketChange    # 市場變更（重置下層）
├── handleAspectChange    # 面向變更（重置下層）
├── handleClassToggle     # 類別切換
├── handleSampleToggle    # 樣本切換
└── resetAllFilters       # 重置所有篩選
```

#### useDataConvert - 轉換邏輯Hook
```javascript
狀態管理:
├── csvInput           # CSV輸入內容
├── convertedData      # 轉換後的數據
├── validationResult   # 驗證結果
├── isConverting       # 轉換進行中
└── showGeneratedCode  # 顯示生成代碼

功能方法:
├── convertData        # 執行數據轉換
├── downloadJsonFile   # 下載JSON檔案
├── copyCodeToClipboard # 複製代碼到剪貼簿
├── applyConvertedData # 應用數據到系統
└── loadSampleData     # 載入示範數據
```

### 🛠️ Utils 工具函數層

#### csvParser.js - CSV處理工具
```javascript
parseCSV()              # 解析CSV文字為物件陣列
validateCSVData()       # 驗證CSV數據結構
convertCSVToSystemData() # 轉換為系統數據格式
generateDataStatistics() # 生成統計資訊
```

#### fileUtils.js - 檔案操作工具
```javascript
downloadJSON()          # 下載JSON檔案
downloadCSV()           # 下載CSV檔案
readUploadedFile()      # 讀取上傳檔案
validateFile()          # 驗證檔案格式
formatFileSize()        # 格式化檔案大小
copyToClipboard()       # 複製到剪貼簿
```

#### dataProcessor.js - 數據處理工具
```javascript
filterTables()          # 篩選表格數據
getAvailableClasses()   # 獲取可用類別
getAvailableSamples()   # 獲取可用樣本
validateFilterDependencies() # 驗證篩選依賴
resetSubsequentFilters() # 重置後續篩選器
generateFilterSummary()  # 生成篩選摘要
sortTables()            # 表格排序
paginateData()          # 數據分頁
validateDataStructure()  # 驗證數據結構
```

### ⚙️ Constants 配置層

#### config.js - 應用程式配置
```javascript
APP_CONFIG:
├── SHOW_DEV_TOOLS     # 開發工具開關
├── APP_NAME           # 應用程式名稱
├── VERSION            # 版本號
├── MODAL              # Modal配置
├── FILTER             # 篩選器配置
└── FILE               # 檔案處理配置

UI_CONFIG:
├── COLORS             # 色彩主題
├── ANIMATION          # 動畫設定
└── BREAKPOINTS        # 響應式斷點
```

#### tableData.js - 預設數據
```javascript
DEFAULT_TABLE_DATA:
├── markets            # 市場清單
├── aspects            # 面向清單
├── classOptions       # 類別選項結構
├── sampleOptions      # 樣本選項結構
├── tableList          # 表格清單
└── metadata           # 元數據

SAMPLE_CSV_DATA:       # 示範CSV數據
```

## 🔄 數據流向設計

### 1. 篩選數據流
```
用戶操作 → Hook狀態更新 → 數據處理 → UI更新
    ↓
FilterSection → useTableFilter → dataProcessor → TableList
```

### 2. 轉換數據流  
```
CSV輸入 → 解析驗證 → 格式轉換 → 代碼生成 → 應用/下載
    ↓
DataConvertPage → useDataConvert → csvParser → fileUtils
```

### 3. 管理數據流
```
文件上傳 → 格式驗證 → 數據更新 → 備份記錄 → 狀態同步
    ↓
DataManagePage → fileUtils → dataProcessor → App狀態
```

## 🎨 樣式架構

### Tailwind CSS 配置層級
```javascript
tailwind.config.js:
├── 自訂色彩主題
├── 字體配置
├── 間距系統
├── 動畫效果
├── 響應式斷點
└── 自訂組件類別

index.css:
├── 基礎樣式重置
├── 組件樣式
├── 工具樣式
├── 動畫定義
└── 響應式樣式
```

## 🔧 開發工具配置

### 建置工具鏈
```javascript
package.json:
├── React腳手架 (Create React App)
├── Tailwind CSS處理
├── PostCSS轉換
├── ESLint代碼檢查
└── Prettier代碼格式化

建置腳本:
├── npm start          # 開發服務器
├── npm run build      # 生產建置
├── npm run build:production # 隱藏開發工具
└── npm test           # 執行測試
```

## 📱 響應式設計

### 斷點策略
```css
手機端 (< 768px):
├── 單欄布局
├── 摺疊式導航
├── 觸控優化
└── 簡化操作

平板端 (768px - 1023px):
├── 雙欄布局
├── 側邊欄可摺疊
├── 觸控+滑鼠混合
└── 中等密度UI

桌機端 (≥ 1024px):
├── 多欄布局
├── 完整功能展示
├── 滑鼠操作優化
└── 高密度UI
```

## 🚀 部署配置

### 環境配置
```javascript
開發環境:
├── SHOW_DEV_TOOLS=true
├── 完整功能集
├── 開發工具
└── 詳細錯誤信息

生產環境:
├── SHOW_DEV_TOOLS=false
├── 核心功能
├── 性能優化
└── 錯誤隱藏
```

## 🔍 最佳實踐

### 1. 組件設計
- 單一職責原則
- Props介面清晰
- 狀態最小化
- 純函數組件優先

### 2. 性能優化
- React.memo避免重渲染
- useMemo緩存計算結果
- useCallback穩定函數引用
- 懶載入大型組件

### 3. 可及性
- 語義化HTML
- 鍵盤導航支援
- ARIA標籤
- 對比度要求

### 4. 錯誤處理
- ErrorBoundary捕獲組件錯誤
- try-catch處理異步操作
- 友好的錯誤提示
- 降級處理策略

---

這個架構提供了完整的投資分析表格篩選系統，具備良好的可維護性、擴展性和使用者體驗。