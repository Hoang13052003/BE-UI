// src/hooks/useAttachmentUpload.ts
import { useState } from 'react';
import { message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import {
  uploadSingleAttachment,
  uploadFolderAttachments,
  FolderFileItem
} from '../api/attachmentApi';
import { AttachmentResponseDto } from '../types/Attachment';
interface UseAttachmentUploadProps {
  onUploadProgress?: (file: UploadFile | FolderFileItem, percent: number) => void;
  onUploadSuccess?: (item: UploadFile | FolderFileItem, response: AttachmentResponseDto) => void;
  onUploadError?: (item: UploadFile | FolderFileItem, error: any) => void;
}

interface UploadResult {
  successfulUploads: AttachmentResponseDto[];
  failedUploads: { itemName: string; reason: string }[]; // Đổi fileName thành itemName cho tổng quát
}

export const useAttachmentUpload = (props?: UseAttachmentUploadProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadFilesIndividually = async (
    projectUpdateId: number,
    antdFileList: UploadFile[]
  ): Promise<UploadResult> => {
    if (!antdFileList || antdFileList.length === 0) {
      return { successfulUploads: [], failedUploads: [] };
    }

    setIsUploading(true);
    message.info(`Uploading ${antdFileList.length} attachment(s) individually...`, 2);

    const successfulUploads: AttachmentResponseDto[] = [];
    const failedUploads: { itemName: string; reason: string }[] = [];

    const uploadPromises = antdFileList.map(async (antdFile) => {
      if (antdFile.originFileObj) {
        const fileToUpload = antdFile.originFileObj as File;
        const logicalName = antdFile.name;

        try {
          const response = await uploadSingleAttachment(fileToUpload, projectUpdateId, logicalName);
          props?.onUploadSuccess?.(antdFile, response);
          return { status: 'fulfilled', value: response, itemName: antdFile.name } as const;
        } catch (error: any) {
          props?.onUploadError?.(antdFile, error);
          const errorMessage = error?.response?.data?.message || error.message || "Upload failed";
          return { status: 'rejected', reason: errorMessage, itemName: antdFile.name } as const;
        }
      }
      return { status: 'skipped', itemName: antdFile.name } as const;
    });

    const results = await Promise.allSettled(uploadPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const innerResult = result.value;
        if (innerResult.status === 'fulfilled' && innerResult.value) {
          successfulUploads.push(innerResult.value);
        } else if (innerResult.status === 'rejected') {
          failedUploads.push({ itemName: innerResult.itemName, reason: innerResult.reason });
        }
      } else {
        console.error("Unexpected error in Promise.allSettled for individual file uploads:", result.reason);
      }
    });

    if (failedUploads.length > 0) {
      message.error(`${failedUploads.length} file(s) failed to upload.`, 5);
      failedUploads.forEach(fail => console.error(`Upload failed for ${fail.itemName}: ${fail.reason}`));
    }
    if (successfulUploads.length > 0 && failedUploads.length === 0) {
      message.success(`${successfulUploads.length} attachment(s) uploaded successfully.`, 3);
    } else if (successfulUploads.length > 0 && failedUploads.length > 0) {
      message.warning(`Partially successful: ${successfulUploads.length} uploaded, ${failedUploads.length} failed.`, 4);
    }

    setIsUploading(false);
    return { successfulUploads, failedUploads };
  };

  const uploadFolderContents = async (
    projectUpdateId: number,
    itemsToUpload: FolderFileItem[]
  ): Promise<UploadResult> => {
    if (!itemsToUpload || itemsToUpload.length === 0) {
      return { successfulUploads: [], failedUploads: [] };
    }

    setIsUploading(true);
    message.info(`Uploading folder contents (${itemsToUpload.length} file(s)) as a single batch...`, 2);

    try {
      const response = await uploadFolderAttachments(itemsToUpload, projectUpdateId);

      // Trích xuất successfulUploads và uploadErrors từ response
      const successfulUploads: AttachmentResponseDto[] = response.successfulUploads;
      const failedUploads: { itemName: string; reason: string }[] = response.uploadErrors.map(error => ({
        itemName: error.logicalName || error.originalFilename || error.fileKey || 'Unknown file',
        reason: error.error
      }));

      if (failedUploads.length > 0) {
        message.error(`${failedUploads.length} file(s) from folder failed to upload.`, 5);
        failedUploads.forEach(fail => console.error(`Folder upload failed for ${fail.itemName}: ${fail.reason}`));
      }
      if (successfulUploads.length > 0 && failedUploads.length === 0) {
        message.success(`${successfulUploads.length} file(s) from folder uploaded successfully.`, 3);
      } else if (successfulUploads.length > 0 && failedUploads.length > 0) {
        message.warning(`Partially successful: ${successfulUploads.length} uploaded, ${failedUploads.length} failed.`, 4);
      }

      // Gọi callback cho từng file thành công
      successfulUploads.forEach(attachment => {
        const correspondingItem = itemsToUpload.find(item => 
          item.relativePath === attachment.logicalName || 
          item.file.name === attachment.fileName
        );
        if (correspondingItem) {
          props?.onUploadSuccess?.(correspondingItem, attachment);
        }
      });

      // Gọi callback cho từng file thất bại
      response.uploadErrors.forEach(error => {
        const correspondingItem = itemsToUpload.find(item => 
          item.relativePath === error.logicalName || 
          item.file.name === error.originalFilename
        );
        if (correspondingItem) {
          props?.onUploadError?.(correspondingItem, new Error(error.error));
        }
      });

      setIsUploading(false);
      return { successfulUploads, failedUploads };

    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || "Failed to upload folder contents.";
      message.error(errorMsg);
      setIsUploading(false);
      return { 
        successfulUploads: [], 
        failedUploads: itemsToUpload.map(item => ({ 
          itemName: item.relativePath, 
          reason: "Processing error" 
        })) 
      };
    }
  };


  return {
    isUploading,
    uploadFilesIndividually, // Dùng cho trường hợp Dragger chỉ chọn file đơn lẻ
    uploadFolderContents,   // Dùng nếu bạn có cách lấy FolderFileItem[] (file + relativePath)
  };
};