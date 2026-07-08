/**
 * Payment Request Module for Finance Request System
 */

/**
 * Create new Payment Request (PR)
 */
function createPaymentRequest(requestData) {
  try {
    // Validate input
    const validation = validateRequestHeader({
      requestNo: requestData.requestNo,
      requestDate: requestData.requestDate,
      requestEmail: requestData.requestEmail,
      requestName: requestData.requestName,
      department: requestData.department,
      requestType: "PR",
      currency: requestData.currency,
      totalAmount: requestData.totalAmount
    });

    if (!validation.valid) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validation.errors
      };
    }

    const requestId = generateId();
    const sheet = getSheet("Request Header");

    sheet.appendRow([
      requestId,                                  // Request ID
      requestData.requestNo,                     // Request No
      requestData.requestDate,                   // Request Date
      requestData.requestEmail,                  // Request Email
      requestData.requestName,                   // Request Name
      requestData.department,                    // Department
      "PR",                                      // Request Type
      requestData.purposeCategory || "",         // Purpose Category
      requestData.purpose || "",                 // Purpose
      requestData.currency,                      // Currency
      requestData.totalAmount,                   // Total Amount
      REQUEST_STATUS.DRAFT,                      // Status
      "",                                        // Current Approver
      PAYMENT_STATUS.PENDING,                    // Payment Status
      "",                                        // Settlement Status
      getCurrentDateTime(),                      // Created At
      false,                                     // Attachment Verified
      "",                                        // Signature File ID
      "",                                        // Signature Time
      "",                                        // Approver Signature
      ""                                         // Payment Request ID
    ]);

    addLog("CREATE_PR", { requestId: requestId, requestNo: requestData.requestNo }, requestData.requestEmail);

    return {
      success: true,
      message: "PR berhasil dibuat",
      requestId: requestId
    };

  } catch (error) {
    Logger.log("Create PR error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Add detail to Payment Request
 */
function addPaymentRequestDetail(requestId, detailData) {
  try {
    // Validate detail
    const validation = validateRequestDetail({
      transactionDate: detailData.transactionDate,
      expenseCategory: detailData.expenseCategory,
      vendor: detailData.vendor,
      description: detailData.description,
      qty: detailData.qty,
      unitPrice: detailData.unitPrice,
      amount: detailData.amount
    });

    if (!validation.valid) {
      return {
        success: false,
        message: "Validasi detail gagal",
        errors: validation.errors
      };
    }

    const detailId = generateId();
    const sheet = getSheet("Request Detail");

    sheet.appendRow([
      detailId,                              // Detail ID
      requestId,                             // Request ID
      detailData.transactionDate,            // Transaction Date
      detailData.expenseCategory,            // Expense Category
      detailData.vendor,                     // Vendor
      detailData.description,                // Description
      detailData.qty,                        // Qty
      detailData.unitPrice,                  // Unit Price
      detailData.amount,                     // Amount
      detailData.attachment || ""            // Attachment
    ]);

    addLog("ADD_PR_DETAIL", { detailId: detailId, requestId: requestId }, "");

    return {
      success: true,
      message: "Detail PR berhasil ditambahkan",
      detailId: detailId
    };

  } catch (error) {
    Logger.log("Add PR detail error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Submit Payment Request for Approval
 */
function submitPaymentRequest(requestId, email) {
  try {
    const validation = validateRequestSubmission(requestId);
    
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }

    const user = getUserFromEmail(email);
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    const sheet = getSheet("Request Header");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === requestId) {
        // Determine next approver based on amount
        let nextApprover = "";
        const totalAmount = parseCurrency(data[i][10]);

        // If amount > threshold, route to Director, else to Manager
        if (totalAmount > 50000000) {  // > 50 juta
          const directors = getApproverByRole("Director");
          if (directors.length > 0) {
            nextApprover = directors[0].email;
          }
        } else {
          const managers = getApproverByRole("Manager");
          if (managers.length > 0) {
            nextApprover = managers[0].email;
          }
        }

        sheet.getRange(i + 1, 12).setValue(REQUEST_STATUS.SUBMITTED);  // Status
        sheet.getRange(i + 1, 13).setValue(nextApprover);               // Current Approver

        addLog("SUBMIT_PR", { requestId: requestId, nextApprover: nextApprover }, email);

        // Send notification
        sendApprovalNotification(nextApprover, requestId, data[i][1]);

        return {
          success: true,
          message: "PR berhasil disubmit untuk approval",
          nextApprover: nextApprover
        };
      }
    }

    return {
      success: false,
      message: "PR tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Submit PR error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Approve Payment Request
 */
function approvePaymentRequest(requestId, email, signatureFileId, notes = "") {
  try {
    const user = getUserFromEmail(email);
    
    if (!user || !["Manager", "Director", "Finance"].includes(user.role)) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk approve"
      };
    }

    const sheet = getSheet("Request Header");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === requestId) {
        const currentStatus = data[i][11];

        if (currentStatus === REQUEST_STATUS.SUBMITTED) {
          let newStatus = REQUEST_STATUS.APPROVED_MANAGER;
          
          if (user.role === "Director") {
            newStatus = REQUEST_STATUS.APPROVED_DIRECTOR;
          }

          sheet.getRange(i + 1, 12).setValue(newStatus);                    // Status
          sheet.getRange(i + 1, 18).setValue(signatureFileId);              // Signature File ID
          sheet.getRange(i + 1, 19).setValue(getCurrentDateTime());         // Signature Time
          sheet.getRange(i + 1, 20).setValue(email);                        // Approver Signature

          addLog("APPROVE_PR", { requestId: requestId, approver: email, notes: notes }, email);

          // Send notification
          const requestNo = data[i][1];
          const creatorEmail = data[i][3];
          sendApprovalNotification(creatorEmail, requestId, requestNo, "approved");

          return {
            success: true,
            message: "PR berhasil di-approve"
          };
        } else {
          return {
            success: false,
            message: "Status PR tidak sesuai untuk di-approve"
          };
        }
      }
    }

    return {
      success: false,
      message: "PR tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Approve PR error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Reject Payment Request
 */
function rejectPaymentRequest(requestId, email, reason) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user || !["Manager", "Director", "Finance"].includes(user.role)) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk reject"
      };
    }

    if (!reason || reason.trim() === "") {
      return {
        success: false,
        message: "Alasan reject harus diisi"
      };
    }

    const sheet = getSheet("Request Header");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === requestId) {
        sheet.getRange(i + 1, 12).setValue(REQUEST_STATUS.REJECTED);     // Status
        sheet.getRange(i + 1, 13).setValue("");                          // Clear Current Approver

        addLog("REJECT_PR", { requestId: requestId, reason: reason }, email);

        // Send notification
        const creatorEmail = data[i][3];
        const requestNo = data[i][1];
        sendRejectionNotification(creatorEmail, requestId, requestNo, reason);

        return {
          success: true,
          message: "PR berhasil di-reject"
        };
      }
    }

    return {
      success: false,
      message: "PR tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Reject PR error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Process Payment Request (Finance)
 */
function processPaymentRequest(requestId, email, bankAccountId, paymentDate) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user || user.role !== "Finance") {
      return {
        success: false,
        message: "Hanya Finance yang dapat memproses pembayaran"
      };
    }

    const sheet = getSheet("Request Header");
    const paymentLogSheet = getSheet("Payments Log");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === requestId) {
        const status = data[i][11];

        if (status !== REQUEST_STATUS.APPROVED_DIRECTOR) {
          return {
            success: false,
            message: "Request harus sudah di-approve oleh Director"
          };
        }

        // Update payment status
        sheet.getRange(i + 1, 12).setValue(REQUEST_STATUS.PAID);         // Status
        sheet.getRange(i + 1, 14).setValue(PAYMENT_STATUS.COMPLETED);    // Payment Status

        // Add to payment log
        paymentLogSheet.appendRow([
          data[i][1],                           // PR/PO Number
          paymentDate,                          // PR/PO Date
          data[i][2],                           // Due Date
          false,                                // Urgent
          "",                                   // Urgent Reason
          false,                                // Escalate
          "",                                   // Escalate Reason
          email,                                // Maker Name
          bankAccountId,                        // Payment From (Bank)
          data[i][10],                          // Total Amount
          PAYMENT_STATUS.COMPLETED,             // Status
          requestId,                            // PR ID
          email,                                // Maker Email
          data[i][5],                           // Department
          data[i][20],                          // Approver Manager
          data[i][20],                          // Approver Director
          "Processed",                          // Finance Note
          paymentDate,                          // Processed Date
          getCurrentDateTime()                  // Created At
        ]);

        addLog("PROCESS_PAYMENT", { requestId: requestId, paymentDate: paymentDate }, email);

        // Send notification
        const creatorEmail = data[i][3];
        const requestNo = data[i][1];
        sendPaymentProcessedNotification(creatorEmail, requestId, requestNo, paymentDate);

        return {
          success: true,
          message: "Pembayaran berhasil diproses"
        };
      }
    }

    return {
      success: false,
      message: "Request tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Process payment error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Payment Requests
 */
function getPaymentRequests(email, status = null) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    const requests = [];
    const sheet = getSheet("Request Header");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][6] === "PR") {  // Only PR requests
        if (!status || data[i][11] === status) {
          requests.push({
            requestId: data[i][0],
            requestNo: data[i][1],
            requestDate: data[i][2],
            requestName: data[i][4],
            department: data[i][5],
            totalAmount: data[i][10],
            status: data[i][11],
            createdAt: data[i][15]
          });
        }
      }
    }

    return {
      success: true,
      data: requests
    };

  } catch (error) {
    Logger.log("Get PRs error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}
