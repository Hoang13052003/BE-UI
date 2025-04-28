import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Target, Clock, Users, BarChart2, FileText, MessageSquare, 
  Calendar, CheckSquare, Mail, Rocket, Globe, Smartphone 
} from 'lucide-react';
import { Tabs } from 'antd';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface ProjectTypeCardProps {
  type: string;
  icon: React.ElementType;
  features: string[];
}

const sampleProgressData = [
  { name: 'Week 1', progress: 20 },
  { name: 'Week 2', progress: 35 },
  { name: 'Week 3', progress: 45 },
  { name: 'Week 4', progress: 60 },
  { name: 'Week 5', progress: 75 },
  { name: 'Week 6', progress: 90 },
];

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <div className="intro-feature-card">
    <div className="intro-feature-content">
      <div className="intro-feature-icon">
        <Icon className="w-6 h-6" />
      </div>
      <div className="intro-feature-text">
        <h3 className="intro-feature-title">{title}</h3>
        <p className="intro-feature-description">{description}</p>
      </div>
    </div>
  </div>
);

const ProjectTypeCard: React.FC<ProjectTypeCardProps> = ({ type, icon: Icon, features }) => (
    <div className="intro-project-card">
    <div className="intro-project-header">
      <Icon className="intro-project-icon" />
      <h3 className="intro-project-title">{type}</h3>
    </div>
    <div className="intro-project-features">
      {features.map((feature, index) => (
        <div key={index} className="intro-project-feature">
          <CheckSquare className="intro-feature-check" />
          <span className="intro-feature-text">{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

const ProgressChart: React.FC = () => (
    <div className="intro-chart-container">
    <h3 className="intro-chart-title">Project Progress Overview</h3>
    <div className="intro-chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sampleProgressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="progress" 
            stroke="var(--primary-color)" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const overviewContent = (
  <div className="intro-overview-grid">
    <ProjectTypeCard
      type="Fixed Price Projects"
      icon={Target}
      features={[
        'Track milestone completion',
        'View project deadlines',
        'Progress visualization',
        'Milestone filtering'
      ]}
    />
    <ProjectTypeCard
      type="Labor Hour Projects"
      icon={Clock}
      features={[
        'Track total hours used',
        'Weekly task logs',
        'Team member tracking',
        'Timesheet reports'
      ]}
    />
    <ProjectTypeCard
      type="Additional Features"
      icon={Rocket}
      features={[
        'Email notifications',
        'Report exports',
        'Multi-language support',
        'Mobile responsive'
      ]}
    />
  </div>
);

const userContent = (
    <div className="intro-user-content">
    <div className="intro-features-grid">
      <FeatureCard
        icon={Users}
        title="Secure Login"
        description="Easy access with password recovery and profile management"
      />
      <FeatureCard
        icon={BarChart2}
        title="Project Dashboard"
        description="Clear overview of all your projects with completion status"
      />
      <FeatureCard
        icon={Calendar}
        title="Progress Tracking"
        description="Detailed timeline view of project milestones and updates"
      />
      <FeatureCard
        icon={FileText}
        title="Documentation"
        description="Access to project documents and attachments"
      />
      <FeatureCard
        icon={MessageSquare}
        title="Communication"
        description="Built-in messaging system for project discussions"
      />
      <FeatureCard
        icon={Globe}
        title="Multi-language"
        description="Interface available in multiple languages"
      />
    </div>
    <ProgressChart />
  </div>
);

const adminContent = (
    <div className="intro-admin-grid">
    <FeatureCard
      icon={BarChart2}
      title="Admin Dashboard"
      description="Comprehensive overview of all projects and their status"
    />
    <FeatureCard
      icon={Users}
      title="User Management"
      description="Create and manage user accounts with role assignments"
    />
    <FeatureCard
      icon={Target}
      title="Project Management"
      description="Create, edit, and track multiple projects"
    />
    <FeatureCard
      icon={Clock}
      title="Progress Updates"
      description="Regular project updates and milestone tracking"
    />
    <FeatureCard
      icon={Mail}
      title="Notifications"
      description="Automated email notifications for important updates"
    />
    <FeatureCard
      icon={Smartphone}
      title="Mobile Access"
      description="Full functionality on mobile devices"
    />
  </div>
);

const tabItems = [
  {
    key: 'overview',
    label: (
      <span className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        Overview
      </span>
    ),
    children: overviewContent
  },
  {
    key: 'user',
    label: (
      <span className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        For Users
      </span>
    ),
    children: userContent
  },
  {
    key: 'admin',
    label: (
      <span className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5" />
        For Admins
      </span>
    ),
    children: adminContent
  }
];

const FeaturesShowcase: React.FC = () => {
    return (
      <div className="intro-container">
        <div className="intro-header">
          <h2 className="intro-title">
            Track Your Projects with Ease
          </h2>
          <p className="intro-subtitle">
            Monitor progress, manage tasks, and collaborate with your team in real-time
          </p>
        </div>
  
        <Tabs 
          defaultActiveKey="overview" 
          items={tabItems}
          className="intro-tabs"
          size="large"
          centered
        />
      </div>
    );
  };
  

export default FeaturesShowcase;