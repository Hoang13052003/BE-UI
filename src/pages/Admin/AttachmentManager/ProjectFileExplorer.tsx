import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import attachmentApi from "../../../api/attachmentApi";
import { TreeNodeDto } from "../../../types/Attachment";
import FileRow from "./FileRow";
import { useAuth } from "../../../contexts/AuthContext";

interface ProjectFileExplorerProps {
  projectId: string;
  projectType: string;
}

const ProjectFileExplorer: React.FC<ProjectFileExplorerProps> = ({
  projectId,
  projectType,
}) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    const fetchNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedNodes: TreeNodeDto[];
        if (!currentPath || currentPath === "/") {
          fetchedNodes = await attachmentApi.getCurrentProjectTreeRoot(
            projectId
          );
        } else {
          fetchedNodes = await attachmentApi.getCurrentProjectTreeByPath(
            projectId,
            currentPath
          );
        }
        setNodes(fetchedNodes);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch tree data"
        );
        setNodes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchNodes();
    }
  }, [projectId, currentPath]);

  const handleNodeClick = (node: TreeNodeDto) => {
    if (node.type === "directory") {
      setCurrentPath(node.path);
    } else if (node.type === "file" && node.attachmentId) {
      handleViewFile(node.attachmentId, node.name, node.fileType);
    }
  };

  const handleViewFile = async (
    attachmentId: number,
    fileName: string,
    fileType: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        `Viewing file: ID=${attachmentId}, Name=${fileName}, Type=${fileType}`
      );
      const response = await attachmentApi.getPresignedUrl(
        attachmentId,
        "inline"
      );
      window.open(response.url, "_blank");
    } catch (err: any) {
      setError(
        "Failed to get file URL: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateUp = () => {
    if (!currentPath || currentPath === "/") return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleViewHistory = () => {
    const basePath = userRole === 'ADMIN' ? '/admin' : '/manager';
    navigate(`${basePath}/projects/${projectType}/${projectId}/history`);
  };

  if (isLoading && nodes.length === 0) return <p>Loading tree...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          paddingBottom: "10px",
          borderBottom: "1px solid #e1e4e8",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>
          <span
            style={{ cursor: "pointer", color: "#0366d6" }}
            onClick={() => setCurrentPath("")}
          >
            Root
          </span>{" "}
          /{" "}
          {currentPath
            .split("/")
            .filter((p) => p)
            .join(" / ")}
        </h3>
        <button
          onClick={handleViewHistory}
          style={{
            padding: "6px 12px",
            fontSize: "13px",
            backgroundColor: "#fafbfc",
            border: "1px solid rgba(27,31,35,.2)",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          View Project Update History
        </button>
      </div>

      {currentPath && currentPath !== "/" && (
        <button
          onClick={navigateUp}
          style={{
            marginBottom: "10px",
            padding: "5px 10px",
            fontSize: "13px",
            backgroundColor: "#fafbfc",
            border: "1px solid rgba(27,31,35,.2)",
            borderRadius: "6px",
          }}
        >
          .. (Up one level)
        </button>
      )}

      {isLoading && nodes.length > 0 && (
        <p style={{ padding: "10px 8px", color: "#586069" }}>
          Loading path content...
        </p>
      )}

      <ul
        style={{
          listStyleType: "none",
          paddingLeft: 0,
          border: "1px solid #e1e4e8",
          borderRadius: "6px",
          marginTop: "10px",
        }}
      >
        {
          <li
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 8px",
              backgroundColor: "#f6f8fa",
              fontWeight: 600,
              fontSize: "13px",
              borderBottom: "1px solid #e1e4e8",
            }}
          >
            <span style={{ flexGrow: 1, marginLeft: "32px" }}>Name</span>
            {nodes.some((n) => n.type === "file") && (
              <>
                <span
                  style={{
                    width: "100px",
                    textAlign: "right",
                    marginRight: "20px",
                  }}
                >
                  Size
                </span>
                <span style={{ width: "150px", marginRight: "10px" }}>
                  Type
                </span>
                <span style={{ width: "170px", textAlign: "right" }}>
                  Last Modified
                </span>
              </>
            )}
          </li>
        }
        {nodes.map((node) => (
          <FileRow
            key={node.path + "-" + node.type}
            node={node}
            onNodeClick={handleNodeClick}
          />
        ))}
        {nodes.length === 0 && !isLoading && (
          <li
            style={{
              padding: "20px 8px",
              textAlign: "center",
              color: "#586069",
            }}
          >
            No files or folders found in this path.
          </li>
        )}
      </ul>
      {error && !isLoading && (
        <p style={{ color: "red", marginTop: "10px" }}>
          Failed to load data: {error}
        </p>
      )}
    </div>
  );
};

export default ProjectFileExplorer;
