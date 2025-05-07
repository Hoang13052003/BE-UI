// import React, { useState, useEffect } from 'react';
// import { Modal, Form, Input, Button, DatePicker, Select, Spin, Alert } from 'antd';
// import { getMilestoneByIdApi, updateMilestoneApi } from '../../api/milestoneApi'; 
// import { Milestone, MilestoneStatus } from '../../types/milestone'; 
// import moment from 'moment';

// const { Option } = Select;

// interface EditMilestoneModalProps {
//   visible: boolean;
//   milestoneId: number | null;
//   projectId: number | null; // Cần projectId để gửi kèm khi update nếu API yêu cầu
//   onClose: () => void;
//   onSuccess: () => void;
// }

// const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({ visible, milestoneId, projectId, onClose, onSuccess }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [initialMilestoneData, setInitialMilestoneData] = useState<Partial<Milestone> | null>(null);

//   useEffect(() => {
//     if (visible && milestoneId) {
//       setLoading(true);
//       setError(null);
//       getMilestoneByIdApi(milestoneId)
//         .then(data => {
//           setInitialMilestoneData(data);
//           form.setFieldsValue({
//             title: data.title,
//             description: data.description,
//             startDate: data.startDate ? moment(data.startDate) : null,
//             endDate: data.endDate ? moment(data.endDate) : null,
//             completionDate: data.completionDate ? moment(data.completionDate) : null,
//             status: data.status,
//             notes: data.notes,
//           });
//           setLoading(false);
//         })
//         .catch(err => {
//           console.error("Failed to fetch milestone details:", err);
//           setError("Failed to load milestone details. " + (err.response?.data?.message || err.message));
//           setLoading(false);
//         });
//     } else {
//       form.resetFields();
//       setInitialMilestoneData(null);
//     }
//   }, [visible, milestoneId, form]);

//   const handleFinish = async (values: any) => {
//     if (!milestoneId || !projectId) {
//       setError("Milestone ID or Project ID is missing.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const milestoneUpdateData = {
//         ...values,
//         startDate: values.startDate ? values.startDate.toISOString() : null,
//         endDate: values.endDate ? values.endDate.toISOString() : null,
//         completionDate: values.completionDate ? values.completionDate.toISOString() : null,
//         projectId: projectId, // Đảm bảo gửi projectId nếu API yêu cầu
//       };
//       await updateMilestoneApi(milestoneId, milestoneUpdateData);
//       setLoading(false);
//       onSuccess(); // Gọi callback khi thành công
//       form.resetFields();
//     } catch (err: any) {
//       console.error("Failed to update milestone:", err);
//       setError("Failed to update milestone. " + (err.response?.data?.message || err.message));
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Edit Milestone"
//       visible={visible}
//       onCancel={() => {
//         form.resetFields();
//         onClose();
//       }}
//       footer={null} // Tắt footer mặc định để dùng footer tùy chỉnh
//       destroyOnClose // Reset trạng thái của modal khi đóng
//     >
//       {loading && !error && <Spin tip="Loading milestone..."><div style={{height: '200px'}}/></Spin>}
//       {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
//       {!loading && initialMilestoneData && (
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleFinish}
//           initialValues={{
//             title: initialMilestoneData.title,
//             description: initialMilestoneData.description,
//             startDate: initialMilestoneData.startDate ? moment(initialMilestoneData.startDate) : undefined,
//             endDate: initialMilestoneData.endDate ? moment(initialMilestoneData.endDate) : undefined,
//             completionDate: initialMilestoneData.completionDate ? moment(initialMilestoneData.completionDate) : undefined,
//             status: initialMilestoneData.status,
//             notes: initialMilestoneData.notes,
//           }}
//         >
//           <Form.Item
//             name="title"
//             label="Title"
//             rules={[{ required: true, message: 'Please input the title!' }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             name="description"
//             label="Description"
//           >
//             <Input.TextArea rows={3} />
//           </Form.Item>
//           <Form.Item name="startDate" label="Start Date">
//             <DatePicker style={{ width: '100%' }} />
//           </Form.Item>
//           <Form.Item name="endDate" label="Due Date">
//             <DatePicker style={{ width: '100%' }} />
//           </Form.Item>
//           <Form.Item name="completionDate" label="Completion Date">
//             <DatePicker style={{ width: '100%' }} />
//           </Form.Item>
//           <Form.Item
//             name="status"
//             label="Status"
//             rules={[{ required: true, message: 'Please select a status!' }]}
//           >
//             <Select placeholder="Select status">
//               {Object.values(MilestoneStatus).map(status => (
//                 <Option key={status} value={status}>{status.replace('_', ' ')}</Option>
//               ))}
//             </Select>
//           </Form.Item>
//           <Form.Item
//             name="notes"
//             label="Notes"
//           >
//             <Input.TextArea rows={2} />
//           </Form.Item>
//           <Form.Item style={{ textAlign: 'right' }}>
//             <Button onClick={() => { form.resetFields(); onClose();}} style={{ marginRight: 8 }}>
//               Cancel
//             </Button>
//             <Button type="primary" htmlType="submit" loading={loading}>
//               Save Changes
//             </Button>
//           </Form.Item>
//         </Form>
//       )}
//       {!loading && !initialMilestoneData && !error && visible && (
//          <Alert message="No milestone data loaded or milestone ID is invalid." type="warning" showIcon />
//       )}
//     </Modal>
//   );
// };

// export default EditMilestoneModal;