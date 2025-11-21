import axios, { AxiosProgressEvent } from 'axios';

// Use environment variable for API URL in production, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export interface UploadResponse {
  success: boolean;
  sessionId: string;
  manifest: {
    title: string;
    entryPoint: string;
    version: string;
  };
  message: string;
}

export interface ManifestResponse {
  title: string;
  entryPoint: string;
  version: string;
  files: string[];
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Upload a SCORM package file
 */
export async function uploadScormPackage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('scormPackage', file);

  const response = await axios.post<UploadResponse>(
    `${API_BASE_URL}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data;
}

/**
 * Get manifest information for a session
 */
export async function getManifest(sessionId: string): Promise<ManifestResponse> {
  const response = await axios.get<ManifestResponse>(
    `${API_BASE_URL}/sessions/${sessionId}/manifest`
  );
  return response.data;
}

/**
 * Get the viewer URL for a session
 */
export function getViewerUrl(sessionId: string): string {
  return `${API_BASE_URL}/sessions/${sessionId}/viewer`;
}

/**
 * Delete a session and its files
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const response = await axios.get<{ status: string; version: string }>(
    `${API_BASE_URL}/health`
  );
  return response.data;
}
