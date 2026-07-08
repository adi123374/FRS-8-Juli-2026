/**
 * App Settings Module for Finance Request System
 */

/**
 * Get system settings
 */
function getSystemSettings() {
  try {
    const sheet = getSheet("Settings");
    const data = sheet.getDataRange().getValues();
    const settings = {};

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        settings[data[i][0]] = data[i][1];
      }
    }

    return {
      success: true,
      data: settings
    };

  } catch (error) {
    Logger.log("Get settings error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update system settings
 */
function updateSystemSettings(key, value, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah settings"
      };
    }

    const sheet = getSheet("Settings");
    const data = sheet.getDataRange().getValues();
    let found = false;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([key, value]);
    }

    addLog("UPDATE_SETTINGS", { key: key, value: value }, adminEmail);

    return {
      success: true,
      message: "Settings berhasil diubah"
    };

  } catch (error) {
    Logger.log("Update settings error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Add bank account
 */
function addBankAccount(bankData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menambah bank account"
      };
    }

    // Validate bank data
    const validation = validateBankAccount({
      bankName: bankData.bankName,
      accountNumber: bankData.accountNumber,
      accountName: bankData.accountName,
      currency: bankData.currency,
      balance: bankData.balance
    });

    if (!validation.valid) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validation.errors
      };
    }

    const sheet = getSheet("Bank Accounts");

    sheet.appendRow([
      bankData.bankName,                     // Bank Name
      bankData.accountNumber,                // Account Number
      bankData.accountName,                  // Account Name
      bankData.status || true,               // Status
      bankData.currency,                     // Currency
      bankData.balance,                      // Balance
      bankData.active || true                // Active
    ]);

    addLog("ADD_BANK_ACCOUNT", { bankName: bankData.bankName }, adminEmail);

    return {
      success: true,
      message: "Bank account berhasil ditambahkan"
    };

  } catch (error) {
    Logger.log("Add bank account error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update bank account
 */
function updateBankAccount(accountNumber, updateData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah bank account"
      };
    }

    const sheet = getSheet("Bank Accounts");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === accountNumber) {
        if (updateData.balance !== undefined) {
          sheet.getRange(i + 1, 6).setValue(updateData.balance);
        }
        if (updateData.status !== undefined) {
          sheet.getRange(i + 1, 4).setValue(updateData.status);
        }
        if (updateData.active !== undefined) {
          sheet.getRange(i + 1, 7).setValue(updateData.active);
        }

        addLog("UPDATE_BANK_ACCOUNT", { accountNumber: accountNumber }, adminEmail);

        return {
          success: true,
          message: "Bank account berhasil diubah"
        };
      }
    }

    return {
      success: false,
      message: "Bank account tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Update bank account error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Add payment category
 */
function addPaymentCategory(categoryData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menambah kategori"
      };
    }

    // Validate category data
    const validation = validatePaymentCategory({
      categoryName: categoryData.categoryName,
      budgetLimit: categoryData.budgetLimit
    });

    if (!validation.valid) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validation.errors
      };
    }

    const sheet = getSheet("Payments Category");

    sheet.appendRow([
      categoryData.categoryName,             // Category Name
      categoryData.budgetLimit,              // Budget Limit
      categoryData.active || true            // Active
    ]);

    addLog("ADD_PAYMENT_CATEGORY", { categoryName: categoryData.categoryName }, adminEmail);

    return {
      success: true,
      message: "Kategori pembayaran berhasil ditambahkan"
    };

  } catch (error) {
    Logger.log("Add category error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update payment category
 */
function updatePaymentCategory(categoryName, updateData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah kategori"
      };
    }

    const sheet = getSheet("Payments Category");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === categoryName) {
        if (updateData.budgetLimit !== undefined) {
          sheet.getRange(i + 1, 2).setValue(updateData.budgetLimit);
        }
        if (updateData.active !== undefined) {
          sheet.getRange(i + 1, 3).setValue(updateData.active);
        }

        addLog("UPDATE_PAYMENT_CATEGORY", { categoryName: categoryName }, adminEmail);

        return {
          success: true,
          message: "Kategori pembayaran berhasil diubah"
        };
      }
    }

    return {
      success: false,
      message: "Kategori tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Update category error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get all payment categories
 */
function listPaymentCategories() {
  try {
    const categories = getPaymentCategories();

    return {
      success: true,
      data: categories
    };

  } catch (error) {
    Logger.log("List categories error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get all bank accounts
 */
function listBankAccounts() {
  try {
    const accounts = getBankAccounts();

    return {
      success: true,
      data: accounts
    };

  } catch (error) {
    Logger.log("List bank accounts error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}
