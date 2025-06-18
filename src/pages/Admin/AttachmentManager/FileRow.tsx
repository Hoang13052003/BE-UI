import React from "react";
import { TreeNodeDto } from "../../../types/Attachment";

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

interface FileRowProps {
  node: TreeNodeDto;
  onNodeClick: (node: TreeNodeDto) => void;
}

const FileRow: React.FC<FileRowProps> = ({ node, onNodeClick }) => {
  const getIcon = () => {
    if (node.type === "directory") return "📁";
    return "📄";
  };

  const formatSize = (sizeInBytes: number | null): string => {
    if (sizeInBytes === null || sizeInBytes === undefined) return "";
    if (sizeInBytes / (1024 * 1024) < 0.01) {
      if (sizeInBytes / 1024 < 0.1 && sizeInBytes > 0) return "< 0.1 KB";
      return (sizeInBytes / 1024).toFixed(1) + " KB";
    }
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <li
      onClick={() => onNodeClick(node)}
      style={{
        cursor: "pointer",
        padding: "10px 8px",
        borderBottom: "1px solid #e1e4e8",
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
      }}
      title={node.type === "file" ? `View ${node.name}` : `Open ${node.name}`}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f6f8fa")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <span style={{ marginRight: "12px", width: "20px", textAlign: "center" }}>
        {getIcon()}
      </span>
      <span style={{ flexGrow: 1, color: "#0366d6" }}>{node.name}</span>
      {node.type === "file" && (
        <>
          <span
            style={{
              width: "100px",
              textAlign: "right",
              marginRight: "20px",
              color: "#586069",
              fontSize: "12px",
            }}
          >
            {formatSize(node.size)}
          </span>
          <span
            style={{
              width: "150px",
              color: "#586069",
              fontSize: "12px",
              whiteSpace: "nowrap",
              marginRight: "10px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.fileType || "unknown"}
          </span>
          <span
            style={{
              width: "170px",
              color: "#586069",
              fontSize: "12px",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            {node.lastModified ? formatDate(node.lastModified) : ""}
          </span>
        </>
      )}
    </li>
  );
};

export default FileRow;
