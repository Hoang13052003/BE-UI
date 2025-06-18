import React, { useState } from "react";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload/interface";
import {
  uploadTimelogsExcelApi,
  ExcelUploadResponseDTO,
} from "../../../api/timelogApi";
import { useAlert } from "../../../contexts/AlertContext";
import "../FileDropUpload/FileDropUpload.css";

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
  width = "100%",
  height = "auto",
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const { addAlert, addBatchAlerts } = useAlert();

  const draggerProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      try {
        setUploading(true);
        onProgress?.({ percent: 30 });

        const response: ExcelUploadResponseDTO = await uploadTimelogsExcelApi(
          projectId,
          file as File
        );
        console.log("API Response in FileDropUpload:", response);
        onProgress?.({ percent: 100 });

        if (response.error) {
          addAlert(`Upload failed: ${response.error}`, "error");

          if (response.errorsDetails && response.errorsDetails.length > 0) {
            addBatchAlerts(
              response.errorsDetails.map((error) => ({
                message: error,
                type: "error",
              })),
              {
                maxDisplay: 3,
                interval: 300,
                summaryMessage: `And {count} more errors. Please check the console or server logs.`,
              }
            );
          }

          if (onError) onError(new Error(response.error));
          if (onUploadError) onUploadError();
          return;
        }

        if (
          response.totalRowsInFile === 0 &&
          response.successfulImports === 0
        ) {
          if (response.error) {
            addAlert(`Upload failed: ${response.error}`, "error");

            if (response.errorsDetails && response.errorsDetails.length > 0) {
              addBatchAlerts(
                response.errorsDetails.map((error) => ({
                  message: error,
                  type: "error",
                })),
                {
                  maxDisplay: 3,
                  interval: 300,
                  summaryMessage: `And {count} more errors. Please check the console or server logs.`,
                }
              );
            }

            if (onError) onError(new Error(response.error));
            if (onUploadError) onUploadError();
            return;
          } else {
            addAlert(
              response.message ||
                "The uploaded Excel file does not contain any valid data rows.",
              "warning"
            );

            if (response.errorsDetails && response.errorsDetails.length > 0) {
              addBatchAlerts(
                response.errorsDetails.map((error) => ({
                  message: error,
                  type: "error",
                })),
                {
                  maxDisplay: 3,
                  interval: 300,
                  summaryMessage: `And {count} more errors. Please check the console or server logs.`,
                }
              );
            }

            if (onSuccess) onSuccess(response, file as any);
            if (onUploadError) onUploadError();
            return;
          }
        }

        if (response.failedImports > 0) {
          addAlert(
            response.message ||
              `Imported ${response.successfulImports} of ${response.totalRowsInFile} time logs.`,
            "warning",
            `${response.failedImports} entries failed.`
          );

          if (response.errorsDetails && response.errorsDetails.length > 0) {
            addBatchAlerts(
              response.errorsDetails.map((error) => ({
                message: "Import error",
                type: "error",
                description: error,
              })),
              {
                maxDisplay: 3,
                interval: 300,
                summaryMessage: `And {count} more detailed errors. Check console or logs.`,
              }
            );
          }

          if (onSuccess) onSuccess(response, file as any);
          if (onUploadError) onUploadError();
        } else {
          addAlert(
            response.message ||
              `Successfully imported ${response.successfulImports} time logs.`,
            "success"
          );
          if (onSuccess) onSuccess(response, file as any);
          if (onUploadComplete) onUploadComplete();
        }
      } catch (error: any) {
        console.error("File upload error:", error);
        addAlert("Upload failed", "error", error.message || "Unknown error");
        if (onError) onError(error);
        if (onUploadError) onUploadError();
      } finally {
        setUploading(false);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <div className="custom-upload-container" style={{ width, height }}>
      <Upload.Dragger
        {...draggerProps}
        disabled={uploading}
        className="custom-uploader"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
      </Upload.Dragger>
    </div>
  );
};

export default FileDropUpload;
