import React, { useState } from 'react';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { uploadTimelogsExcelApi, ExcelUploadResponseDTO } from '../../api/timelogApi';
import { useAlert } from '../../contexts/AlertContext';

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
  // Lấy thêm addBatchAlerts từ context
  const { addAlert, addBatchAlerts } = useAlert();

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
          
          // Sử dụng addBatchAlerts thay vì setTimeout nhiều lần
          if (response.errorsDetails && response.errorsDetails.length > 0) {
            addBatchAlerts(
              response.errorsDetails.map(error => ({
                message: error, 
                type: 'error'
              })),
              {
                maxDisplay: 3,
                interval: 300,
                summaryMessage: `And {count} more errors. Please check the console or server logs.`
              }
            );
          }
          
          if (onError) onError(new Error(response.error));
          if (onUploadError) onUploadError();
          return;
        }

        // Case 2: File was empty or contained no processable data rows
        if (response.totalRowsInFile === 0 && response.successfulImports === 0) {
          // Show error if present, otherwise show warning
          if (response.error) {
            addAlert(`Upload failed: ${response.error}`, 'error');
            
            // Sử dụng addBatchAlerts
            if (response.errorsDetails && response.errorsDetails.length > 0) {
              addBatchAlerts(
                response.errorsDetails.map(error => ({
                  message: error, 
                  type: 'error'
                })),
                {
                  maxDisplay: 3,
                  interval: 300,
                  summaryMessage: `And {count} more errors. Please check the console or server logs.`
                }
              );
            }
            
            if (onError) onError(new Error(response.error));
            if (onUploadError) onUploadError();
            return;
          } else {
            addAlert(
              response.message || 'The uploaded Excel file does not contain any valid data rows.',
              'warning'
            );
            
            // Sử dụng addBatchAlerts
            if (response.errorsDetails && response.errorsDetails.length > 0) {
              addBatchAlerts(
                response.errorsDetails.map(error => ({
                  message: error, 
                  type: 'error'
                })),
                {
                  maxDisplay: 3,
                  interval: 300,
                  summaryMessage: `And {count} more errors. Please check the console or server logs.`
                }
              );
            }
            
            if (onSuccess) onSuccess(response, file as any);
            if (onUploadError) onUploadError();
            return;
          }
        }

        // Case 3: File processed, but there were failed imports
        if (response.failedImports > 0) {
          addAlert(
            response.message || `Imported ${response.successfulImports} of ${response.totalRowsInFile} time logs.`,
            'warning',
            `${response.failedImports} entries failed.`
          );
          
          // Sử dụng addBatchAlerts
          if (response.errorsDetails && response.errorsDetails.length > 0) {
            addBatchAlerts(
              response.errorsDetails.map(error => ({
                message: 'Import error',
                type: 'error',
                description: error
              })),
              {
                maxDisplay: 3,
                interval: 300,
                summaryMessage: `And {count} more detailed errors. Check console or logs.`
              }
            );
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
  );
};

export default FileDropUpload;