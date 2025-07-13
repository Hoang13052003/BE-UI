import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, List, Typography, Spin, Alert, Button } from "antd";
import attachmentApi from "../../../api/attachmentApi";
import { ProjectUpdateSummaryDto } from "../../../types/Attachment";

const { Title, Text } = Typography;

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
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

const ProjectUpdateHistory: React.FC = () => {
  const { projectId, projectType } = useParams<{ projectId: string; projectType: string }>();
  const navigate = useNavigate();

  const [history, setHistory] = useState<ProjectUpdateSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, _setProjectName] = useState<string>("");

  useEffect(() => {
    if (!projectId || !projectType) {
      setError("Invalid Project ID or Project Type provided.");
      setIsLoading(false);
      return;
    }

    if (projectType !== "labor" && projectType !== "fixed-price") {
      setError("Invalid Project Type. Must be 'labor' or 'fixed-price'.");
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const projectTypeUpper = projectType === "labor" ? "LABOR" : "FIXED_PRICE";
        const historyData = await attachmentApi.getProjectUpdateHistoryByType(
          projectId,
          projectTypeUpper
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
  }, [projectId, projectType]);

  const handleGoBackToExplorer = () => {
    if (projectId && projectType) {
      navigate(`/admin/attachment-display/${projectType}/${projectId}`);
    }
  };

  if (!projectId || !projectType) {
    return (
      <Card>
        <Alert
          message="Error"
          description="Invalid Project ID or Project Type in URL."
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
                <Link
                  to={`/admin/projects/${projectType}/${projectId}/updates/${item.id}/snapshot`}
                  key={`view-snapshot-${item.id}`}
                >
                  View Files at this Point
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Link
                    to={`/admin/projects/${projectType}/${projectId}/updates/${item.id}/snapshot`}
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
