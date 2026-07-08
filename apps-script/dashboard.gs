/**
 * Dashboard Module for Finance Request System
 */

/**
 * Get Dashboard Summary
 */
function getDashboardSummary(email) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    const summary = {
      totalRequests: 0,
      draftRequests: 0,
      pendingApproval: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      paidRequests: 0,
      totalAmount: 0
    };

    const headerSheet = getSheet("Request Header");
    const headerData = headerSheet.getDataRange().getValues();

    for (let i = 1; i < headerData.length; i++) {
      const requestEmail = headerData[i][3];
      const status = headerData[i][11];
      const totalAmount = headerData[i][10];

      // Filter by user role
      if (requestEmail === email || user.role === "Director" || user.role === "Finance" || user.role === "Admin") {
        summary.totalRequests++;
        summary.totalAmount += parseCurrency(totalAmount);

        switch (status) {
          case REQUEST_STATUS.DRAFT:
            summary.draftRequests++;
            break;
          case REQUEST_STATUS.SUBMITTED:
            summary.pendingApproval++;
            break;
          case REQUEST_STATUS.APPROVED_MANAGER:
          case REQUEST_STATUS.APPROVED_DIRECTOR:
            summary.approvedRequests++;
            break;
          case REQUEST_STATUS.REJECTED:
            summary.rejectedRequests++;
            break;
          case REQUEST_STATUS.PAID:
            summary.paidRequests++;
            break;
        }
      }
    }

    return {
      success: true,
      data: summary,
      user: {
        name: user.name,
        role: user.role,
        department: user.department
      }
    };

  } catch (error) {
    Logger.log("Dashboard error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Recent Requests
 */
function getRecentRequests(email, limit = 10) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    const requests = [];
    const headerSheet = getSheet("Request Header");
    const headerData = headerSheet.getDataRange().getValues();

    for (let i = 1; i < headerData.length; i++) {
      const requestEmail = headerData[i][3];
      
      // Filter by user or if user is approver
      if (requestEmail === email || user.role === "Director" || user.role === "Finance") {
        requests.push({
          requestId: headerData[i][0],
          requestNo: headerData[i][1],
          requestDate: headerData[i][2],
          requestName: headerData[i][4],
          department: headerData[i][5],
          requestType: headerData[i][6],
          totalAmount: headerData[i][10],
          status: headerData[i][11],
          currentApprover: headerData[i][12],
          createdAt: headerData[i][15]
        });
      }
    }

    // Sort by date and return recent ones
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      data: requests.slice(0, limit)
    };

  } catch (error) {
    Logger.log("Get requests error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Pending Approvals
 */
function getPendingApprovals(email) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    // Only show pending approvals for managers and directors
    if (!["Manager", "Director", "Finance"].includes(user.role)) {
      return {
        success: true,
        data: []
      };
    }

    const pendingRequests = [];
    const headerSheet = getSheet("Request Header");
    const headerData = headerSheet.getDataRange().getValues();

    for (let i = 1; i < headerData.length; i++) {
      const status = headerData[i][11];
      const currentApprover = headerData[i][12];

      // Show requests awaiting this user's approval
      if (status === REQUEST_STATUS.SUBMITTED && currentApprover === email) {
        pendingRequests.push({
          requestId: headerData[i][0],
          requestNo: headerData[i][1],
          requestDate: headerData[i][2],
          requestName: headerData[i][4],
          department: headerData[i][5],
          totalAmount: headerData[i][10],
          status: status,
          createdAt: headerData[i][15]
        });
      }
    }

    // Sort by date
    pendingRequests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return {
      success: true,
      data: pendingRequests,
      count: pendingRequests.length
    };

  } catch (error) {
    Logger.log("Get pending approvals error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Request Details
 */
function getRequestDetails(requestId) {
  try {
    const headerSheet = getSheet("Request Header");
    const detailSheet = getSheet("Request Detail");
    const paymentLogSheet = getSheet("Payments Log");

    const headerData = headerSheet.getDataRange().getValues();
    const detailData = detailSheet.getDataRange().getValues();
    const paymentData = paymentLogSheet.getDataRange().getValues();

    let headerInfo = null;
    for (let i = 1; i < headerData.length; i++) {
      if (headerData[i][0] === requestId) {
        headerInfo = {
          requestId: headerData[i][0],
          requestNo: headerData[i][1],
          requestDate: headerData[i][2],
          requestEmail: headerData[i][3],
          requestName: headerData[i][4],
          department: headerData[i][5],
          requestType: headerData[i][6],
          purposeCategory: headerData[i][7],
          purpose: headerData[i][8],
          currency: headerData[i][9],
          totalAmount: headerData[i][10],
          status: headerData[i][11],
          currentApprover: headerData[i][12],
          paymentStatus: headerData[i][13],
          settlementStatus: headerData[i][14],
          createdAt: headerData[i][15],
          attachmentVerified: headerData[i][16],
          signatureFileId: headerData[i][17],
          signatureTime: headerData[i][18],
          approverSignature: headerData[i][19],
          paymentRequestId: headerData[i][20]
        };
        break;
      }
    }

    let details = [];
    for (let i = 1; i < detailData.length; i++) {
      if (detailData[i][1] === requestId) {
        details.push({
          detailId: detailData[i][0],
          requestId: detailData[i][1],
          transactionDate: detailData[i][2],
          expenseCategory: detailData[i][3],
          vendor: detailData[i][4],
          description: detailData[i][5],
          qty: detailData[i][6],
          unitPrice: detailData[i][7],
          amount: detailData[i][8],
          attachment: detailData[i][9]
        });
      }
    }

    let paymentInfo = null;
    for (let i = 1; i < paymentData.length; i++) {
      if (paymentData[i][11] === requestId) {
        paymentInfo = {
          paymentNumber: paymentData[i][0],
          paymentDate: paymentData[i][1],
          dueDate: paymentData[i][2],
          urgent: paymentData[i][3],
          totalAmount: paymentData[i][9],
          status: paymentData[i][10],
          processedDate: paymentData[i][17]
        };
        break;
      }
    }

    return {
      success: true,
      header: headerInfo,
      details: details,
      payment: paymentInfo
    };

  } catch (error) {
    Logger.log("Get request details error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get Dashboard Statistics
 */
function getDashboardStatistics(email) {
  try {
    const summary = getDashboardSummary(email);
    
    if (!summary.success) {
      return summary;
    }

    const headerSheet = getSheet("Request Header");
    const headerData = headerSheet.getDataRange().getValues();

    // Calculate by department
    const departmentStats = {};
    let totalPendingAmount = 0;

    for (let i = 1; i < headerData.length; i++) {
      const department = headerData[i][5];
      const status = headerData[i][11];
      const totalAmount = parseCurrency(headerData[i][10]);

      if (!departmentStats[department]) {
        departmentStats[department] = {
          count: 0,
          amount: 0
        };
      }

      departmentStats[department].count++;
      departmentStats[department].amount += totalAmount;

      if (status === REQUEST_STATUS.SUBMITTED) {
        totalPendingAmount += totalAmount;
      }
    }

    return {
      success: true,
      summary: summary.data,
      user: summary.user,
      departmentStats: departmentStats,
      totalPendingAmount: totalPendingAmount
    };

  } catch (error) {
    Logger.log("Dashboard statistics error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}
