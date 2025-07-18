import React, { useState, useEffect } from "react";
import { ChatProvider, useChat, LocalChatMessage } from "../../contexts/ChatContext";
import { Card, List, Input, Button, Layout, Spin } from "antd";
import { getProjectChatRooms, ChatRoom, getProjectChatHistory, ChatMessageResponseDto } from "../../api/chatApi";

const { Sider, Content } = Layout;

// Sidebar: List of project chat rooms from backend
interface SelectedRoom {
  roomId: string;
  projectId: string;
  roomName: string;
}

const ChatSidebar: React.FC<{ onSelect: (room: SelectedRoom) => void; active: SelectedRoom | null }> = ({ onSelect, active }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscribeToProjectRooms } = useChat();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await getProjectChatRooms();
        setRooms(data);
        // Subscribe to all project chat rooms after loading
        subscribeToProjectRooms(data.map(room => room.id));
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [subscribeToProjectRooms]);

  return (
    <Card title="Project Chats" bodyStyle={{ padding: 0 }} style={{ height: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}><Spin /></div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={rooms}
          renderItem={room => (
            <List.Item
              style={{ background: active?.roomId === room.id ? "#f0f5ff" : undefined, cursor: "pointer" }}
              onClick={() => onSelect({ roomId: room.id, projectId: room.projectId || "", roomName: room.roomName })}
            >
              <List.Item.Meta title={room.roomName} description={room.projectId} />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// Main chat window: show messages and input
const ChatWindow: React.FC<{ selectedRoom: SelectedRoom | null }> = ({ selectedRoom }) => {
  const { projectChats, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessageResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Load history when selectedRoom changes
  useEffect(() => {
    if (!selectedRoom) return;
    setLoading(true);
    setPage(0);
    getProjectChatHistory(selectedRoom.projectId, 0, 13)
      .then(res => {
        setHistory(res.messages.reverse());
        setHasNext(res.hasNext);
        setScrollToBottom(true);
      })
      .finally(() => setLoading(false));
  }, [selectedRoom]);

  // Scroll to bottom when open room or send message
  useEffect(() => {
    if (scrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      setScrollToBottom(false);
    }
  }, [history, scrollToBottom]);

  // Infinite scroll: load more when scroll to top
  const handleScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (loading || isLoadingMore || !hasNext || page === null) return;
    const container = e.currentTarget;
    if (container.scrollTop < 32) {
      setIsLoadingMore(true);
      const prevHeight = container.scrollHeight;
      const nextPage = page + 1;
      try {
        const res = await getProjectChatHistory(selectedRoom!.projectId, nextPage, 20);
        setHistory(prev => [...res.messages.reverse(), ...prev]);
        setHasNext(res.hasNext);
        setPage(nextPage);
        // Giữ vị trí cuộn khi prepend
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - prevHeight;
        }, 0);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Get messages from context (projectChats)
  const messages = selectedRoom && projectChats.get(selectedRoom.roomId) ? projectChats.get(selectedRoom.roomId)! : [];

  const handleSend = () => {
    if (!input.trim() || !selectedRoom) return;
    sendMessage({
      type: "project_message",
      projectId: selectedRoom.projectId,
      content: input,
      chatMessageType: "TEXT",
    });
    setInput("");
    setScrollToBottom(true);
  };

  // Gộp lịch sử và real-time (không trùng lặp)
  const allMessages = [...history, ...messages.filter(m => !history.some(h => h.id === m.id))];

  return (
    <Card
      title={selectedRoom ? `Project Chat: ${selectedRoom.roomName}` : "Select a project to chat"}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 0 }}
    >
      <div
        ref={messagesContainerRef}
        style={{ flex: 1, overflowY: "auto", padding: 16, position: "relative" }}
        onScroll={handleScroll}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#888" }}>Loading messages...</div>
        ) : allMessages.length === 0 ? (
          <div style={{ color: "#888" }}>No messages yet.</div>
        ) : (
          <>
            {isLoadingMore && (
              <div style={{ textAlign: "center", color: "#888", marginBottom: 8 }}>Loading more...</div>
            )}
            {allMessages.map((m, idx) => {
              let statusColor = "#aaa";
              if ((m as any).status === "sending") statusColor = "#faad14";
              if ((m as any).status === "failed") statusColor = "#ff4d4f";
              if ((m as any).status === "sent") statusColor = "#52c41a";
              return (
                <div key={m.id || idx} style={{ marginBottom: 8 }}>
                  <b>{m.senderName || m.senderId || "Me"}:</b> {m.content}
                  {(m as any).status && (
                    <span style={{ color: statusColor, marginLeft: 8, fontSize: 12 }}>
                      [{(m as any).status}]
                    </span>
                  )}
                  <span style={{ color: "#bbb", marginLeft: 8, fontSize: 11 }}>
                    {m.timestamp ? new Date(m.timestamp).toLocaleString() : ""}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #eee", padding: 8 }}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={e => { e.preventDefault(); handleSend(); }}
          placeholder="Type a message..."
        />
        <Button type="primary" onClick={handleSend} style={{ marginLeft: 8 }}>
          Send
        </Button>
      </div>
    </Card>
  );
};

// Main Chat Page
const ChatPage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  return (
    <ChatProvider token={localStorage.getItem("token") || ""}>
      <Layout style={{ height: "80vh", background: "#fff" }}>
        <Sider width={250} style={{ background: "#fff", borderRight: "1px solid #eee" }}>
          <ChatSidebar onSelect={setSelectedRoom} active={selectedRoom} />
        </Sider>
        <Content style={{ padding: 24 }}>
          <ChatWindow selectedRoom={selectedRoom} />
        </Content>
      </Layout>
    </ChatProvider>
  );
};

export default ChatPage; 