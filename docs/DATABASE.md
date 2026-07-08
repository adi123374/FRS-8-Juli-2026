# 📊 Database Schema - Finance Request System

## Overview

System menggunakan Google Sheets sebagai database dengan struktur sheet yang terorganisir dan saling berhubungan.

## Sheet Structure

### 1. Request Header

**Deskripsi**: Menyimpan informasi utama dari setiap request (PO atau PR)

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Request ID | String (UUID) | Primary Key | Auto-generated |
| Request No | String | Nomor request manual | Unique |
| Request Date | Date | Tanggal request dibuat | Format: dd/MM/yyyy |
| Request Email | Email | Email pembuat request | Unique, valid email |
| Request Name | String | Nama pembuat request | Full name |
| Department | String | Departemen pembuat | Lookup ke User Access |
| Request Type | String (Enum) | PO atau PR | Values: PO, PR |
| Purpose Category | String | Kategori tujuan | Opsional |
| Purpose | String | Tujuan detail | Opsional |
| Currency | String (Enum) | Mata uang | Values: IDR, USD, EUR |
| Total Amount | Number | Total nominal request | Format: Number |
| Status | String (Enum) | Status approval | See: REQUEST_STATUS |
| Current Approver | Email | Approver berikutnya | Update saat status change |
| Payment Status | String (Enum) | Status pembayaran | See: PAYMENT_STATUS |
| Settlement Status | String | Status settlement | Opsional |
| Created At | DateTime | Waktu dibuat | Auto-generated |
| Attachment Verified | Boolean | Attachment sudah verified | Default: false |
| Signature File ID | String | ID file signature di Drive | Google Drive file ID |
| Signature Time | DateTime | Waktu signature | Auto-filled saat approve |
| Approver Signature | Email | Email yang sign | Auto-filled saat approve |
| Payment Request ID | String | Link ke payment log | Foreign key |

**Relationships**:
- 1:N dengan Request Detail (via Request ID)
- 1:1 dengan Payments Log (via Payment Request ID)

---

### 2. Request Detail

**Deskripsi**: Menyimpan item/line item dari setiap request

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Detail ID | String (UUID) | Primary Key | Auto-generated |
| Request ID | String | Foreign Key | Link ke Request Header |
| Transaction Date | Date | Tanggal transaksi | Format: dd/MM/yyyy |
| Expense Category | String | Kategori expense | Lookup ke Payments Category |
| Vendor | String | Nama vendor/supplier | Free text |
| Description | String | Deskripsi detail | Free text |
| Qty | Number | Jumlah/Quantity | Integer |
| Unit Price | Number | Harga satuan | Format: Number |
| Amount | Number | Total (Qty × Unit Price) | Formula: =G*H |
| Attachment | String | Link/Reference attachment | File link atau ID |

**Relationships**:
- N:1 dengan Request Header (via Request ID)

**Validasi**:
- Qty > 0
- Unit Price > 0
- Amount = Qty × Unit Price

---

### 3. User Access

**Deskripsi**: Menyimpan data user dan access control

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Email | Email | Primary Key | Unique, valid email |
| Name | String | Nama lengkap user | Full name |
| Department | String | Departemen | Free text |
| Role | String (Enum) | Role/Posisi | See: USER_ROLES |
| Status | String (Enum) | Status user | Values: Active, Inactive |
| ID Karyawan | String | Employee ID | Unique |
| Password | String | Hashed password | SHA-256 hash |
| Signature File ID | String | Drive ID signature | Google Drive file ID |
| Signature URL | String | Direct link signature | For display |

**Roles & Permissions**:

| Role | Permissions |
|------|-------------|
| Admin | Create/Edit user, Settings, View all requests, Full control |
| Finance | Process payment, View all requests, Create PR/PO |
| Director | Approve requests (final), View all requests, Create PR/PO |
| Manager | Approve requests (routing to Director), View own dept requests |
| Maker | Create PR/PO, View own requests |

**Status**:
- Active: User bisa login dan membuat request
- Inactive: User tidak bisa login

---

### 4. Bank Accounts

**Deskripsi**: Menyimpan data rekening bank perusahaan

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Bank Name | String | Nama bank | e.g., BCA, Mandiri |
| Account Number | String | Nomor rekening | Unique |
| Account Name | String | Nama pemilik rek | Sesuai surat |
| Status | Boolean | Status active | true/false |
| Currency | String (Enum) | Mata uang | Values: IDR, USD, EUR |
| Balance | Number | Saldo terakhir | Format: Number |
| Active | Boolean | Bisa digunakan | true/false |

---

### 5. Payments Category

**Deskripsi**: Menyimpan kategori pembayaran dan budget limit

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Category Name | String | Nama kategori | Primary Key, Unique |
| Budget Limit (IDR) | Number | Limit budget per tahun | Format: Number |
| Active | Boolean | Kategori aktif | true/false |

**Penggunaan**:
- Lookup saat create request detail
- Validation untuk budget limit checking
- Alert ketika spending > 80% budget

---

### 6. Payments Log

**Deskripsi**: Audit trail untuk semua pembayaran

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| PR/PO Number | String | Reference number | Link ke Request Header |
| PR/PO Date | Date | Tanggal PR/PO | Format: dd/MM/yyyy |
| Due Date | Date | Tanggal jatuh tempo | Format: dd/MM/yyyy |
| Urgent | Boolean | Flag urgent | true/false |
| Urgent Reason | String | Alasan urgent | Opsional |
| Escalate | Boolean | Flag escalate | true/false |
| Escalate Reason | String | Alasan escalate | Opsional |
| Maker Name | String | Nama pembuat | From User Access |
| Payment From (Bank) | String | Bank yang digunakan | Lookup ke Bank Accounts |
| Total Amount | Number | Total pembayaran | Format: Number |
| Status | String (Enum) | Status pembayaran | See: PAYMENT_STATUS |
| PR ID | String | Foreign Key | Link ke Request Header |
| Maker Email | Email | Email pembuat | From User Access |
| Department | String | Departemen pembuat | From User Access |
| Approver Manager | Email | Manager approver | From approval flow |
| Approver Director | Email | Director approver | From approval flow |
| Finance Note | String | Catatan dari Finance | Opsional |
| Processed Date | Date | Tanggal diproses | Format: dd/MM/yyyy |
| Created At | DateTime | Waktu dibuat | Auto-generated |

**Status Flow**:
```
Pending → Approved → Processed → Completed
                  ↓
              Rejected
```

---

### 7. Settings

**Deskripsi**: Menyimpan konfigurasi sistem

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Setting Name | String | Key | Unique, Primary Key |
| Value | String | Value | Any value |

**Default Settings**:

```
System Name = Finance Request System
Company Name = PT Company Indonesia
Email Sender = noreply@company.com
Approval Threshold (IDR) = 50000000
Daily Summary Time = 08:00
Budget Alert Threshold = 80
Max Attachment Size (MB) = 5
System Status = Active
```

---

### 8. Logs

**Deskripsi**: Audit trail untuk semua aktivitas user

| Kolom | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| Timestamp | DateTime | Waktu aktivitas | Auto-generated |
| Email | Email | Email user | From session |
| Action | String | Tipe action | e.g., CREATE_PO, APPROVE |
| Details | JSON | Data detail | JSON format |

**Logged Actions**:
- LOGIN_SUCCESS / LOGIN_FAILED
- CREATE_PO / CREATE_PR
- SUBMIT_PO / SUBMIT_PR
- APPROVE_PO / APPROVE_PR
- REJECT_PO / REJECT_PR
- PROCESS_PAYMENT
- ADD_USER / UPDATE_USER / DEACTIVATE_USER
- ADD_BANK_ACCOUNT / UPDATE_BANK_ACCOUNT
- UPDATE_SETTINGS
- UPLOAD_SIGNATURE / UPLOAD_ATTACHMENT
- SYSTEM_HEALTH_CHECK

---

## Data Relationships

```
User Access (Email)
    ↓
    ├─→ Request Header (Request Email)
    │       ↓
    │       └─→ Request Detail (Request ID)
    │
    ├─→ Bank Accounts (Account)
    ├─→ Payments Category (Category)
    └─→ Logs (Email)

Payments Log (PR ID) ↔ Request Header (Request ID)
```

---

## Status & Enums

### REQUEST_STATUS

```javascript
"Draft"                    // Initial status
"Submitted"               // Submitted for approval
"Approved by Manager"     // Manager approved
"Approved by Director"    // Director approved (final)
"Rejected"                // Rejected by approver
"Paid"                    // Payment processed
"Cancelled"               // Cancelled by maker
```

### PAYMENT_STATUS

```javascript
"Pending"                 // Waiting for approval
"Approved"                // Approved, ready to process
"Processed"               // Being processed
"Completed"               // Payment completed
"Rejected"                // Payment rejected
```

### USER_ROLES

```javascript
"Admin"                   // System administrator
"Finance"                 // Finance officer
"Director"                // Approval level: Director
"Manager"                 // Approval level: Manager
"Maker"                   // Request creator
```

---

## Data Validation Rules

### Request Header
- Request No: Unique, not empty
- Request Email: Valid email format
- Request Date: Valid date
- Currency: Must be one of [IDR, USD, EUR]
- Total Amount: > 0
- Request Type: Must be one of [PO, PR]

### Request Detail
- Transaction Date: Valid date
- Expense Category: Must exist in Payments Category
- Vendor: Not empty
- Qty: > 0 (integer)
- Unit Price: > 0
- Amount: = Qty × Unit Price (auto-calculated)

### User Access
- Email: Unique, valid email format
- Role: Must be one of [Admin, Finance, Director, Manager, Maker]
- Status: Must be one of [Active, Inactive]
- ID Karyawan: Unique, not empty

### Bank Accounts
- Account Number: Unique, not empty
- Currency: Must be one of [IDR, USD, EUR]
- Balance: ≥ 0

---

## Backup & Archive Strategy

1. **Daily Logs**: Keep for 90 days
2. **Completed Requests**: Archive after 6 months
3. **Deleted Users**: Keep records indefinitely for audit
4. **Regular Backup**: Monthly export to Google Drive

---

## Performance Notes

- Sheet max 1,000,000 rows
- Recommend archiving old requests to separate sheet/file
- Use filters for reporting instead of complex formulas
- Regular cleanup of old logs (> 90 days)

---

**Last Updated**: 8 Juli 2026