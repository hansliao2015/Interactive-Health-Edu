# Interactive Health Edu (腎臟病衛教互動平台)

這個專案是一個互動式的健康衛教平台，專注於慢性腎臟病的知識推廣。透過遊戲化的闖關學習與測驗系統，讓腎臟保健知識變得生動有趣，提升使用者的學習動機與成效。

## Features

### 互動式學習 (Interactive Learning)
- **闖關模式**：將衛教知識分為多個關卡 (Stages)，使用者必須循序漸進解鎖內容。
- **進度追蹤**：系統自動記錄使用者的學習進度，隨時可以中斷並接續學習。

### 題庫系統 (QuizBank System)
- **題庫系統**：支援單選與多選題型，題目由後台動態管理。
- **詳細檢討**：測驗結束後提供完整成績單與每一題的作答檢討。
- **歷史紀錄**：完整保存使用者的每一次測驗分數與作答細節。

### 管理員後台 (Admin Dashboard)
- **題目管理**：管理員可新增、刪除、修改題庫內容。
- **學員追蹤**：可查看所有註冊使用者的學習進度與測驗表現。


## Quick Start

### 1. Backend Setup (後端設定)

確保你已經安裝 PHP 與 MySQL。

```bash
cd backend

# Import Database
# 預設帳號: CVML, 密碼: 114DWP2025 (可於 config.php 修改)
mysql -u CVML -p < database.sql

# Start PHP Server
# macOS / Linux
php -S localhost:8000

# Windows (XAMPP)
"C:\xampp\php\php.exe" -S localhost:8000 -t .
```

### 2. Frontend Setup (前端設定)

確保你已經安裝 Node.js。

```bash
cd frontend

# Install Dependencies
npm install

# Start Dev Server
npm run dev
```

打開瀏覽器前往 `http://localhost:5173` 即可開始使用！

## 專案結構 (Project Structure)

```
Interactive-Health-Edu/
├── backend/              # PHP 後端 API
│   ├── controllers/      # Controller (Auth, Progress, Quiz...)
│   ├── api.php           # API 單一入口 (Router)
│   ├── config.php        # 資料庫連線設定
│   └── database.sql      # 資料庫結構與預設資料
│
└── frontend/             # React 前端應用
    ├── src/
    │   ├── components/   # UI 元件
    │   ├── pages/        # 頁面 (Home, Stages, Admin...)
    │   ├── lib/          # API 呼叫與工具函式
    │   └── types/        # TypeScript 型別定義
    └── index.html
```
