import React from "react";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileOutlined,
} from "@ant-design/icons";

interface FilePreviewProps {
  fileName?: string;
  fileUrl?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileName, fileUrl }) => {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  if (ext && imageExts.includes(ext) && fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={fileUrl}
          alt={fileName}
          style={{
            width: 32,
            height: 32,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        />
      </a>
    );
  }
  if (ext === "pdf") {
    return <FilePdfOutlined style={{ fontSize: 20, color: "#e74c3c" }} />;
  }
  if (["doc", "docx"].includes(ext || "")) {
    return <FileWordOutlined style={{ fontSize: 20, color: "#2980b9" }} />;
  }
  if (["xls", "xlsx"].includes(ext || "")) {
    return <FileExcelOutlined style={{ fontSize: 20, color: "#27ae60" }} />;
  }
  if (["ppt", "pptx"].includes(ext || "")) {
    return <FilePptOutlined style={{ fontSize: 20, color: "#e67e22" }} />;
  }
  return <FileOutlined style={{ fontSize: 20 }} />;
};

export default FilePreview;
