import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-new";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, Check, CheckCheck, Sparkles, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  recipientId: number;
  actorIds: string;
  notificationType: string;
  thoughtId: number;
  thoughtHeading: string;
  isRead: boolean;
  createdAt: string;
  actors: Array<{
    id: number;
    fullName: string | null;
    avatar: string | null;
  }>;
  actorCount: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery<{
    success: boolean;
    notifications: Notification[];
    unreadCount: number;
  }>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/notifications/read-all`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    // Navigate to the thought and open full view modal
    // Store the thought ID to open the modal on social page
    sessionStorage.setItem('openThoughtId', notification.thoughtId.toString());
    setLocation(`/social`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_thought':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'new_perspective':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'spark_saved':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const actorNames = notification.actors.map(a => a.fullName || 'Someone').slice(0, 2);
    const remainingCount = notification.actorCount - actorNames.length;

    let message = '';
    
    if (notification.actorCount === 1) {
      message = actorNames[0];
    } else if (notification.actorCount === 2) {
      message = `${actorNames[0]} and ${actorNames[1]}`;
    } else {
      message = `${actorNames[0]} and ${remainingCount} other${remainingCount > 1 ? 's' : ''}`;
    }

    switch (notification.notificationType) {
      case 'new_thought':
        return `${message} shared a new thought`;
      case 'new_perspective':
        return `${message} shared a perspective`;
      case 'spark_saved':
        return `${message} saved a thought as a spark`;
      default:
        return message;
    }
  };

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-2">
              You'll be notified of all social engagement and activity
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all
                    ${notification.isRead 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100'
                    }
                    border ${notification.isRead ? 'border-gray-200' : 'border-orange-200'}
                  `}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notificationType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      "{notification.thoughtHeading}"
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
