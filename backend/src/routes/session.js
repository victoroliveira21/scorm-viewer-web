import express from 'express';
import {
  getManifest,
  serveFile,
  getViewer,
  deleteSession
} from '../controllers/sessionController.js';

const router = express.Router();

// GET /api/sessions/:sessionId/manifest
router.get('/:sessionId/manifest', getManifest);

// GET /api/sessions/:sessionId/viewer
router.get('/:sessionId/viewer', getViewer);

// GET /api/sessions/:sessionId/files/*
router.get('/:sessionId/files/*', serveFile);

// DELETE /api/sessions/:sessionId
router.delete('/:sessionId', deleteSession);

export default router;
