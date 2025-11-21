import fs from 'fs/promises';
import path from 'path';
import { getSession, cleanupSession } from '../utils/sessionManager.js';

// MIME type mapping (ported from app.js)
const MIME_TYPES = {
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'ogv': 'video/ogg',
  'pdf': 'application/pdf',
  'xml': 'application/xml',
  'txt': 'text/plain',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'eot': 'application/vnd.ms-fontobject',
  'swf': 'application/x-shockwave-flash'
};

function getMimeType(filename) {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Get manifest metadata
 * GET /api/sessions/:sessionId/manifest
 */
export async function getManifest(req, res) {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired'
      });
    }

    res.json({
      sessionId: session.id,
      manifest: session.manifest,
      expiresAt: new Date(session.expiresAt).toISOString(),
      createdAt: new Date(session.createdAt).toISOString()
    });
  } catch (error) {
    console.error('Error getting manifest:', error);
    res.status(500).json({
      error: 'Failed to retrieve manifest'
    });
  }
}

/**
 * Serve SCORM package files
 * GET /api/sessions/:sessionId/files/*
 */
export async function serveFile(req, res) {
  try {
    const { sessionId } = req.params;
    const filePath = req.params[0]; // Everything after /files/

    // Validate session
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired'
      });
    }

    // Prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(session.directory, safePath);

    // Ensure path is within session directory
    if (!fullPath.startsWith(session.directory)) {
      console.warn(`⚠ Directory traversal attempt: ${filePath}`);
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Check file exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      return res.status(404).json({
        error: 'File not found',
        file: safePath
      });
    }

    // Set appropriate headers
    const mimeType = getMimeType(safePath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream file
    const fileStream = await fs.readFile(fullPath);
    res.send(fileStream);

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      error: 'Failed to serve file'
    });
  }
}

/**
 * Get viewer HTML with SCORM API
 * GET /api/sessions/:sessionId/viewer
 * Ported from viewer.html
 */
export async function getViewer(req, res) {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired'
      });
    }

    const { entryPoint, title } = session.manifest;

    // Generate viewer HTML with SCORM API (from viewer.html)
    const viewerHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'SCORM Viewer'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body, html {
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        #scorm-frame {
            width: 100%;
            height: 100%;
            border: none;
        }

        .loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            z-index: 9999;
        }

        .loading.hidden {
            display: none;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 15px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <span>Carregando SCORM...</span>
    </div>

    <iframe id="scorm-frame" title="${title || 'SCORM Content'}"></iframe>

    <script>
        // ========================================
        // SCORM 1.2 API Mock
        // ========================================
        var API = {
            LMSInitialize: function(param) {
                console.log('[SCORM API] LMSInitialize called');
                return "true";
            },

            LMSFinish: function(param) {
                console.log('[SCORM API] LMSFinish called');
                return "true";
            },

            LMSGetValue: function(element) {
                console.log('[SCORM API] LMSGetValue:', element);

                var values = {
                    "cmi.core.lesson_status": "not attempted",
                    "cmi.core.student_id": "${sessionId}",
                    "cmi.core.student_name": "SCORM Viewer",
                    "cmi.core.lesson_location": "",
                    "cmi.suspend_data": "",
                    "cmi.launch_data": "",
                    "cmi.core.lesson_mode": "normal",
                    "cmi.core.exit": "",
                    "cmi.core.entry": "ab-initio",
                    "cmi.core.score.raw": "",
                    "cmi.core.score.max": "",
                    "cmi.core.score.min": "",
                    "cmi.core.total_time": "0000:00:00.00",
                    "cmi.core.session_time": "0000:00:00.00"
                };

                return values[element] || "";
            },

            LMSSetValue: function(element, value) {
                console.log('[SCORM API] LMSSetValue:', element, '=', value);
                return "true";
            },

            LMSCommit: function(param) {
                console.log('[SCORM API] LMSCommit called');
                return "true";
            },

            LMSGetLastError: function() {
                return "0";
            },

            LMSGetErrorString: function(errorCode) {
                return "No error";
            },

            LMSGetDiagnostic: function(errorCode) {
                return "No error";
            }
        };

        // ========================================
        // SCORM 2004 API Mock
        // ========================================
        var API_1484_11 = {
            Initialize: function(param) {
                console.log('[SCORM 2004 API] Initialize called');
                return "true";
            },

            Terminate: function(param) {
                console.log('[SCORM 2004 API] Terminate called');
                return "true";
            },

            GetValue: function(element) {
                console.log('[SCORM 2004 API] GetValue:', element);

                var values = {
                    "cmi.completion_status": "not attempted",
                    "cmi.learner_id": "${sessionId}",
                    "cmi.learner_name": "SCORM Viewer",
                    "cmi.location": "",
                    "cmi.suspend_data": "",
                    "cmi.launch_data": "",
                    "cmi.mode": "normal",
                    "cmi.exit": "",
                    "cmi.entry": "ab-initio",
                    "cmi.score.raw": "",
                    "cmi.score.max": "",
                    "cmi.score.min": "",
                    "cmi.score.scaled": "",
                    "cmi.total_time": "PT0H0M0S",
                    "cmi.session_time": "PT0H0M0S",
                    "cmi.success_status": "unknown"
                };

                return values[element] || "";
            },

            SetValue: function(element, value) {
                console.log('[SCORM 2004 API] SetValue:', element, '=', value);
                return "true";
            },

            Commit: function(param) {
                console.log('[SCORM 2004 API] Commit called');
                return "true";
            },

            GetLastError: function() {
                return "0";
            },

            GetErrorString: function(errorCode) {
                return "No error";
            },

            GetDiagnostic: function(errorCode) {
                return "No error";
            }
        };

        // Disponibiliza as APIs globalmente
        window.API = API;
        window.API_1484_11 = API_1484_11;

        // Funções auxiliares para compatibilidade
        window.WriteToDebug = function(msg) {
            console.log('[SCORM Debug]', msg);
        };

        // ========================================
        // Carrega o SCORM
        // ========================================

        const frame = document.getElementById('scorm-frame');
        const loading = document.getElementById('loading');

        // Load SCORM content
        frame.src = '/api/sessions/${sessionId}/files/${entryPoint}';

        // Remove loading when loaded
        frame.onload = function() {
            setTimeout(() => {
                loading.classList.add('hidden');
            }, 500);
        };

        // Log for debug
        console.log('%c[SCORM Viewer] API SCORM Mock carregada com sucesso!', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        console.log('[SCORM Viewer] Session ID:', '${sessionId}');
        console.log('[SCORM Viewer] Entry Point:', '${entryPoint}');
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(viewerHtml);

  } catch (error) {
    console.error('Error generating viewer:', error);
    res.status(500).json({
      error: 'Failed to generate viewer'
    });
  }
}

/**
 * Delete session manually
 * DELETE /api/sessions/:sessionId
 */
export async function deleteSession(req, res) {
  try {
    const { sessionId } = req.params;
    const deleted = await cleanupSession(sessionId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session'
    });
  }
}
