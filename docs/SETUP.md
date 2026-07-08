# 🚀 Setup Guide - Finance Request System

## Prasyarat

1. **Google Account** - Dengan akses ke Google Drive dan Google Sheets
2. **Google Apps Script** - Sudah integrated dengan Google Sheets
3. **Spreadsheet Baru** - Untuk menyimpan data sistem

## Langkah-langkah Setup

### 1️⃣ Persiapan Google Sheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "Finance Request System"
3. Share spreadsheet dengan tim (sesuai kebutuhan)

### 2️⃣ Setup Google Apps Script

1. Buka spreadsheet yang sudah dibuat
2. Klik **Extensions** → **Apps Script**
3. Copy semua file `.gs` dari folder `apps-script/` ke editor Apps Script
   - Buat file baru untuk setiap module
   - Copy paste content masing-masing file

#### Urutan memasukkan file (penting untuk dependencies):

```
1. utils.gs              (base utilities)
2. dataValidator.gs      (validation functions)
3. auth.gs              (authentication)
4. dashboard.gs         (dashboard)
5. signature.gs         (signature handling)
6. notifications.gs     (email notifications)
7. paymentOrder.gs      (PO module)
8. paymentRequest.gs    (PR module)
9. userSettings.gs      (user management)
10. appSettings.gs       (app configuration)
11. trigger.gs           (scheduled triggers)
```

### 3️⃣ Initialize Spreadsheet Structure

1. Buka **Google Apps Script Editor**
2. Cari function `setupFinanceRequestSystem` di file `sheets-setup/setupSheets.gs`
3. Copy file `sheets-setup/setupSheets.gs` ke editor Apps Script
4. Run function `setupFinanceRequestSystem()` dengan klik ▶️ button
5. Tunggu hingga selesai (check Logs untuk status)

### 4️⃣ Verifikasi Setup

1. Run function `testSetup()` untuk verifikasi semua sheets sudah dibuat
2. Check di Logs untuk hasil:
   ```
   ✓ Request Header: 1 rows
   ✓ Request Detail: 1 rows
   ✓ User Access: 2 rows
   ...
   ```

### 5️⃣ Konfigurasi Awal

#### Setup Admin User

Default admin:
- **Email**: admin@company.com
- **Password**: admin123
- **Role**: Admin

**Langsung rubah password ini setelah login pertama kali!**

#### Tambah Bank Accounts

1. Buka Sheet "Bank Accounts"
2. Tambah data bank:
   - Bank Name: BCA / Mandiri / etc
   - Account Number: 1234567890
   - Account Name: PT Company Account
   - Currency: IDR
   - Balance: Saldo awal
   - Status: true
   - Active: true

#### Setup Payment Categories

1. Buka Sheet "Payments Category"
2. Tambah kategori dan budget limit:
   - Office Supplies: Rp 10.000.000
   - Travel: Rp 50.000.000
   - Equipment: Rp 100.000.000
   - dll

#### Tambah Users

1. Buka Sheet "User Access"
2. Tambah user dengan format:
   - Email: user@company.com
   - Name: Nama Lengkap
   - Department: IT / Finance / etc
   - Role: Admin / Finance / Director / Manager / Maker
   - Status: Active
   - ID Karyawan: EMP001
   - Password: (akan di-hash otomatis saat login)

### 6️⃣ Deploy Web App (Opsional)

Untuk akses via URL (bukan embed di Sheet):

1. Buka **Google Apps Script Editor**
2. Klik **Deploy** → **New Deployment**
3. Type: **Web app**
4. Execute as: Pilih akun Anda
5. Who has access: "Anyone within [Organization]" atau sesuai kebutuhan
6. Klik **Deploy**
7. Copy URL yang diberikan

### 7️⃣ Setup Scheduled Triggers (Opsional)

1. Run function `setupAllTriggers()` untuk membuat scheduled tasks:
   - Daily summary emails (08:00)
   - Weekly budget alerts (Monday 09:00)

2. Atau manual setup di Apps Script:
   - Klik **Triggers** (jam icon di sidebar)
   - Tambah trigger sesuai kebutuhan

## 🔧 Troubleshooting

### Error: "Sheet not found"

**Solusi**: Run `setupFinanceRequestSystem()` lagi untuk membuat sheets yang missing.

### Error: "Permission denied"

**Solusi**: 
- Pastikan spreadsheet sudah di-share dengan semua user
- Check user role di sheet "User Access"

### Email tidak terkirim

**Solusi**:
- Check email address di User Access sheet valid
- Enable "Less secure app access" di Google Account (jika applicable)
- Check Logs untuk error messages

### Form tidak muncul

**Solusi**:
- Refresh browser (Ctrl+F5)
- Cek browser console untuk errors (F12)
- Pastikan semua .gs files sudah di-copy ke Apps Script

## 📝 Testing Setup

### Test Login

1. Buka Apps Script Logs (View → Logs)
2. Run test functions:
   ```
   testSetup()        - Check sheets structure
   listAllTriggers()  - Check triggers
   systemHealthCheck()- Check system status
   ```

### Test Email Notifications

1. Create request baru
2. Submit untuk approval
3. Check approver's email inbox

## 🔐 Security Checklist

- [ ] Ubah admin password default
- [ ] Setup email notifications dengan domain company
- [ ] Restrict spreadsheet access ke authorized users only
- [ ] Enable 2FA untuk akun Google
- [ ] Regular backup spreadsheet data
- [ ] Monitor Logs sheet untuk unauthorized access

## 📞 Support

Jika ada masalah:

1. Check Logs sheet untuk error messages
2. Review console logs di Apps Script (View → Logs)
3. Verify user permissions dan roles
4. Check email addresses format (harus valid)

---

**Selamat! System sudah siap digunakan!** 🎉