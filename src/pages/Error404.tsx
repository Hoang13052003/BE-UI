import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Error404: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleBackHome = () => {
    if (userRole === 'ADMIN') {
      navigate('/admin/overview');
    } else if (userRole === 'USER') {
      navigate('/client/overview');
    } else {
      navigate('/');
    }
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={handleBackHome}>
          Back Home
        </Button>
      }
    />
  );
};

export default Error404;