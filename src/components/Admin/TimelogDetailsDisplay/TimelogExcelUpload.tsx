import React, { useState } from "react";
import { Upload, Button, Modal, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { uploadTimelogsExcelApi, ExcelUploadResponseDTO } from "../../../api/timelogApi";

interface TimelogExcelUploadProps {
  projectLaborId: string;
  onSuccess: () => void;
  disabled?: boolean;
}

const TimelogExcelUpload: React.FC<TimelogExcelUploadProps> = ({
  projectLaborId,
  onSuccess,
  disabled,
}) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ExcelUploadResponseDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess: onUploadSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadTimelogsExcelApi(projectLaborId, file as File);
      setResult(res);
      setModalOpen(true);
      if (!res.failedImports || res.failedImports === 0) {
        notification.success({ message: "Tải lên thành công", description: res.message });
        onSuccess();
      } else {
        notification.warning({ message: "Có lỗi khi nhập file", description: res.message });
      }
      onUploadSuccess && onUploadSuccess("ok");
    } catch (err: any) {
      notification.error({ message: "Lỗi tải lên", description: err?.response?.data?.message || err.message });
      setResult(null);
      onError && onError(err);
    } finally {
      setUploading(false);
    }
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
        onCancel={() => setModalOpen(false)}
        footer={null}
        title="Kết quả nhập file Timelog"
      >
        {result && (
          <div>
            <p><b>{result.message}</b></p>
            <ul>
              <li>Tổng số dòng trong file: {result.totalRowsInFile}</li>
              <li>Nhập thành công: {result.successfulImports}</li>
              <li>Nhập thất bại: {result.failedImports}</li>
            </ul>
            {result.errorsDetails && result.errorsDetails.length > 0 && (
              <div style={{ color: "#ff4d4f" }}>
                <b>Chi tiết lỗi:</b>
                <ul>
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

export default TimelogExcelUpload; 