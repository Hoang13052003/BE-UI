# Hướng dẫn sử dụng tính năng Emoji Reaction cho Chat

## 1. Sử dụng qua REST API (CRUD)

### Thêm hoặc xóa reaction cho một tin nhắn
- **Endpoint:** `POST /api/chat/messages/reactions`
- **Request body:**
```json
{
  "messageId": "<ID của tin nhắn>",
  "emoji": "<emoji unicode hoặc shortcode>",
  "addReaction": true // true: thêm, false: xóa
}
```
- **Response:**
```json
{
  "id": "<ID reaction>",
  "messageId": "<ID tin nhắn>",
  "userId": 123,
  "userFullName": "Nguyễn Văn A",
  "userAvatar": "<url ảnh>",
  "emoji": "👍",
  "createdAt": "2024-06-01T12:34:56"
}
```
- **Validation & Error Handling:**
  - `messageId` không được để trống
  - `emoji` không được để trống
  - Tin nhắn phải tồn tại
  - Người dùng phải là thành viên của phòng chat
  - Phòng chat và tin nhắn không được bị xóa

### Lấy tất cả reactions của một tin nhắn
- **Endpoint:** `GET /api/chat/messages/{messageId}/reactions`
- **Response:**
```json
{
  "messageId": "<ID tin nhắn>",
  "reactionCounts": {
    "👍": 2,
    "❤️": 1
  },
  "currentUserReactions": ["👍"],
  "reactionUsers": {
    "👍": [
      {"userId": 123, "userFullName": "Nguyễn Văn A", "userAvatar": "..."},
      {"userId": 456, "userFullName": "Trần Thị B", "userAvatar": "..."}
    ],
    "❤️": [
      {"userId": 789, "userFullName": "Lê Văn C", "userAvatar": "..."}
    ]
  }
}
```
- **Validation & Error Handling:**
  - `messageId` phải tồn tại

### Lấy reactions của một tin nhắn cho người dùng hiện tại
- **Endpoint:** `GET /api/chat/messages/{messageId}/reactions/user`
- **Response:** Tương tự như trên nhưng có thêm thông tin về reactions của người dùng hiện tại

## 2. Sử dụng qua WebSocket (Realtime)

### Gửi reaction qua WebSocket
- **Endpoint:** `/app/chat.reaction`
- **Payload:**
```json
{
  "messageId": "<ID của tin nhắn>",
  "emoji": "<emoji unicode hoặc shortcode>",
  "addReaction": true // true: thêm, false: xóa
}
```
- **Validation & Error Handling:**
  - Payload phải tuân thủ định dạng `MessageReactionRequestDto`
  - Các validation tương tự như REST API

### Lắng nghe sự kiện reaction
- **Subscribe:** `/user/queue/reaction`
- **Payload nhận được:**
```json
{
  "messageId": "<ID tin nhắn>",
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "userAvatar": "<url ảnh>",
  "emoji": "👍",
  "addReaction": true // true: thêm, false: xóa
}
```
- **Các loại sự kiện reaction:**
  - Thêm reaction mới
  - Xóa reaction hiện có
  - Thay thế reaction (khi người dùng chọn emoji khác)

### Lắng nghe trạng thái tin nhắn
- **Subscribe:** `/user/queue/message-status`
- **Sử dụng:** Để cập nhật trạng thái đã đọc của tin nhắn khi có reaction

## 3. Quy tắc nghiệp vụ
- Mỗi người dùng chỉ có thể react 1 emoji cho 1 tin nhắn
- Khi người dùng chọn emoji khác, emoji cũ sẽ được thay thế
- Reaction chỉ có thể được thêm vào tin nhắn trong phòng chat mà người dùng là thành viên
- Không thể react vào tin nhắn đã bị xóa hoặc trong phòng chat đã bị xóa
- Tất cả reactions đều hỗ trợ soft delete (không xóa hoàn toàn khỏi database)

## 4. Gợi ý UI
- Hiển thị các emoji reaction dưới mỗi tin nhắn, kèm số lượng
- Nếu người dùng đã react emoji nào thì làm nổi bật emoji đó
- Khi click vào emoji đã react thì gửi request xóa (addReaction: false)
- Khi click vào emoji mới thì gửi request thêm (addReaction: true)
- Khi có sự kiện realtime, cập nhật UI ngay lập tức
- Hiển thị tooltip với danh sách người dùng đã react khi hover vào emoji
- Hỗ trợ hiển thị tên và avatar của người dùng trong tooltip

## 5. Xử lý edge cases
- Khi người dùng bị xóa khỏi phòng chat nhưng vẫn có reaction: Reaction vẫn hiển thị nhưng không cho phép thêm/xóa
- Khi tin nhắn bị xóa: Tất cả reactions của tin nhắn đó sẽ bị ẩn
- Khi phòng chat bị xóa: Tất cả reactions trong phòng sẽ bị ẩn
- Khi người dùng bị vô hiệu hóa: Reactions của người dùng vẫn hiển thị nhưng không cho phép tương tác

## 6. Error handling
- Hiển thị thông báo lỗi thân thiện khi người dùng không có quyền react
- Hiển thị thông báo khi tin nhắn hoặc phòng chat không tồn tại
- Hiển thị thông báo khi có lỗi kết nối WebSocket
- Retry mechanism cho các yêu cầu thất bại do lỗi mạng

---
**Lưu ý:**
- Mỗi người dùng chỉ có thể react 1 emoji cho 1 tin nhắn (nếu chọn emoji khác sẽ thay thế emoji cũ)
- Tất cả reactions đều được lưu trữ với timestamp để hỗ trợ audit
- Hệ thống hỗ trợ Unicode emoji và custom emoji (nếu có)
