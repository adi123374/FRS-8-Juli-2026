# 📚 API Documentation - Finance Request System

## Overview

Finance Request System menyediakan API berbasis Google Apps Script untuk semua operasi sistem. Semua function dapat dipanggil dari frontend atau diintegrasikan dengan system lain.

## Authentication

### Login

```javascript
function authenticateUser(email, password)
```

**Parameters:**
- `email` (String): Email pengguna
- `password` (String): Password pengguna

**Returns:**
```javascript
{
  success: Boolean,
  message: String,
  session: {
    email: String,
    role: String,
    name: String,
    loginTime: Date,
    sessionId: String
  },
  user: {
    email: String,
    name: String,
    department: String,
    role: String,
    status: String
  }
}
```

**Example:**
```javascript
const result = authenticateUser("user@company.com", "password123");
if (result.success) {
  console.log("Login berhasil:", result.user.name);
}
```

---

## Payment Order API

### Create Payment Order

```javascript
function createPaymentOrder(orderData)
```

**Parameters:**
```javascript
{
  requestNo: String,           // PO-001
  requestDate: Date,           // 2026-07-08
  requestEmail: String,        // maker@company.com
  requestName: String,         // John Doe
  department: String,          // IT
  currency: String,            // IDR
  totalAmount: Number,         // 5000000
  purposeCategory: String,     // Optional
  purpose: String              // Optional
}
```

**Returns:**
```javascript
{
  success: Boolean,
  message: String,
  requestId: String            // UUID of created PO
}
```

### Add Payment Order Detail

```javascript
function addPaymentOrderDetail(requestId, detailData)
```

**Parameters:**
```javascript
{
  requestId: String,           // From createPaymentOrder
  detailData: {
    transactionDate: Date,
    expenseCategory: String,
    vendor: String,
    description: String,
    qty: Number,
    unitPrice: Number,
    amount: Number,
    attachment: String         // Optional
  }
}
```

**Returns:**
```javascript
{
  success: Boolean,
  message: String,
  detailId: String             // UUID of detail
}
```

### Submit Payment Order

```javascript
function submitPaymentOrder(requestId, email)
```

**Parameters:**
- `requestId` (String): ID dari PO
- `email` (String): Email pembuat PO

**Returns:**
```javascript
{
  success: Boolean,
  message: String,
  nextApprover: String         // Email approver berikutnya
}
```

### Approve Payment Order

```javascript
function approvePaymentOrder(requestId, email, signatureFileId)
```

**Parameters:**
- `requestId` (String): ID dari PO
- `email` (String): Email approver (Manager/Director/Finance)
- `signatureFileId` (String): ID file signature di Google Drive

**Returns:**
```javascript
{
  success: Boolean,
  message: String
}
```

### Reject Payment Order

```javascript
function rejectPaymentOrder(requestId, email, reason)
```

**Parameters:**
- `requestId` (String): ID dari PO
- `email` (String): Email approver
- `reason` (String): Alasan rejection

**Returns:**
```javascript
{
  success: Boolean,
  message: String
}
```

### Get Payment Orders

```javascript
function getPaymentOrders(email, status)
```

**Parameters:**
- `email` (String): Email user
- `status` (String, Optional): Filter by status (Draft, Submitted, etc)

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      requestId: String,
      requestNo: String,
      requestDate: String,
      requestName: String,
      department: String,
      totalAmount: Number,
      status: String,
      createdAt: String
    }
  ]
}
```

---

## Payment Request API

Sama seperti Payment Order API tetapi untuk PR (Payment Request):

- `createPaymentRequest(requestData)`
- `addPaymentRequestDetail(requestId, detailData)`
- `submitPaymentRequest(requestId, email)`
- `approvePaymentRequest(requestId, email, signatureFileId, notes)`
- `rejectPaymentRequest(requestId, email, reason)`
- `processPaymentRequest(requestId, email, bankAccountId, paymentDate)`
- `getPaymentRequests(email, status)`

---

## Dashboard API

### Get Dashboard Summary

```javascript
function getDashboardSummary(email)
```

**Parameters:**
- `email` (String): Email user

**Returns:**
```javascript
{
  success: Boolean,
  data: {
    totalRequests: Number,
    draftRequests: Number,
    pendingApproval: Number,
    approvedRequests: Number,
    rejectedRequests: Number,
    paidRequests: Number,
    totalAmount: Number
  },
  user: {
    name: String,
    role: String,
    department: String
  }
}
```

### Get Recent Requests

```javascript
function getRecentRequests(email, limit)
```

**Parameters:**
- `email` (String): Email user
- `limit` (Number, Optional): Default 10

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      requestId: String,
      requestNo: String,
      requestDate: String,
      totalAmount: Number,
      status: String,
      createdAt: String
    }
  ]
}
```

### Get Pending Approvals

```javascript
function getPendingApprovals(email)
```

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      requestId: String,
      requestNo: String,
      totalAmount: Number,
      department: String,
      createdAt: String
    }
  ],
  count: Number
}
```

### Get Request Details

```javascript
function getRequestDetails(requestId)
```

**Returns:**
```javascript
{
  success: Boolean,
  header: {
    requestId: String,
    requestNo: String,
    totalAmount: Number,
    status: String,
    // ... semua field dari Request Header
  },
  details: [
    {
      detailId: String,
      expenseCategory: String,
      vendor: String,
      qty: Number,
      unitPrice: Number,
      amount: Number
    }
  ],
  payment: {
    paymentNumber: String,
    status: String,
    processedDate: String
  }
}
```

---

## User Management API

### Add User

```javascript
function addUser(userData, adminEmail)
```

**Parameters:**
```javascript
{
  email: String,
  name: String,
  department: String,
  role: String,              // Admin, Finance, Director, Manager, Maker
  status: String,            // Active, Inactive
  idKaryawan: String
}
```

**Returns:**
```javascript
{
  success: Boolean,
  message: String
}
```

### Update User

```javascript
function updateUser(email, updateData, adminEmail)
```

**Parameters:**
```javascript
{
  email: String,
  updateData: {
    name: String,           // Optional
    department: String,     // Optional
    role: String,          // Optional
    status: String         // Optional
  }
}
```

### Get All Users

```javascript
function listAllUsers(adminEmail)
```

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      email: String,
      name: String,
      department: String,
      role: String,
      status: String
    }
  ]
}
```

### Get Users by Role

```javascript
function getUsersByRole(role)
```

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      email: String,
      name: String,
      role: String
    }
  ]
}
```

---

## Digital Signature API

### Upload Signature

```javascript
function uploadSignature(fileName, fileBlob, email)
```

**Parameters:**
- `fileName` (String): Nama file
- `fileBlob` (Blob): File data (dari form upload)
- `email` (String): Email user

**Returns:**
```javascript
{
  success: Boolean,
  message: String,
  fileId: String,           // Google Drive file ID
  fileUrl: String           // Direct link ke file
}
```

### Save User Signature

```javascript
function saveUserSignature(email, signatureFileId)
```

**Returns:**
```javascript
{
  success: Boolean,
  message: String
}
```

### Verify Signature

```javascript
function verifySignature(requestId, signatureFileId)
```

**Returns:**
```javascript
{
  valid: Boolean,
  message: String,
  fileName: String,
  fileSize: Number,
  fileUrl: String
}
```

---

## Settings API

### Get System Settings

```javascript
function getSystemSettings()
```

**Returns:**
```javascript
{
  success: Boolean,
  data: {
    "System Name": "Finance Request System",
    "Company Name": "PT Company",
    "Approval Threshold (IDR)": "50000000",
    // ... semua settings
  }
}
```

### Add Bank Account

```javascript
function addBankAccount(bankData, adminEmail)
```

**Parameters:**
```javascript
{
  bankName: String,
  accountNumber: String,
  accountName: String,
  currency: String,
  balance: Number,
  status: Boolean,
  active: Boolean
}
```

### Get Bank Accounts

```javascript
function listBankAccounts()
```

**Returns:**
```javascript
{
  success: Boolean,
  data: [
    {
      bankName: String,
      accountNumber: String,
      accountName: String,
      currency: String,
      balance: Number,
      active: Boolean
    }
  ]
}
```

### Add Payment Category

```javascript
function addPaymentCategory(categoryData, adminEmail)
```

**Parameters:**
```javascript
{
  categoryName: String,
  budgetLimit: Number,
  active: Boolean
}
```

---

## Utility Functions

### Format Currency

```javascript
function formatCurrency(amount, currency)
// Returns: "Rp 5.000.000" atau "5000.00"
```

### Get Current Date/Time

```javascript
function getCurrentDate()      // "08/07/2026"
function getCurrentDateTime()  // "08/07/2026 14:30:45"
```

### Validate Email

```javascript
function validateEmail(email)  // Boolean
```

### Validate Amount

```javascript
function validateAmount(amount)  // Boolean, checks if > 0
```

---

## Triggers API

### Setup All Triggers

```javascript
function setupAllTriggers()
```

Membuat:
- Daily summary (08:00)
- Weekly budget alert (Monday 09:00)

### List All Triggers

```javascript
function listAllTriggers()
```

**Returns:**
```javascript
"📋 Active Triggers:
- sendDailySummaryTrigger
- checkBudgetAlertsTrigger"
```

### System Health Check

```javascript
function systemHealthCheck()
```

**Returns:**
```javascript
{
  success: Boolean,
  issues: [String]           // Empty array if all OK
}
```

---

## Error Handling

Semua API mengembalikan standard response object:

```javascript
{
  success: Boolean,          // true jika berhasil
  message: String,           // Pesan untuk user
  data: Any,                 // Data hasil (jika ada)
  errors: Array              // Validasi errors (jika ada)
}
```

**Contoh error handling:**

```javascript
const result = createPaymentOrder(data);
if (!result.success) {
  console.error("Error:", result.message);
  if (result.errors) {
    result.errors.forEach(e => console.error("- " + e));
  }
}
```

---

## Rate Limits

- Google Apps Script: 6 minutes quota per day
- Email sending: 100 emails per day (free account)
- Drive API: 10 million requests per day
- Sheets API: 500 requests per 100 seconds

---

## Best Practices

1. **Always check success flag** sebelum menggunakan data
2. **Validate input data** sebelum call function
3. **Handle errors gracefully** dengan try-catch
4. **Log important actions** untuk audit trail
5. **Use email for notifications** bukan hardcoded messages
6. **Implement caching** untuk frequent queries
7. **Regular backup** data penting

---

**Last Updated**: 8 Juli 2026