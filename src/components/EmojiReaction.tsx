import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Typography, Popover, Row, Col, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { MessageReactionResponse, MessageReactionRequest } from '../api/chatApi';
import chatApi from '../api/chatApi';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import './EmojiReaction.css';

const { Text } = Typography;

interface EmojiReactionProps {
  messageId: string;
  reactions?: MessageReactionResponse;
  onReactionChange?: (messageId: string, reactions: MessageReactionResponse) => void;
}

// Common emoji list for quick selection
const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯', '🎉'];

const EmojiReaction: React.FC<EmojiReactionProps> = ({ 
  messageId, 
  reactions, 
  onReactionChange 
}) => {
  const { userDetails } = useAuth();
  const { sendReaction } = useChat();
  const [loading, setLoading] = useState(false);
  const [currentReactions, setCurrentReactions] = useState<MessageReactionResponse | undefined>(reactions);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  useEffect(() => {
    setCurrentReactions(reactions);
  }, [reactions]);

  // Load reactions if not provided
  useEffect(() => {
    if (!currentReactions && messageId) {
      loadReactions();
    }
  }, [messageId]);

  const loadReactions = async () => {
    try {
      const response = await chatApi.getMessageReactions(messageId);
      setCurrentReactions(response.data);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const handleReactionClick = async (emoji: string) => {
    if (!userDetails) return;

    try {
      setLoading(true);
      
      // Check if user already reacted with this emoji
      const isAlreadyReacted = currentReactions?.currentUserReactions.includes(emoji);
      
      const request: MessageReactionRequest = {
        messageId,
        emoji,
        addReaction: !isAlreadyReacted
      };

      // Sử dụng sendReaction từ context (ưu tiên WebSocket, fallback REST)
      await sendReaction(request);
      
      // Reload reactions to get updated data
      const response = await chatApi.getMessageReactions(messageId);
      const updatedReactions = response.data;
      
      setCurrentReactions(updatedReactions);
      onReactionChange?.(messageId, updatedReactions);

      setEmojiPickerVisible(false);
      
    } catch (error: any) {
      console.error('Failed to add/remove reaction:', error);
      message.error('Không thể thêm/xóa reaction. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderReactionButton = (emoji: string, count: number) => {
    const isUserReacted = currentReactions?.currentUserReactions.includes(emoji);
    const users = currentReactions?.reactionUsers[emoji] || [];
    
    const tooltipContent = (
      <div>
        {users.map((user) => (
          <div key={user.userId}>
            {user.userFullName}
          </div>
        ))}
      </div>
    );

    return (
      <Tooltip key={emoji} title={tooltipContent} placement="top">
        <Button
          size="small"
          type={isUserReacted ? "primary" : "default"}
          className={`emoji-reaction-btn ${isUserReacted ? 'user-reacted' : ''}`}
          onClick={() => handleReactionClick(emoji)}
          disabled={loading}
        >
          <span className="emoji">{emoji}</span>
          <span className="count">{count}</span>
        </Button>
      </Tooltip>
    );
  };

  const renderEmojiPicker = () => (
    <div className="emoji-picker">
      <Text strong>Chọn emoji:</Text>
      <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
        {COMMON_EMOJIS.map((emoji) => (
          <Col key={emoji}>
            <Button
              size="small"
              type="text"
              className="emoji-picker-btn"
              onClick={() => handleReactionClick(emoji)}
              disabled={loading}
            >
              <span className="emoji-large">{emoji}</span>
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );

  const hasReactions = currentReactions && Object.keys(currentReactions.reactionCounts).length > 0;

  return (
    <div className="emoji-reaction-container">
      {hasReactions && (
        <div className="reactions-display">
          {Object.entries(currentReactions.reactionCounts).map(([emoji, count]) => 
            renderReactionButton(emoji, count)
          )}
        </div>
      )}
      
      <Popover
        content={renderEmojiPicker()}
        title={null}
        trigger="click"
        open={emojiPickerVisible}
        onOpenChange={setEmojiPickerVisible}
        placement="topLeft"
      >
        <Button
          size="small"
          type="text"
          icon={<SmileOutlined />}
          className="add-reaction-btn"
          disabled={loading}
        />
      </Popover>
    </div>
  );
};

export default EmojiReaction;
