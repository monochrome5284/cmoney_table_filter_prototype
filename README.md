# 投資分析表格篩選系統

一個功能完整的投資數據分析平台，包含4層級聯篩選器、數據轉換工具和數據管理功能。

## ✨ 主要功能

### 🔍 4層級篩選系統
- **市場類型**：台灣/美國/中國/香港，單選Chip模式
- **分析面向**：基本面/技術面/籌碼面/消息面，單選Chip模式  
- **類別選擇**：多選Dropdown，支援搜尋和批量操作
- **樣本選擇**：多選Dropdown，支援搜尋和批量操作
- **智能聯動**：上層變更自動重置下層選項
- **即時搜尋**：表格名稱關鍵字搜尋

### 📊 數據轉換工具
- **CSV解析**：支援Excel/CSV格式數據導入
- **格式驗證**：自動檢查數據結構完整性
- **代碼生成**：自動生成React數據結構代碼
- **統計分析**：提供數據分布和品質報告
- **一鍵匯出**：JSON格式下載和複製功能

### 🗄️ 數據管理功能
- **文件上傳**：支援JSON格式拖拽上傳
- **備份系統**：自動和手動數據備份
- **版本控制**：追蹤數據變更歷史
- **批量操作**：批量匯入、匯出和管理
- **數據驗證**：完整性檢查和錯誤修復

### 🎨 進階功能
- **表格預覽**：Modal彈窗展示詳細資訊
- **自訂報表**：時間區間、欄位選擇、多格式匯出
- **響應式設計**：支援桌機、平板、手機
- **開發者模式**：可控制功能顯示/隱藏

## 🚀 快速開始

### 環境要求

- Node.js 16+ 
- npm 或 yarn
- 現代瀏覽器 (Chrome 90+, Firefox 88+, Safari 14+)

### 安裝步驟

1. **複製專案**
```bash
git clone https://github.com/yourusername/investment-table-system.git
cd investment-table-system
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
```

3. **啟動開發服務器**
```bash
npm start
# 或
yarn start
```

4. **在瀏覽器中開啟**
```
http://localhost:3000
```

### 建置生產版本

```bash
# 包含開發工具的版本
npm run build

# 生產環境版本（隱藏開發工具）
npm run build:production
```

## 📁 專案結構

```
src/
├── components/              # React 組件
│   ├── TableSystem/        # 表格系統組件
│   │   ├── FilterSection.js    # 篩選器組件
│   │   ├── TableList.js        # 表格列表組件
│   │   ├── PreviewModal.js     # 預覽彈窗組件
│   │   └── ReportModal.js      # 報表彈窗組件
│   ├── DataConvert/        # 數據轉換組件
│   │   └── DataConvertPage.js  # 轉換頁面組件
│   ├── DataManage/         # 數據管理組件
│   │   └── DataManagePage.js   # 管理頁面組件
│   └── common/             # 通用組件
│       ├── Modal.js            # 通用Modal組件
│       └── Dropdown.js         # 通用下拉選單組件
├── hooks/                   # 自定義Hooks
│   ├── useTableFilter.js       # 表格篩選Hook
│   └── useDataConvert.js       # 數據轉換Hook
├── utils/                   # 工具函數
│   ├── csvParser.js            # CSV解析工具
│   ├── fileUtils.js            # 檔案操作工具
│   └── dataProcessor.js       # 數據處理工具
├── constants/               # 常數和配置
│   ├── config.js               # 應用配置
│   └── tableData.js            # 預設數據
├── App.js                   # 主要應用組件
├── index.js                 # 應用入口點
└── index.css                # 全局樣式
```

## ⚙️ 配置說明

### 開發者工具控制

在 `src/constants/config.js` 中設定：

```javascript
export const APP_CONFIG = {
  // 設為 false 可隱藏數據轉換和管理功能
  SHOW_DEV_TOOLS: true,
  // ... 其他配置
};
```

### 環境變數

創建 `.env` 檔案：

```env
# 開發模式設定
REACT_APP_SHOW_DEV_TOOLS=true

# 生產模式設定（建置時）
REACT_APP_SHOW_DEV_TOOLS=false
```

## 📊 數據格式

### CSV 輸入格式

```csv
Table名稱,市場,面向,類別,樣本,描述
台股資產負債表,台灣,基本面,財務報表,資產負債表,台股公司資產負債分析
美股損益表分析,美國,基本面,財報分析,季度財報,美股獲利能力分析
A股技術指標,中國,技術面,滬深技術,資金流向,A股技術分析工具
```

### JSON 數據結構

```javascript
{
  "markets": ["台灣", "美國", "中國", "香港"],
  "aspects": ["基本面", "技術面", "籌碼面", "消息面"],
  "classOptions": {
    "台灣": {
      "基本面": ["財務報表", "營收分析", "獲利能力"]
    }
  },
  "sampleOptions": {
    "財務報表": ["資產負債表", "損益表", "現金流量表"]
  },
  "tableList": [
    {
      "id": "table-1",
      "name": "台股資產負債表分析",
      "market": "台灣",
      "aspect": "基本面",
      "class": "財務報表",
      "sample": "資產負債表",
      "createdAt": "2024-01-15",
      "updatedAt": "2024-01-15"
    }
  ],
  "metadata": {
    "totalTables": 1,
    "lastUpdated": "2024-01-15",
    "dataVersion": "1.0",
    "source": "csv_import"
  }
}
```

## 🎯 使用指南

### 1. 基本篩選操作

1. 點擊「表格查詢系統」開啟主功能
2. 選擇**市場類型**（台灣、美國等）
3. 選擇**分析面向**（基本面、技術面等）
4. 在**類別**下拉選單中選擇多個選項
5. 在**樣本**下拉選單中選擇多個選項
6. 使用搜尋框進行關鍵字搜尋
7. 點擊表格卡片的「預覽」查看詳細資訊

### 2. 數據轉換操作

1. 點擊「數據轉換」進入轉換頁面
2. 點擊「載入示範數據」或貼上您的CSV數據
3. 確認CSV格式符合要求
4. 點擊「轉換數據」執行轉換
5. 查看轉換統計和結果預覽
6. 選擇「下載JSON」或「應用到系統」

### 3. 數據管理操作

1. 點擊「數據管理」進入管理頁面
2. 查看當前數據狀態和分布
3. 使用「備份數據」建立備份點
4. 拖拽JSON文件或點擊上傳新數據
5. 在備份歷史中恢復之前的版本
6. 使用「導出數據」下載當前數據

## 🔧 開發指南

### 添加新的篩選選項

1. 編輯 `src/constants/tableData.js`
2. 在相應的 `classOptions` 或 `sampleOptions` 中添加新選項
3. 更新 `tableList` 中的相關表格數據

### 自訂主題和樣式

1. 編輯 `tailwind.config.js` 修改色彩主題
2. 在 `src/index.css` 中添加自訂樣式
3. 修改 `src/constants/config.js` 中的UI配置

### 擴展功能

1. 在 `src/components/` 中創建新組件
2. 在 `src/hooks/` 中添加自訂Hook
3. 在 `src/utils/` 中添加工具函數
4. 更新 `src/App.js` 整合新功能

## 📱 瀏覽器支援

| 瀏覽器 | 版本 |
|--------|------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 🔒 安全性

- 所有文件上傳都在客戶端處理，無伺服器風險
- CSV和JSON解析都包含格式驗證
- 沒有外部API依賴，減少安全風險
- 支援CSP (Content Security Policy)

## 🎨 設計系統

### 色彩規範

- **主色調**：Purple (#9333ea) - 專業可信賴
- **功能色**：
  - 成功：Green (#22c55e)
  - 警告：Yellow (#f59e0b) 
  - 錯誤：Red (#ef4444)
  - 資訊：Blue (#3b82f6)

### 響應式斷點

- **手機**：< 768px
- **平板**：768px - 1023px  
- **桌機**：≥ 1024px

## 📈 效能優化

- 使用React.memo減少不必要的重新渲染
- 虛擬滾動處理大量數據列表
- 圖片懶載入和代碼分割
- 生產版本包含壓縮和優化

## 🧪 測試

```bash
# 執行單元測試
npm test

# 執行測試覆蓋率
npm test -- --coverage

# 執行E2E測試
npm run test:e2e
```

## 📦 部署

### Vercel 部署

1. 連接GitHub repository到Vercel
2. 設定環境變數：`REACT_APP_SHOW_DEV_TOOLS=false`
3. 自動部署完成

### Netlify 部署

1. 拖拽 `build` 資料夾到Netlify
2. 或連接Git repository自動部署
3. 設定重定向規則支援SPA

### 傳統主機部署

```bash
npm run build:production
# 將 build 資料夾內容上傳到網頁伺服器
```

## 🤝 貢獻指南

1. Fork 專案到您的GitHub
2. 創建功能分支：`git checkout -b feature/new-feature`
3. 提交變更：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 開啟Pull Request

### 開發規範

- 使用ESLint和Prettier保持代碼風格一致
- 組件命名使用PascalCase
- 函數命名使用camelCase
- 常數命名使用UPPER_SNAKE_CASE
- 提交訊息遵循Conventional Commits規範

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🆘 支援

- **問題回報**：[GitHub Issues](https://github.com/yourusername/investment-table-system/issues)
- **功能建議**：[GitHub Discussions](https://github.com/yourusername/investment-table-system/discussions)
- **技術支援**：your.email@example.com

## 📋 更新日誌

### v1.0.0 (2024-01-15)

- ✨ 初始版本發布
- 🔍 4層級篩選系統
- 📊 數據轉換工具
- 🗄️ 數據管理功能
- 📱 響應式設計
- 🎨 完整UI/UX設計

---

**Made with ❤️ for Investment Data Analysis**