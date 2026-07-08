# Finance Request System (FRS)

Aplikasi Finance Request System menggunakan Google Apps Script dan Google Spreadsheet untuk mengelola approval dan pembayaran request.

## 📋 Fitur Utama

1. **Login** - Autentikasi berbasis email
2. **Dashboard** - Ringkasan request dan status
3. **Payment Order** - Kelola PO dengan tanda tangan digital
4. **Payment Request** - Buat dan proses payment request
5. **User Settings** - Manajemen user dan role
6. **App Settings** - Konfigurasi sistem

## 🏗️ Struktur Folder

```
├── apps-script/              # Backend Google Apps Script
│   ├── auth.gs              # Login & Session Management
│   ├── dashboard.gs         # Dashboard Logic
│   ├── paymentOrder.gs      # Payment Order Processing
│   ├── paymentRequest.gs    # Payment Request Processing
│   ├── userSettings.gs      # User Management
│   ├── appSettings.gs       # System Settings
│   ├── signature.gs         # Digital Signature Handling
│   ├── notifications.gs     # Email Notifications
│   ├── utils.gs             # Helper Functions
│   ├── dataValidator.gs     # Data Validation
│   └── trigger.gs           # Scheduled Triggers
│
├── frontend/                 # HTML/CSS/JavaScript UI
│   ├── index.html           # Main UI Shell
│   ├── styles.css           # Global Styling
│   ├── login.html           # Login Page
│   ├── dashboard.html       # Dashboard View
│   ├── paymentOrder.html    # Payment Order Form
│   ├── paymentRequest.html  # Payment Request Form
│   ├── userSettings.html    # User Management
│   ├── appSettings.html     # App Settings
│   └── scripts.js           # Client-side Logic
│
├── sheets-setup/            # Google Sheets Setup Script
│   └── setupSheets.gs       # Sheet initialization & formulas
│
└── docs/                     # Documentation
    ├── SETUP.md            # Setup Instructions
    ├── API.md              # API Documentation
    └── DATABASE.md         # Database Schema
```

## 📊 Spreadsheet Structure

### Sheets yang Diperlukan:
1. **Request Header** - Informasi utama request
2. **Request Detail** - Detail item/transaksi
3. **User Access** - Manajemen user
4. **Bank Accounts** - Daftar rekening bank
5. **Payments Category** - Kategori pembayaran
6. **Payments Log** - Log semua transaksi
7. **Settings** - Konfigurasi sistem
8. **Logs** - Audit trail

## 🚀 Quick Start

1. **Setup Google Sheet**
   - Buka Google Sheet baru
   - Copy script dari `sheets-setup/setupSheets.gs`
   - Run function `setupFinanceRequestSystem()`

2. **Setup Apps Script**
   - Buka Apps Script dari Google Sheet (Extensions → Apps Script)
   - Copy semua file dari `apps-script/` folder
   - Deploy sebagai Web App

3. **Konfigurasi User & Settings**
   - Akses menu "App Settings"
   - Atur user access
   - Atur bank accounts & kategori

## 🔐 Authentication Flow

```
Login → Session Validation → Role Check → Menu Access
```

## 📝 Approval Flow

```
Maker (Create) → Manager (Review) → Director (Approve) → Finance (Process)
```

## 🛠️ Setup Instructions

Lihat [SETUP.md](./docs/SETUP.md) untuk panduan detail.

## 📌 Notes

- Menggunakan Google Drive API untuk upload signature
- Email notifications otomatis ke approver
- Audit trail lengkap untuk semua transaksi
- Role-based access control

---

**Version**: 1.0.0  
**Last Updated**: 8 Juli 2026
