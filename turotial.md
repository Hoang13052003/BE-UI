# Hướng dẫn sử dụng endpoint lấy chi tiết ProjectLabor

## 1. Mô tả endpoint
- **Phương thức:** GET
- **Đường dẫn:** `/api/project-labor/{id}/details`
  - Thay `{id}` bằng ID của ProjectLabor bạn muốn lấy chi tiết.
- **Chức năng:** Lấy thông tin chi tiết của một ProjectLabor 
## 5. Giải thích response
- Nếu thành công, response sẽ là một object JSON chứa thông tin chi tiết của ProjectLabor, ví dụ:

```json
{
  "id": "123",
  "name": "Dự án A",
  "description": "Mô tả dự án",
  "startDate": "2024-01-01",
  "endDate": "2024-06-01",
  ...
}
```
- Cấu trúc cụ thể phụ thuộc vào `ProjectLaborDetailResponseDto`.

## 6. Lỗi thường gặp
- **401 Unauthorized:** Không gửi token hoặc token không hợp lệ.
- **403 Forbidden:** Không có quyền truy cập (không thuộc vai trò cho phép).
- **404 Not Found:** Không tìm thấy ProjectLabor với ID đã cung cấp.

## 7. Lưu ý
- Đảm bảo bạn đã đăng nhập và lấy đúng token.
- Kiểm tra kỹ ID ProjectLabor trước khi gửi request.

---
Nếu cần thêm ví dụ về lấy token hoặc các thao tác khác, hãy liên hệ với đội phát triển backend hoặc tham khảo tài liệu xác thực API. 

## 8. Giải thích chi tiết các trường trong response và các trường hợp đặc biệt

### 1. Trường cơ bản
| Trường                  | Kiểu dữ liệu      | Ý nghĩa | Giá trị có thể khác nhau khi nào? |
|-------------------------|------------------|--------|-----------------------------------|
| id                      | String           | Mã dự án | Luôn có nếu dự án tồn tại |
| projectName             | String           | Tên dự án | Luôn có |
| description             | String           | Mô tả dự án | Có thể null nếu chưa nhập |
| status                  | Enum             | Trạng thái dự án | Thay đổi theo tiến độ (e.g. ACTIVE, COMPLETED,...) |
| startDate               | LocalDate        | Ngày bắt đầu | Có thể null nếu chưa nhập |
| plannedEndDate          | LocalDate        | Ngày kết thúc dự kiến | Có thể null nếu chưa nhập |
| actualEndDate           | LocalDate        | Ngày kết thúc thực tế | Chỉ có khi dự án đã hoàn thành |
| totalBudget             | BigDecimal       | Ngân sách | Có thể null nếu chưa nhập |
| totalActualHours        | BigDecimal       | Tổng giờ thực tế đã làm | 0 nếu chưa có time log nào |
| totalEstimatedHours     | BigDecimal       | Tổng giờ ước tính | Có thể null nếu chưa nhập |
| completionPercentage    | BigDecimal       | % hoàn thành | Có thể null hoặc 0 nếu chưa cập nhật |
| overallProcess          | BigDecimal       | % tiến độ tổng thể | Có thể null nếu chưa cập nhật |
| actualProcess           | BigDecimal       | % tiến độ thực tế | Có thể null nếu chưa cập nhật |
| isActive                | Boolean          | Đang hoạt động? | true/false tùy trạng thái |
| deleted                 | Boolean          | Đã xóa mềm? | true nếu đã xóa mềm |
| createdAt               | Instant          | Ngày tạo | Luôn có |
| updatedAt               | Instant          | Ngày cập nhật | Luôn có |

### 2. Trường liên quan đến người dùng
| Trường                  | Kiểu dữ liệu      | Ý nghĩa | Giá trị có thể khác nhau khi nào? |
|-------------------------|------------------|--------|-----------------------------------|
| users                   | Set<UserBasicResponseDto> | Danh sách thành viên dự án | Chỉ chứa user chưa bị xóa mềm |
| participantCount        | Integer          | Số lượng thành viên | = số user chưa bị xóa mềm |

**UserBasicResponseDto** gồm: id, email, fullName, image, note, role.

### 3. Trường liên quan đến nhật ký thời gian (TimeLog)
| Trường                  | Kiểu dữ liệu      | Ý nghĩa | Giá trị có thể khác nhau khi nào? |
|-------------------------|------------------|--------|-----------------------------------|
| recentTimeLogs          | List<ProjectTimeLogResponseDto> | Time log trong tuần hiện tại | Rỗng nếu chưa có time log tuần này |
| totalTimeLogCount       | Integer          | Tổng số time log | 0 nếu chưa có time log |
| remainingHours          | BigDecimal       | Số giờ còn lại | = totalEstimatedHours - tổng giờ đã log, có thể âm nếu log vượt quá ước tính |

**ProjectTimeLogResponseDto** gồm: id, performer (UserSummaryDto), taskDate, taskDescription, hoursSpent, computedTimelogStatus, completionPercentage.

### 4. Trường liên quan đến cập nhật dự án (ProjectUpdate)
| Trường                  | Kiểu dữ liệu      | Ý nghĩa | Giá trị có thể khác nhau khi nào? |
|-------------------------|------------------|--------|-----------------------------------|
| projectUpdates          | List<ProjectUpdateTimelineDto> | Danh sách cập nhật dự án | Rỗng nếu chưa có cập nhật nào |
| totalProjectUpdateCount | Integer          | Tổng số cập nhật | 0 nếu chưa có cập nhật |

**ProjectUpdateTimelineDto** gồm: id, createdBy (UserSummaryDto), updateDate, summary, details, statusAtUpdate, overallProcess, actualProcess, published.

### 5. Trường deadline
| Trường                  | Kiểu dữ liệu      | Ý nghĩa | Giá trị có thể khác nhau khi nào? |
|-------------------------|------------------|--------|-----------------------------------|
| daysUntilDeadline       | Integer          | Số ngày đến deadline | null nếu chưa có plannedEndDate, âm nếu đã quá hạn |

---

### **Các trường hợp đặc biệt**
- Nếu dự án chưa có time log nào, các trường liên quan đến giờ thực tế, recentTimeLogs, totalTimeLogCount sẽ là 0 hoặc rỗng.
- Nếu dự án chưa có cập nhật nào, projectUpdates và totalProjectUpdateCount sẽ rỗng/0.
- Nếu plannedEndDate chưa được nhập, daysUntilDeadline sẽ là null.
- Nếu user bị xóa mềm, sẽ không xuất hiện trong users và participantCount.
- Nếu dự án đã hoàn thành, actualEndDate sẽ có giá trị, daysUntilDeadline có thể âm hoặc 0. 