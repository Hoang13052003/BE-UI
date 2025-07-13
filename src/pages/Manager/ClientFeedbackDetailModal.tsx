import React from "react";
import { Modal, Typography, Tag, Space, Divider, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { PaperClipOutlined, DownloadOutlined } from "@ant-design/icons";
import { List } from "antd";
import { useAttachmentDownload } from "../../hooks/useAttachmentDownload";

const { Text, Title } = Typography;

export interface FeedbackDetailModel {
  id: string; // Add feedback ID for download functionality
  projectName: string;
  projectId: string; // Changed from number to string to match backend DTO
  content: string;
  createdAt: string;
  read: boolean;
  attachments?: Array<{
    fileName: string;
    url: string;
    fileSize?: number;
    uploadedAt?: string;
  }>;
}

interface ClientFeedbackDetailModalProps {
  feedback: FeedbackDetailModel | null;
  visible: boolean;
  onClose: () => void;
}

const ClientFeedbackDetailModal: React.FC<ClientFeedbackDetailModalProps> = ({
  feedback,
  visible,
  onClose,
}) => {
  const { downloadAttachment, loading: downloadLoading } = useAttachmentDownload();
  
  if (!feedback) return null;
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={<Title level={5}>Feedback Details</Title>}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text strong>Project:</Text> <Text>{feedback.projectName}</Text>
        </div>
        <Divider style={{ margin: "8px 0" }} />
        <div>
          <Text strong>Content:</Text>
          <div
            style={{
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 6,
              marginTop: 4,
              whiteSpace: "pre-wrap",
            }}
          >
            <Text>{feedback.content}</Text>
          </div>
        </div>
        {feedback.attachments && feedback.attachments.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <PaperClipOutlined /> Attachments ({feedback.attachments.length})
            </Divider>
            <List
              itemLayout="horizontal"
              dataSource={feedback.attachments}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tooltip
                      title="Download/View Attachment"
                      key={`download-${item.fileName}`}
                    >
                      <Button
                        icon={<DownloadOutlined />}
                        type="text"
                        loading={downloadLoading}
                        onClick={() => downloadAttachment(feedback.id, feedback.attachments?.indexOf(item) || 0, item.fileName)}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<PaperClipOutlined style={{ fontSize: 18 }} />}
                    title={<Text>{item.fileName}</Text>}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.fileSize
                          ? `${(item.fileSize / 1024).toFixed(1)} KB`
                          : null}
                        {item.uploadedAt
                          ? ` • Uploaded: ${dayjs(item.uploadedAt).format(
                              "YYYY-MM-DD HH:mm"
                            )}`
                          : null}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
        <div>
          <Text strong>Date:</Text>{" "}
          <Text>{dayjs(feedback.createdAt).format("MMM DD, YYYY")}</Text>
        </div>
        <div>
          <Text strong>Status:</Text>{" "}
          <Tag color={feedback.read ? "green" : "blue"}>
            {feedback.read ? "Reviewed" : "Pending"}
          </Tag>
        </div>
      </Space>
    </Modal>
  );
};

export default ClientFeedbackDetailModal;
