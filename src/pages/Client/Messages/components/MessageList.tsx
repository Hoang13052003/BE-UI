import React from "react";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: any[];
  userDetails: any;
  activeChatRoom: any;
  getMessageTime: (timestamp: string) => string;
  formatTimeLabel: (timestamp: string) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  userDetails,
  activeChatRoom,
  getMessageTime,
  formatTimeLabel,
}) => {
  return (
    <>
      {messages.map((message, index, arr) => {
        const isMyMessage = message.senderId === userDetails?.id;
        const previousMessage = arr[index - 1];
        const nextMessage = arr[index + 1];
        const isFirstMessageInGroup = !(
          previousMessage &&
          previousMessage.senderId === message.senderId &&
          Math.abs(
            new Date(message.timestamp).getTime() -
              new Date(previousMessage.timestamp).getTime()
          ) <
            60 * 1000
        );
        const isLastMessageInGroup = !(
          nextMessage &&
          nextMessage.senderId === message.senderId &&
          Math.abs(
            new Date(nextMessage.timestamp).getTime() -
              new Date(message.timestamp).getTime()
          ) <
            60 * 1000
        );
        const shouldShowTimeLabel =
          index === 0 ||
          new Date(message.timestamp).getTime() -
            new Date(arr[index - 1]?.timestamp || 0).getTime() >
            5 * 60 * 1000;
        return (
          <MessageItem
            key={message.id + "-" + index}
            message={message}
            isMyMessage={isMyMessage}
            isFirstMessageInGroup={isFirstMessageInGroup}
            isLastMessageInGroup={isLastMessageInGroup}
            shouldShowTimeLabel={shouldShowTimeLabel}
            getMessageTime={getMessageTime}
            formatTimeLabel={formatTimeLabel}
            activeChatRoom={activeChatRoom}
            userDetails={userDetails}
          />
        );
      })}
    </>
  );
};

export default MessageList;
