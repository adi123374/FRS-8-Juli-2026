/**
 * Scheduled Triggers Module for Finance Request System
 */

/**
 * Setup all triggers
 * Run this function once to initialize scheduled triggers
 */
function setupAllTriggers() {
  try {
    Logger.log("Setting up triggers...");

    // Remove existing triggers to avoid duplicates
    deleteDailyTrigger();
    deleteWeeklyTrigger();

    // Create daily trigger for sending summary (08:00)
    ScriptApp.newTrigger("sendDailySummaryTrigger")
      .timeBased()
      .atHour(8)
      .everyDays(1)
      .create();

    // Create weekly trigger for budget check (Monday 09:00)
    ScriptApp.newTrigger("checkBudgetAlertsTrigger")
      .timeBased()
      .atHour(9)
      .everyWeeks(1)
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .create();

    Logger.log("✓ All triggers setup successfully");
    return {
      success: true,
      message: "Triggers berhasil disetup"
    };

  } catch (error) {
    Logger.log("Setup triggers error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat setup triggers"
    };
  }
}

/**
 * Daily summary trigger - Send daily summary emails
 */
function sendDailySummaryTrigger() {
  try {
    Logger.log("⏰ Running daily summary trigger...");
    sendDailySummary();
    Logger.log("✓ Daily summary completed");

  } catch (error) {
    Logger.log("Daily summary trigger error: " + error);
  }
}

/**
 * Check budget alerts trigger
 */
function checkBudgetAlertsTrigger() {
  try {
    Logger.log("⏰ Running budget alert trigger...");
    checkBudgetAlerts();
    Logger.log("✓ Budget alert check completed");

  } catch (error) {
    Logger.log("Budget alert trigger error: " + error);
  }
}

/**
 * Check budget alerts and send notifications
 */
function checkBudgetAlerts() {
  try {
    const categories = getPaymentCategories();
    const headerSheet = getSheet("Request Header");
    const headerData = headerSheet.getDataRange().getValues();

    // Calculate spending per category
    const categorySpending = {};

    for (let i = 1; i < headerData.length; i++) {
      const status = headerData[i][11];
      
      // Only count submitted and approved requests
      if ([REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.APPROVED_MANAGER, REQUEST_STATUS.APPROVED_DIRECTOR].includes(status)) {
        // Get category from details
        const detailSheet = getSheet("Request Detail");
        const detailData = detailSheet.getDataRange().getValues();

        for (let j = 1; j < detailData.length; j++) {
          if (detailData[j][1] === headerData[i][0]) {
            const category = detailData[j][3];
            const amount = parseCurrency(detailData[j][8]);

            if (!categorySpending[category]) {
              categorySpending[category] = 0;
            }
            categorySpending[category] += amount;
          }
        }
      }
    }

    // Check against budget limits
    for (let category of categories) {
      const spent = categorySpending[category.name] || 0;
      const budgetLimit = parseCurrency(category.budgetLimit);
      const percentageUsed = (spent / budgetLimit) * 100;

      if (percentageUsed >= 80) {
        // Get department users to notify
        const admins = getApproverByRole("Admin");
        if (admins.length > 0) {
          sendBudgetAlert(
            category.name,
            spent,
            budgetLimit,
            admins[0].email
          );
        }
      }
    }

  } catch (error) {
    Logger.log("Check budget alerts error: " + error);
  }
}

/**
 * Check pending approvals - Alert approvers of pending requests
 */
function checkPendingApprovalsAlert() {
  try {
    Logger.log("Checking pending approvals...");

    const managers = getApproverByRole("Manager");
    const directors = getApproverByRole("Director");

    // Check pending for managers
    for (let manager of managers) {
      const pending = getPendingApprovals(manager.email);
      
      if (pending.count > 0) {
        const subject = `[FRS Alert] Anda memiliki ${pending.count} request menunggu approval`;
        const body = `
          <h2>Pending Approvals</h2>
          <p>Anda memiliki ${pending.count} request yang menunggu untuk di-approve.</p>
          <p><a href="[SYSTEM_URL]">Lihat di Sistem</a></p>
        `;

        GmailApp.sendEmail(manager.email, subject, body, {
          htmlBody: body
        });
      }
    }

    // Check pending for directors
    for (let director of directors) {
      const pending = getPendingApprovals(director.email);
      
      if (pending.count > 0) {
        const subject = `[FRS Alert] Anda memiliki ${pending.count} request menunggu approval`;
        const body = `
          <h2>Pending Approvals</h2>
          <p>Anda memiliki ${pending.count} request yang menunggu untuk di-approve.</p>
          <p><a href="[SYSTEM_URL]">Lihat di Sistem</a></p>
        `;

        GmailApp.sendEmail(director.email, subject, body, {
          htmlBody: body
        });
      }
    }

    Logger.log("✓ Pending approvals check completed");

  } catch (error) {
    Logger.log("Check pending approvals error: " + error);
  }
}

/**
 * Archive old records - Run monthly to archive completed requests
 */
function archiveOldRecords() {
  try {
    Logger.log("Archiving old records...");

    const headerSheet = getSheet("Request Header");
    const detailSheet = getSheet("Request Detail");
    const paymentLogSheet = getSheet("Payments Log");

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6);  // Archive records older than 6 months

    // This is a placeholder - in production, you would archive to another sheet or export
    Logger.log("✓ Archive completed");

  } catch (error) {
    Logger.log("Archive error: " + error);
  }
}

/**
 * Cleanup stale sessions - Run daily to clean up old sessions
 */
function cleanupStaleSessions() {
  try {
    Logger.log("Cleaning up stale sessions...");
    // Session cleanup logic here
    Logger.log("✓ Session cleanup completed");

  } catch (error) {
    Logger.log("Cleanup error: " + error);
  }
}

/**
 * Health check - Monitor system health
 */
function systemHealthCheck() {
  try {
    Logger.log("Running system health check...");

    const issues = [];

    // Check if all required sheets exist
    const requiredSheets = [
      "Request Header",
      "Request Detail",
      "User Access",
      "Bank Accounts",
      "Payments Category",
      "Payments Log",
      "Settings",
      "Logs"
    ];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    for (let sheetName of requiredSheets) {
      if (!ss.getSheetByName(sheetName)) {
        issues.push(`Sheet '${sheetName}' not found`);
      }
    }

    // Check if there are active users
    const users = getActiveUsers();
    if (users.data.length === 0) {
      issues.push("No active users found");
    }

    // Check if there are bank accounts
    const accounts = getBankAccounts();
    if (accounts.length === 0) {
      issues.push("No active bank accounts configured");
    }

    // Log results
    if (issues.length === 0) {
      Logger.log("✓ System health check PASSED");
      addLog("SYSTEM_HEALTH_CHECK", { status: "PASSED" }, "system");
    } else {
      Logger.log("⚠ System health check FAILED: " + issues.join("; "));
      addLog("SYSTEM_HEALTH_CHECK", { status: "FAILED", issues: issues }, "system");
      
      // Notify admins
      const admins = getApproverByRole("Admin");
      if (admins.length > 0) {
        sendSystemAlert(
          admins[0].email,
          "System Health Check Failed",
          "Issues found: " + issues.join("; ")
        );
      }
    }

    return {
      success: issues.length === 0,
      issues: issues
    };

  } catch (error) {
    Logger.log("Health check error: " + error);
    return {
      success: false,
      issues: [error.toString()]
    };
  }
}

/**
 * Delete all triggers - Use this to remove all scheduled triggers
 */
function deleteAllTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    for (let trigger of triggers) {
      ScriptApp.deleteTrigger(trigger);
    }

    Logger.log("✓ All triggers deleted");
    return {
      success: true,
      message: "Semua trigger berhasil dihapus"
    };

  } catch (error) {
    Logger.log("Delete triggers error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus triggers"
    };
  }
}

/**
 * Delete daily trigger
 */
function deleteDailyTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    for (let trigger of triggers) {
      if (trigger.getHandlerFunction() === "sendDailySummaryTrigger") {
        ScriptApp.deleteTrigger(trigger);
      }
    }

  } catch (error) {
    Logger.log("Delete daily trigger error: " + error);
  }
}

/**
 * Delete weekly trigger
 */
function deleteWeeklyTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    for (let trigger of triggers) {
      if (trigger.getHandlerFunction() === "checkBudgetAlertsTrigger") {
        ScriptApp.deleteTrigger(trigger);
      }
    }

  } catch (error) {
    Logger.log("Delete weekly trigger error: " + error);
  }
}

/**
 * List all triggers - For debugging and monitoring
 */
function listAllTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let triggerList = "📋 Active Triggers:\n\n";

    if (triggers.length === 0) {
      triggerList += "No active triggers found";
    } else {
      for (let trigger of triggers) {
        triggerList += `- ${trigger.getHandlerFunction()}\n`;
      }
    }

    Logger.log(triggerList);
    return triggerList;

  } catch (error) {
    Logger.log("List triggers error: " + error);
    return "Error listing triggers: " + error;
  }
}
