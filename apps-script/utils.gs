/**
 * Utility Functions for Finance Request System
 */

/**
 * Get the active spreadsheet and sheets
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  return getSpreadsheet().getSheetByName(sheetName);
}

/**
 * Session Management
 */
function createSession(email, role, name) {
  const session = {
    email: email,
    role: role,
    name: name,
    loginTime: new Date(),
    sessionId: generateId()
  };
  return session;
}

function generateId() {
  return Utilities.getUuid();
}

/**
 * Date & Time Utilities
 */
function formatDate(date) {
  return Utilities.formatDate(date, "GMT+7", "dd/MM/yyyy");
}

function formatDateTime(date) {
  return Utilities.formatDate(date, "GMT+7", "dd/MM/yyyy HH:mm:ss");
}

function getCurrentDate() {
  return formatDate(new Date());
}

function getCurrentDateTime() {
  return formatDateTime(new Date());
}

/**
 * Data Retrieval Functions
 */
function getUserFromEmail(email) {
  const sheet = getSheet("User Access");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return {
        email: data[i][0],
        name: data[i][1],
        department: data[i][2],
        role: data[i][3],
        status: data[i][4],
        idKaryawan: data[i][5],
        signatureFileId: data[i][7],
        signatureUrl: data[i][8]
      };
    }
  }
  return null;
}

function getAllUsers() {
  const sheet = getSheet("User Access");
  const data = sheet.getDataRange().getValues();
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      users.push({
        email: data[i][0],
        name: data[i][1],
        department: data[i][2],
        role: data[i][3],
        status: data[i][4]
      });
    }
  }
  return users;
}

/**
 * Payment Categories
 */
function getPaymentCategories() {
  const sheet = getSheet("Payments Category");
  const data = sheet.getDataRange().getValues();
  const categories = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][2] === true) {
      categories.push({
        name: data[i][0],
        budgetLimit: data[i][1],
        active: data[i][2]
      });
    }
  }
  return categories;
}

/**
 * Bank Accounts
 */
function getBankAccounts() {
  const sheet = getSheet("Bank Accounts");
  const data = sheet.getDataRange().getValues();
  const accounts = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][3] === true) {
      accounts.push({
        bankName: data[i][0],
        accountNumber: data[i][1],
        accountName: data[i][2],
        status: data[i][3],
        currency: data[i][4],
        balance: data[i][5],
        active: data[i][6]
      });
    }
  }
  return accounts;
}

/**
 * Logging Functions
 */
function addLog(action, details, email) {
  const sheet = getSheet("Logs");
  const timestamp = getCurrentDateTime();
  sheet.appendRow([
    timestamp,
    email,
    action,
    JSON.stringify(details)
  ]);
}

/**
 * Email Utilities
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Currency & Number Formatting
 */
function formatCurrency(amount, currency = "IDR") {
  if (currency === "IDR") {
    return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return amount.toFixed(2);
}

function parseCurrency(value) {
  if (typeof value === "string") {
    return parseFloat(value.replace(/[^0-9.-]+/g, ""));
  }
  return parseFloat(value);
}

/**
 * Array & Object Utilities
 */
function findInArray(array, key, value) {
  return array.find(item => item[key] === value);
}

function filterArray(array, key, value) {
  return array.filter(item => item[key] === value);
}

/**
 * Status Constants
 */
const REQUEST_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED_MANAGER: "Approved by Manager",
  APPROVED_DIRECTOR: "Approved by Director",
  REJECTED: "Rejected",
  PAID: "Paid",
  CANCELLED: "Cancelled"
};

const PAYMENT_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PROCESSED: "Processed",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};

const USER_ROLES = {
  MAKER: "Maker",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  FINANCE: "Finance",
  ADMIN: "Admin"
};

/**
 * Get Approver based on Role
 */
function getApproverByRole(role) {
  const users = getAllUsers();
  const approvers = users.filter(u => u.role === role && u.status === "Active");
  return approvers;
}

/**
 * Validation Helper
 */
function validateEmail(email) {
  return isValidEmail(email);
}

function validateAmount(amount) {
  const num = parseCurrency(amount);
  return !isNaN(num) && num > 0;
}

function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}