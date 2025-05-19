import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Target, Clock, Users, BarChart2, FileText, MessageSquare, 
  Calendar, CheckSquare, Mail, Rocket, Globe, Smartphone 
} from 'lucide-react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';


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

const ProgressChart: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="intro-chart-container">
      <h3 className="intro-chart-title">{t('homeIntro.chart.title')}</h3>
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
};

const FeaturesShowcase: React.FC = () => {
  const { t } = useTranslation();
  
  const overviewContent = (
    <div className="intro-overview-grid">
      <ProjectTypeCard
        type={t('homeIntro.projectTypes.fixedPrice')}
        icon={Target}
        features={[
          t('homeIntro.projectFeatures.trackMilestones'),
          t('homeIntro.projectFeatures.viewDeadlines'),
          t('homeIntro.projectFeatures.progressVisualization'),
          t('homeIntro.projectFeatures.milestoneFiltering')
        ]}
      />
      <ProjectTypeCard
        type={t('homeIntro.projectTypes.laborHour')}
        icon={Clock}
        features={[
          t('homeIntro.projectFeatures.trackHours'),
          t('homeIntro.projectFeatures.weeklyLogs'),
          t('homeIntro.projectFeatures.teamTracking'),
          t('homeIntro.projectFeatures.timesheetReports')
        ]}
      />
      <ProjectTypeCard
        type={t('homeIntro.projectTypes.additionalFeatures')}
        icon={Rocket}
        features={[
          t('homeIntro.projectFeatures.emailNotifications'),
          t('homeIntro.projectFeatures.reportExports'),
          t('homeIntro.projectFeatures.multiLanguage'),
          t('homeIntro.projectFeatures.mobileResponsive')
        ]}
      />
    </div>
  );

  const userContent = (
    <div className="intro-user-content">
      <div className="intro-features-grid">
        <FeatureCard
          icon={Users}
          title={t('homeIntro.userFeatures.secureLogin.title')}
          description={t('homeIntro.userFeatures.secureLogin.description')}
        />
        <FeatureCard
          icon={BarChart2}
          title={t('homeIntro.userFeatures.projectDashboard.title')}
          description={t('homeIntro.userFeatures.projectDashboard.description')}
        />
        <FeatureCard
          icon={Calendar}
          title={t('homeIntro.userFeatures.progressTracking.title')}
          description={t('homeIntro.userFeatures.progressTracking.description')}
        />
        <FeatureCard
          icon={FileText}
          title={t('homeIntro.userFeatures.documentation.title')}
          description={t('homeIntro.userFeatures.documentation.description')}
        />
        <FeatureCard
          icon={MessageSquare}
          title={t('homeIntro.userFeatures.communication.title')}
          description={t('homeIntro.userFeatures.communication.description')}
        />
        <FeatureCard
          icon={Globe}
          title={t('homeIntro.userFeatures.multiLanguage.title')}
          description={t('homeIntro.userFeatures.multiLanguage.description')}
        />
      </div>
      <ProgressChart />
    </div>
  );

  const adminContent = (
    <div className="intro-admin-grid">
      <FeatureCard
        icon={BarChart2}
        title={t('homeIntro.adminFeatures.adminDashboard.title')}
        description={t('homeIntro.adminFeatures.adminDashboard.description')}
      />
      <FeatureCard
        icon={Users}
        title={t('homeIntro.adminFeatures.userManagement.title')}
        description={t('homeIntro.adminFeatures.userManagement.description')}
      />
      <FeatureCard
        icon={Target}
        title={t('homeIntro.adminFeatures.projectManagement.title')}
        description={t('homeIntro.adminFeatures.projectManagement.description')}
      />
      <FeatureCard
        icon={Clock}
        title={t('homeIntro.adminFeatures.progressUpdates.title')}
        description={t('homeIntro.adminFeatures.progressUpdates.description')}
      />
      <FeatureCard
        icon={Mail}
        title={t('homeIntro.adminFeatures.notifications.title')}
        description={t('homeIntro.adminFeatures.notifications.description')}
      />
      <FeatureCard
        icon={Smartphone}
        title={t('homeIntro.adminFeatures.mobileAccess.title')}
        description={t('homeIntro.adminFeatures.mobileAccess.description')}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          {t('homeIntro.tabs.overview')}
        </span>
      ),
      children: overviewContent
    },
    {
      key: 'user',
      label: (
        <span className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('homeIntro.tabs.forUsers')}
        </span>
      ),
      children: userContent
    },
    {
      key: 'admin',
      label: (
        <span className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          {t('homeIntro.tabs.forAdmins')}
        </span>
      ),
      children: adminContent
    }
  ];

  return (
    <div className="intro-container">
      <div className="intro-header">
        <h2 className="intro-title">
          {t('homeIntro.title')}
        </h2>
        <p className="intro-subtitle">
          {t('homeIntro.subtitle')}
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