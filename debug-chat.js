// Debug script for testing chat APIs
// Chạy: node debug-chat.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8080'; // Thay đổi theo backend URL của bạn

async function testChatAPIs() {
  console.log('🔍 Testing Chat APIs...\n');
  
  // Test 1: Get chat rooms
  try {
    console.log('📋 Testing: GET /api/chat/rooms');
    const roomsResponse = await axios.get(`${BASE_URL}/api/chat/rooms`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Thay YOUR_TOKEN_HERE
      }
    });
    console.log('✅ Chat rooms:', roomsResponse.data);
    
    if (roomsResponse.data.length > 0) {
      const firstRoom = roomsResponse.data[0];
      console.log('\n📝 First room details:', firstRoom);
      
      // Test 2: Get chat history based on room type
      if (firstRoom.roomType === 'PRIVATE') {
        const otherParticipant = firstRoom.participants.find(p => p.userId !== 'YOUR_USER_ID');
        if (otherParticipant) {
          console.log('\n💬 Testing private chat history for user:', otherParticipant.userId);
          const historyResponse = await axios.get(
            `${BASE_URL}/api/chat/messages/private/${otherParticipant.userId}`,
            {
              headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' },
              params: { page: 0, size: 20 }
            }
          );
          console.log('✅ Private chat history:', historyResponse.data);
        }
      } else if (firstRoom.roomType === 'GROUP') {
        console.log('\n👥 Testing group chat history for topic:', firstRoom.roomName);
        const historyResponse = await axios.get(
          `${BASE_URL}/api/chat/messages/group/${encodeURIComponent(firstRoom.roomName)}`,
          {
            headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' },
            params: { page: 0, size: 20 }
          }
        );
        console.log('✅ Group chat history:', historyResponse.data);
      } else if (firstRoom.roomType === 'PROJECT_CHAT') {
        console.log('\n🏗️ Testing project chat history for project:', firstRoom.projectId);
        const historyResponse = await axios.get(
          `${BASE_URL}/api/chat/messages/project/${firstRoom.projectId}`,
          {
            headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' },
            params: { page: 0, size: 20 }
          }
        );
        console.log('✅ Project chat history:', historyResponse.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Test WebSocket connection
function testWebSocket() {
  console.log('\n🔌 Testing WebSocket connection...');
  // Có thể test WebSocket ở đây nếu cần
}

console.log('=== CHAT DEBUG TOOL ===');
console.log('Before running this script:');
console.log('1. npm install axios');
console.log('2. Update BASE_URL if needed');
console.log('3. Replace YOUR_TOKEN_HERE with real auth token');
console.log('4. Replace YOUR_USER_ID with real user ID');
console.log('======================\n');

// Uncomment để chạy test
// testChatAPIs();
