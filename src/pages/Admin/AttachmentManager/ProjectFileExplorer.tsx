import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <<--- THÊM IMPORT
import attachmentApi from '../../../api/attachmentApi';
import { TreeNodeDto } from '../../../types/Attachment' // Giả sử type TreeNodeDto đã có fileType

// Hàm helper để định dạng ngày giờ (ví dụ)
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
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
  const navigate = useNavigate(); // <<--- KHỞI TẠO useNavigate

  useEffect(() => {
    const fetchNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedNodes: TreeNodeDto[];
        if (!currentPath || currentPath === "/") {
          // Sử dụng hàm API đã đổi tên
          fetchedNodes = await attachmentApi.getCurrentProjectTreeRoot(projectId); // <<--- CẬP NHẬT
        } else {
          // Sử dụng hàm API đã đổi tên
          fetchedNodes = await attachmentApi.getCurrentProjectTreeByPath(projectId, currentPath); // <<--- CẬP NHẬT
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
      // Truyền thêm node.name và node.fileType (nếu có)
      handleViewFile(node.attachmentId, node.name, node.fileType); // <<--- CẬP NHẬT
    }
  };

  // Cập nhật handleViewFile để nhận thêm tham số
  const handleViewFile = async (attachmentId: number, fileName: string, fileType: string | null) => {
    // Hiện tại vẫn dùng logic chung, nhưng đã có fileName và fileType để mở rộng sau này
    // nếu bạn muốn xử lý đặc biệt cho một số loại file (ví dụ: render CSV trong modal)
    setIsLoading(true); // Có thể set loading cụ thể cho hành động xem file
    setError(null);
    try {
      console.log(`Viewing file: ID=${attachmentId}, Name=${fileName}, Type=${fileType}`);
      const response = await attachmentApi.getPresignedUrl(attachmentId, "inline");
      window.open(response.url, '_blank');
    } catch (err: any) {
      setError("Failed to get file URL: " + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  const navigateUp = () => {
    if (!currentPath || currentPath === "/") return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleViewHistory = () => {
    // Điều hướng đến trang lịch sử ProjectUpdate, truyền projectId
    navigate(`/admin/projects/${projectId}/history`); // <<--- ĐIỀU HƯỚNG (Kiểm tra lại route của bạn)
    // Giả sử route của bạn là /admin/projects/:projectId/history
    // Nếu AttachmentDisplay là component cha, thì route này phải được định nghĩa ở App router
  };

  if (isLoading && nodes.length === 0) return <p>Loading tree...</p>; // Chỉ hiển thị loading nếu chưa có nodes
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Current Project Path: /{currentPath}</h3>
        {/* Nút Xem Lịch Sử */}
        <button onClick={handleViewHistory} style={{ padding: '8px 15px'}}>
          View Project Update History
        </button>
      </div>

      {currentPath && currentPath !== "/" && (
        <button onClick={navigateUp} style={{ marginBottom: '10px' }}>Up one level</button>
      )}

      {/* Hiển thị loading tinh tế hơn khi refresh path con */}
      {isLoading && nodes.length > 0 && <p>Loading path content...</p>}

      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {nodes.map((node) => (
          <li
            key={node.path + '-' + node.type} // Thêm type vào key để chắc chắn unique hơn
            onClick={() => handleNodeClick(node)}
            style={{
              cursor: 'pointer',
              padding: '8px 5px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center'
            }}
            title={node.type === 'file' ? `View ${node.name}` : `Open ${node.name}`}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ marginRight: '10px', fontSize: '1.2em' }}>
              {node.type === 'directory' ? '📁' : '📄'}
            </span>
            <span style={{ flexGrow: 1 }}>
              {node.name}
            </span>
            {node.type === 'file' && (
              <>
                <span style={{ marginRight: '20px', color: '#777', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                  {node.size !== null ? `(${(node.size / (1024*1024) < 0.01 ? (node.size / 1024).toFixed(1) + ' KB' : (node.size / (1024*1024)).toFixed(2) + ' MB')})` : ''}
                </span>
                <span style={{ color: '#888', fontSize: '0.85em', whiteSpace: 'nowrap', marginRight: '10px' }}>
                  {node.fileType || 'unknown type'} {/* Hiển thị fileType */}
                </span>
                <span style={{ color: '#888', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                  {node.lastModified ? `${formatDate(node.lastModified)}` : ''}
                </span>
              </>
            )}
          </li>
        ))}
        {nodes.length === 0 && !isLoading && <li style={{padding: '8px 5px'}}>No files or folders found in this path.</li>}
      </ul>
      {/* Hiển thị lỗi chung nếu có, khác với lỗi loading */}
      {error && !isLoading && <p style={{color: 'red', marginTop: '10px'}}>Failed to load data: {error}</p>}
    </div>
  );
};

export default ProjectFileExplorer;