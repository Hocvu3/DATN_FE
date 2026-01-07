"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
  userRole?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
  userRole,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Debug logging
    console.log("NotificationContext: userId=", userId, "userRole=", userRole);
    
    // Connect for all authenticated users
    if (!userId) {
      console.warn("⚠️ Not connecting to notification server - No userId");
      return;
    }

    // Backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    console.log("Connecting to notification server:", `${backendUrl}/notifications`);

    const newSocket = io(`${backendUrl}/notifications`, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      timeout: 10000,
      path: "/api/socket.io/",
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to notification server");
      setIsConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from notification server:", reason);
      setIsConnected(false);
    });

    newSocket.on("notification", (notification: Notification) => {
      console.log("📬 Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      
      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icons/notification.png",
        });
      }
    });

    newSocket.on("unreadCount", (count: number) => {
      console.log("Unread count:", count);
      setUnreadCount(count);
    });

    setSocket(newSocket);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      newSocket.disconnect();
    };
  }, [userId, userRole]);

  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!socket) return;

      socket.emit(
        "getNotifications",
        { page, limit },
        (response: { success: boolean; data?: any }) => {
          if (response.success && response.data) {
            setNotifications(response.data.data || []);
          }
        }
      );
    },
    [socket]
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (!socket) return;

      socket.emit(
        "markAsRead",
        { notificationId },
        (response: { success: boolean }) => {
          if (response.success) {
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === notificationId ? { ...notif, isRead: true } : notif
              )
            );
          }
        }
      );
    },
    [socket]
  );

  const markAllAsRead = useCallback(() => {
    if (!socket) return;

    socket.emit("markAllAsRead", {}, (response: { success: boolean }) => {
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    });
  }, [socket]);

  const clearAllNotifications = useCallback(() => {
    if (!socket) return;

    socket.emit("clearAll", {}, (response: { success: boolean }) => {
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    });
  }, [socket]);

  // Fetch initial notifications when connected
  useEffect(() => {
    if (isConnected && userId) {
      fetchNotifications();
    }
  }, [isConnected, userId, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
