import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-new";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Users, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinCircleInvitePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [inviteAccepted, setInviteAccepted] = useState(false);
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Validate token and get invite details
  const { data: inviteData, isLoading, error } = useQuery<{
    success: boolean;
    invite: {
      id: number;
      circleId: number;
      circleName: string;
      inviterName: string;
      inviteeEmail: string;
      status: string;
      expiresAt: string;
    };
  }>({
    queryKey: [`/api/thinq-circles/invites/validate/${token}`],
    enabled: !!token,
    retry: false,
  });

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: async () => {
      if (!inviteData?.invite) throw new Error('No invite data');
      const res = await apiRequest('POST', `/api/thinq-circles/invites/${inviteData.invite.id}/accept`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      setInviteAccepted(true);
      // Redirect to circle after 2 seconds
      setTimeout(() => {
        if (data.circleId) {
          setLocation(`/thinq-circle/${data.circleId}`);
        }
      }, 2000);
    },
  });

  // Auto-accept if user is logged in and invite is valid
  useEffect(() => {
    if (user && inviteData?.invite && inviteData.invite.status === 'pending' && !inviteAccepted) {
      acceptInviteMutation.mutate();
    }
  }, [user, inviteData]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-center">Invalid Invite Link</CardTitle>
            <CardDescription className="text-center">
              This invite link is missing the required token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/mydotspark")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Validating invite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteData?.invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-center">Invite Not Found</CardTitle>
            <CardDescription className="text-center">
              This invite link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/mydotspark")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invite = inviteData.invite;

  // If invite accepted, show success
  if (inviteAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center">Invite Accepted!</CardTitle>
            <CardDescription className="text-center">
              You are now a member of {invite.circleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">Redirecting to circle...</p>
            <Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If invite already accepted
  if (invite.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-center">Invite Already Processed</CardTitle>
            <CardDescription className="text-center">
              This invite has already been {invite.status}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation(`/thinq-circle/${invite.circleId}`)} className="w-full">
              Go to Circle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user not logged in, redirect to auth with return URL
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-center">Circle Invitation</CardTitle>
            <CardDescription className="text-center">
              {invite.inviterName} invited you to join "{invite.circleName}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Circle:</strong> {invite.circleName}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Invited by:</strong> {invite.inviterName}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Email:</strong> {invite.inviteeEmail}
              </p>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Please sign in or create an account to accept this invitation
            </p>

            <Button 
              onClick={() => {
                // Store token for after auth
                sessionStorage.setItem('pendingCircleInvite', token);
                setLocation('/auth');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              Sign In / Sign Up
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Should not reach here as auto-accept would trigger
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Processing invite...</p>
        </CardContent>
      </Card>
    </div>
  );
}
