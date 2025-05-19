import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  notification,
  Spin} from 'antd';
import { updateProjectApi, ProjectUpdateRequest } from '../../api/projectApi';
import { searchUsersByEmailOrUsernameApi, UserSearchParams } from '../../api/userApi';
import { UserIdAndEmailResponse } from '../../types/User';
import { Project } from '../../types/project';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const { TextArea } = Input;
const { Option } = Select;

interface EditProjectModalProps {
  visible: boolean;
  projectId: number | null;
  onClose: () => void;
  onSuccess: () => void;
  projectData?: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  visible,
  projectId,
  projectData,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTypeChanged, setIsTypeChanged] = useState(false);
  
  // States cho tìm kiếm người dùng
  const [users, setUsers] = useState<UserIdAndEmailResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [, setSearchValue] = useState('');

  // Load dữ liệu dự án khi modal được mở và projectId thay đổi
  useEffect(() => {
    const loadProjectData = async () => {
      if (visible && projectId && !projectData) {
        setLoading(true);
        try {
          // Nếu không có projectData được truyền vào, bạn có thể gọi API để lấy dữ liệu
          // const data = await getProjectById(projectId);
          // fillFormWithData(data);
          // Tạm thời bỏ qua phần này vì bạn đã truyền projectData
        } catch (error) {
          console.error('Failed to load project data:', error);
          notification.error({
            message: t('project.edit.loadError'),
            description: t('project.edit.loadErrorDesc')
          });
          onClose();
        } finally {
          setLoading(false);
        }
      }
    };

    if (projectData) {
      fillFormWithData(projectData);
    } else {
      loadProjectData();
    }
    
    // Reset state khi modal đóng
    return () => {
      setIsTypeChanged(false);
    };
  }, [visible, projectId, projectData, form, t, onClose]);

  const fillFormWithData = (data: Project) => {
    form.setFieldsValue({
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      startDate: data.startDate ? dayjs(data.startDate, 'YYYY-MM-DD') : null,
      plannedEndDate: data.plannedEndDate ? dayjs(data.plannedEndDate, 'YYYY-MM-DD') : null,
      totalBudget: data.totalBudget,
      totalEstimatedHours: data.totalEstimatedHours,
      userIds: data.users?.map(user => user.id) || []
    });

    // Nếu có user thì tìm thông tin user để hiển thị trong Select
    if (data.users && data.users.length > 0) {
      const initialUsers = data.users.map(user => ({
        id: user.id,
        email: user.email
      }));
      setUsers(initialUsers);
    }
  };

  const handleTypeChange = (value: string) => {
    // Kiểm tra xem type có thay đổi so với giá trị ban đầu không
    if (projectData && value !== projectData.type) {
      setIsTypeChanged(true);
    } else {
      setIsTypeChanged(false);
    }
  };

  // Hàm search user với debounce để tránh gọi API quá nhiều
  const searchUsers = debounce(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      return;
    }

    setSearchLoading(true);
    try {
      const params: UserSearchParams = {
        'searchTerm.contains': searchTerm,
        page: 0,
        size: 10
      };

      const result = await searchUsersByEmailOrUsernameApi(params);
      setUsers(prevUsers => {
        // Kết hợp users hiện tại và kết quả tìm kiếm mới, lọc các bản ghi trùng
        const combinedUsers = [...prevUsers];
        
        result.users.forEach(user => {
          if (!combinedUsers.some(u => u.id === user.id)) {
            combinedUsers.push(user);
          }
        });
        
        return combinedUsers;
      });
    } catch (error) {
      console.error('Failed to search users:', error);
      notification.error({
        message: t('project.edit.searchUserError'),
        description: t('project.edit.searchUserErrorDesc')
      });
    } finally {
      setSearchLoading(false);
    }
  }, 500);

  const handleSearchUser = (value: string) => {
    setSearchValue(value);
    searchUsers(value);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (isTypeChanged) {
        confirmAlert({
          title: t('project.edit.typeChangeWarningTitle'),
          message: t('project.edit.typeChangeWarningContent'),
          buttons: [
            {
              label: t('common.continue'),
              onClick: () => submitForm(values)
            },
            {
              label: t('common.cancel'),
              onClick: () => {}
            }
          ]
        });
      } else {
        submitForm(values);
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const submitForm = async (values: any) => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const updateData: ProjectUpdateRequest = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : undefined
      };

      await updateProjectApi(projectId, updateData);
      notification.success({
        message: t('project.edit.success'),
        description: t('project.edit.successDesc')
      });
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to update project:', error);
      notification.error({
        message: t('project.edit.error'),
        description: error instanceof Error ? error.message : t('project.edit.errorDesc')
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Render nội dung modal
  return (
    <Modal
      title={t('project.edit.title')}
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleOk}
        >
          {t('common.save')}
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('project.form.name')}
            rules={[{ required: true, message: t('project.form.nameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label={t('project.form.description')}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('project.form.type')}
            rules={[{ required: true, message: t('project.form.typeRequired') }]}
            extra={isTypeChanged && t('project.edit.typeChangeNote')}
          >
            <Select onChange={handleTypeChange}>
              <Option value="FIXED_PRICE">{t('project.type.fixedPrice')}</Option>
              <Option value="LABOR">{t('project.type.labor')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label={t('project.form.status')}
            rules={[{ required: true, message: t('project.form.statusRequired') }]}
          >
            <Select>
              <Option value="NEW">{t('project.status.notStarted')}</Option>
              <Option value="PENDING">{t('project.status.pending')}</Option>
              <Option value="PROGRESS">{t('project.status.inProgress')}</Option>
              <Option value="CLOSED">{t('project.status.closed')}</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label={t('project.form.startDate')}
              style={{ flex: 1 }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="plannedEndDate"
              label={t('project.form.plannedEndDate')}
              style={{ flex: 1 }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="totalBudget"
              label={t('project.form.totalBudget')}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined): string | number => {
                  return value ? Number(value.replace(/\$\s?|(,*)/g, '')) || 0 : 0;
                }}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="totalEstimatedHours"
              label={t('project.form.totalEstimatedHours')}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="userIds"
            label={t('project.form.teamMembers')}
          >
            <Select
              mode="multiple"
              placeholder={t('project.form.searchUsers')}
              filterOption={false}
              onSearch={handleSearchUser}
              notFoundContent={searchLoading ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              loading={searchLoading}
              showSearch
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '-12px' }}>
            {t('project.form.searchUsersHint')}
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default EditProjectModal;