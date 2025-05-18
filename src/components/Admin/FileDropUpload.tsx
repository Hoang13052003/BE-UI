import React, { useState } from 'react';
import { Upload, Alert, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { uploadTimelogsExcelApi, ExcelUploadResponseDTO } from '../../api/timelogApi';

interface FileDropUploadProps {
  projectId: number;
  onUploadComplete?: () => void;
  onUploadError?: () => void;
  width?: string | number;
  height?: string | number;
}

const FileDropUpload: React.FC<FileDropUploadProps> = ({
  projectId,
  onUploadComplete,
  onUploadError,
  width = '100%',
  height = 'auto',
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<{ message: string; description?: string; type: 'success' | 'info' | 'warning' | 'error'; key: number }[]>([]);

  // Function to add alerts
  const addAlert = (message: string, type: 'success' | 'info' | 'warning' | 'error', description?: string) => {
    const key = Date.now();
    setAlerts(prev => [...prev, { message, description, type, key }]);
    
    // Auto remove after some time based on type
    const duration = type === 'error' ? 7000 : type === 'warning' ? 6000 : 4000;
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.key !== key));
    }, duration);
  };

  // Function to remove an alert
  const removeAlert = (key: number) => {
    setAlerts(prev => prev.filter(alert => alert.key !== key));
  };

  const draggerProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      try {
        setUploading(true);
        onProgress?.({ percent: 30 }); // Simulate initial progress

        const response: ExcelUploadResponseDTO = await uploadTimelogsExcelApi(projectId, file as File);
        console.log('API Response in FileDropUpload:', response);
        onProgress?.({ percent: 100 }); // Simulate upload completion

        // Case 1: Explicit error field in API response
        if (response.error) {
          addAlert(`Upload failed: ${response.error}`, 'error');
          
          const errorsToShow = response.errorsDetails?.slice(0, 3) || [];
          if (errorsToShow.length > 0) {
            errorsToShow.forEach((detailError, index) => {
              setTimeout(() => {
                addAlert(detailError, 'error');
              }, 300 * (index + 1));
            });
            
            const totalErrors = response.errorsDetails?.length ?? 0;
            if (totalErrors > 3) {
              setTimeout(() => {
                addAlert(`And ${totalErrors - 3} more errors. Please check the console or server logs.`, 'info');
              }, 1200);
            }
          }
          if (onError) onError(new Error(response.error));
          if (onUploadError) onUploadError();
          return;
        }

        // Case 2: File was empty or contained no processable data rows
        if (response.totalRowsInFile === 0 && response.successfulImports === 0) {
          addAlert(
            response.message || 'The uploaded Excel file does not contain any valid data rows.',
            'warning'
          );
          if (onSuccess) onSuccess(response, file as any);
          return;
        }

        // Case 3: File processed, but there were failed imports
        if (response.failedImports > 0) {
          addAlert(
            response.message || `Imported ${response.successfulImports} of ${response.totalRowsInFile} time logs.`,
            'warning',
            `${response.failedImports} entries failed.`
          );
          
          if (response.errorsDetails && response.errorsDetails.length > 0) {
            const maxErrorsToShow = Math.min(3, response.errorsDetails.length);
            response.errorsDetails.slice(0, maxErrorsToShow).forEach((detailError, index) => {
              setTimeout(() => {
                addAlert('Import error', 'error', detailError);
              }, 300 * (index + 1));
            });
            
            const totalDetailedErrors = response.errorsDetails.length;
            if (totalDetailedErrors > maxErrorsToShow) {
              setTimeout(() => {
                addAlert(
                  `And ${totalDetailedErrors - maxErrorsToShow} more detailed errors.`,
                  'info',
                  'Check console or logs.'
                );
              }, 300 * (maxErrorsToShow + 1));
            }
          }
          if (onSuccess) onSuccess(response, file as any);
          if (onUploadError) onUploadError();
        } else {
          // Case 4: Full success
          addAlert(
            response.message || `Successfully imported ${response.successfulImports} time logs.`,
            'success'
          );
          if (onSuccess) onSuccess(response, file as any);
          if (onUploadComplete) onUploadComplete();
        }

      } catch (error: any) {
        console.error('File upload error:', error);
        addAlert('Upload failed', 'error', error.message || 'Unknown error');
        if (onError) onError(error);
        if (onUploadError) onUploadError();
      } finally {
        setUploading(false);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <>
      {alerts.length > 0 && (
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          {alerts.map(alert => (
            <Alert
              key={alert.key}
              message={alert.message}
              description={alert.description}
              type={alert.type}
              showIcon
              closable
              onClose={() => removeAlert(alert.key)}
            />
          ))}
        </Space>
      )}
      
      <Upload.Dragger
        {...draggerProps}
        disabled={uploading}
        style={{
          width: width,
          height: height,
          minHeight: '90px',
          maxHeight: '120px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px dashed #d9d9d9',
          padding: '12px 10px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <p className="ant-upload-drag-icon" style={{ marginTop: '2px', marginBottom: '6px' }}>
          <InboxOutlined />
        </p>
        <p className="ant-upload-text" style={{ fontSize: '14px', marginBottom: '4px' }}>
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint" style={{ fontSize: '12px' }}>
          Support for a single .xlsx or .xls file.
        </p>
      </Upload.Dragger>
    </>
  );
};

export default FileDropUpload;