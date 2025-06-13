// import React, { useState, useEffect } from 'react';
// import { Card, List, Typography, Skeleton, Divider, Empty } from 'antd';
// import { Link } from 'react-router-dom';
// import { getRecentFeedback, Feedback, markFeedbackAsRead } from '../../../api/feedbackApi';
// import './RecentFeedback.scss';

// const { Title, Text } = Typography;

// // Function to format dates in a relative way (e.g., "2 hours ago", "1 day ago")
// const getRelativeTime = (dateStr: string): string => {
//   const now = new Date();
//   const past = new Date(dateStr);
//   const diffMs = now.getTime() - past.getTime();
  
//   // Convert to minutes, hours, days
//   const diffMins = Math.round(diffMs / (1000 * 60));
//   const diffHours = Math.round(diffMs / (1000 * 60 * 60));
//   const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
//   if (diffMins < 60) {
//     return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
//   } else if (diffHours < 24) {
//     return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
//   } else if (diffDays < 30) {
//     return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
//   } else {
//     return past.toLocaleDateString();
//   }
// };

// interface RecentFeedbackProps {
//   limit?: number;
//   onViewAll?: () => void;
//   useMockData?: boolean; // For demo/development purpose
// }

// const RecentFeedback: React.FC<RecentFeedbackProps> = ({ 
//   limit = 5,
//   onViewAll = () => {},
//   useMockData = true // Default to mock data for development
// }) => {
//   const [feedback, setFeedback] = useState<Feedback[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Mock data - In a real application, this would come from an API
//   const mockFeedback: Feedback[] = [
//     {
//       id: '1',
//       updateId: 1,
//       projectId: 101,
//       userId: 1,
//       content: 'Great progress!',
//       createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
//       read: false
//     },
//     {
//       id: '2',
//       updateId: 2,
//       projectId: 102,
//       userId: 2,
//       content: 'Needs attention',
//       createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
//       read: false
//     },
//     {
//       id: '3',
//       updateId: 3,
//       projectId: 103,
//       userId: 1,
//       content: 'Milestone completed ahead of schedule. Great job team!',
//       createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
//       read: true
//     },
//     {
//       id: '4',
//       updateId: 4,
//       projectId: 104,
//       userId: 3,
//       content: 'Client requested changes to the design',
//       createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
//       read: true
//     }
//   ];

//   useEffect(() => {
//     const fetchFeedback = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         if (useMockData) {
//           // Use mock data for development/demo
//           setTimeout(() => {
//             setFeedback(mockFeedback);
//             setLoading(false);
//           }, 800);
//         } else {
//           // Use actual API in production
//           const data = await getRecentFeedback(limit);
//           setFeedback(data);
//         }
//       } catch (err) {
//         console.error('Error fetching feedback:', err);
//         setError('Failed to load feedback. Please try again later.');
//       } finally {
//         if (!useMockData) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchFeedback();
//   }, [limit, useMockData]);

//   // Handle clicking on a feedback item (mark as read)
//   const handleFeedbackClick = async (id: string) => {
//     // Only mark as unread items
//     const feedbackItem = feedback.find(item => item.id === id);
//     if (feedbackItem && !feedbackItem.read) {
//       try {
//         if (!useMockData) {
//           await markFeedbackAsRead(id);
//         }
//         // Update local state
//         setFeedback(prevFeedback => 
//           prevFeedback.map(item => 
//             item.id === id ? { ...item, read: true } : item
//           )
//         );
//       } catch (err) {
//         console.error('Error marking feedback as read:', err);
//       }
//     }
//   };

//   const limitedFeedback = feedback.slice(0, limit);

//   return (
//     <Card 
//       className="recent-feedback-card" 
//       title={
//         <div className="card-header">
//           <Title level={5} className="card-title">Recent Feedback</Title>
//           <Link to="/admin/feedback" onClick={onViewAll} className="view-all-link">
//             View All
//           </Link>
//         </div>
//       }
//       bordered={false}
//     >
//       {loading ? (
//         <Skeleton active paragraph={{ rows: 4 }} />
//       ) : error ? (
//         <Empty description={error} />
//       ) : limitedFeedback.length === 0 ? (
//         <Empty description="No feedback available" />
//       ) : (
//         <List
//           itemLayout="vertical"
//           dataSource={limitedFeedback}
//           renderItem={(item, index) => (
//             <React.Fragment key={item.id}>
//               <div 
//                 className="feedback-item"
//                 onClick={() => handleFeedbackClick(item.id)}
//               >
//                 <Link to={`/admin/projects/${item.projectId}`}>
//                   <Title level={5} className={item.read ? 'project-title read' : 'project-title'}>
//                     Project #{item.projectId}
//                   </Title>
//                 </Link>
//                 <Text className="feedback-message">{item.content}</Text>
//                 <div className="feedback-meta">
//                   <Text type="secondary" className="time-ago">
//                     {getRelativeTime(item.createdAt)}
//                   </Text>
//                 </div>
//               </div>
//               {index < limitedFeedback.length - 1 && (
//                 <Divider style={{ margin: '12px 0' }} />
//               )}
//             </React.Fragment>
//           )}
//         />
//       )}
//     </Card>
//   );
// };

// export default RecentFeedback;