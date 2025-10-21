import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-new";
import { Loader2, Users, Shield, CheckCircle2, XCircle, Calendar, Target, PhoneCall, Send, Clock, AlertTriangle, Trash2, Upload } from "lucide-react";
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminUser {
  id: number;
  email: string;
  fullName: string | null;
  username: string | null;
  avatar: string | null;
  linkedinPhotoUrl: string | null;
  linkedinHeadline: string | null;
  linkedinProfileUrl: string | null;
  dotSparkActivated: boolean;
  dotSparkActivatedAt: Date | null;
  subscriptionTier: string | null;
  cognitiveIdentityCompleted: boolean;
  learningEngineCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CircleMember {
  user: {
    id: number;
    email: string;
    fullName: string | null;
    avatar: string | null;
    linkedinPhotoUrl: string | null;
  };
  role: string;
  joinedAt: Date;
}

interface ThinQCircle {
  id: number;
  name: string;
  description: string | null;
  createdBy: number;
  createdAt: Date;
  creator: {
    id: number;
    email: string;
    fullName: string | null;
    avatar: string | null;
    linkedinPhotoUrl: string | null;
  };
  members: CircleMember[];
}

interface ConversationAttempt {
  id: number;
  phoneNumber: string;
  state: string;
  stateData?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface CommunityMember {
  id: number;
  phoneNumber: string;
  name?: string;
  tags?: string;
  notes?: string;
  source: string;
  lastMessagedAt?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // WhatsApp state
  const [broadcastPhone, setBroadcastPhone] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [bulkImportText, setBulkImportText] = useState('');
  const [nudgeMessage, setNudgeMessage] = useState("Hey! 👋 I noticed you tried reaching out to DotSpark earlier. I'm here to help! Just send me your registered email to get started, or visit https://www.dotspark.in to sign up if you're new. 😊");
  const [individualNudgeOpen, setIndividualNudgeOpen] = useState(false);
  const [individualNudgePhone, setIndividualNudgePhone] = useState('');
  const [individualNudgeMessage, setIndividualNudgeMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  // Check if user is admin
  const isAdmin = user?.email === 'aravindhraj1410@gmail.com';

  // Fetch all users and circles
  const { data, isLoading, error, refetch } = useQuery<{ 
    success: boolean; 
    users: AdminUser[];
    circles: ThinQCircle[];
  }>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && isAdmin,
  });

  // WhatsApp queries
  const { data: conversationAttempts = [], isLoading: attemptsLoading } = useQuery<ConversationAttempt[]>({
    queryKey: ['/api/whatsapp/admin/attempts'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && isAdmin,
    refetchInterval: 10000
  });

  const { data: communityMembers = [], isLoading: membersLoading } = useQuery<CommunityMember[]>({
    queryKey: ['/api/community-members'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && isAdmin
  });

  // WhatsApp mutations
  const broadcastMutation = useMutation({
    mutationFn: async ({ phoneNumber, message }: { phoneNumber: string; message: string }) => {
      const res = await apiRequest('POST', '/api/whatsapp/admin/broadcast', { phoneNumber, message });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Message sent", description: `Sent to ${data.to}` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ phoneNumber, name }: { phoneNumber: string; name?: string }) => {
      const res = await apiRequest('POST', '/api/community-members', { phoneNumber, name });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Member added successfully" });
      setNewMemberPhone('');
      setNewMemberName('');
      queryClient.invalidateQueries({ queryKey: ['/api/community-members'] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add member", description: error.message, variant: "destructive" });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/community-members/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Member removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/community-members'] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
    }
  });

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Access denied for non-admin users
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  const users = data?.users || [];
  const circles = data?.circles || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and view all registered users and ThinQ Circles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">DotSpark Active</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.dotSparkActivated).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Cognitive Complete</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.cognitiveIdentityCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Learning Complete</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.learningEngineCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">ThinQ Circles</p>
              <p className="text-2xl font-bold">{circles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Registered Users</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load users</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>DotSpark</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={user.linkedinPhotoUrl || user.avatar || undefined} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                            {user.fullName?.substring(0, 2).toUpperCase() || 
                             user.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName || user.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      {user.linkedinProfileUrl ? (
                        <a 
                          href={user.linkedinProfileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                        {user.subscriptionTier || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.dotSparkActivated ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Inactive</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.cognitiveIdentityCompleted && (
                          <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950">
                            Cognitive ✓
                          </Badge>
                        )}
                        {user.learningEngineCompleted && (
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950">
                            Learning ✓
                          </Badge>
                        )}
                        {!user.cognitiveIdentityCompleted && !user.learningEngineCompleted && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ThinQ Circles Section */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm mt-8">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">ThinQ Circles ({circles.length})</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load circles</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : circles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mb-4 opacity-50" />
            <p>No ThinQ Circles created yet</p>
          </div>
        ) : (
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {circles.map((circle) => (
                <AccordionItem key={circle.id} value={`circle-${circle.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-white font-bold">
                          {circle.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{circle.name}</p>
                          {circle.description && (
                            <p className="text-sm text-muted-foreground">{circle.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{circle.members.length} members</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(circle.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 pl-14">
                      <h4 className="font-medium mb-3">Circle Creator</h4>
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={circle.creator.linkedinPhotoUrl || circle.creator.avatar || undefined} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
                            {circle.creator.fullName?.substring(0, 2).toUpperCase() || 
                             circle.creator.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{circle.creator.fullName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{circle.creator.email}</p>
                        </div>
                      </div>

                      <h4 className="font-medium mb-3">Members ({circle.members.length})</h4>
                      <div className="space-y-3">
                        {circle.members.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage 
                                  src={member.user.linkedinPhotoUrl || member.user.avatar || undefined} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
                                  {member.user.fullName?.substring(0, 2).toUpperCase() || 
                                   member.user.email.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user.fullName || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{member.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {/* WhatsApp Bot Monitoring Section */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm mt-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-6 w-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold">WhatsApp Bot Monitoring</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of unregistered users attempting to contact the bot</p>
              </div>
            </div>
            {conversationAttempts.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm(`Send nudge messages to all ${conversationAttempts.length} stuck users?`)) {
                    conversationAttempts.forEach(attempt => {
                      broadcastMutation.mutate({ phoneNumber: attempt.phoneNumber, message: nudgeMessage });
                    });
                  }
                }}
                disabled={broadcastMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Nudge All ({conversationAttempts.length})
              </Button>
            )}
          </div>
          
          {/* Custom Nudge Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Nudge Message</label>
            <Textarea
              placeholder="Your nudge message..."
              value={nudgeMessage}
              onChange={(e) => setNudgeMessage(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">This message will be sent when you click any Nudge button below</p>
          </div>
        </div>

        {attemptsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversationAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p>No conversation attempts yet</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
              {conversationAttempts.map((attempt) => (
                <div key={attempt.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary" />
                      <span className="font-medium">{attempt.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIndividualNudgePhone(attempt.phoneNumber);
                          setIndividualNudgeMessage(nudgeMessage);
                          setIndividualNudgeOpen(true);
                        }}
                        disabled={broadcastMutation.isPending}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Nudge
                      </Button>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(attempt.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">State:</span>
                      <Badge variant={attempt.state === 'awaiting_email' ? 'secondary' : 'default'}>
                        {attempt.state}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      First contact: {new Date(attempt.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Community Members Section */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Members ({communityMembers.length})
            </CardTitle>
            <CardDescription>
              Manage your community phone numbers for broadcasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="+1234567890"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Name (optional)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <Button 
                  onClick={() => addMemberMutation.mutate({ phoneNumber: newMemberPhone, name: newMemberName })}
                  disabled={addMemberMutation.isPending || !newMemberPhone}
                >
                  Add
                </Button>
              </div>
              
              <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                {membersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : communityMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Users className="h-12 w-12 mb-2 opacity-50" />
                    <p>No members added yet</p>
                  </div>
                ) : (
                  communityMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center p-3">
                      <div>
                        <p className="font-medium">{member.phoneNumber}</p>
                        {member.name && <p className="text-sm text-muted-foreground">{member.name}</p>}
                        {member.lastMessagedAt && (
                          <p className="text-xs text-muted-foreground">
                            Last messaged: {new Date(member.lastMessagedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remove ${member.phoneNumber}?`)) {
                            deleteMemberMutation.mutate(member.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Broadcast Message
            </CardTitle>
            <CardDescription>
              Select contacts from community members and send messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Message Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Broadcast Message</label>
                <Textarea
                  placeholder="Your message to send to selected contacts..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Contact Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Select Contacts ({selectedContacts.length} selected)</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allIds = communityMembers.map(m => m.id);
                        setSelectedContacts(allIds);
                      }}
                      disabled={communityMembers.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContacts([])}
                      disabled={selectedContacts.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : communityMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No community members yet. Add members above to start broadcasting.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                    {communityMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedContacts(prev =>
                            prev.includes(member.id)
                              ? prev.filter(id => id !== member.id)
                              : [...prev, member.id]
                          );
                        }}
                      >
                        <Checkbox 
                          checked={selectedContacts.includes(member.id)}
                          onCheckedChange={(checked) => {
                            setSelectedContacts(prev =>
                              checked
                                ? [...prev, member.id]
                                : prev.filter(id => id !== member.id)
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{member.phoneNumber}</p>
                          {member.name && (
                            <p className="text-sm text-muted-foreground">{member.name}</p>
                          )}
                          {member.lastMessagedAt && (
                            <p className="text-xs text-muted-foreground">
                              Last messaged: {new Date(member.lastMessagedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <Button 
                onClick={() => {
                  if (selectedContacts.length === 0) {
                    toast({ title: "No contacts selected", description: "Please select at least one contact", variant: "destructive" });
                    return;
                  }
                  if (!broadcastMessage) {
                    toast({ title: "No message", description: "Please enter a message to send", variant: "destructive" });
                    return;
                  }
                  
                  // Send to all selected contacts
                  selectedContacts.forEach((contactId) => {
                    const member = communityMembers.find(m => m.id === contactId);
                    if (member) {
                      broadcastMutation.mutate({ 
                        phoneNumber: member.phoneNumber, 
                        message: broadcastMessage 
                      });
                    }
                  });
                  
                  toast({ 
                    title: "Sending messages...", 
                    description: `Sending to ${selectedContacts.length} contact(s)` 
                  });
                  
                  // Clear selections after sending
                  setSelectedContacts([]);
                  setBroadcastMessage('');
                }}
                disabled={broadcastMutation.isPending || selectedContacts.length === 0 || !broadcastMessage}
                className="w-full"
              >
                {broadcastMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Nudge Dialog */}
      <Dialog open={individualNudgeOpen} onOpenChange={setIndividualNudgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Custom Message</DialogTitle>
            <DialogDescription>
              Send a personalized nudge to {individualNudgePhone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Type your custom message..."
              value={individualNudgeMessage}
              onChange={(e) => setIndividualNudgeMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIndividualNudgeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                broadcastMutation.mutate({ 
                  phoneNumber: individualNudgePhone, 
                  message: individualNudgeMessage 
                });
                setIndividualNudgeOpen(false);
              }}
              disabled={broadcastMutation.isPending || !individualNudgeMessage}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
