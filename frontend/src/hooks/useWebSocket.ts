import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useWebSocket = (roomId?: string, options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.warn('No access token found, skipping WebSocket connection');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
    
    // Create Socket.IO connection with authentication
    socketRef.current = io(wsUrl, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      options.onConnect?.();
      
      // Subscribe to room updates if roomId is provided
      if (roomId) {
        socketRef.current?.emit('subscribe:room', { roomId });
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      options.onError?.(error);
    });

    // Listen for booking events
    socketRef.current.on('booking:created', (data) => {
      options.onMessage?.({ type: 'booking_created', ...data });
    });

    socketRef.current.on('booking:cancelled', (data) => {
      options.onMessage?.({ type: 'booking_cancelled', ...data });
    });

    socketRef.current.on('slot:booked', (data) => {
      options.onMessage?.({ type: 'slot_booked', ...data });
    });

    socketRef.current.on('slot:cancelled', (data) => {
      options.onMessage?.({ type: 'slot_cancelled', ...data });
    });

    return () => {
      if (roomId && socketRef.current) {
        socketRef.current.emit('unsubscribe:room', { roomId });
      }
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return { isConnected, sendMessage };
};
