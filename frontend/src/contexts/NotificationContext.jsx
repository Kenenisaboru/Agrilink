import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('agrilink_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('agrilink_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Simulate WebSocket connection
  useEffect(() => {
    // In production, this would be a real WebSocket connection
    setIsConnected(true);

    // Simulate receiving notifications
    const simulateNotification = () => {
      const sampleNotifications = [
        {
          id: Date.now(),
          type: 'order',
          title: 'New Order Received',
          message: 'You have a new order for Premium Coffee',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/dashboard/farmer/orders'
        },
        {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: 'A buyer sent you a message about your product',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/chat'
        },
        {
          id: Date.now(),
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of ETB 4,500 has been received',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/dashboard/farmer/payments'
        },
        {
          id: Date.now(),
          type: 'system',
          title: 'System Update',
          message: 'New features have been added to the platform',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/about'
        }
      ];

      // Randomly add a notification (for demo purposes)
      if (Math.random() > 0.7) {
        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotification);
      }
    };

    // Simulate receiving notifications every 30 seconds (for demo)
    const interval = setInterval(simulateNotification, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png'
      });
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getRecentNotifications = useCallback((limit = 5) => {
    return notifications.slice(0, limit);
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestNotificationPermission,
    getNotificationsByType,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
