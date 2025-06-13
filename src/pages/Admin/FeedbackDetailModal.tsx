import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Space,
  Button,
  Divider,
  Descriptions,
  Spin,
  Tag,
  List,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  PaperClipOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  MailOutlined, // For email
} from "@ant-design/icons";
import dayjs from "dayjs";
import styled from "styled-components";
import {
  FeedbackResponse,
  getFeedbackById,
  markFeedbackAsRead,
} from "../../api/feedbackApi";

const { Text, Paragraph } = Typography;

// --- Styled Components (Optional) ---
const DetailSection = styled.div`
  margin-bottom: 20px;
`;

const AttachmentsListContainer = styled.div`
  margin-top: 8px;
  max-height: 250px; // Adjust as needed
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  padding: 8px;
  border-radius: 4px;
`;

// --- Props Interface for the Modal ---
interface FeedbackDetailModalProps {
  feedbackId: string | null;
  visible: boolean;
  onClose: () => void;
}

// --- Helper function to get file icons (reused from NotificationDetail) ---
const getFileIconByExtension = (fileName: string): React.ReactNode => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const style = { fontSize: "20px", marginRight: "8px" };

  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ ...style, color: "#D93025" }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ ...style, color: "#4285F4" }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ ...style, color: "#34A853" }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FileImageOutlined style={{ ...style, color: "#FBBC04" }} />;
    case "zip":
    case "rar":
      return <FileZipOutlined style={{ ...style, color: "#7B1FA2" }} />; // Purple
    case "txt":
    case "md":
      return <PaperClipOutlined style={{ ...style, color: "#5F6368" }} />; // Grey for generic text/docs
    default:
      return <FileUnknownOutlined style={{ ...style, color: "#9AA0A6" }} />;
  }
};

// --- The Modal Component ---
const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedbackId,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);

  const resetModalState = () => {
    setLoading(false);
    setFeedback(null);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!feedbackId) {
        resetModalState();
        return;
      }
      setLoading(true);
      try {
        const data = await getFeedbackById(feedbackId);
        setFeedback(data);

        await markFeedbackAsRead(feedbackId);
      } catch (error) {
        console.error("Error fetching feedback details:", error);
        // Handle error display if needed
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    if (visible && feedbackId) {
      fetchDetails();
    } else if (!visible) {
      resetModalState(); // Ensure data is cleared when modal is hidden
    }
  }, [feedbackId, visible]);

  const renderFeedbackContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!feedback) {
      return (
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", padding: "48px 0" }}
        >
          No feedback details found.
        </Text>
      );
    }

    return (
      <>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Client Name
              </Space>
            }
            labelStyle={{ width: "180px" }}
          >
            {feedback.fullName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <MailOutlined />
                Client Email
              </Space>
            }
          >
            {feedback.email ? (
              <a href={`mailto:${feedback.email}`}>{feedback.email}</a>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <ProjectOutlined />
                Project
              </Space>
            }
          >
            {feedback.projectName || "N/A"} (ID: {feedback.projectId || "N/A"})
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <ClockCircleOutlined />
                Submitted At
              </Space>
            }
          >
            {dayjs(feedback.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <InfoCircleOutlined />
                Status
              </Space>
            }
          >
            <Tag color={feedback.read ? "green" : "blue"}>
              {feedback.read ? "Reviewed" : "Pending Review"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" plain>
          <MessageOutlined /> Feedback Content
        </Divider>
        <DetailSection>
          <Paragraph
            style={{
              whiteSpace: "pre-wrap",
              background: "#f9f9f9",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {feedback.content || "No content provided."}
          </Paragraph>
        </DetailSection>

        {feedback.attachments && feedback.attachments.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <PaperClipOutlined /> Attachments ({feedback.attachments.length})
            </Divider>
            <AttachmentsListContainer>
              <List
                itemLayout="horizontal"
                dataSource={feedback.attachments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Tooltip
                        title="Download/View Attachment"
                        key={`download-${item.s3Key}`}
                      >
                        <Button
                          icon={<DownloadOutlined />}
                          type="text"
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getFileIconByExtension(item.fileName)}
                      title={<Text>{item.fileName}</Text>}
                      description={
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {(item.fileSize / 1024).toFixed(1)} KB
                          {item.uploadedAt &&
                            ` • Uploaded: ${dayjs(item.uploadedAt).format(
                              "YYYY-MM-DD HH:mm"
                            )}`}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </AttachmentsListContainer>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <MessageOutlined />
          <Text strong>Feedback Details</Text>
          {feedback && <Tag>ID: {feedback.id}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
        // You can add more actions here, e.g., "Mark as Read"
        // <Button key="markRead" type="primary" onClick={() => { /* Mark as read logic */ }}>
        //   Mark as Read
        // </Button>,
      ]}
      width={800} // Adjust width as needed
      destroyOnHidden // Ensures modal content is unmounted and state is reset
      styles={{ body: {
        paddingTop: "12px",
        maxHeight: "75vh",
        overflowY: "auto"
      } }}
    >
      {renderFeedbackContent()}
    </Modal>
  );
};

export default FeedbackDetailModal;
