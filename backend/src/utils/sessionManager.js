import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// In-memory session store
// In production, this would be Redis or similar
const sessions = new Map();

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 5 * 60 * 1000; // 5 minutes
const SESSIONS_DIR = path.join(process.env.UPLOAD_TEMP_DIR || './temp', 'sessions');

/**
 * Create a new session
 * @param {string} extractedDir - Path to extracted SCORM directory
 * @param {object} manifest - Parsed manifest object
 * @returns {object} Session object
 */
export function createSession(extractedDir, manifest) {
  const sessionId = uuidv4();
  const now = Date.now();
  const expiresAt = now + SESSION_TIMEOUT;

  const session = {
    id: sessionId,
    directory: extractedDir,
    manifest: manifest,
    createdAt: now,
    expiresAt: expiresAt,
    lastAccessed: now
  };

  sessions.set(sessionId, session);

  // Schedule cleanup
  setTimeout(() => {
    cleanupSession(sessionId);
  }, SESSION_TIMEOUT);

  console.log(`✓ Session created: ${sessionId} (expires in ${SESSION_TIMEOUT / 1000 / 60} min)`);

  return session;
}

/**
 * Get a session by ID
 * @param {string} sessionId - Session ID
 * @returns {object|null} Session object or null if not found/expired
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Check if expired
  if (session.expiresAt < Date.now()) {
    cleanupSession(sessionId);
    return null;
  }

  // Update last accessed time
  session.lastAccessed = Date.now();

  return session;
}

/**
 * Delete a session and cleanup files
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function cleanupSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  try {
    // Delete files
    await fs.rm(session.directory, { recursive: true, force: true });
    console.log(`✓ Cleaned up session files: ${sessionId}`);
  } catch (error) {
    console.error(`⚠ Error cleaning up session ${sessionId}:`, error.message);
  }

  // Remove from memory
  sessions.delete(sessionId);
  console.log(`✓ Session removed from memory: ${sessionId}`);

  return true;
}

/**
 * Cleanup all expired sessions
 */
export async function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      await cleanupSession(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`✓ Cleaned up ${cleaned} expired session(s)`);
  }

  return cleaned;
}

/**
 * Start automatic session cleanup service
 */
export function startSessionCleanup() {
  console.log(`✓ Session cleanup service started (interval: ${CLEANUP_INTERVAL / 1000 / 60} min)`);

  setInterval(async () => {
    await cleanupExpiredSessions();
  }, CLEANUP_INTERVAL);

  // Cleanup on process termination
  process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, cleaning up all sessions...');
    for (const sessionId of sessions.keys()) {
      await cleanupSession(sessionId);
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, cleaning up all sessions...');
    for (const sessionId of sessions.keys()) {
      await cleanupSession(sessionId);
    }
    process.exit(0);
  });
}

/**
 * Get session statistics
 * @returns {object} Session stats
 */
export function getSessionStats() {
  return {
    total: sessions.size,
    sessions: Array.from(sessions.values()).map(s => ({
      id: s.id,
      createdAt: new Date(s.createdAt).toISOString(),
      expiresAt: new Date(s.expiresAt).toISOString(),
      lastAccessed: new Date(s.lastAccessed).toISOString(),
      title: s.manifest.title
    }))
  };
}
