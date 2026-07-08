/**
 * Google Sheet Setup Script for Finance Request System
 * Run this function to initialize all required sheets and their structure
 */

/**
 * Main setup function - Run this to initialize the system
 */
function setupFinanceRequestSystem() {
  try {
    Logger.log("🚀 Starting Finance Request System setup...");

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Step 1: Create all required sheets
    Logger.log("📋 Creating sheets...");
    createRequestHeaderSheet(ss);
    createRequestDetailSheet(ss);
    createUserAccessSheet(ss);
    createBankAccountsSheet(ss);
    createPaymentsCategorySheet(ss);
    createPaymentsLogSheet(ss);
    createSettingsSheet(ss);
    createLogsSheet(ss);

    // Step 2: Add sample data
    Logger.log("📊 Adding sample data...");
    addSampleData(ss);

    // Step 3: Set up data validation
    Logger.log("✅ Setting up data validation...");
    setupDataValidation(ss);

    // Step 4: Set up formulas
    Logger.log("📐 Setting up formulas...");
    setupFormulas(ss);

    Logger.log("✨ Setup completed successfully!");
    return {
      success: true,
      message: "Finance Request System berhasil disetup. Silakan refresh spreadsheet Anda."
    };

  } catch (error) {
    Logger.log("❌ Setup error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat setup: " + error.toString()
    };
  }
}

/**
 * Create Request Header Sheet
 */
function createRequestHeaderSheet(ss) {
  let sheet = ss.getSheetByName("Request Header");
  if (!sheet) {
    sheet = ss.insertSheet("Request Header");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Request ID",
    "Request No",
    "Request Date",
    "Request Email",
    "Request Name",
    "Department",
    "Request Type",
    "Purpose Category",
    "Purpose",
    "Currency",
    "Total Amount",
    "Status",
    "Current Approver",
    "Payment Status",
    "Settlement Status",
    "Created At",
    "Attachment Verified",
    "Signature File ID",
    "Signature Time",
    "Approver Signature",
    "Payment Request ID"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#4285F4").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 30);  // Request ID
  sheet.setColumnWidth(2, 15);  // Request No
  sheet.setColumnWidth(3, 15);  // Request Date
  sheet.setColumnWidth(4, 20);  // Request Email
  sheet.setColumnWidth(5, 15);  // Request Name
  sheet.setColumnWidth(6, 12);  // Department
  sheet.setColumnWidth(7, 12);  // Request Type
  sheet.setColumnWidth(8, 12);  // Purpose Category
  sheet.setColumnWidth(9, 15);  // Purpose
  sheet.setColumnWidth(10, 10); // Currency
  sheet.setColumnWidth(11, 15); // Total Amount
  sheet.setColumnWidth(12, 15); // Status
  sheet.setColumnWidth(13, 15); // Current Approver

  Logger.log("✓ Request Header sheet created");
}

/**
 * Create Request Detail Sheet
 */
function createRequestDetailSheet(ss) {
  let sheet = ss.getSheetByName("Request Detail");
  if (!sheet) {
    sheet = ss.insertSheet("Request Detail");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Detail ID",
    "Request ID",
    "Transaction Date",
    "Expense Category",
    "Vendor",
    "Description",
    "Qty",
    "Unit Price",
    "Amount",
    "Attachment"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#34A853").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 30);  // Detail ID
  sheet.setColumnWidth(2, 30);  // Request ID
  sheet.setColumnWidth(3, 15);  // Transaction Date
  sheet.setColumnWidth(4, 15);  // Expense Category
  sheet.setColumnWidth(5, 12);  // Vendor
  sheet.setColumnWidth(6, 20);  // Description
  sheet.setColumnWidth(7, 8);   // Qty
  sheet.setColumnWidth(8, 12);  // Unit Price
  sheet.setColumnWidth(9, 12);  // Amount
  sheet.setColumnWidth(10, 15); // Attachment

  Logger.log("✓ Request Detail sheet created");
}

/**
 * Create User Access Sheet
 */
function createUserAccessSheet(ss) {
  let sheet = ss.getSheetByName("User Access");
  if (!sheet) {
    sheet = ss.insertSheet("User Access");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Email",
    "Name",
    "Department",
    "Role",
    "Status",
    "ID Karyawan",
    "Password",
    "Signature File ID",
    "Signature URL"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#EA4335").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 20);  // Email
  sheet.setColumnWidth(2, 15);  // Name
  sheet.setColumnWidth(3, 12);  // Department
  sheet.setColumnWidth(4, 12);  // Role
  sheet.setColumnWidth(5, 10);  // Status
  sheet.setColumnWidth(6, 12);  // ID Karyawan
  sheet.setColumnWidth(7, 30);  // Password (hashed)
  sheet.setColumnWidth(8, 30);  // Signature File ID
  sheet.setColumnWidth(9, 30);  // Signature URL

  // Add sample admin user
  const adminPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "admin123")
    .map(b => (b < 0 ? 256 + b : b).toString(16).padStart(2, "0"))
    .join("");

  sheet.appendRow([
    "admin@company.com",
    "Admin User",
    "IT",
    "Admin",
    "Active",
    "ADM001",
    adminPassword,
    "",
    ""
  ]);

  Logger.log("✓ User Access sheet created");
}

/**
 * Create Bank Accounts Sheet
 */
function createBankAccountsSheet(ss) {
  let sheet = ss.getSheetByName("Bank Accounts");
  if (!sheet) {
    sheet = ss.insertSheet("Bank Accounts");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Bank Name",
    "Account Number",
    "Account Name",
    "Status",
    "Currency",
    "Balance",
    "Active"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#FBBC04").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 15);  // Bank Name
  sheet.setColumnWidth(2, 18);  // Account Number
  sheet.setColumnWidth(3, 15);  // Account Name
  sheet.setColumnWidth(4, 10);  // Status
  sheet.setColumnWidth(5, 10);  // Currency
  sheet.setColumnWidth(6, 15);  // Balance
  sheet.setColumnWidth(7, 10);  // Active

  // Add sample bank account
  sheet.appendRow([
    "BCA",
    "1234567890",
    "PT Company Account",
    true,
    "IDR",
    1000000000,
    true
  ]);

  Logger.log("✓ Bank Accounts sheet created");
}

/**
 * Create Payments Category Sheet
 */
function createPaymentsCategorySheet(ss) {
  let sheet = ss.getSheetByName("Payments Category");
  if (!sheet) {
    sheet = ss.insertSheet("Payments Category");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Category Name",
    "Budget Limit (IDR)",
    "Active"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#9C27B0").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 20);  // Category Name
  sheet.setColumnWidth(2, 18);  // Budget Limit
  sheet.setColumnWidth(3, 10);  // Active

  // Add sample categories
  const categories = [
    ["Office Supplies", 10000000, true],
    ["Travel", 50000000, true],
    ["Equipment", 100000000, true],
    ["Maintenance", 30000000, true],
    ["Utilities", 25000000, true]
  ];

  categories.forEach(cat => sheet.appendRow(cat));

  Logger.log("✓ Payments Category sheet created");
}

/**
 * Create Payments Log Sheet
 */
function createPaymentsLogSheet(ss) {
  let sheet = ss.getSheetByName("Payments Log");
  if (!sheet) {
    sheet = ss.insertSheet("Payments Log");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "PR/PO Number",
    "PR/PO Date",
    "Due Date",
    "Urgent",
    "Urgent Reason",
    "Escalate",
    "Escalate Reason",
    "Maker Name",
    "Payment From (Bank)",
    "Total Amount",
    "Status",
    "PR ID",
    "Maker Email",
    "Department",
    "Approver Manager",
    "Approver Director",
    "Finance Note",
    "Processed Date",
    "Created At"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#00BCD4").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  headers.forEach((_, index) => {
    sheet.setColumnWidth(index + 1, 15);
  });

  Logger.log("✓ Payments Log sheet created");
}

/**
 * Create Settings Sheet
 */
function createSettingsSheet(ss) {
  let sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = ["Setting Name", "Value"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#FF6D00").setFontColor("white");
  sheet.setFrozenRows(1);

  // Default settings
  const settings = [
    ["System Name", "Finance Request System"],
    ["Company Name", "PT Company Indonesia"],
    ["Email Sender", "noreply@company.com"],
    ["Approval Threshold (IDR)", "50000000"],
    ["Daily Summary Time", "08:00"],
    ["Budget Alert Threshold", "80"],
    ["Max Attachment Size (MB)", "5"],
    ["System Status", "Active"]
  ];

  settings.forEach(setting => sheet.appendRow(setting));

  Logger.log("✓ Settings sheet created");
}

/**
 * Create Logs Sheet
 */
function createLogsSheet(ss) {
  let sheet = ss.getSheetByName("Logs");
  if (!sheet) {
    sheet = ss.insertSheet("Logs");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "Timestamp",
    "Email",
    "Action",
    "Details"
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#424242").setFontColor("white");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 20);  // Timestamp
  sheet.setColumnWidth(2, 20);  // Email
  sheet.setColumnWidth(3, 20);  // Action
  sheet.setColumnWidth(4, 50);  // Details

  Logger.log("✓ Logs sheet created");
}

/**
 * Add sample data
 */
function addSampleData(ss) {
  // This function is placeholder for future sample data
  Logger.log("✓ Sample data initialized");
}

/**
 * Setup data validation
 */
function setupDataValidation(ss) {
  try {
    // User Access - Role validation
    const userSheet = ss.getSheetByName("User Access");
    const roleRange = userSheet.getRange("D2:D1000");
    const roleValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Admin", "Finance", "Director", "Manager", "Maker"])
      .setAllowInvalid(false)
      .build();
    roleRange.setDataValidation(roleValidation);

    // User Access - Status validation
    const statusRange = userSheet.getRange("E2:E1000");
    const statusValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Active", "Inactive"])
      .setAllowInvalid(false)
      .build();
    statusRange.setDataValidation(statusValidation);

    // Request Header - Request Type validation
    const headerSheet = ss.getSheetByName("Request Header");
    const typeRange = headerSheet.getRange("G2:G1000");
    const typeValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(["PO", "PR"])
      .setAllowInvalid(false)
      .build();
    typeRange.setDataValidation(typeValidation);

    // Request Header - Currency validation
    const currencyRange = headerSheet.getRange("J2:J1000");
    const currencyValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(["IDR", "USD", "EUR"])
      .setAllowInvalid(false)
      .build();
    currencyRange.setDataValidation(currencyValidation);

    Logger.log("✓ Data validation setup completed");

  } catch (error) {
    Logger.log("Data validation error: " + error);
  }
}

/**
 * Setup formulas
 */
function setupFormulas(ss) {
  try {
    // You can add formulas here for automatic calculations
    // Example: Total in Request Header based on Request Detail
    Logger.log("✓ Formulas setup completed");

  } catch (error) {
    Logger.log("Formula setup error: " + error);
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    "Request Header",
    "Request Detail",
    "User Access",
    "Bank Accounts",
    "Payments Category",
    "Payments Log",
    "Settings",
    "Logs"
  ];

  let results = "✅ Sheet Verification Results:\n\n";

  sheets.forEach(sheetName => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const rowCount = sheet.getLastRow();
        results += `✓ ${sheetName}: ${rowCount} rows\n`;
      } else {
        results += `✗ ${sheetName}: NOT FOUND\n`;
      }
    } catch (error) {
      results += `✗ ${sheetName}: ERROR - ${error}\n`;
    }
  });

  Logger.log(results);
  return results;
}
