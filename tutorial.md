# Hướng dẫn sử dụng Endpoint Search - Unified Projects API

## Tổng quan
Endpoint `/api/private/unified-projects/search` cung cấp tính năng tìm kiếm động và linh hoạt cho cả hai loại project: **Labor Projects** và **Fixed Price Projects**.

## URL và Phương thức
```
GET /api/private/unified-projects/search
```

## Các tham số tìm kiếm được hỗ trợ

### 1. Tìm kiếm theo tên (name)
- **Tham số**: `name`
- **Kiểu dữ liệu**: String
- **Mô tả**: Tìm kiếm project theo tên (không phân biệt hoa thường, hỗ trợ tìm kiếm một phần)
- **Ví dụ**: 
  ```
  GET /api/private/unified-projects/search?name=website
  GET /api/private/unified-projects/search?name=mobile app
  ```

### 2. Lọc theo loại project (projectType)
- **Tham số**: `projectType`
- **Kiểu dữ liệu**: String
- **Giá trị cho phép**: 
  - `LABOR` - Dự án theo giờ
  - `FIXED_PRICE` - Dự án theo milestone
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?projectType=LABOR
  GET /api/private/unified-projects/search?projectType=FIXED_PRICE
  ```

### 3. Lọc theo trạng thái (status)
- **Tham số**: `status`
- **Kiểu dữ liệu**: ProjectStatusEnum
- **Giá trị cho phép**: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?status=IN_PROGRESS
  GET /api/private/unified-projects/search?status=COMPLETED
  ```

### 4. Lọc theo khoảng thời gian bắt đầu
- **Tham số từ**: `startDateFrom`
- **Tham số đến**: `startDateTo`
- **Kiểu dữ liệu**: LocalDate (format: YYYY-MM-DD)
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?startDateFrom=2024-01-01
  GET /api/private/unified-projects/search?startDateFrom=2024-01-01&startDateTo=2024-12-31
  ```

### 5. Lọc theo khoảng thời gian kết thúc dự kiến
- **Tham số từ**: `endDateFrom`
- **Tham số đến**: `endDateTo`
- **Kiểu dữ liệu**: LocalDate (format: YYYY-MM-DD)
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?endDateFrom=2024-06-01
  GET /api/private/unified-projects/search?endDateTo=2024-12-31
  ```

### 6. Lọc theo khoảng ngân sách
- **Tham số min**: `minBudget`
- **Tham số max**: `maxBudget`
- **Kiểu dữ liệu**: BigDecimal
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?minBudget=10000
  GET /api/private/unified-projects/search?minBudget=5000&maxBudget=50000
  ```

### 7. Lọc theo tiến độ hoàn thành
- **Tham số min**: `minProgress`
- **Tham số max**: `maxProgress`
- **Kiểu dữ liệu**: BigDecimal (0-100)
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?minProgress=50
  GET /api/private/unified-projects/search?minProgress=80&maxProgress=100
  ```

### 8. Lọc project quá hạn
- **Tham số**: `isOverdue`
- **Kiểu dữ liệu**: Boolean
- **Mô tả**: `true` để lấy các project quá hạn (planned end date < ngày hiện tại và chưa hoàn thành)
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?isOverdue=true
  ```

### 9. Lọc project đã hoàn thành
- **Tham số**: `isCompleted`
- **Kiểu dữ liệu**: Boolean
- **Mô tả**: 
  - `true`: Lấy project hoàn thành (progress >= 100%)
  - `false`: Lấy project chưa hoàn thành (progress < 100%)
- **Ví dụ**:
  ```
  GET /api/private/unified-projects/search?isCompleted=true
  GET /api/private/unified-projects/search?isCompleted=false
  ```

## Phân trang (Pagination)
Endpoint hỗ trợ phân trang với các tham số:
- **page**: Số trang (bắt đầu từ 0)
- **size**: Số lượng records mỗi trang (mặc định: 20)
- **sort**: Sắp xếp theo field (ví dụ: `name,asc` hoặc `startDate,desc`)

**Ví dụ**:
```
GET /api/private/unified-projects/search?page=0&size=10&sort=name,asc
GET /api/private/unified-projects/search?page=1&size=20&sort=startDate,desc
```

## Ví dụ tổng hợp

### 1. Tìm tất cả project đang thực hiện với budget từ 10,000 đến 100,000
```
GET /api/private/unified-projects/search?status=IN_PROGRESS&minBudget=10000&maxBudget=100000
```

### 2. Tìm project LABOR quá hạn
```
GET /api/private/unified-projects/search?projectType=LABOR&isOverdue=true
```

### 3. Tìm project FIXED_PRICE bắt đầu trong Q1 2024 và có tiến độ trên 50%
```
GET /api/private/unified-projects/search?projectType=FIXED_PRICE&startDateFrom=2024-01-01&startDateTo=2024-03-31&minProgress=50
```

### 4. Tìm project có tên chứa "mobile" và chưa hoàn thành
```
GET /api/private/unified-projects/search?name=mobile&isCompleted=false
```

### 5. Tìm tất cả project hoàn thành với phân trang
```
GET /api/private/unified-projects/search?isCompleted=true&page=0&size=20&sort=name,asc
```

## Response Format
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Project Description",
      "projectType": "LABOR",
      "status": "IN_PROGRESS",
      "startDate": "2024-01-01",
      "plannedEndDate": "2024-06-30",
      "actualEndDate": null,
      "totalBudget": 50000.00,
      "totalEstimatedHours": 500.0,
      "overallProcess": 75.5,
      "actualProcess": 70.0,
      "users": [
        {
          "id": 1,
          "fullName": "John Doe",
          "email": "john@example.com"
        }
      ],
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-07-04T12:00:00"
    }
  ],
  "totalProjects": 1,
  "laborProjectsCount": 1,
  "fixedPriceProjectsCount": 0
}
```

## Lưu ý quan trọng
1. **Tất cả tham số đều là tùy chọn** - có thể kết hợp bất kỳ tham số nào
2. **Luôn chỉ trả về project chưa bị xóa** (deleted = false)
3. **Hỗ trợ tìm kiếm fuzzy** cho tên project (không phân biệt hoa thường)
4. **Kết hợp nhiều điều kiện** bằng toán tử AND
5. **Response bao gồm thông tin users** được gán cho mỗi project
6. **Hỗ trợ cả hai loại project** trong một endpoint thống nhất

## Các endpoint khác liên quan
- `GET /api/private/unified-projects/overdue` - Lấy tất cả project quá hạn
- `GET /api/private/unified-projects/completed` - Lấy tất cả project hoàn thành  
- `GET /api/private/unified-projects/labor` - Lấy tất cả labor projects
- `GET /api/private/unified-projects/fixed-price` - Lấy tất cả fixed price projects
- `GET /api/private/unified-projects/analytics/count-by-type` - Thống kê theo loại project
- `GET /api/private/unified-projects/analytics/count-by-status` - Thống kê theo trạng thái
