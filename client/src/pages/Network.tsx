import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Connection } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserPlus, X, Check, Share } from "lucide-react";
import ShareEntryDialog from "@/components/network/ShareEntryDialog";

export default function Network() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
  const { toast } = useToast();

  // Fetch current user's connections
  const { data: connections, isLoading: loadingConnections } = useQuery({
    queryKey: ["/api/connections"],
    queryFn: async () => {
      const response = await fetch("/api/connections");
      if (!response.ok) throw new Error("Failed to fetch connections");
      return response.json();
    },
  });

  // Fetch connection requests
  const { data: connectionRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/connections/requests"],
    queryFn: async () => {
      const response = await fetch("/api/connections/requests");
      if (!response.ok) throw new Error("Failed to fetch connection requests");
      return response.json();
    },
  });

  // Search for users
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Send connection request
  const sendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedUserId: userId }),
      });
      if (!response.ok) throw new Error("Failed to send connection request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection request sent",
        description: "The user will be notified of your request.",
      });
    },
  });

  // Accept connection request
  const acceptRequestMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to accept connection request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections/requests"] });
      toast({
        title: "Connection accepted",
        description: "You are now connected with this user.",
      });
    },
  });

  // Reject connection request
  const rejectRequestMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/connections/${connectionId}/reject`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject connection request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/requests"] });
      toast({
        title: "Connection rejected",
        description: "The connection request has been rejected.",
      });
    },
  });

  // Remove connection
  const removeConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove connection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection removed",
        description: "The user has been removed from your connections.",
      });
    },
  });

  // Share an entry with a connection
  const shareEntryMutation = useMutation({
    mutationFn: async ({ userId, entryId }: { userId: number; entryId: number }) => {
      const response = await fetch("/api/entries/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, sharedWithUserId: userId }),
      });
      if (!response.ok) throw new Error("Failed to share entry");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry shared",
        description: "Your learning entry has been shared successfully.",
      });
    },
  });

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Barter Learn Network</h1>
      <p className="text-muted-foreground mb-6">
        Connect with other learners to share knowledge and insights.
      </p>

      <Tabs defaultValue="connections">
        <TabsList className="mb-6">
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="requests">
            Connection Requests
            {connectionRequests?.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {connectionRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="search">Find Learners</TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <h2 className="text-xl font-semibold mb-4">Your Connections</h2>
          {loadingConnections ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : connections?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection: Connection & { user: User }) => (
                <Card key={connection.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.user.avatarUrl || ""} />
                      <AvatarFallback>
                        {getUserInitials(connection.user.fullName || connection.user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{connection.user.fullName || connection.user.username}</CardTitle>
                      <CardDescription>{connection.user.bio || "No bio available"}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeConnectionMutation.mutate(connection.id)}
                      disabled={removeConnectionMutation.isPending}
                    >
                      {removeConnectionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedUser({
                          id: connection.user.id,
                          username: connection.user.fullName || connection.user.username
                        });
                        setShowShareDialog(true);
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Entries
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any connections yet.</p>
              <p className="mt-2">Use the "Find Learners" tab to discover people to connect with.</p>
            </div>
          )}
        </TabsContent>

        {/* Connection Requests Tab */}
        <TabsContent value="requests">
          <h2 className="text-xl font-semibold mb-4">Pending Connection Requests</h2>
          {loadingRequests ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : connectionRequests?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectionRequests.map((request: Connection & { user: User }) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.user.avatarUrl || ""} />
                      <AvatarFallback>
                        {getUserInitials(request.user.fullName || request.user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{request.user.fullName || request.user.username}</CardTitle>
                      <CardDescription>{request.user.bio || "No bio available"}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This user wants to connect with you to share learning entries.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                      disabled={rejectRequestMutation.isPending}
                    >
                      {rejectRequestMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => acceptRequestMutation.mutate(request.id)}
                      disabled={acceptRequestMutation.isPending}
                    >
                      {acceptRequestMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any pending connection requests.</p>
            </div>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <div className="flex w-full max-w-xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button type="submit" disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {searchQuery.length < 2 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Enter at least 2 characters to search.</p>
            </div>
          ) : searching ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user: User & { isConnected?: boolean; hasPendingRequest?: boolean }) => (
                <Card key={user.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl || ""} />
                      <AvatarFallback>
                        {getUserInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{user.fullName || user.username}</CardTitle>
                      <CardDescription>{user.bio || "No bio available"}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    {user.isConnected ? (
                      <Badge variant="outline" className="ml-auto">Already Connected</Badge>
                    ) : user.hasPendingRequest ? (
                      <Badge variant="secondary" className="ml-auto">Request Pending</Badge>
                    ) : (
                      <Button
                        className="ml-auto"
                        onClick={() => sendRequestMutation.mutate(user.id)}
                        disabled={sendRequestMutation.isPending}
                      >
                        {sendRequestMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}