import React from "react";
import { ChatProvider } from "../../contexts/ChatContext";

// TODO: Replace with real chat UI
const ChatPage: React.FC = () => {
  return (
    <ChatProvider token={localStorage.getItem("jwt_token") || ""}>
      <div style={{ padding: 32 }}>
        <h2>Chat Page</h2>
        <p>This is the chat page. Chat UI will be implemented here.</p>
      </div>
    </ChatProvider>
  );
};

export default ChatPage; 