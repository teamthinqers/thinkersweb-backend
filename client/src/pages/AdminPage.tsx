import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-new";
import { Loader2, Users, Shield, CheckCircle2, XCircle, Calendar, Target } from "lucide-react";
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

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();

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
    </div>
  );
}
