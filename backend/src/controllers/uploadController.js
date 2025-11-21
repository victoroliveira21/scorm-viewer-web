import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { validateUploadedFile } from '../utils/securityValidator.js';
import { findManifest, parseManifest, validateScormPackage } from '../utils/manifestParser.js';
import { createSession } from '../utils/sessionManager.js';

const SESSIONS_DIR = path.join(process.env.UPLOAD_TEMP_DIR || './temp', 'sessions');

/**
 * Handle SCORM package upload
 * POST /api/upload
 */
export async function uploadScormPackage(req, res) {
  let extractDir = null;

  try {
    // 1. Validate file exists
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a SCORM ZIP file'
      });
    }

    console.log(`📦 Upload received: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    // 2. Security validation
    console.log('🔒 Validating file security...');
    const validation = validateUploadedFile(req.file);

    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.errors);
      return res.status(400).json({
        error: 'File validation failed',
        details: validation.errors,
        warnings: validation.warnings
      });
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠ Validation warnings:', validation.warnings);
    }

    // 3. Extract ZIP to temporary directory
    console.log('📂 Extracting ZIP file...');
    const sessionId = uuidv4();
    extractDir = path.join(SESSIONS_DIR, sessionId);

    await fs.mkdir(extractDir, { recursive: true });

    const zip = new AdmZip(req.file.buffer);
    zip.extractAllTo(extractDir, true);

    const extractedFiles = await fs.readdir(extractDir);
    console.log(`✓ Extracted ${extractedFiles.length} items`);

    // 4. Find and parse manifest
    console.log('📋 Parsing SCORM manifest...');
    const manifestXml = await findManifest(extractDir);
    const manifest = await parseManifest(manifestXml, extractDir);

    console.log(`✓ SCORM Package: ${manifest.title}`);
    console.log(`✓ Version: ${manifest.version}`);
    console.log(`✓ Entry Point: ${manifest.entryPoint}`);

    // 5. Validate SCORM package structure
    const packageValidation = await validateScormPackage(extractDir);

    if (!packageValidation.valid) {
      // Cleanup on validation failure
      await fs.rm(extractDir, { recursive: true, force: true });
      return res.status(400).json({
        error: 'Invalid SCORM package',
        details: packageValidation.errors,
        warnings: packageValidation.warnings
      });
    }

    // 6. Create session
    const session = createSession(extractDir, manifest);

    // 7. Return success response
    res.status(200).json({
      success: true,
      sessionId: session.id,
      manifest: {
        title: manifest.title,
        version: manifest.version,
        entryPoint: manifest.entryPoint,
        fileCount: manifest.files.length
      },
      expiresAt: new Date(session.expiresAt).toISOString(),
      warnings: validation.warnings.concat(packageValidation.warnings || [])
    });

    console.log(`✅ Upload successful - Session: ${session.id}`);

  } catch (error) {
    console.error('❌ Upload error:', error);

    // Cleanup on error
    if (extractDir) {
      try {
        await fs.rm(extractDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('⚠ Cleanup error:', cleanupError);
      }
    }

    // Return appropriate error response
    if (error.message.includes('not found')) {
      return res.status(400).json({
        error: 'Invalid SCORM package',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Upload processing failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
