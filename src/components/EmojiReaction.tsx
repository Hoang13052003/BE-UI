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
    if (!userDetails || loading) return;

    try {
      setLoading(true);
      
      // Check if user already reacted with this emoji
      const users = currentReactions?.reactionUsers[emoji] || [];
      const isAlreadyReacted = users.some(user => user.userId === userDetails.id);
      
      // Find current user's existing reaction (if any)
      const currentUserReaction = currentReactions?.currentUserReactions?.[0]; // User can only have 1 reaction
      
      // If clicking the same emoji that user already reacted with, remove it
      if (isAlreadyReacted) {
        const request: MessageReactionRequest = {
          messageId,
          emoji,
          addReaction: false
        };
        await sendReaction(request);
      } else {
        // If user has an existing reaction, remove it first
        if (currentUserReaction && currentUserReaction !== emoji) {
          const removeRequest: MessageReactionRequest = {
            messageId,
            emoji: currentUserReaction,
            addReaction: false
          };
          await sendReaction(removeRequest);
        }
        
        // Add the new reaction
        const addRequest: MessageReactionRequest = {
          messageId,
          emoji,
          addReaction: true
        };
        await sendReaction(addRequest);
      }
      
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
    const users = currentReactions?.reactionUsers[emoji] || [];
    const isUserReacted = users.some(user => user.userId === userDetails?.id);
    
    return (
      <Tooltip 
        key={emoji} 
        title={users.map(u => u.userFullName).join(', ')}
        placement="top"
      >
        <Button 
          className={`emoji-reaction-btn ${isUserReacted ? 'user-reacted' : ''}`}
          onClick={() => handleReactionClick(emoji)}
          size="small"
          type="text"
        >
          <span className="emoji">{emoji}</span>
          {count > 1 && <span className="count">{count}</span>}
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

  const hasReactions = currentReactions && currentReactions.reactionCounts && Object.keys(currentReactions.reactionCounts).length > 0;

  return (
    <div className="emoji-reaction-container">
      {hasReactions && (
        <div className="reactions-display">
          {Object.entries(currentReactions?.reactionCounts || {}).map(([emoji, count]) => 
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
