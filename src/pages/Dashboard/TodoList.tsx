import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag, Dropdown, Menu } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';

export interface TodoItem {
    id: string;
    task: string;
    status: 'Active' | 'On Hand' | 'Urgent';
    assignedTo: string;
    deadline: string;
    priority: 'High' | 'Medium' | 'Low';
  }

const TodoList: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  
  const initialData: TodoItem[] = [
    {
      id: '1',
      task: 'Create A New React app',
      status: 'Active',
      assignedTo: 'Alexander White',
      deadline: 'Due in 3 days',
      priority: 'High',
    },
    {
      id: '2',
      task: 'Integrate Component Into App.js',
      status: 'On Hand',
      assignedTo: 'Emma Anderson',
      deadline: 'Due in 4 days',
      priority: 'Medium',
    },
    {
      id: '3',
      task: 'Start The Development Server',
      status: 'Urgent',
      assignedTo: 'Noah Taylor',
      deadline: 'Due in 1 day',
      priority: 'Low',
    },
    {
      id: '4',
      task: 'Perform Unit Testing',
      status: 'Active',
      assignedTo: 'Sophia Williams',
      deadline: 'Due in 3 days',
      priority: 'High',
    },
    {
      id: '5',
      task: 'Counter Component Into App.js',
      status: 'Active',
      assignedTo: 'Sophia Williams',
      deadline: 'Due in 3 days',
      priority: 'Medium',
    },
    {
      id: '6',
      task: 'Create A TodoList Component',
      status: 'Urgent',
      assignedTo: 'Noah Taylor',
      deadline: 'Due in 1 day',
      priority: 'Low',
    },
    {
      id: '7',
      task: 'Data Fetcher Component Into App.js',
      status: 'On Hand',
      assignedTo: 'Emma Anderson',
      deadline: 'Due in 4 days',
      priority: 'High',
    },
    {
      id: '8',
      task: 'Test The Todo List',
      status: 'Active',
      assignedTo: 'Alexander White',
      deadline: 'Due in 3 days',
      priority: 'Medium',
    },
    {
      id: '9',
      task: 'Start The Development Server',
      status: 'Urgent',
      assignedTo: 'Olivia Smith',
      deadline: 'Due in 2 days',
      priority: 'Low',
    },
  ];

  const [todoItems, setTodoItems] = useState<TodoItem[]>(initialData);

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Filter logic can be added here
  };

  const getStatusTag = (status: string) => {
    let color = '';
    switch (status) {
      case 'Active':
        color = 'blue';
        break;
      case 'On Hand':
        color = 'green';
        break;
      case 'Urgent':
        color = 'pink';
        break;
      default:
        color = 'default';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      render: () => <input type="checkbox" />,
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <span className={getPriorityClass(priority)}>{priority}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <EditOutlined className="action-icon" />
          <DeleteOutlined className="action-icon" />
        </Space>
      ),
    },
  ];

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h2>To Do List</h2>
        <div className="header-right">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1">This Week</Menu.Item>
                <Menu.Item key="2">Next Week</Menu.Item>
                <Menu.Item key="3">This Month</Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button className="filter-button">
              This Week <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className="search-container">
        <Input 
          placeholder="Search here..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Table 
        columns={columns}
        dataSource={todoItems.map(item => ({ ...item, key: item.id }))}
        pagination={false}
        className="todo-table"
      />
    </div>
  );
};

export default TodoList;
