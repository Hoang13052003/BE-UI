// src/services/stompService.ts
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

const VITE_API_URL_HTTP = import.meta.env.VITE_API_URL; // Ví dụ: http://localhost:8080
// Chuyển đổi sang URL cho WebSocket (nếu VITE_API_URL là http)
// Nếu VITE_API_URL đã là ws:// hoặc wss:// thì không cần
const STOMP_URL_SOCKJS = `${VITE_API_URL_HTTP}/ws/audit-logs`; // Endpoint cho SockJS

let stompClient: Client | null = null;
let isConnecting = false;
const connectionPromiseQueue: Array<{ resolve: (client: Client) => void; reject: (reason?: any) => void }> = [];

interface SubscriptionCallbacks {
  [destination: string]: ((message: IMessage) => void) | undefined;
}
const activeSubscriptions: Map<string, StompSubscription> = new Map();
const subscriptionCallbacks: SubscriptionCallbacks = {};

const connect = (): Promise<Client> => {
  return new Promise((resolve, reject) => {
    if (stompClient && stompClient.active) {
      console.log("STOMP: Already connected.");
      resolve(stompClient);
      return;
    }

    if (isConnecting) {
      console.log("STOMP: Connection in progress, adding to queue.");
      connectionPromiseQueue.push({ resolve, reject });
      return;
    }

    isConnecting = true;
    console.log("STOMP: Attempting to connect...");

    const token = localStorage.getItem('token'); // Lấy token từ localStorage

    const socket = new SockJS(STOMP_URL_SOCKJS);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        // Gửi token qua STOMP headers nếu interceptor backend của bạn cho STOMP endpoint kiểm tra nó.
        // Hiện tại, cấu hình backend của bạn không có interceptor xác thực riêng cho STOMP endpoint.
        // Nếu bạn thêm, đây là nơi để gửi token:
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      debug: (str) => {
        console.log('STOMP (Global): ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        isConnecting = false;
        stompClient = client;
        console.log('STOMP: Connected: ' + frame);
        resolve(client);
        // Xử lý queue nếu có
        connectionPromiseQueue.forEach(p => p.resolve(client));
        connectionPromiseQueue.length = 0; // Clear queue

        // Tự động subscribe lại vào các kênh đã đăng ký trước đó nếu có
        Object.keys(subscriptionCallbacks).forEach(dest => {
            if (subscriptionCallbacks[dest]) {
                subscribe(dest, subscriptionCallbacks[dest]!);
            }
        });
      },
      onStompError: (frame) => {
        isConnecting = false;
        console.error('STOMP: Broker reported error: ' + frame.headers['message']);
        console.error('STOMP: Additional details: ' + frame.body);
        reject(frame);
        connectionPromiseQueue.forEach(p => p.reject(frame));
        connectionPromiseQueue.length = 0;
        // Có thể emit một event hoặc gọi callback để UI biết kết nối lỗi
      },
      onWebSocketError: (errorEvent) => {
        isConnecting = false;
        console.error("STOMP: WebSocket Error:", errorEvent);
        reject(errorEvent);
        connectionPromiseQueue.forEach(p => p.reject(errorEvent));
        connectionPromiseQueue.length = 0;
      },
      onWebSocketClose: (closeEvent) => {
        console.log("STOMP: WebSocket connection closed:", closeEvent);
        // isConnecting và stompClient.active sẽ tự động được cập nhật bởi thư viện
        // Khi reconnectDelay > 0, thư viện sẽ tự động thử kết nối lại.
        // Nếu bạn muốn xử lý thêm, có thể thêm ở đây.
        // Ví dụ: clear activeSubscriptions để nó được tạo lại khi onConnect
        activeSubscriptions.clear();
      }
    });

    client.activate();
  });
};

const disconnect = async () => {
  if (stompClient && stompClient.active) {
    try {
      await stompClient.deactivate();
      console.log("STOMP: Deactivated successfully.");
    } catch (error) {
      console.error("STOMP: Error during deactivation:", error);
    }
  } else {
    console.log("STOMP: Client not active or already disconnected.");
  }
  stompClient = null;
  isConnecting = false;
  activeSubscriptions.clear(); // Xóa các subscription đang hoạt động
  // Không xóa subscriptionCallbacks để có thể subscribe lại khi kết nối lại
};

const subscribe = (destination: string, callback: (message: IMessage) => void): StompSubscription | undefined => {
  subscriptionCallbacks[destination] = callback; // Lưu callback để có thể re-subscribe

  if (stompClient && stompClient.active) {
    if (activeSubscriptions.has(destination)) {
        console.warn(`STOMP: Already subscribed to ${destination}. Re-using existing subscription or check logic.`);
        // Có thể bạn muốn unsubscribe trước rồi subscribe lại, hoặc chỉ trả về subscription cũ
        // return activeSubscriptions.get(destination);
        // Hoặc, để đơn giản, nếu đã có thì không làm gì, chỉ cần callback đã được cập nhật
    }
    console.log(`STOMP: Subscribing to ${destination}`);
    const subscription = stompClient.subscribe(destination, (message: IMessage) => {
      // Gọi callback đã lưu trữ, đảm bảo là callback mới nhất từ component
      if (subscriptionCallbacks[destination]) {
        subscriptionCallbacks[destination]!(message);
      }
    });
    activeSubscriptions.set(destination, subscription);
    return subscription;
  } else {
    console.warn(`STOMP: Client not connected. Subscription to ${destination} will be attempted upon connection.`);
    // Không cần làm gì thêm, onConnect sẽ tự động subscribe lại
    return undefined;
  }
};

const unsubscribe = (destination: string) => {
  const subscription = activeSubscriptions.get(destination);
  if (subscription) {
    subscription.unsubscribe();
    activeSubscriptions.delete(destination);
    console.log(`STOMP: Unsubscribed from ${destination}`);
  }
  delete subscriptionCallbacks[destination]; // Xóa callback đã lưu
};

const publish = (destination: string, body?: string, headers?: { [key: string]: any }) => {
  if (stompClient && stompClient.active) {
    stompClient.publish({ destination, body, headers });
  } else {
    console.error(`STOMP: Cannot publish to ${destination}. Client not connected.`);
    // Có thể thêm logic retry hoặc thông báo lỗi
    // Hoặc kết nối rồi mới publish
    // connect().then(() => {
    //     stompClient?.publish({ destination, body, headers });
    // }).catch(err => console.error("Failed to connect for publishing", err));
  }
};

const getClient = (): Client | null => {
    return stompClient;
};

const isActive = (): boolean => {
    return !!stompClient && stompClient.active;
};


export const stompService = {
  connect,
  disconnect,
  subscribe,
  unsubscribe,
  publish,
  getClient,
  isActive,
};