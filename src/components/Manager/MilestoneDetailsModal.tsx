import React, { useState } from "react";
import { Modal, message } from "antd";
import MilestoneDetailsDisplay from "../Admin/MilestoneDetailsDisplay";
import AddMilestoneModal from "../Admin/AddMilestoneModal";
import EditMilestoneModal from "../Admin/EditMilestoneModal";

interface MilestoneDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
  onRefreshProgress?: () => void;
  theme?: string;
}

const MilestoneDetailsModal: React.FC<MilestoneDetailsModalProps> = ({
  visible,
  onClose,
  projectId,
  projectName,
  onRefreshProgress,
  theme = "light",
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<{
    id: number;
    projectId: string;
  } | null>(null);

  const handleAddMilestone = (refreshCallback?: () => void) => {
    setIsAddModalVisible(true);
  };

  const handleEditMilestone = (
    milestoneId: number,
    projectId: string,
    refreshCallback?: () => void
  ) => {
    setEditingMilestone({ id: milestoneId, projectId });
    setIsEditModalVisible(true);
  };

  const handleAddMilestoneSuccess = () => {
    setIsAddModalVisible(false);
    message.success("Milestone added successfully!");
    if (onRefreshProgress) {
      onRefreshProgress();
    }
  };

  const handleEditMilestoneSuccess = () => {
    setIsEditModalVisible(false);
    setEditingMilestone(null);
    message.success("Milestone updated successfully!");
    if (onRefreshProgress) {
      onRefreshProgress();
    }
  };

  return (
    <>
      <Modal
        title={`All Milestones - ${projectName || "Project"}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200 }}
        destroyOnClose
      >
        <MilestoneDetailsDisplay
          projectId={projectId}
          onAddMilestone={handleAddMilestone}
          onEditMilestone={handleEditMilestone}
          theme={theme}
          onRefreshProgress={onRefreshProgress}
        />
      </Modal>

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={handleAddMilestoneSuccess}
        projectId={projectId}
      />

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <EditMilestoneModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingMilestone(null);
          }}
          onSuccess={handleEditMilestoneSuccess}
          milestoneId={editingMilestone.id}
          projectId={editingMilestone.projectId}
        />
      )}
    </>
  );
};

export default MilestoneDetailsModal; 