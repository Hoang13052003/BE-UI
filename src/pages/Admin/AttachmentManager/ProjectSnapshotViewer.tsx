import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Typography, Spin, Alert, Button, Breadcrumb } from "antd";
import attachmentApi from "../../../api/attachmentApi";
import {
  TreeNodeDto,
  ProjectUpdateSummaryDto,
} from "../../../types/Attachment";
import { useAuth } from "../../../contexts/AuthContext";
const { Title } = Typography;

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
const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const ProjectSnapshotViewer: React.FC = () => {
  const { projectId: projectIdString, projectUpdateId: projectUpdateIdString, projectType } =
    useParams<{ projectId: string; projectUpdateId: string; projectType: string }>();

  const navigate = useNavigate();
  const projectId = projectIdString ? parseInt(projectIdString, 10) : undefined;
  const projectUpdateId = projectUpdateIdString
    ? parseInt(projectUpdateIdString, 10)
    : undefined;
  const { userRole } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>("");
  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentProjectUpdate, setCurrentProjectUpdate] =
    useState<ProjectUpdateSummaryDto | null>(null);

  useEffect(() => {
    if (projectId && projectUpdateId && !isNaN(projectUpdateId) && projectType) {
      const fetchProjectUpdateDetails = async () => {
        try {
          if (projectType !== "labor" && projectType !== "fixed-price") {
            console.error("Invalid project type:", projectType);
            return;
          }

          const projectTypeUpper = projectType === "labor" ? "LABOR" : "FIXED_PRICE";
          const historyData = await attachmentApi.getProjectUpdateHistoryByType(
            projectId.toString(),
            projectTypeUpper
          );
          const foundUpdate = historyData.find(
            (update) => update.id === projectUpdateId
          );
          if (foundUpdate) {
            setCurrentProjectUpdate(foundUpdate);
          } else {
            console.warn(
              `Details for Project Update ID ${projectUpdateId} not found in history for project ${projectId}.`
            );
            setCurrentProjectUpdate({
              id: projectUpdateId,
              summary: `Update ID: ${projectUpdateId}`,
              updateDate: new Date().toISOString().split("T")[0],
            });
          }
        } catch (err) {
          console.error(
            "Failed to fetch project update details for title:",
            err
          );
        }
      };
      fetchProjectUpdateDetails();
    }
  }, [projectId, projectUpdateId, projectType]);

  useEffect(() => {
    if (!projectUpdateId || isNaN(projectUpdateId)) {
      setError("Invalid Project Update ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchSnapshotNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedNodes: TreeNodeDto[];
        if (!currentPath || currentPath === "/") {
          fetchedNodes = await attachmentApi.getProjectUpdateSnapshotTreeRoot(
            projectUpdateId
          );
        } else {
          fetchedNodes = await attachmentApi.getProjectUpdateSnapshotTreeByPath(
            projectUpdateId,
            currentPath
          );
        }
        setNodes(fetchedNodes);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch snapshot tree data."
        );
        setNodes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnapshotNodes();
  }, [projectUpdateId, currentPath]);

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
        `Viewing snapshot file: ID=${attachmentId}, Name=${fileName}, Type=${fileType}`
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

  const handleGoBackToHistory = () => {
    if (projectId && projectType) {
      const basePath = userRole === "ADMIN" ? "/admin" : "/manager";
      navigate(`${basePath}/projects/${projectType}/${projectId}/history`);
    } else {
      navigate(-1);
    }
  };

  const basePath = userRole === "ADMIN" ? "/admin" : "/manager";
  const historyUrl = `${basePath}/projects/${projectType}/${projectId}/history`;

  const breadcrumbItems = [
    {
      title: <Link to={historyUrl}>Project History</Link>,
    },
  ];
  if (currentProjectUpdate) {
    breadcrumbItems.push({
      title: (
        <span>{`Snapshot: ${
          currentProjectUpdate.summary || "Update " + currentProjectUpdate.id
        } (${formatDateOnly(currentProjectUpdate.updateDate)})`}</span>
      ),
    });
  }
  if (currentPath) {
    const pathSegments = currentPath.split("/");
    let accumulatedPath = "";
    pathSegments.forEach((segment, index) => {
      accumulatedPath += (index > 0 ? "/" : "") + segment;
      breadcrumbItems.push({
        title: (
          <span
            onClick={() => setCurrentPath(accumulatedPath)}
            style={{ cursor: "pointer" }}
          >
            {segment}
          </span>
        ),
      });
    });
  }

  if (!projectUpdateId || isNaN(projectUpdateId)) {
    return (
      <Card>
        <Alert
          message="Error"
          description="Invalid Project Update ID in URL."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!projectType || (projectType !== "labor" && projectType !== "fixed-price")) {
    return (
      <Card>
        <Alert
          message="Error"
          description="Invalid Project Type in URL. Must be 'labor' or 'fixed-price'."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (isLoading && nodes.length === 0)
    return (
      <Card style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading snapshot files..." />
      </Card>
    );

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: "15px" }} />
        <Button onClick={handleGoBackToHistory}>Back to Project History</Button>
      </div>

      <Title level={5} style={{ marginTop: "0", marginBottom: "15px" }}>
        Path: /{currentPath}
      </Title>

      {currentPath && currentPath !== "/" && (
        <button onClick={navigateUp} style={{ marginBottom: "10px" }}>
          Up one level
        </button>
      )}

      {isLoading && nodes.length > 0 && <p>Loading path content...</p>}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "10px" }}
        />
      )}

      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {nodes.map((node) => (
          <li
            key={node.path + "-" + node.type}
            onClick={() => handleNodeClick(node)}
            style={{
              cursor: "pointer",
              padding: "8px 5px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
            }}
            title={
              node.type === "file" ? `View ${node.name}` : `Open ${node.name}`
            }
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9f9f9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <span style={{ marginRight: "10px", fontSize: "1.2em" }}>
              {node.type === "directory" ? "📁" : "📄"}
            </span>
            <span style={{ flexGrow: 1 }}>{node.name}</span>
            {node.type === "file" && (
              <>
                <span
                  style={{
                    marginRight: "20px",
                    color: "#777",
                    fontSize: "0.85em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.size !== null
                    ? `(${
                        node.size / (1024 * 1024) < 0.01
                          ? (node.size / 1024).toFixed(1) + " KB"
                          : (node.size / (1024 * 1024)).toFixed(2) + " MB"
                      })`
                    : ""}
                </span>
                <span
                  style={{
                    color: "#888",
                    fontSize: "0.85em",
                    whiteSpace: "nowrap",
                    marginRight: "10px",
                  }}
                >
                  {node.fileType || "unknown"}
                </span>
                <span
                  style={{
                    color: "#888",
                    fontSize: "0.85em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.lastModified ? `${formatDate(node.lastModified)}` : ""}
                </span>
              </>
            )}
          </li>
        ))}
        {nodes.length === 0 && !isLoading && !error && (
          <li style={{ padding: "8px 5px" }}>
            No files or folders found in this snapshot path.
          </li>
        )}
      </ul>
    </Card>
  );
};

export default ProjectSnapshotViewer;
