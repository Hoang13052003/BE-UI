import { useState } from 'react';
import { getAttachmentDownloadUrl } from '../api/feedbackApi';
import { useAlert } from '../contexts/AlertContext';

interface UseAttachmentDownloadReturn {
  downloadAttachment: (feedbackId: string, attachmentIndex: number, fileName: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for downloading feedback attachments
 * Handles the new API flow: get download URL then download file
 */
export const useAttachmentDownload = (): UseAttachmentDownloadReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAlert } = useAlert();

  const downloadAttachment = async (
    feedbackId: string,
    attachmentIndex: number,
    fileName: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get fresh presigned URL
      const { url } = await getAttachmentDownloadUrl(feedbackId, attachmentIndex);

      // Step 2: Download file using the URL
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addAlert('File download started successfully', 'success');

    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Show appropriate error message to user
      if (err.response?.status === 401) {
        addAlert('Session expired. Please login again.', 'error');
        // Optionally redirect to login
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        addAlert('You do not have permission to access this file.', 'error');
      } else if (err.response?.status === 404) {
        addAlert('File not found or has been deleted.', 'error');
      } else if (err.response?.status === 400) {
        addAlert('Invalid file request. Please try again.', 'error');
      } else {
        addAlert('Failed to download file. Please try again.', 'error');
      }
      
      console.error('Download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { downloadAttachment, loading, error };
};

/**
 * Extract error message from different error types
 */
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
}; 