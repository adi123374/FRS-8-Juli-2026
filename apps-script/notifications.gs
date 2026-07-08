/**
 * Notifications Module for Finance Request System
 */

const EMAIL_CONFIG = {
  sender: "noreply@finance-request.com",
  senderName: "Finance Request System"
};

/**
 * Send approval notification
 */
function sendApprovalNotification(approverEmail, requestId, requestNo, action = "pending") {
  try {
    if (!isValidEmail(approverEmail)) {
      Logger.log("Invalid approver email: " + approverEmail);
      return false;
    }

    let subject, body;

    if (action === "pending") {
      subject = `[FRS] New Request Awaiting Your Approval - ${requestNo}`;
      body = `
        <h2>New Request Approval Needed</h2>
        <p>A new payment request (${requestNo}) is awaiting your approval.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><a href="[SYSTEM_URL]">View Request</a></p>
        <p>Please review and take necessary action.</p>
      `;
    } else if (action === "approved") {
      subject = `[FRS] Your Request Has Been Approved - ${requestNo}`;
      body = `
        <h2>Request Approved</h2>
        <p>Your payment request (${requestNo}) has been approved.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><a href="[SYSTEM_URL]">View Request</a></p>
      `;
    }

    GmailApp.sendEmail(approverEmail, subject, body, {
      htmlBody: body
    });

    addLog("SEND_APPROVAL_NOTIFICATION", { approverEmail: approverEmail, requestId: requestId }, "");

    return true;

  } catch (error) {
    Logger.log("Send approval notification error: " + error);
    return false;
  }
}

/**
 * Send rejection notification
 */
function sendRejectionNotification(creatorEmail, requestId, requestNo, reason) {
  try {
    if (!isValidEmail(creatorEmail)) {
      Logger.log("Invalid creator email: " + creatorEmail);
      return false;
    }

    const subject = `[FRS] Your Request Has Been Rejected - ${requestNo}`;
    const body = `
      <h2>Request Rejected</h2>
      <p>Your payment request (${requestNo}) has been rejected.</p>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><a href="[SYSTEM_URL]">View Request</a></p>
      <p>Please review the comments and make necessary corrections.</p>
    `;

    GmailApp.sendEmail(creatorEmail, subject, body, {
      htmlBody: body
    });

    addLog("SEND_REJECTION_NOTIFICATION", { creatorEmail: creatorEmail, requestId: requestId }, "");

    return true;

  } catch (error) {
    Logger.log("Send rejection notification error: " + error);
    return false;
  }
}

/**
 * Send payment processed notification
 */
function sendPaymentProcessedNotification(creatorEmail, requestId, requestNo, paymentDate) {
  try {
    if (!isValidEmail(creatorEmail)) {
      Logger.log("Invalid creator email: " + creatorEmail);
      return false;
    }

    const subject = `[FRS] Your Request Has Been Processed - ${requestNo}`;
    const body = `
      <h2>Payment Processed</h2>
      <p>Your payment request (${requestNo}) has been processed.</p>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Payment Date:</strong> ${paymentDate}</p>
      <p><a href="[SYSTEM_URL]">View Request</a></p>
    `;

    GmailApp.sendEmail(creatorEmail, subject, body, {
      htmlBody: body
    });

    addLog("SEND_PAYMENT_NOTIFICATION", { creatorEmail: creatorEmail, requestId: requestId }, "");

    return true;

  } catch (error) {
    Logger.log("Send payment notification error: " + error);
    return false;
  }
}

/**
 * Send escalation notification
 */
function sendEscalationNotification(directorEmail, requestId, requestNo, reason) {
  try {
    if (!isValidEmail(directorEmail)) {
      Logger.log("Invalid director email: " + directorEmail);
      return false;
    }

    const subject = `[FRS] Urgent: Request Escalation Required - ${requestNo}`;
    const body = `
      <h2>Request Escalation</h2>
      <p>A payment request (${requestNo}) has been escalated to you.</p>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Escalation Reason:</strong> ${reason}</p>
      <p><a href="[SYSTEM_URL]">View Request</a></p>
      <p>This requires your immediate attention.</p>
    `;

    GmailApp.sendEmail(directorEmail, subject, body, {
      htmlBody: body
    });

    addLog("SEND_ESCALATION_NOTIFICATION", { directorEmail: directorEmail, requestId: requestId }, "");

    return true;

  } catch (error) {
    Logger.log("Send escalation notification error: " + error);
    return false;
  }
}

/**
 * Send daily summary email
 */
function sendDailySummary() {
  try {
    const users = getAllUsers();
    
    for (let user of users) {
      if (user.status !== "Active" || !isValidEmail(user.email)) {
        continue;
      }

      // Get user's pending items
      const pendingApprovals = getPendingApprovals(user.email);
      const recentRequests = getRecentRequests(user.email, 5);

      if (pendingApprovals.count === 0) {
        continue;
      }

      let body = `
        <h2>Finance Request System - Daily Summary</h2>
        <p>Dear ${user.name},</p>
        <h3>Pending Approvals: ${pendingApprovals.count}</h3>
        <table border="1" cellpadding="5">
          <tr>
            <th>Request No</th>
            <th>Amount</th>
            <th>Department</th>
          </tr>
      `;

      for (let request of pendingApprovals.data) {
        body += `
          <tr>
            <td>${request.requestNo}</td>
            <td>${request.totalAmount}</td>
            <td>${request.department}</td>
          </tr>
        `;
      }

      body += `
        </table>
        <p><a href="[SYSTEM_URL]">Go to System</a></p>
      `;

      const subject = `[FRS] Daily Summary - ${pendingApprovals.count} Pending Approvals`;

      GmailApp.sendEmail(user.email, subject, body, {
        htmlBody: body
      });
    }

    addLog("SEND_DAILY_SUMMARY", {}, "system");

    return true;

  } catch (error) {
    Logger.log("Send daily summary error: " + error);
    return false;
  }
}

/**
 * Send system alert
 */
function sendSystemAlert(adminEmail, subject, message) {
  try {
    if (!isValidEmail(adminEmail)) {
      return false;
    }

    const body = `
      <h2>System Alert</h2>
      <p>${message}</p>
      <p><strong>Time:</strong> ${getCurrentDateTime()}</p>
    `;

    GmailApp.sendEmail(adminEmail, `[FRS ALERT] ${subject}`, body, {
      htmlBody: body
    });

    addLog("SEND_SYSTEM_ALERT", { adminEmail: adminEmail, subject: subject }, "system");

    return true;

  } catch (error) {
    Logger.log("Send system alert error: " + error);
    return false;
  }
}

/**
 * Send budget alert
 */
function sendBudgetAlert(categoryName, currentAmount, budgetLimit, departmentEmail) {
  try {
    const percentageUsed = (currentAmount / budgetLimit) * 100;
    
    const subject = `[FRS] Budget Alert - ${categoryName} (${percentageUsed.toFixed(0)}% used)`;
    const body = `
      <h2>Budget Alert</h2>
      <p>Your budget for <strong>${categoryName}</strong> is running low.</p>
      <p><strong>Current Amount:</strong> Rp ${formatCurrency(currentAmount)}</p>
      <p><strong>Budget Limit:</strong> Rp ${formatCurrency(budgetLimit)}</p>
      <p><strong>Percentage Used:</strong> ${percentageUsed.toFixed(2)}%</p>
      <p>Please review your spending and plan accordingly.</p>
    `;

    GmailApp.sendEmail(departmentEmail, subject, body, {
      htmlBody: body
    });

    addLog("SEND_BUDGET_ALERT", { category: categoryName, percentage: percentageUsed }, "");

    return true;

  } catch (error) {
    Logger.log("Send budget alert error: " + error);
    return false;
  }
}
