/**
 * Digital Signature Module for Finance Request System
 */

/**
 * Upload signature to Google Drive
 */
function uploadSignature(fileName, fileBlob, email) {
  try {
    const user = getUserFromEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      };
    }

    // Validate file
    const fileValidation = validateFileUpload(fileName, fileBlob.getBytes().length);
    
    if (!fileValidation.valid) {
      return {
        success: false,
        message: "Validasi file gagal",
        errors: fileValidation.errors
      };
    }

    // Create folder for signatures if not exists
    const rootFolder = DriveApp.getRootFolder();
    let signatureFolder;
    
    const folders = rootFolder.getFoldersByName("FRS_Signatures");
    if (folders.hasNext()) {
      signatureFolder = folders.next();
    } else {
      signatureFolder = rootFolder.createFolder("FRS_Signatures");
    }

    // Create user folder
    let userFolder;
    const userFolders = signatureFolder.getFoldersByName(email);
    if (userFolders.hasNext()) {
      userFolder = userFolders.next();
    } else {
      userFolder = signatureFolder.createFolder(email);
    }

    // Upload file
    fileBlob.setName(fileName + "_" + generateId() + ".png");
    const file = userFolder.createFile(fileBlob);
    
    // Make file accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const fileUrl = file.getUrl();

    addLog("UPLOAD_SIGNATURE", { fileName: fileName, fileId: fileId }, email);

    return {
      success: true,
      message: "Signature berhasil diupload",
      fileId: fileId,
      fileUrl: fileUrl
    };

  } catch (error) {
    Logger.log("Upload signature error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat upload signature"
    };
  }
}

/**
 * Get signature URL
 */
function getSignatureUrl(fileId) {
  try {
    if (!fileId || fileId === "") {
      return null;
    }

    const file = DriveApp.getFileById(fileId);
    return file.getUrl();

  } catch (error) {
    Logger.log("Get signature URL error: " + error);
    return null;
  }
}

/**
 * Save signature to user profile
 */
function saveUserSignature(email, signatureFileId) {
  try {
    const sheet = getSheet("User Access");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.getRange(i + 1, 8).setValue(signatureFileId);  // Signature File ID
        
        const fileUrl = getSignatureUrl(signatureFileId);
        if (fileUrl) {
          sheet.getRange(i + 1, 9).setValue(fileUrl);        // Signature URL
        }

        addLog("SAVE_USER_SIGNATURE", { email: email, fileId: signatureFileId }, email);

        return {
          success: true,
          message: "Signature berhasil disimpan ke profil"
        };
      }
    }

    return {
      success: false,
      message: "User tidak ditemukan"
    };

  } catch (error) {
    Logger.log("Save user signature error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem"
    };
  }
}

/**
 * Verify signature on document
 */
function verifySignature(requestId, signatureFileId) {
  try {
    if (!signatureFileId || signatureFileId === "") {
      return {
        valid: false,
        message: "Signature tidak ditemukan"
      };
    }

    // Check if file exists in Drive
    try {
      const file = DriveApp.getFileById(signatureFileId);
      const fileName = file.getName();
      const fileSize = file.getSize();

      return {
        valid: true,
        message: "Signature valid",
        fileName: fileName,
        fileSize: fileSize,
        fileUrl: file.getUrl()
      };

    } catch (error) {
      return {
        valid: false,
        message: "File signature tidak ditemukan di Drive"
      };
    }

  } catch (error) {
    Logger.log("Verify signature error: " + error);
    return {
      valid: false,
      message: "Terjadi kesalahan saat verifikasi"
    };
  }
}

/**
 * Download signature (for export/print)
 */
function downloadSignature(fileId) {
  try {
    if (!fileId || fileId === "") {
      return null;
    }

    const file = DriveApp.getFileById(fileId);
    return {
      fileName: file.getName(),
      mimeType: file.getMimeType(),
      blob: file.getBlob()
    };

  } catch (error) {
    Logger.log("Download signature error: " + error);
    return null;
  }
}

/**
 * Delete signature
 */
function deleteSignature(fileId) {
  try {
    if (!fileId || fileId === "") {
      return {
        success: false,
        message: "File ID tidak valid"
      };
    }

    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    addLog("DELETE_SIGNATURE", { fileId: fileId }, "");

    return {
      success: true,
      message: "Signature berhasil dihapus"
    };

  } catch (error) {
    Logger.log("Delete signature error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus signature"
    };
  }
}

/**
 * Batch upload attachments
 */
function uploadAttachment(fileName, fileBlob, email, requestId) {
  try {
    // Validate file
    const fileValidation = validateFileUpload(fileName, fileBlob.getBytes().length);
    
    if (!fileValidation.valid) {
      return {
        success: false,
        message: "Validasi file gagal",
        errors: fileValidation.errors
      };
    }

    // Create folder for attachments
    const rootFolder = DriveApp.getRootFolder();
    let attachmentFolder;
    
    const folders = rootFolder.getFoldersByName("FRS_Attachments");
    if (folders.hasNext()) {
      attachmentFolder = folders.next();
    } else {
      attachmentFolder = rootFolder.createFolder("FRS_Attachments");
    }

    // Create request folder
    let requestFolder;
    const requestFolders = attachmentFolder.getFoldersByName(requestId);
    if (requestFolders.hasNext()) {
      requestFolder = requestFolders.next();
    } else {
      requestFolder = attachmentFolder.createFolder(requestId);
    }

    // Upload file
    fileBlob.setName(fileName);
    const file = requestFolder.createFile(fileBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const fileUrl = file.getUrl();

    addLog("UPLOAD_ATTACHMENT", { fileName: fileName, requestId: requestId }, email);

    return {
      success: true,
      message: "Attachment berhasil diupload",
      fileId: fileId,
      fileUrl: fileUrl,
      fileName: fileName
    };

  } catch (error) {
    Logger.log("Upload attachment error: " + error);
    return {
      success: false,
      message: "Terjadi kesalahan saat upload attachment"
    };
  }
}
