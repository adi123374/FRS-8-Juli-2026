/**
 * User Settings Module for Finance Request System
 */

/**
 * Add new user
 */
function addUser(userData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menambah user"
      };
    }

    // Validate user data
    const validation = validateUserAccess({
      email: userData.email,
      name: userData.name,
      department: userData.department,
      role: userData.role,
      status: userData.status,
      idKaryawan: userData.idKaryawan
    });

    if (!validation.valid) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validation.errors
      };
    }

    const sheet = getSheet("User Access");
    const defaultPassword = hashPassword("123456");  // Default password

    sheet.appendRow([
      userData.email,                        // Email
      userData.name,                         // Name
      userData.department,                   // Department
      userData.role,                         // Role
      userData.status,                       // Status
      userData.idKaryawan,                   // ID Karyawan
      defaultPassword,                       // Password (hashed)
      "",                                    // Signature File ID
      ""                                     // Signature URL
    ]);

    addLog("ADD_USER", { email: userData.email, role: userData.role }, adminEmail);

    return {
      success: true,
      message: "User berhasil ditambahkan"
    };

  } catch (error) {
    Logger.log("Add user error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update user
 */
function updateUser(email, updateData, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah user"
      };
    }

    const sheet = getSheet("User Access");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        // Update allowed fields
        if (updateData.name) {
          sheet.getRange(i + 1, 2).setValue(updateData.name);
        }
        if (updateData.department) {
          sheet.getRange(i + 1, 3).setValue(updateData.department);
        }
        if (updateData.role) {
          sheet.getRange(i + 1, 4).setValue(updateData.role);
        }
        if (updateData.status) {
          sheet.getRange(i + 1, 5).setValue(updateData.status);
        }

        addLog("UPDATE_USER", { email: email, changes: updateData }, adminEmail);

        return {
          success: true,
          message: "User berhasil diubah"
        };
      }
    }

    return {
      success: false,
      message: "User tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Update user error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Delete user (Deactivate)
 */
function deactivateUser(email, adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus user"
      };
    }

    const sheet = getSheet("User Access");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.getRange(i + 1, 5).setValue("Inactive");

        addLog("DEACTIVATE_USER", { email: email }, adminEmail);

        return {
          success: true,
          message: "User berhasil di-deactivate"
        };
      }
    }

    return {
      success: false,
      message: "User tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Deactivate user error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get all users
 */
function listAllUsers(adminEmail) {
  try {
    // Check if caller is Admin
    const admin = getUserFromEmail(adminEmail);
    if (!admin || admin.role !== "Admin") {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk melihat user list"
      };
    }

    const users = getAllUsers();

    return {
      success: true,
      data: users
    };

  } catch (error) {
    Logger.log("List users error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update user signature
 */
function updateUserSignature(email, signatureFileId) {
  try {
    return saveUserSignature(email, signatureFileId);

  } catch (error) {
    Logger.log("Update user signature error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get user profile
 */
function getUserProfile(email) {
  try {
    const user = getUserFromEmail(email);

    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    return {
      success: true,
      data: user
    };

  } catch (error) {
    Logger.log("Get user profile error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Update user profile
 */
function updateUserProfile(email, profileData) {
  try {
    const sheet = getSheet("User Access");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        // Users can only update certain fields
        if (profileData.name) {
          sheet.getRange(i + 1, 2).setValue(profileData.name);
        }

        addLog("UPDATE_PROFILE", { email: email }, email);

        return {
          success: true,
          message: "Profile berhasil diubah"
        };
      }
    }

    return {
      success: false,
      message: "User tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Update profile error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get users by role
 */
function getUsersByRole(role) {
  try {
    const users = getAllUsers();
    const filteredUsers = filterArray(users, "role", role);

    return {
      success: true,
      data: filteredUsers
    };

  } catch (error) {
    Logger.log("Get users by role error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Get active users
 */
function getActiveUsers() {
  try {
    const users = getAllUsers();
    const activeUsers = filterArray(users, "status", "Active");

    return {
      success: true,
      data: activeUsers
    };

  } catch (error) {
    Logger.log("Get active users error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}
