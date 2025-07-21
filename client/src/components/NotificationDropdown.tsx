import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, MessageSquare, Trophy, TrendingUp, Clock, RotateCcw, Settings, X} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { apiGet, apiPatch, apiDelete } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Notification } from '../lib/types';
import { queryClient } from '../lib/queryClient';
import { Client } from '@stomp/stompjs';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'CHAT_MESSAGE':
      return <MessageSquare className="h-4 w-4" />;
    case 'DECLARED_WINNER':
      return <Trophy className="h-4 w-4" />;
    case 'OUTBID':
      return <TrendingUp className="h-4 w-4" />;
    case 'AUCTION_ENDING':
    case 'AUCTION_ENDED':
      return <Clock className="h-4 w-4" />;
    case 'PRODUCT_RELISTED':
      return <RotateCcw className="h-4 w-4" />;
    case 'TIME_UPDATED':
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'CHAT_MESSAGE':
      return 'text-blue-600';
    case 'DECLARED_WINNER':
      return 'text-yellow-600';
    case 'OUTBID':
      return 'text-red-600';
    case 'AUCTION_ENDING':
    case 'AUCTION_ENDED':
      return 'text-orange-600';
    case 'PRODUCT_RELISTED':
      return 'text-green-600';
    case 'TIME_UPDATED':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/notifications'],
    queryFn: () => apiGet('/notifications'),
    enabled: !!user,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['/notifications/unread-count'],
    queryFn: () => apiGet('/notifications/unread-count'),
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiPatch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiPatch('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
    },
  });

  // WebSocket setup for real-time notifications
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/topic/notifications', (msg) => {
          const notification: Notification = JSON.parse(msg.body);
          // Add new notification to the list
          queryClient.setQueryData(['/notifications'], (oldData: Notification[] | undefined) => {
            if (oldData) {
              return [notification, ...oldData];
            }
            return [notification];
          });
          // Update unread count
          queryClient.setQueryData(['/notifications/unread-count'], (oldCount: number | undefined) => {
            return (oldCount || 0) + 1;
          });
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'UNREAD') {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-green-500 text-white border-none flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate mr-2">{notification.title}</span>
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{formatTimeAgo(notification.createdAt)}</span>
                          <button
                            className="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
                            title="Delete notification"
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 truncate">{notification.message}</div>
                        {notification.relatedUrl && (
                          <a
                            href={notification.relatedUrl}
                            className="text-xs text-blue-600 hover:underline mt-1 block"
                            onClick={e => e.stopPropagation()}
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 