# Project Fixed Price Details Endpoint - API Guide

## Endpoint Information

**URL:** `GET /api/projects/fixed-price/{id}/details`
**Method:** GET
**Authentication:** Required (JWT Token)
**Authorization:** `ADMIN`, `MANAGER`, or `USER` roles

## Description
Lấy thông tin chi tiết toàn diện của một dự án milestone-based bao gồm thống kê, milestone, project updates, và các metrics hiệu suất.

## Request Parameters

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | ✅ | ID của project fixed price cần lấy thông tin |

### Example Request
```bash
GET /api/projects/fixed-price/proj-12345/details
Authorization: Bearer <your-jwt-token>
```

## Response Structure

### Success Response (200 OK)
```json
{
  "id": "string",
  "name": "string", 
  "description": "string",
  "status": "enum",
  "startDate": "yyyy-MM-dd",
  "plannedEndDate": "yyyy-MM-dd",
  "actualEndDate": "yyyy-MM-dd",
  "totalBudget": "decimal",
  "completionPercentage": "decimal",
  "overallProcess": "decimal",
  "actualProcess": "decimal",
  "isActive": "boolean",
  "deleted": "boolean",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "users": [],
  "milestoneInWeek": [],
  "projectUpdates": [],
  "totalMilestoneCount": "integer",
  "totalProjectUpdateCount": "integer", 
  "activeUserCount": "integer",
  "newMilestones": "integer",
  "sentMilestones": "integer",
  "reviewedMilestones": "integer",
  "completedMilestones": "integer",
  "daysUntilDeadline": "integer",
  "isOverdue": "boolean",
  "averageMilestoneCompletionDays": "decimal",
  "milestonesCompletedThisWeek": "integer"
}
```

## Field Details

### Basic Project Information
| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `id` | String | Unique identifier của project | UUID string |
| `name` | String | Tên dự án | Any text |
| `description` | String | Mô tả chi tiết dự án | Any text, có thể null |
| `status` | Enum | Trạng thái hiện tại của dự án | `NEW`, `PENDING`, `PROGRESS`, `COMPLETED`, `CLOSED` |
| `startDate` | LocalDate | Ngày bắt đầu dự án | Format: `yyyy-MM-dd`, có thể null |
| `plannedEndDate` | LocalDate | Ngày kết thúc dự định | Format: `yyyy-MM-dd`, có thể null |
| `actualEndDate` | LocalDate | Ngày kết thúc thực tế | Format: `yyyy-MM-dd`, có thể null |

### Budget & Progress Information
| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `totalBudget` | BigDecimal | Tổng ngân sách dự án | Positive number, có thể null |
| `completionPercentage` | BigDecimal | Phần trăm hoàn thành dự án | 0.00 - 100.00 |
| `overallProcess` | BigDecimal | Tiến độ tổng thể | 0.00 - 100.00, có thể null |
| `actualProcess` | BigDecimal | Tiến độ thực tế | 0.00 - 100.00, có thể null |

### Status & Metadata
| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `isActive` | Boolean | Dự án có đang hoạt động không | `true`, `false` |
| `deleted` | Boolean | Dự án có bị xóa không | `true`, `false` |
| `createdAt` | Instant | Thời gian tạo dự án | ISO-8601 timestamp |
| `updatedAt` | Instant | Thời gian cập nhật cuối | ISO-8601 timestamp |

### Team Information
| Field | Type | Description | Structure |
|-------|------|-------------|-----------|
| `users` | Set<UserBasicResponseDto> | Danh sách user trong dự án | See [User Structure](#user-structure) |
| `activeUserCount` | Integer | Số lượng user đang hoạt động | Non-negative integer |

### Milestone Information
| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `milestoneInWeek` | List<MilestoneResponseDto> | Milestones trong tuần này | See [Milestone Structure](#milestone-structure) |
| `totalMilestoneCount` | Integer | Tổng số milestone | Non-negative integer |
| `newMilestones` | Integer | Số milestone mới (TODO) | Non-negative integer |
| `sentMilestones` | Integer | Số milestone đang thực hiện (DOING) | Non-negative integer |
| `reviewedMilestones` | Integer | Số milestone đang review (PENDING) | Non-negative integer |
| `completedMilestones` | Integer | Số milestone đã hoàn thành (COMPLETED) | Non-negative integer |
| `milestonesCompletedThisWeek` | Integer | **🆕 Số milestone hoàn thành tuần này** | Non-negative integer |

### Project Updates
| Field | Type | Description | Structure |
|-------|------|-------------|-----------|
| `projectUpdates` | List<ProjectUpdateTimelineDto> | Lịch sử cập nhật dự án | See [Project Update Structure](#project-update-structure) |
| `totalProjectUpdateCount` | Integer | Tổng số project update | Non-negative integer |

### Timeline & Performance Metrics
| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `daysUntilDeadline` | Integer | Số ngày còn lại đến deadline | Positive (còn thời gian), Negative (đã quá hạn), có thể null |
| `isOverdue` | Boolean | Dự án có quá hạn không | `true`, `false`, có thể null |
| `averageMilestoneCompletionDays` | BigDecimal | Số ngày trung bình hoàn thành milestone | Positive number, có thể null |

## Nested Object Structures

### User Structure
```json
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "image": "profile-image-url",
  "note": "Additional notes",
  "role": "ADMIN"
}
```

| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `id` | Long | User ID | Positive integer |
| `email` | String | Email address | Valid email format |
| `fullName` | String | Họ tên đầy đủ | Any text |
| `image` | String | URL ảnh profile | URL string, có thể null |
| `note` | String | Ghi chú về user | Any text, có thể null |
| `role` | String | Vai trò trong hệ thống | `ADMIN`, `MANAGER`, `USER` |

### Milestone Structure
```json
{
  "id": 456,
  "projectFixedPriceId": "proj-12345",
  "projectName": "Sample Project",
  "name": "Milestone 1",
  "description": "First milestone",
  "startDate": "2025-01-01",
  "deadlineDate": "2025-01-15",
  "status": "DOING",
  "completionDate": null,
  "notes": "Work in progress",
  "completionPercentage": 75
}
```

| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `id` | Long | Milestone ID | Positive integer |
| `projectFixedPriceId` | String | ID của project | String |
| `projectName` | String | Tên project | Any text |
| `name` | String | Tên milestone | Any text |
| `description` | String | Mô tả milestone | Any text, có thể null |
| `startDate` | LocalDate | Ngày bắt đầu | Format: `yyyy-MM-dd`, có thể null |
| `deadlineDate` | LocalDate | Ngày deadline | Format: `yyyy-MM-dd`, có thể null |
| `status` | Enum | Trạng thái milestone | `TODO`, `DOING`, `PENDING`, `COMPLETED` |
| `completionDate` | LocalDate | Ngày hoàn thành | Format: `yyyy-MM-dd`, null nếu chưa hoàn thành |
| `notes` | String | Ghi chú | Any text, có thể null |
| `completionPercentage` | Integer | Phần trăm hoàn thành | 0 - 100 |

### Project Update Structure
```json
{
  "id": 789,
  "createdBy": {
    "id": 123,
    "fullName": "John Doe", 
    "email": "john@example.com"
  },
  "updateDate": "2025-01-10",
  "summary": "Weekly update",
  "details": "Detailed progress report",
  "statusAtUpdate": "SENT",
  "overallProcess": 85.5,
  "actualProcess": 80.0,
  "published": true
}
```

| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `id` | Long | Update ID | Positive integer |
| `createdBy` | UserSummaryDto | Người tạo update | See below |
| `updateDate` | LocalDate | Ngày tạo update | Format: `yyyy-MM-dd` |
| `summary` | String | Tóm tắt update | Any text |
| `details` | String | Chi tiết update | Any text, có thể null |
| `statusAtUpdate` | Enum | Trạng thái khi update | `NEW`, `SENT`, `FEEDBACK` |
| `overallProcess` | BigDecimal | Tiến độ tổng thể lúc update | 0.00 - 100.00, có thể null |
| `actualProcess` | BigDecimal | Tiến độ thực tế lúc update | 0.00 - 100.00, có thể null |
| `published` | Boolean | Update đã được publish chưa | `true`, `false` |

#### UserSummaryDto Structure
```json
{
  "id": 123,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

## Error Responses

### 404 Not Found
```json
{
  "timestamp": "2025-07-06T15:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Project with id 'invalid-id' not found",
  "path": "/api/projects/fixed-price/invalid-id/details"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2025-07-06T15:30:00.000Z",
  "status": 403,
  "error": "Forbidden", 
  "message": "Access denied",
  "path": "/api/projects/fixed-price/proj-12345/details"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2025-07-06T15:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/projects/fixed-price/proj-12345/details"
}
```

## Usage Examples

### Example 1: Successful Request
```bash
curl -X GET "http://localhost:8080/api/projects/fixed-price/proj-12345/details" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "id": "proj-12345",
  "name": "E-commerce Website Development",
  "description": "Building a modern e-commerce platform",
  "status": "PROGRESS",
  "startDate": "2025-01-01",
  "plannedEndDate": "2025-06-30",
  "actualEndDate": null,
  "totalBudget": 50000.00,
  "completionPercentage": 65.50,
  "overallProcess": 70.00,
  "actualProcess": 65.50,
  "isActive": true,
  "deleted": false,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-07-06T15:30:00Z",
  "users": [
    {
      "id": 1,
      "email": "developer@company.com",
      "fullName": "John Developer",
      "image": "https://example.com/profile1.jpg",
      "note": "Lead Developer",
      "role": "USER"
    },
    {
      "id": 2,
      "email": "manager@company.com", 
      "fullName": "Jane Manager",
      "image": "https://example.com/profile2.jpg",
      "note": "Project Manager",
      "role": "MANAGER"
    }
  ],
  "milestoneInWeek": [
    {
      "id": 1,
      "projectFixedPriceId": "proj-12345",
      "projectName": "E-commerce Website Development",
      "name": "Frontend Development Phase 1",
      "description": "Complete homepage and product listing",
      "startDate": "2025-07-01",
      "deadlineDate": "2025-07-07",
      "status": "DOING",
      "completionDate": null,
      "notes": "Making good progress",
      "completionPercentage": 80
    }
  ],
  "projectUpdates": [
    {
      "id": 1,
      "createdBy": {
        "id": 2,
        "fullName": "Jane Manager",
        "email": "manager@company.com"
      },
      "updateDate": "2025-07-05",
      "summary": "Weekly Progress Update",
      "details": "Completed user authentication and started product catalog",
      "statusAtUpdate": "SENT",
      "overallProcess": 65.50,
      "actualProcess": 65.50,
      "published": true
    }
  ],
  "totalMilestoneCount": 8,
  "totalProjectUpdateCount": 12,
  "activeUserCount": 2,
  "newMilestones": 2,
  "sentMilestones": 3,
  "reviewedMilestones": 1,
  "completedMilestones": 2,
  "daysUntilDeadline": 177,
  "isOverdue": false,
  "averageMilestoneCompletionDays": 12.5,
  "milestonesCompletedThisWeek": 1
}
```

### Example 2: Project with No Milestones This Week
```json
{
  "id": "proj-67890",
  "name": "Mobile App Development",
  "status": "NEW",
  "milestoneInWeek": [],
  "milestonesCompletedThisWeek": 0,
  "totalMilestoneCount": 0,
  "newMilestones": 0,
  "sentMilestones": 0,
  "reviewedMilestones": 0,
  "completedMilestones": 0
}
```

### Example 3: Overdue Project
```json
{
  "id": "proj-99999",
  "name": "Legacy System Migration",
  "status": "PROGRESS",
  "plannedEndDate": "2025-06-01",
  "daysUntilDeadline": -35,
  "isOverdue": true,
  "milestonesCompletedThisWeek": 0
}
```

## Key Features & New Implementation

### 🆕 milestonesCompletedThisWeek Field
- **Purpose:** Đếm số milestone đã hoàn thành trong tuần hiện tại (Thứ 2 - Chủ nhật)
- **Calculation:** Dựa trên `completionDate` của milestone và `status = COMPLETED`
- **Use Case:** Theo dõi tiến độ hoàn thành milestone theo tuần
- **Value Range:** 0 đến số lượng milestone tối đa có thể hoàn thành trong tuần

### Related Endpoints
- `GET /api/projects/fixed-price/{id}/milestone-summary` - Để lấy thống kê milestone chi tiết hơn
- `GET /api/projects/fixed-price/statistics` - Để lấy thống kê toàn cục bao gồm milestones completed this week

### Performance Considerations
- Endpoint này thực hiện nhiều query để tính toán metrics
- Có thể cache kết quả cho các dự án lớn
- Sử dụng @Transactional để đảm bảo consistency

### Security Notes
- Cần JWT token hợp lệ
- User chỉ có thể xem project mà họ có quyền truy cập
- Admin/Manager có quyền xem tất cả projects
- User thường chỉ xem được project mà họ được assign

## Integration Tips

### Frontend Integration
```javascript
// React/Angular example
const fetchProjectDetails = async (projectId) => {
  try {
    const response = await fetch(`/api/projects/fixed-price/${projectId}/details`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Use milestonesCompletedThisWeek for dashboard metrics
    console.log(`Completed this week: ${data.milestonesCompletedThisWeek}`);
    
    return data;
  } catch (error) {
    console.error('Error fetching project details:', error);
  }
};
```

### Dashboard Metrics Usage
```javascript
// Example: Display weekly progress
const WeeklyProgress = ({ projectDetails }) => {
  const { milestonesCompletedThisWeek, totalMilestoneCount } = projectDetails;
  const weeklyProgress = (milestonesCompletedThisWeek / totalMilestoneCount * 100).toFixed(1);
  
  return (
    <div>
      <h3>Weekly Progress</h3>
      <p>{milestonesCompletedThisWeek} of {totalMilestoneCount} milestones completed this week</p>
      <progress value={weeklyProgress} max="100">{weeklyProgress}%</progress>
    </div>
  );
};
```

## Testing the Implementation

### Frontend Integration Test
```javascript
// Test function for the new endpoint
const testProjectFixedPriceDetails = async (projectId) => {
  try {
    console.log(`Testing fixed price project details for ID: ${projectId}`);
    
    const response = await fetch(`/api/projects/fixed-price/${projectId}/details`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log key metrics from the new endpoint
    console.log('=== PROJECT DETAILS ===');
    console.log(`Project: ${data.name} (${data.id})`);
    console.log(`Status: ${data.status}`);
    console.log(`Completion: ${data.completionPercentage}%`);
    
    console.log('\n=== MILESTONE METRICS ===');
    console.log(`Total Milestones: ${data.totalMilestoneCount}`);
    console.log(`Completed: ${data.completedMilestones}`);
    console.log(`In Progress: ${data.sentMilestones}`);
    console.log(`Pending Review: ${data.reviewedMilestones}`);
    console.log(`New: ${data.newMilestones}`);
    console.log(`🆕 Completed This Week: ${data.milestonesCompletedThisWeek}`);
    
    console.log('\n=== TIMELINE INFO ===');
    console.log(`Days until deadline: ${data.daysUntilDeadline}`);
    console.log(`Is overdue: ${data.isOverdue}`);
    console.log(`Avg completion time: ${data.averageMilestoneCompletionDays} days`);
    
    console.log('\n=== MILESTONES THIS WEEK ===');
    data.milestoneInWeek.forEach((milestone, index) => {
      console.log(`${index + 1}. ${milestone.name} (${milestone.status}) - ${milestone.completionPercentage}%`);
    });
    
    console.log('\n=== TEAM INFO ===');
    console.log(`Active users: ${data.activeUserCount}`);
    console.log(`Total updates: ${data.totalProjectUpdateCount}`);
    
    return data;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
};

// Usage example:
// testProjectFixedPriceDetails('ca6b9d8f-7580-45af-bb14-608c126bfd6e');
```
