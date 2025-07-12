import React, { useState } from "react";
import { Modal, message } from "antd";
import TimelogDetailsDisplay from "../Admin/TimelogDetailsDisplay";
import AddTimeLogModal from "../Admin/AddTimeLogModal";

interface TimelogDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
  onRefreshProgress?: () => void;
  theme?: string;
}

const TimelogDetailsModal: React.FC<TimelogDetailsModalProps> = ({
  visible,
  onClose,
  projectId,
  projectName,
  onRefreshProgress,
  theme = "light",
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const handleAddTimeLog = () => {
    setIsAddModalVisible(true);
  };

  const handleAddTimeLogSuccess = () => {
    setIsAddModalVisible(false);
    message.success("Time log added successfully!");
    if (onRefreshProgress) {
      onRefreshProgress();
    }
  };

  return (
    <>
      <Modal
        title={`All Time Logs - ${projectName || "Project"}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200 }}
        destroyOnClose
      >
        <TimelogDetailsDisplay
          projectId={projectId}
          theme={theme}
          isAdmin={true} // Enable admin features for manager
          onRefreshProgress={onRefreshProgress}
        />
      </Modal>

      {/* Add Time Log Modal */}
      <AddTimeLogModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={handleAddTimeLogSuccess}
        projectId={projectId}
      />
    </>
  );
};

export default TimelogDetailsModal; 