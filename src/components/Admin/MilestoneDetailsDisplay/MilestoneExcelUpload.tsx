import React, { useState } from "react";
import { Upload, Button, Modal, notification, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import axiosClient from "../../../api/axiosClient";

interface MilestoneExcelUploadProps {
  projectId: string;
  onSuccess: () => void;
  disabled?: boolean;
}

interface ExcelUploadMilestoneResponseDTO {
  successfulImports: number;
  failedImports: number;
  newRecordsCreated: number;
  existingRecordsUpdated: number;
  totalRowsInFile: number;
  message: string;
  errorsDetails?: string[];
}

const MilestoneExcelUpload: React.FC<MilestoneExcelUploadProps> = ({
  projectId,
  onSuccess,
  disabled,
}) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ExcelUploadMilestoneResponseDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess: onUploadSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file as Blob);
    setUploading(true);
    try {
      const res = await axiosClient.post<ExcelUploadMilestoneResponseDTO>(
        `/api/milestones/project-fixed-price/${projectId}/upload-excel`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
      setModalOpen(true);
      setShouldRefetch(res.data.successfulImports > 0);
      if (res.data.failedImports === 0) {
        notification.success({ message: "Upload successful", description: res.data.message });
      } else {
        notification.warning({ message: "Partial success", description: res.data.message });
      }
      onUploadSuccess && onUploadSuccess("ok");
    } catch (err: any) {
      // Nếu backend trả về dữ liệu chi tiết trong err.response.data
      const data = err?.response?.data;
      if (data && typeof data === "object" && (data.successfulImports !== undefined || data.failedImports !== undefined)) {
        setResult(data);
        setModalOpen(true);
        setShouldRefetch(data.successfulImports > 0);
        notification.warning({ message: "Partial success", description: data.message });
        onUploadSuccess && onUploadSuccess("ok");
      } else {
        notification.error({ message: "Upload failed", description: err?.response?.data?.message || err.message });
        setResult(null);
        setModalOpen(false);
        setShouldRefetch(false);
        onError && onError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (shouldRefetch) {
      onSuccess();
    }
    setResult(null);
    setShouldRefetch(false);
  };

  return (
    <>
      <Upload
        accept=".xlsx,.xls"
        showUploadList={false}
        customRequest={handleUpload}
        disabled={uploading || disabled}
      >
        <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading || disabled}>
          Upload Excel
        </Button>
      </Upload>
      <Modal
        open={modalOpen}
        onCancel={handleModalClose}
        footer={null}
        title="Milestone Excel Import Result"
      >
        {result && (
          <div>
            <p><b>{result.message}</b></p>
            <Table
              size="small"
              pagination={false}
              showHeader={false}
              bordered
              style={{ marginBottom: 16 }}
              dataSource={[
                { label: "Total rows in file", value: result.totalRowsInFile },
                { label: "Successfully imported", value: result.successfulImports },
                { label: "Failed imports", value: result.failedImports },
                { label: "New records created", value: result.newRecordsCreated },
                { label: "Existing records updated", value: result.existingRecordsUpdated },
              ]}
              columns={[
                { title: "", dataIndex: "label", key: "label", width: 180 },
                { title: "", dataIndex: "value", key: "value", width: 80 },
              ]}
            />
            {result.errorsDetails && result.errorsDetails.length > 0 && (
              <div style={{ color: "#ff4d4f" }}>
                <b>Error details:</b>
                <ul style={{ maxHeight: 120, overflow: "auto", paddingLeft: 18 }}>
                  {result.errorsDetails.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default MilestoneExcelUpload; 