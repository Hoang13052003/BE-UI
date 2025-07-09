// AttachmentsTree.tsx (Multi-level tree, dynamic loading for each folder)
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
import { TreeNodeDto as ApiTreeNodeDto } from "../../../types/Attachment"; // Rename API DTO to avoid conflict

const { Text } = Typography;

// DataNode for Ant Design Tree (matches TreeNodeDto structure from API)
interface DataNode {
  title: string; // file or folder name
  key: string; // full path (logicalName or folder path)
  isLeaf: boolean;
  children?: DataNode[];
  icon?: React.ReactNode;
  // Store original data from API if needed
  apiData?: ApiTreeNodeDto;
  loaded?: boolean; // To know if the folder node has loaded children
}

// Function to convert from TreeNodeDto (API) to DataNode (Ant Tree)
const mapApiNodeToDataNode = (apiNode: ApiTreeNodeDto): DataNode => ({
  title: apiNode.name,
  key: apiNode.path, // Path is the unique key
  isLeaf: apiNode.type === "file",
  icon:
    apiNode.type === "directory" ? (
      <FolderOutlined />
    ) : (
      getFileIconByExtension(apiNode.name)
    ),
  children: apiNode.type === "directory" ? undefined : undefined,
  apiData: apiNode,
  loaded: apiNode.type === "file",
});

// Helper function to update treeData when loading children
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
        loaded: true,
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
  projectId?: string;
  projectName?: string; // For displaying title
}

const getFileIconByExtension = (fileName: string): React.ReactNode => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#e74c3c" }} />; // Red
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#2e86de" }} />; // Blue
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#27ae60" }} />; // Green
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FileImageOutlined style={{ color: "#f39c12" }} />; // Orange
    case "txt":
    case "md":
      return <FileTextOutlined style={{ color: "#7f8c8d" }} />; // Gray
    case "zip":
    case "rar":
      return <FileZipOutlined style={{ color: "#8e44ad" }} />; // Purple
    default:
      return <FileUnknownOutlined style={{ color: "#95a5a6" }} />; // Light gray (default)
  }
};

const AttachmentsTree: React.FC<AttachmentsTreeProps> = ({
  projectId,
  projectName,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (projectId) {
      const fetchRootNodes = async () => {
        setLoadingKeys(["root-loading"]);
        setTreeData([]);
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
  }, [projectId, projectName]);

  const onLoadData = useCallback(
    (node: DataNode): Promise<void> => {
      const { key: nodePath, children, loaded, isLeaf } = node;

      return new Promise(async (resolve) => {
        if (children || loaded || isLeaf || !projectId) {
          resolve();
          return;
        }

        setLoadingKeys((prev) => [...prev, nodePath]);
        try {
          const childrenApiNodes =
            await attachmentApi.getCurrentProjectTreeByPath(
              projectId,
              nodePath
            );
          const childrenDataNodes = childrenApiNodes.map(mapApiNodeToDataNode);

          setTreeData((origin) =>
            updateTreeDataRecursive(origin, nodePath, childrenDataNodes)
          );
          setExpandedKeys((prevKeys) =>
            prevKeys.includes(nodePath) ? prevKeys : [...prevKeys, nodePath]
          );
        } catch (error: any) {
          console.error(`Failed to load children for ${nodePath}:`, error);
          message.error(
            error.response?.data?.error ||
              `Failed to load content for ${node.title}.`
          );
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
  );

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
  };

  const onTreeExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
  };

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

  const processedTreeData = (data: DataNode[]): any[] => {
    return data.map((node) => ({
      ...node,
      title: renderTitle(node),
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
          <Spin tip="Loading project structure...">
            <div style={{ height: 40 }} />
          </Spin>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Project Files ${projectName ? `- ${projectName}` : ""}`}>
      {treeData.length > 0 ? (
        <Tree
          loadData={onLoadData as any}
          treeData={processedTreeData(treeData)}
          onSelect={handleSelect}
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
