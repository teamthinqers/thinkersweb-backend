import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-new";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, Check, CheckCheck, MessageSquare, FileText, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import SparkIcon from "@/components/ui/spark-icon";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  recipientId: number;
  actorIds: string;
  notificationType: string;
  thoughtId?: number | null;
  thoughtHeading?: string | null;
  badgeId?: number | null;
  circleInviteId?: number | null;
  circleName?: string | null;
  isRead: boolean;
  createdAt: string;
  actors: Array<{
    id: number;
    fullName: string | null;
    avatar: string | null;
  }>;
  actorCount: number;
  badge?: {
    id: number;
    name: string;
    icon: string;
    description: string;
  } | null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  // Accept circle invite
  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const res = await apiRequest("POST", `/api/thinq-circles/invites/${inviteId}/accept`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Invite accepted!',
        description: 'You are now a member of the circle.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles/my-circles'] });
      
      // Navigate to the circle
      if (data.circleId) {
        setLocation(`/thinq-circle/${data.circleId}`);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to accept invite',
        variant: 'destructive',
      });
    },
  });

  // Reject circle invite
  const rejectInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return apiRequest("POST", `/api/thinq-circles/invites/${inviteId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Invite rejected',
        description: 'You declined the circle invitation.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject invite',
        variant: 'destructive',
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Badge and circle invite notifications don't navigate anywhere
    if (notification.notificationType === 'badge_unlocked' || notification.notificationType === 'circle_invite') {
      return;
    }
    
    // Navigate to the thought and open full view modal
    if (notification.thoughtId) {
      sessionStorage.setItem('openThoughtId', notification.thoughtId.toString());
      setLocation(`/social`);
    }
  };

  const getNotificationIcon = (type: string, badge?: Notification['badge']) => {
    switch (type) {
      case 'new_thought':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'new_perspective':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'spark_saved':
        return <SparkIcon className="h-5 w-5" fill="#6366f1" />;
      case 'badge_unlocked':
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case 'circle_invite':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    // Badge unlock notification
    if (notification.notificationType === 'badge_unlocked' && notification.badge) {
      return `You unlocked the ${notification.badge.name} badge!`;
    }

    // Circle invite notification
    if (notification.notificationType === 'circle_invite') {
      const inviter = notification.actors[0]?.fullName || 'Someone';
      return `${inviter} invited you to join "${notification.circleName}"`;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-500 to-indigo-500 shadow-[0_8px_30px_rgba(59,130,246,0.25)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-white text-blue-600 text-sm px-2 py-0.5 rounded-full font-semibold">
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
                className="text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
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
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                    }
                    border ${notification.isRead ? 'border-gray-200' : 'border-blue-200'}
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
                    {notification.notificationType === 'badge_unlocked' && notification.badge ? (
                      <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                        <span className="text-lg">{notification.badge.icon}</span>
                        {notification.badge.description}
                      </p>
                    ) : notification.notificationType === 'circle_invite' && notification.circleInviteId ? (
                      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          onClick={() => acceptInviteMutation.mutate(notification.circleInviteId!)}
                          disabled={acceptInviteMutation.isPending}
                          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                        >
                          {acceptInviteMutation.isPending ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectInviteMutation.mutate(notification.circleInviteId!)}
                          disabled={rejectInviteMutation.isPending}
                        >
                          {rejectInviteMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    ) : notification.thoughtHeading && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        "{notification.thoughtHeading}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
