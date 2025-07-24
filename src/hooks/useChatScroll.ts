import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook tối ưu scroll cho giao diện chat
 * - Scroll xuống dưới cùng khi vào phòng chat hoặc có tin nhắn mới (nếu đang ở cuối)
 * - Giữ nguyên vị trí khi tải thêm tin nhắn cũ
 * - Trả về ref cho container, ref cho cuối danh sách, và hàm scrollToBottom
 */
export function useChatScroll(messages: any[], isLoadingMore: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);
  const prevMsgCountRef = useRef<number>(0);

  // Scroll xuống dưới cùng
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Khi có tin nhắn mới, nếu user đang ở cuối thì auto scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Nếu vừa tải thêm tin nhắn cũ thì giữ nguyên vị trí
    if (isLoadingMore && prevMsgCountRef.current < messages.length) {
      const newHeight = container.scrollHeight;
      const diff = newHeight - prevHeightRef.current;
      container.scrollTop = diff;
      prevHeightRef.current = newHeight;
      prevMsgCountRef.current = messages.length;
      return;
    }
    // Nếu user đang ở gần cuối hoặc vào phòng mới thì auto scroll
    const threshold = 150;
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    if (distanceFromBottom < threshold) {
      scrollToBottom('auto');
    }
    prevHeightRef.current = container.scrollHeight;
    prevMsgCountRef.current = messages.length;
  }, [messages, isLoadingMore, scrollToBottom]);

  // Khi vào phòng chat mới, scroll xuống dưới cùng
  useEffect(() => {
    prevHeightRef.current = containerRef.current?.scrollHeight || 0;
    prevMsgCountRef.current = messages.length;
    scrollToBottom('auto');
  }, []);

  return { containerRef, endRef, scrollToBottom };
} 