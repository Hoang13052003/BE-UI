import React from "react";
import { Avatar } from "antd";

interface TypingUser {
  userId: string | number;
  userAvatar?: string;
  senderName?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string | number;
  TypingDots: React.FC;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId,
  TypingDots,
}) => {
  return (
    <>
      {typingUsers
        .filter((u) => u.userId !== currentUserId)
        .map((u) => (
          <div
            key={u.userId}
            style={{
              display: "flex",
              alignItems: "center",
              margin: "8px 0 8px 8px",
              color: "#888",
              fontSize: 14,
            }}
          >
            <Avatar size={24} style={{ marginRight: 8 }} src={u.userAvatar}>
              {u.senderName ? u.senderName[0] : "U"}
            </Avatar>
            <span>
              <b>{u.senderName || "User"}</b>
            </span>
            <TypingDots />
          </div>
        ))}
    </>
  );
};

export default TypingIndicator;
