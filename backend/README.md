# Backend Setup Guide

## 安裝步驟

### 1. 設置資料庫
執行以下命令創建資料庫和資料表：

```bash
cd backend
mysql -u CVML -p < database.sql
```

或者在 phpMyAdmin 中執行 `database.sql` 文件。

### 2. 配置資料庫連接
編輯 `backend/config.php` 文件，根據你的環境修改以下設置：

```php
define('DB_HOST', 'localhost');     // 資料庫主機
define('DB_NAME', 'health_edu_db'); // 資料庫名稱
define('DB_USER', 'CVML');          // 資料庫用戶名
define('DB_PASS', '114DWP2025');    // 資料庫密碼
```

### 3. 啟動 PHP 伺服器

#### 選項 A: 使用 PHP 內建伺服器（開發環境）
```bash
cd backend
php -S localhost:8000
& "C:\xampp\php\php.exe" -S localhost:8000 -t .
```

#### 選項 B: 使用 XAMPP/MAMP
1. 將 `backend` 資料夾放到 `htdocs` 或 `www` 目錄
2. 啟動 Apache 伺服器
3. 訪問 `http://localhost/backend/`

### 4. 測試 API

