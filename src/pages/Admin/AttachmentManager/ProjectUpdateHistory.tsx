import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Thêm Link
import { Card, List, Typography, Spin, Alert, Button } from "antd"; // Sử dụng Ant Design components
import attachmentApi from "../../../api/attachmentApi"; // Đường dẫn tới API service của bạn
import { ProjectUpdateSummaryDto } from "../../../types/Attachment"; // Đường dẫn tới DTO types của bạn

const { Title, Text } = Typography;

// Hàm helper để định dạng ngày (ví dụ)
const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    // Giả sử dateString là "YYYY-MM-DD"
    const date = new Date(dateString + "T00:00:00"); // Thêm T00:00:00 để tránh vấn đề múi giờ khi chỉ có ngày
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

const ProjectUpdateHistory: React.FC = () => {
  const { projectId: projectIdString } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectId = projectIdString ? parseInt(projectIdString, 10) : undefined;

  const [history, setHistory] = useState<ProjectUpdateSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, _setProjectName] = useState<string>(""); // Để lưu tên project nếu cần

  useEffect(() => {
    if (!projectId || isNaN(projectId)) {
      setError("Invalid Project ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Optional: Fetch project details để lấy tên project nếu cần hiển thị
        // const projectDetails = await projectApi.getProjectById(projectId);
        // setProjectName(projectDetails.name);

        const historyData = await attachmentApi.getProjectUpdateHistory(
          projectId
        );
        setHistory(historyData);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch project update history."
        );
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [projectId]);

  const handleGoBackToExplorer = () => {
    if (projectId) {
      // Điều hướng trở lại Component A (ProjectFileExplorer)
      // Giả sử route của ProjectFileExplorer là /admin/attachment-display/:projectId
      navigate(`/admin/attachment-display/${projectId}`);
    }
  };

  if (!projectId || isNaN(projectId)) {
    return (
      <Card>
        <Alert
          message="Error"
          description="Invalid Project ID in URL."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading project history..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert message="Error" description={error} type="error" showIcon />
        <Button onClick={handleGoBackToExplorer} style={{ marginTop: 16 }}>
          Back to Project Explorer
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={3}>
          Project Update History {projectName && `for ${projectName}`}
        </Title>
        <Button onClick={handleGoBackToExplorer}>Back to Current Files</Button>
      </div>

      {history.length === 0 ? (
        <Text>No update history found for this project.</Text>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={history}
          renderItem={(item: ProjectUpdateSummaryDto) => (
            <List.Item
              actions={[
                // Link điều hướng đến Component C (ProjectSnapshotViewer)
                <Link
                  to={`/admin/projects/${projectId}/updates/${item.id}/snapshot`}
                  key={`view-snapshot-${item.id}`}
                >
                  View Files at this Point
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Link
                    to={`/admin/projects/${projectId}/updates/${item.id}/snapshot`}
                    style={{ fontSize: "1.1em" }}
                  >
                    Update on: {formatDateOnly(item.updateDate)}
                  </Link>
                }
                description={item.summary || "No summary provided."}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default ProjectUpdateHistory;
