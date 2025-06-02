# Cập nhật Chat API theo Backend Controller

## Những thay đổi đã thực hiện:

### 1. Cập nhật `src/api/chatApi.ts`
- **Xóa các API endpoints không còn tồn tại:**
  - `joinProjectChat()` - Không còn cần thiết vì users tự động có quyền truy cập project chat dựa trên project membership
  - `leaveProjectChat()` - Tương tự như trên

- **Thêm comment giải thích:**
  - Thêm ghi chú rằng việc tham gia project chat hiện tại là tự động dựa trên project membership
  
- **Cập nhật notification API:**
  - Sửa `notifyUsers()` để truyền userIds qua query parameters đúng format

### 2. Cập nhật `src/contexts/ChatContext.tsx`
- **Xóa joinProjectChat function:**
  - Loại bỏ import `joinProjectChat as joinProjectChatApi`
  - Xóa `joinProjectChat` khỏi interface `ChatContextType`
  - Xóa implementation của `joinProjectChat` callback
  - Loại bỏ khỏi context value

### 3. Cập nhật `src/pages/Client/Messages.tsx`
- **Thay đổi logic project chat:**
  - Xóa `joinProjectChat` từ useChat() hook
  - Xóa `handleJoinProject()` function
  - Thay đổi nút "Join Chat" thành "Vào Chat" và logic tìm existing project chat room thay vì join

### 4. Cập nhật `src/services/ChatService.ts` và `src/services/ChatServiceNew.ts`
- **Xóa WebSocket methods:**
  - Loại bỏ `joinProjectChat()` method
  - Loại bỏ `leaveProjectChat()` method

## API Endpoints hiện tại phù hợp với Backend:

### Message Endpoints:
- ✅ `POST /api/chat/messages` - Send message
- ✅ `POST /api/chat/messages/file` - Send message with file
- ✅ `GET /api/chat/messages/private/{userId}` - Get private chat history
- ✅ `GET /api/chat/messages/group/{topic}` - Get group chat history
- ✅ `GET /api/chat/messages/project/{projectId}` - Get project chat history
- ✅ `GET /api/chat/messages/{messageId}` - Get message by ID
- ✅ `PUT /api/chat/messages/{messageId}/read` - Mark message as read
- ✅ `PUT /api/chat/messages/read` - Mark multiple messages as read
- ✅ `GET /api/chat/messages/search` - Search messages
- ✅ `GET /api/chat/messages/files` - Get file history

### Chat Room Endpoints:
- ✅ `GET /api/chat/rooms` - Get user's chat rooms
- ✅ `POST /api/chat/rooms` - Create group chat room
- ✅ `GET /api/chat/rooms/{roomId}` - Get chat room by ID
- ✅ `PUT /api/chat/rooms/{roomId}` - Update chat room
- ✅ `POST /api/chat/rooms/{roomId}/participants` - Add user to chat room
- ✅ `DELETE /api/chat/rooms/{roomId}/participants/{userId}` - Remove user from chat room
- ✅ `DELETE /api/chat/rooms/{roomId}/leave` - Leave chat room
- ✅ `GET /api/chat/rooms/search` - Search chat rooms

### Topic Subscription Endpoints:
- ✅ `POST /api/chat/topics/subscribe` - Subscribe to topic
- ✅ `DELETE /api/chat/topics/{topic}/unsubscribe` - Unsubscribe from topic
- ✅ `GET /api/chat/topics/subscriptions` - Get user's subscriptions
- ✅ `GET /api/chat/topics/{topic}/subscribers` - Get topic subscribers

### Project Chat Endpoints:
- ✅ `GET /api/chat/projects/{projectId}/participants` - Get project chat participants
- ✅ `GET /api/chat/projects` - Get user's project chats
- ❌ `POST /api/chat/projects/{projectId}/join` - **REMOVED** (auto-join based on project membership)
- ❌ `DELETE /api/chat/projects/{projectId}/leave` - **REMOVED** (auto-leave based on project membership)

### User Connection Endpoints:
- ✅ `GET /api/chat/users/online` - Get online users
- ✅ `GET /api/chat/users/{userId}/status` - Get user connection status

### Unread Message Endpoints:
- ✅ `GET /api/chat/unread/count` - Get unread message count
- ✅ `GET /api/chat/unread/messages` - Get unread messages

### Notification Endpoints:
- ✅ `POST /api/chat/notifications/project/{projectId}` - Notify project members
- ✅ `POST /api/chat/notifications/topic/{topic}` - Notify topic subscribers
- ✅ `POST /api/chat/notifications/users` - Notify specific users

## Lưu ý quan trọng:

1. **Project Chat Access:** Giờ đây users tự động có quyền truy cập vào project chat dựa trên project membership, không cần join/leave manually.

2. **Backward Compatibility:** Tất cả existing chat functionality vẫn hoạt động bình thường, chỉ loại bỏ các features không còn cần thiết.

3. **UI Updates:** UI đã được cập nhật để reflect việc project chat access tự động.

4. **Error Handling:** Tất cả lỗi TypeScript đã được resolved.
