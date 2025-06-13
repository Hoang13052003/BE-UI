// AttachmentsTree.tsx (Cây nhiều cấp, load động từng thư mục)
import React, { useState, useEffect, useCallback } from "react";
import { Tree, Card, Typography, Spin, message } from "antd";
import {
  FolderOutlined,
  FileOutlined,
  LoadingOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import attachmentApi from "../../../api/attachmentApi";
import { TreeNodeDto as ApiTreeNodeDto } from "../../../types/Attachment"; // Đổi tên DTO từ API để tránh trùng

const { Text } = Typography;

// DataNode cho Ant Design Tree (khớp với cấu trúc TreeNodeDto từ API)
interface DataNode {
  title: string; // tên file hoặc thư mục
  key: string; // path đầy đủ (logicalName hoặc path thư mục)
  isLeaf: boolean;
  children?: DataNode[];
  icon?: React.ReactNode;
  // Lưu trữ dữ liệu gốc từ API nếu cần
  apiData?: ApiTreeNodeDto;
  loaded?: boolean; // Để biết node thư mục đã load children chưa
}

// Hàm chuyển đổi từ TreeNodeDto (API) sang DataNode (Ant Tree)
const mapApiNodeToDataNode = (apiNode: ApiTreeNodeDto): DataNode => ({
  title: apiNode.name,
  key: apiNode.path, // Path là key duy nhất
  isLeaf: apiNode.type === "file",
  icon:
    apiNode.type === "directory" ? (
      <FolderOutlined />
    ) : (
      getFileIconByExtension(apiNode.name)
    ),
  children: apiNode.type === "directory" ? undefined : undefined, // Thư mục có thể load con
  apiData: apiNode,
  loaded: apiNode.type === "file", // File coi như đã "loaded" children (không có)
});

// Hàm helper để cập nhật treeData khi load children
const updateTreeDataRecursive = (
  list: DataNode[],
  key: React.Key,
  children: DataNode[]
): DataNode[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
        loaded: true, // Đánh dấu đã load
        // isLeaf không cần cập nhật ở đây vì mapApiNodeToDataNode đã set isLeaf ban đầu
        // và Tree sẽ tự biết nếu có children
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeDataRecursive(node.children, key, children),
      };
    }
    return node;
  });
};

interface AttachmentsTreeProps {
  projectId?: number;
  projectName?: string; // Để hiển thị tiêu đề
}

const getFileIconByExtension = (fileName: string): React.ReactNode => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#e74c3c" }} />; // Đỏ
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#2e86de" }} />; // Xanh dương
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#27ae60" }} />; // Xanh lá
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FileImageOutlined style={{ color: "#f39c12" }} />; // Cam
    case "txt":
    case "md":
      return <FileTextOutlined style={{ color: "#7f8c8d" }} />; // Xám
    case "zip":
    case "rar":
      return <FileZipOutlined style={{ color: "#8e44ad" }} />; // Tím
    default:
      return <FileUnknownOutlined style={{ color: "#95a5a6" }} />; // Xám nhạt (mặc định)
  }
};

const AttachmentsTree: React.FC<AttachmentsTreeProps> = ({
  projectId,
  projectName,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<React.Key[]>([]); // Các key đang load
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Load root level khi projectId thay đổi
  useEffect(() => {
    if (projectId) {
      const fetchRootNodes = async () => {
        setLoadingKeys(["root-loading"]); // Key giả cho trạng thái loading ban đầu
        setTreeData([]); // Xóa cây cũ
        setExpandedKeys([]);
        try {
          const rootApiNodes = await attachmentApi.getCurrentProjectTreeRoot(
            projectId
          );
          if (rootApiNodes.length === 0) {
            message.info(
              `No files or folders found at the root of project ${
                projectName || `ID ${projectId}`
              }.`
            );
          }
          setTreeData(rootApiNodes.map(mapApiNodeToDataNode));
        } catch (error: any) {
          console.error("Failed to load root attachments:", error);
          message.error(
            error.response?.data?.error ||
              `Failed to load root files for project.`
          );
          setTreeData([
            {
              title: "Error loading root",
              key: "root-error",
              isLeaf: true,
              icon: <FileOutlined />,
            },
          ]);
        } finally {
          setLoadingKeys([]);
        }
      };
      fetchRootNodes();
    } else {
      setTreeData([]);
      setExpandedKeys([]);
    }
  }, [projectId, projectName]); // Chỉ chạy khi projectId, projectName thay đổi

  const onLoadData = useCallback(
    (node: DataNode): Promise<void> => {
      const { key: nodePath, children, loaded, isLeaf } = node;

      return new Promise(async (resolve) => {
        if (children || loaded || isLeaf || !projectId) {
          // Đã có con, hoặc đã load, hoặc là file, hoặc không có projectId
          resolve();
          return;
        }

        setLoadingKeys((prev) => [...prev, nodePath]);
        try {
          // nodePath ở đây chính là 'requestedPath' cho API
          const childrenApiNodes =
            await attachmentApi.getCurrentProjectTreeByPath(
              projectId,
              nodePath
            );
          const childrenDataNodes = childrenApiNodes.map(mapApiNodeToDataNode);

          setTreeData((origin) =>
            updateTreeDataRecursive(origin, nodePath, childrenDataNodes)
          );
          // Tự động mở rộng node vừa được load
          setExpandedKeys((prevKeys) =>
            prevKeys.includes(nodePath) ? prevKeys : [...prevKeys, nodePath]
          );
        } catch (error: any) {
          console.error(`Failed to load children for ${nodePath}:`, error);
          message.error(
            error.response?.data?.error ||
              `Failed to load content for ${node.title}.`
          );
          // Cập nhật node với thông báo lỗi
          const errorNodeChild: DataNode[] = [
            {
              title: "Error loading content",
              key: `${nodePath}-error-${Date.now()}`,
              isLeaf: true,
              icon: <FileOutlined />,
            },
          ];
          setTreeData((origin) =>
            updateTreeDataRecursive(origin, nodePath, errorNodeChild)
          );
        } finally {
          setLoadingKeys((prev) => prev.filter((k) => k !== nodePath));
          resolve();
        }
      });
    },
    [projectId]
  ); // Dependency

  const handleFileView = async (attachmentNode: DataNode) => {
    if (!attachmentNode.apiData || !attachmentNode.apiData.attachmentId) return;
    const attachmentId = attachmentNode.apiData.attachmentId;
    const fileName = attachmentNode.title;

    message.loading({
      content: `Preparing ${fileName}...`,
      key: `file-${attachmentId}`,
    });
    try {
      const response = await attachmentApi.getPresignedUrl(
        attachmentId,
        "inline"
      );
      message.success({
        content: `Opening ${fileName}...`,
        key: `file-${attachmentId}`,
        duration: 2,
      });
      window.open(response.url, "_blank");
    } catch (error: any) {
      message.error({
        content:
          error.response?.data?.error || `Failed to get URL for ${fileName}.`,
        key: `file-${attachmentId}`,
        duration: 3,
      });
      console.error("Failed to get presigned URL:", error);
    }
  };

  const handleSelect = (_selectedKeys: React.Key[], info: { node: any }) => {
    const clickedNode = info.node as DataNode;
    if (clickedNode.isLeaf && clickedNode.apiData?.attachmentId) {
      handleFileView(clickedNode);
    }
    // Nếu click vào thư mục, nó sẽ tự expand (do loadData) hoặc collapse
  };

  const onTreeExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
  };

  // Function để render title với icon loading
  const renderTitle = (node: DataNode) => {
    if (loadingKeys.includes(node.key) && !node.loaded) {
      return (
        <>
          {node.icon} <Text>{node.title}</Text>{" "}
          <LoadingOutlined style={{ marginLeft: 8 }} />
        </>
      );
    }
    return (
      <>
        {node.icon} <Text>{node.title}</Text>
      </>
    );
  };

  // Áp dụng renderTitle cho treeData
  const processedTreeData = (data: DataNode[]): any[] => {
    return data.map((node) => ({
      ...node,
      title: renderTitle(node), // Sử dụng hàm renderTitle
      children: node.children ? processedTreeData(node.children) : undefined,
    }));
  };

  if (!projectId) {
    return (
      <Card title={`Project Files ${projectName ? `- ${projectName}` : ""}`}>
        <Text type="secondary">Project ID not provided.</Text>
      </Card>
    );
  }

  if (loadingKeys.includes("root-loading") && treeData.length === 0) {
    return (
      <Card title={`Project Files ${projectName ? `- ${projectName}` : ""}`}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin tip="Loading project structure..." />
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Project Files ${projectName ? `- ${projectName}` : ""}`}>
      {treeData.length > 0 ? (
        <Tree
          loadData={onLoadData as any} // Antd Tree mong đợi (node: EventDataNode) => Promise<void>
          treeData={processedTreeData(treeData)} // Sử dụng treeData đã xử lý title
          onSelect={handleSelect}
          // showIcon // Không cần showIcon nếu title đã bao gồm icon
          expandedKeys={expandedKeys}
          onExpand={onTreeExpand}
        />
      ) : (
        !loadingKeys.includes("root-loading") && (
          <Text type="secondary">
            No files or folders found for this project.
          </Text>
        )
      )}
    </Card>
  );
};

export default AttachmentsTree;
