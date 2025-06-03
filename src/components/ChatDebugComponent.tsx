import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjectChats, getProjectChatHistory } from '../api/chatApi';

const ChatDebugComponent: React.FC = () => {  const { 
    chatRooms, 
    messages, 
    activeChatRoom,
    selectChatRoom,
    loading
  } = useChat();
  const { userDetails, isAuthenticated } = useAuth();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [lastActiveRoomId, setLastActiveRoomId] = useState<string | null>(null);
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);

  // Monitor real-time state changes
  useEffect(() => {
    const currentRoomId = activeChatRoom?.id || null;
    const currentMessageCount = messages.length;
    
    if (currentRoomId !== lastActiveRoomId) {
      if (currentRoomId) {
        addLog(`🔄 State Change: Active room changed to "${activeChatRoom?.roomName}" (${currentRoomId})`);
      } else if (lastActiveRoomId) {
        addLog(`🔄 State Change: Active room cleared (was ${lastActiveRoomId})`);
      }
      setLastActiveRoomId(currentRoomId);
    }
    
    if (currentMessageCount !== lastMessageCount) {
      addLog(`📊 State Change: Messages count changed from ${lastMessageCount} to ${currentMessageCount}`);
      if (currentMessageCount > 0 && lastMessageCount === 0) {
        addLog(`✅ SUCCESS: Messages loaded successfully!`);
      }
      setLastMessageCount(currentMessageCount);
    }
  }, [activeChatRoom, messages, lastActiveRoomId, lastMessageCount]);
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-20));
  };
  const testAll = async () => {
    addLog('🚀 === TESTING ALL CHAT FUNCTIONALITY ===');
    
    try {
      // 1. Test Direct API
      addLog('');
      addLog('1️⃣ Testing Direct API...');
      const roomsResponse = await getUserProjectChats();
      addLog(`✅ API: Got ${roomsResponse.length} chat rooms`);
      
      if (roomsResponse.length > 0) {
        const firstRoom = roomsResponse[0];
        addLog(`📋 API: First room "${firstRoom.roomName}" (ID: ${firstRoom.id})`);
        addLog(`🆔 API: Project ID: ${firstRoom.projectId || 'N/A'}`);
        
        if (firstRoom.projectId) {
          const historyResponse = await getProjectChatHistory(firstRoom.projectId);
          addLog(`✅ API: Got ${historyResponse.messages.length} messages`);
        }
      }
      
      // 2. Compare with ChatContext (current state)
      addLog('');
      addLog('2️⃣ Comparing with ChatContext...');
      addLog(`📊 Context: ${chatRooms.length} rooms, ${messages.length} messages`);
      addLog(`🔍 Context: Loading = ${loading ? 'Yes' : 'No'}`);
      addLog(`📋 Context: Active room = ${activeChatRoom?.id || 'null'}`);
      
      if (chatRooms.length > 0 && roomsResponse.length > 0) {
        const contextRoom = chatRooms[0];
        const apiRoom = roomsResponse[0];
        addLog(`🆔 Context room ID: "${contextRoom.id}"`);
        addLog(`🆔 API room ID: "${apiRoom.id}"`);
        addLog(`🔍 IDs match: ${contextRoom.id === apiRoom.id ? '✅ Yes' : '❌ No'}`);
      }
      
      // 3. Test current UI state
      addLog('');
      addLog('3️⃣ Testing Current UI State...');
      const messageElements = document.querySelectorAll('[style*="marginBottom: 24"], .ant-list-item');
      const loadingElements = document.querySelectorAll('.ant-spin');
      const emptyElements = document.querySelectorAll('.ant-empty');
      
      addLog(`🔍 DOM: ${messageElements.length} message elements`);
      addLog(`⏳ DOM: ${loadingElements.length} loading spinners`);
      addLog(`📭 DOM: ${emptyElements.length} empty state elements`);
      
      if (messages.length > 0) {
        const firstMessage = messages[0];
        addLog(`💬 First message: "${firstMessage.content}" by ${firstMessage.senderName}`);
        const uniqueIds = new Set(messages.map((m: any) => m.id));
        addLog(`🔍 Message IDs: ${uniqueIds.size}/${messages.length} unique`);
      }
      
      // 4. Final diagnosis based on current state
      addLog('');
      addLog('4️⃣ === CURRENT STATE DIAGNOSIS ===');
      const hasActiveRoom = !!activeChatRoom;
      const hasMessages = messages.length > 0;
      const hasUIMessages = messageElements.length > 1;
      const noEmptyState = emptyElements.length === 0;
      const notLoading = !loading;
      
      if (hasActiveRoom && hasMessages && hasUIMessages && notLoading) {
        addLog('🎉 PERFECT: Chat is working perfectly!');
        addLog(`  ✅ Active Room: ${activeChatRoom.roomName}`);
        addLog(`  ✅ Messages: ${messages.length} loaded`);
        addLog(`  ✅ UI: Messages displayed`);
        addLog(`  ✅ Loading: Complete`);
      } else if (hasMessages && hasUIMessages && noEmptyState) {
        addLog('✅ WORKING: Messages loaded and displayed');
        addLog(`  ✅ Messages: ${messages.length} loaded`);
        addLog(`  ✅ UI: Messages displayed`);
        if (!hasActiveRoom) addLog(`  ⚠️ Active Room: Not set (may be normal)`);
        if (loading) addLog(`  ⚠️ Loading: Still in progress`);
      } else if (chatRooms.length > 0 && !hasActiveRoom) {
        addLog('ℹ️ READY: Rooms available, no room selected yet');
        addLog(`  ✅ Rooms: ${chatRooms.length} available`);
        addLog(`  ℹ️ Action: Click a room to load messages`);
      } else {
        addLog('⚠️ ISSUES DETECTED:');
        if (!chatRooms.length) addLog('  ❌ No chat rooms available');
        if (chatRooms.length > 0 && !hasActiveRoom) addLog('  ⚠️ No room selected');
        if (hasActiveRoom && !hasMessages && !loading) addLog('  ❌ Room selected but no messages');
        if (hasMessages && !hasUIMessages) addLog('  ❌ Messages in context but not displayed');
        if (loading) addLog('  ⏳ Still loading...');
      }
      
      addLog('');
      addLog('💡 RECOMMENDATION:');
      if (chatRooms.length > 0 && !hasActiveRoom) {
        addLog('  � Click on a chat room below to test manual selection');
      } else if (hasActiveRoom && hasMessages) {
        addLog('  ✅ Everything looks good! Chat is working properly');
      } else if (chatRooms.length === 0) {
        addLog('  📝 Create a chat room first');
      }
      
      addLog('🔍 Check browser console for detailed ChatContext logs');
      
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div style={{ 
      border: '2px solid #e74c3c', 
      borderRadius: '8px', 
      padding: '16px', 
      margin: '16px 0',
      backgroundColor: '#fff5f5'
    }}>
      <h3 style={{ color: '#e74c3c', marginTop: 0 }}>🔧 Chat Debug Panel</h3>
      
      {/* Current State */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px', 
        borderRadius: '4px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>📊 Current State:</h4>
        <p style={{ margin: '4px 0' }}>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>User ID:</strong> {userDetails?.id || 'Not logged in'}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Chat Rooms:</strong> {chatRooms.length} rooms
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Messages:</strong> {messages.length} messages
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Active Room:</strong> {activeChatRoom ? `${activeChatRoom.roomName} (ID: ${activeChatRoom.id})` : 'None'}
        </p>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={testAll}
          style={{ 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '4px', 
            marginRight: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🚀 Test All Chat Functionality
        </button>
        
        <button 
          onClick={clearLogs}
          style={{ 
            backgroundColor: '#95a5a6', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Debug Console */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        color: '#ecf0f1', 
        padding: '12px', 
        borderRadius: '4px', 
        fontFamily: 'monospace', 
        fontSize: '12px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <div style={{ 
          borderBottom: '1px solid #34495e', 
          paddingBottom: '8px', 
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          🖥️ Debug Console
        </div>
        {debugLogs.length === 0 ? (
          <div style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            No debug logs yet. Click the test buttons above.
          </div>
        ) : (
          debugLogs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))
        )}
      </div>      {/* Chat Rooms List */}
      {chatRooms.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4>📋 Available Chat Rooms (Click to test):</h4>
          {chatRooms.map((room, index) => (
            <div 
              key={index}              onClick={() => {
                addLog(`🖱️ User Click: Selecting room "${room.roomName}" (${room.id})`);
                addLog(`📋 Before Click: activeChatRoom = ${activeChatRoom?.id || 'null'}, messages = ${messages.length}`);
                
                // Use selectChatRoom function directly
                selectChatRoom(room.id);
                
                // The useEffect above will automatically log the state changes
                addLog(`⏳ Waiting for state update...`);
              }}
              style={{ 
                padding: '12px', 
                backgroundColor: activeChatRoom?.id === room.id ? '#d4edda' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeChatRoom?.id !== room.id) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (activeChatRoom?.id !== room.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {room.roomName} {activeChatRoom?.id === room.id && '← ACTIVE'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                ID: {room.id} | Unread: {room.unreadCount}
              </div>
              {room.projectId && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Project: {room.projectName} ({room.projectId})
                </div>
              )}
            </div>
          ))}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
            💡 Click any room above to test manual selection and message loading
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDebugComponent;
