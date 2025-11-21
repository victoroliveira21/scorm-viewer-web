import AdmZip from 'adm-zip';

// Security constants
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024; // 500MB
const MAX_DECOMPRESSION_RATIO = 100; // Max ratio of uncompressed/compressed size
const BLOCKED_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.com', '.sh',
  '.ps1', '.vbs', '.jar', '.app', '.deb',
  '.rpm', '.dmg', '.pkg', '.msi', '.scr'
  // Note: .js is allowed as SCORM packages require JavaScript to function
  // JavaScript files run in browser sandbox, not on server
];

/**
 * Validate ZIP file magic bytes
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} True if valid ZIP
 */
export function validateZipMagicBytes(buffer) {
  // ZIP magic bytes: 50 4B 03 04 or 50 4B 05 06 or 50 4B 07 08
  if (buffer.length < 4) {
    return false;
  }

  const magicBytes = buffer.slice(0, 4);
  const validSignatures = [
    [0x50, 0x4B, 0x03, 0x04], // Standard ZIP
    [0x50, 0x4B, 0x05, 0x06], // Empty archive
    [0x50, 0x4B, 0x07, 0x08]  // Spanned archive
  ];

  return validSignatures.some(signature =>
    signature.every((byte, index) => byte === magicBytes[index])
  );
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {object} Validation result
 */
export function validateFileSize(size) {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    };
  }

  return { valid: true };
}

/**
 * Check if file extension is blocked
 * @param {string} filename - File name
 * @returns {boolean} True if blocked
 */
function isBlockedExtension(filename) {
  const lowerName = filename.toLowerCase();
  return BLOCKED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

/**
 * Normalize path to prevent directory traversal
 * @param {string} filePath - File path
 * @returns {string} Normalized path
 */
function normalizePath(filePath) {
  // Remove leading slashes and dots
  return filePath.replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
}

/**
 * Validate ZIP contents for security threats
 * @param {Buffer} buffer - ZIP file buffer
 * @returns {object} Validation result
 */
export function validateZipContents(buffer) {
  const errors = [];
  const warnings = [];

  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      errors.push('ZIP file is empty');
      return { valid: false, errors, warnings };
    }

    let totalUncompressedSize = 0;
    let totalCompressedSize = 0;

    for (const entry of entries) {
      const entryName = entry.entryName;

      // Check for directory traversal
      const normalized = normalizePath(entryName);
      if (normalized !== entryName) {
        errors.push(`Suspicious path detected: ${entryName}`);
      }

      // Check for blocked extensions
      if (isBlockedExtension(entryName)) {
        errors.push(`Prohibited file type: ${entryName}`);
      }

      // Check for hidden/system files (optional warning)
      if (entryName.startsWith('.') || entryName.includes('/__MACOSX/')) {
        warnings.push(`Hidden/system file: ${entryName}`);
      }

      // Accumulate sizes for zip bomb detection
      if (!entry.isDirectory) {
        totalUncompressedSize += entry.header.size;
        totalCompressedSize += entry.header.compressedSize;
      }
    }

    // Zip bomb detection
    if (totalCompressedSize > 0) {
      const decompressionRatio = totalUncompressedSize / totalCompressedSize;
      if (decompressionRatio > MAX_DECOMPRESSION_RATIO) {
        errors.push(
          `Suspicious compression ratio (${decompressionRatio.toFixed(2)}:1). Possible zip bomb.`
        );
      }
    }

    // Check total uncompressed size
    const maxUncompressedSize = MAX_FILE_SIZE * 5; // Allow 5x expansion
    if (totalUncompressedSize > maxUncompressedSize) {
      errors.push(
        `Uncompressed size too large: ${(totalUncompressedSize / 1024 / 1024).toFixed(2)}MB`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        files: entries.filter(e => !e.isDirectory).length,
        directories: entries.filter(e => e.isDirectory).length,
        totalCompressedSize,
        totalUncompressedSize,
        compressionRatio: totalCompressedSize > 0
          ? (totalUncompressedSize / totalCompressedSize).toFixed(2)
          : 'N/A'
      }
    };
  } catch (error) {
    errors.push(`ZIP validation error: ${error.message}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * Complete file validation pipeline
 * @param {object} file - Multer file object
 * @returns {object} Validation result
 */
export function validateUploadedFile(file) {
  const errors = [];
  const warnings = [];

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors, warnings };
  }

  // Check MIME type (client-provided, not reliable alone)
  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream'
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    warnings.push(`Unexpected MIME type: ${file.mimetype}`);
  }

  // Check file extension
  if (!file.originalname.toLowerCase().endsWith('.zip')) {
    errors.push('File must be a ZIP archive');
  }

  // Validate size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  // Validate magic bytes (most reliable check)
  if (file.buffer) {
    if (!validateZipMagicBytes(file.buffer)) {
      errors.push('Invalid ZIP file (magic bytes check failed)');
    } else {
      // Validate ZIP contents
      const contentsValidation = validateZipContents(file.buffer);
      errors.push(...contentsValidation.errors);
      warnings.push(...contentsValidation.warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
