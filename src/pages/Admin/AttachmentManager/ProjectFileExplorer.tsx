import React, { useEffect, useState } from 'react';
import attachmentApi from '../../../api/attachmentApi';
import { TreeNodeDto } from '../../../types/Attachment'

// Hàm helper để định dạng ngày giờ (ví dụ)
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Bạn có thể dùng thư viện như date-fns hoặc moment.js để định dạng phức tạp hơn
    return date.toLocaleString(); // Định dạng mặc định của trình duyệt
  } catch (error) {
    return 'Invalid date';
  }
};

interface ProjectFileExplorerProps {
  projectId: number;
}

const ProjectFileExplorer: React.FC<ProjectFileExplorerProps> = ({ projectId }) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedNodes: TreeNodeDto[];
        if (!currentPath || currentPath === "/") {
          fetchedNodes = await attachmentApi.getProjectTreeRoot(projectId);
        } else {
          fetchedNodes = await attachmentApi.getProjectTreeByPath(projectId, currentPath);
        }
        setNodes(fetchedNodes);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to fetch tree data");
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
      handleDownloadFile(node.attachmentId);
    }
  };

  const handleDownloadFile = async (attachmentId: number) => {
    try {
      const response = await attachmentApi.getPresignedUrlForDownload(attachmentId);
      window.open(response.url, '_blank');
    } catch (err: any) {
      alert("Failed to get download URL: " + (err.response?.data?.error || err.message));
    }
  };

  const navigateUp = () => {
    if (!currentPath || currentPath === "/") return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  if (isLoading) return <p>Loading tree...</p>;
  if (error) return <p>Error: {error}</p>;

  // Ví dụ sử dụng antd Table để hiển thị đẹp hơn
  // Nếu không dùng antd, bạn có thể dùng <ul> hoặc <table> HTML bình thường
  // Để đơn giản, tôi sẽ dùng <ul> và thêm thông tin lastModified

  return (
    <div>
      <h3>Path: /{currentPath}</h3>
      {currentPath && currentPath !== "/" && (
        <button onClick={navigateUp} style={{ marginBottom: '10px' }}>Up one level</button>
      )}
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {nodes.map((node) => (
          <li 
            key={node.path} // Sử dụng node.path làm key vì nó sẽ unique hơn trong trường hợp tên trùng
            onClick={() => handleNodeClick(node)} 
            style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #eee' }}
            title={node.type === 'file' ? `Click to download ${node.name}` : `Click to open ${node.name}`}
          >
            <span style={{ marginRight: '10px' }}>
              {node.type === 'directory' ? '📁' : '📄'}
            </span>
            <span style={{ marginRight: '20px', minWidth: '200px', display: 'inline-block' }}>
              {node.name}
            </span>
            {node.type === 'file' && (
              <>
                <span style={{ marginRight: '20px', color: '#555', fontSize: '0.9em' }}>
                  {node.size !== null ? `(${(node.size / 1024).toFixed(2)} KB)` : ''}
                </span>
                <span style={{ color: '#777', fontSize: '0.9em' }}>
                  {/* HIỂN THỊ lastModified Ở ĐÂY */}
                  {node.lastModified ? `Modified: ${formatDate(node.lastModified)}` : ''}
                </span>
              </>
            )}
          </li>
        ))}
        {nodes.length === 0 && !isLoading && <li>No files or folders found.</li>}
      </ul>
    </div>
  );
};

export default ProjectFileExplorer;