/**
 * Payment Order Module for Finance Request System
 */

/**
 * Create new Payment Order (PO)
 */
function createPaymentOrder(orderData) {
  try {
    // Validate input
    const validation = validateRequestHeader({
      requestNo: orderData.requestNo,
      requestDate: orderData.requestDate,
      requestEmail: orderData.requestEmail,
      requestName: orderData.requestName,
      department: orderData.department,
      requestType: "PO",
      currency: orderData.currency,
      totalAmount: orderData.totalAmount
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
      orderData.requestNo,                       // Request No
      orderData.requestDate,                     // Request Date
      orderData.requestEmail,                    // Request Email
      orderData.requestName,                     // Request Name
      orderData.department,                      // Department
      "PO",                                      // Request Type
      orderData.purposeCategory || "",           // Purpose Category
      orderData.purpose || "",                   // Purpose
      orderData.currency,                        // Currency
      orderData.totalAmount,                     // Total Amount
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

    addLog("CREATE_PO", { requestId: requestId, requestNo: orderData.requestNo }, orderData.requestEmail);

    return {
      success: true,
      message: "PO berhasil dibuat",
      requestId: requestId
    };

  } catch (error) {
    Logger.log("Create PO error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Add detail to Payment Order
 */
function addPaymentOrderDetail(requestId, detailData) {
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

    addLog("ADD_PO_DETAIL", { detailId: detailId, requestId: requestId }, "");

    return {
      success: true,
      message: "Detail PO berhasil ditambahkan",
      detailId: detailId
    };

  } catch (error) {
    Logger.log("Add PO detail error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Submit Payment Order for Approval
 */
function submitPaymentOrder(requestId, email) {
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
        // Determine next approver
        let nextApprover = "";
        const managers = getApproverByRole("Manager");
        
        if (managers.length > 0) {
          nextApprover = managers[0].email;
        }

        sheet.getRange(i + 1, 12).setValue(REQUEST_STATUS.SUBMITTED);  // Status
        sheet.getRange(i + 1, 13).setValue(nextApprover);               // Current Approver

        addLog("SUBMIT_PO", { requestId: requestId, nextApprover: nextApprover }, email);

        // Send notification
        sendApprovalNotification(nextApprover, requestId, data[i][1]);

        return {
          success: true,
          message: "PO berhasil disubmit untuk approval",
          nextApprover: nextApprover
        };
      }
    }

    return {
      success: false,
      message: "PO tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Submit PO error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Approve Payment Order
 */
function approvePaymentOrder(requestId, email, signatureFileId) {
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

          addLog("APPROVE_PO", { requestId: requestId, approver: email }, email);

          // Send notification
          const requestNo = data[i][1];
          const creatorEmail = data[i][3];
          sendApprovalNotification(creatorEmail, requestId, requestNo, "approved");

          return {
            success: true,
            message: "PO berhasil di-approve"
          };
        } else {
          return {
            success: false,
            message: "Status PO tidak sesuai untuk di-approve"
          };
        }
      }
    }

    return {
      success: false,
      message: "PO tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Approve PO error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Reject Payment Order
 */
function rejectPaymentOrder(requestId, email, reason) {
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

        addLog("REJECT_PO", { requestId: requestId, reason: reason }, email);

        // Send notification
        const creatorEmail = data[i][3];
        const requestNo = data[i][1];
        sendRejectionNotification(creatorEmail, requestId, requestNo, reason);

        return {
          success: true,
          message: "PO berhasil di-reject"
        };
      }
    }

    return {
      success: false,
      message: "PO tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Reject PO error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Payment Orders
 */
function getPaymentOrders(email, status = null) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    const orders = [];
    const sheet = getSheet("Request Header");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][6] === "PO") {  // Only PO requests
        if (!status || data[i][11] === status) {
          orders.push({
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
      data: orders
    };

  } catch (error) {
    Logger.log("Get POs error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}
