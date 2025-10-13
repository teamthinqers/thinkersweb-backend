import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Loader2, Trophy, Lightbulb, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { CognitiveIdentityCard } from "@/components/CognitiveIdentityCard";
import BadgeDisplay from "@/components/BadgeDisplay";
import SparkIcon from "@/components/ui/spark-icon";

interface UserProfile {
  id: number;
  fullName: string | null;
  linkedinHeadline: string | null;
  linkedinProfileUrl: string | null;
  linkedinPhotoUrl: string | null;
  avatar: string | null;
  email: string;
  aboutMe: string | null;
  cognitiveIdentityPublic: boolean;
  primaryArchetype?: string;
  secondaryArchetype?: string;
  thinkingStyle?: string;
  emotionalPattern?: string;
  lifePhilosophy?: string;
  coreValues?: string;
}

const PublicProfile = () => {
  const params = useParams();
  const userId = params.userId;

  // Fetch user profile
  const { data, isLoading, error } = useQuery<{ success: boolean; user: UserProfile }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch user badges
  const { data: badgesData } = useQuery<{ success: boolean; badges: any[] }>({
    queryKey: [`/api/users/${userId}/badges`],
    enabled: !!userId,
  });

  // Fetch dashboard data for stats
  const { data: dashboardData } = useQuery<{ success: boolean; data: any }>({
    queryKey: [`/api/users/${userId}/dashboard`],
    enabled: !!userId,
  });

  const user = data?.user;
  const allBadgesForDisplay = badgesData?.badges || [];
  const dashboard = dashboardData?.data;
  const profilePhoto = user?.linkedinPhotoUrl || user?.avatar;
  const displayName = user?.fullName || "User Name";
  const displayHeadline = user?.linkedinHeadline || "Professional Headline";
  const linkedinProfileUrl = user?.linkedinProfileUrl || "";
  const hasLinkedIn = !!linkedinProfileUrl;

  if (isLoading) {
    return (
      <SharedAuthLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
            <p className="text-center text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </SharedAuthLayout>
    );
  }

  if (error || !user) {
    return (
      <SharedAuthLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">User not found</p>
                <p className="text-sm text-gray-600">The profile you're looking for doesn't exist.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SharedAuthLayout>
    );
  }

  return (
    <SharedAuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Three-Column Layout - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* LEFT COLUMN - Cognitive Identity Card */}
          <div className="lg:col-span-1">
            <CognitiveIdentityCard
              userId={user.id}
              isPublic={user.cognitiveIdentityPublic}
              isOwnProfile={false}
            />
          </div>

          {/* MIDDLE COLUMN - Profile Details */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
              <CardContent className="p-4">
                {/* Profile Picture */}
                <div className="flex justify-center mb-6">
                  <Avatar className="h-32 w-32 border-4 border-gradient-to-br from-amber-400 to-orange-500">
                    {profilePhoto ? (
                      <AvatarImage src={profilePhoto} alt={displayName} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <div className="mt-1 flex items-center gap-2">
                      {hasLinkedIn ? (
                        <a
                          href={linkedinProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold text-gray-900 hover:text-[#0A66C2] transition-colors cursor-pointer"
                        >
                          {displayName}
                        </a>
                      ) : (
                        <p className="text-base font-semibold text-gray-900">{displayName}</p>
                      )}
                      {hasLinkedIn && (
                        <a
                          href={linkedinProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-sm w-6 h-6 bg-[#0A66C2] hover:bg-[#004182] transition-colors"
                          title="View LinkedIn Profile"
                        >
                          <Linkedin className="h-4 w-4 text-white" fill="currentColor" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Professional Headline */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Professional Headline</p>
                    <p className="mt-1 text-sm text-gray-600">{displayHeadline}</p>
                  </div>

                  {/* LinkedIn Profile URL */}
                  {linkedinProfileUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">LinkedIn Profile</p>
                      <a
                        href={linkedinProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - About Me Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                {user.aboutMe ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-6">{user.aboutMe}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No professional story added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Badges and Contributions Section */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Badges Card */}
          {allBadgesForDisplay.length > 0 && (
            <BadgeDisplay badges={allBadgesForDisplay} />
          )}
          
          {/* Contributions Card */}
          <Card className="inline-flex flex-col gap-2 px-4 py-3 bg-gradient-to-br from-amber-50/80 via-orange-50/80 to-amber-100/80 border-2 border-amber-200/60 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Contributions</span>
            </div>
            
            <div className="h-px w-full bg-amber-300/50 my-1"></div>
            
            <div className="flex items-center gap-6">
              {/* Dots */}
              <div className="flex flex-col items-center gap-1">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">{dashboard?.stats?.dots || 0}</span>
              </div>
              {/* Sparks */}
              <div className="flex flex-col items-center gap-1">
                <SparkIcon className="h-5 w-5" fill="#d97706" />
                <span className="text-sm font-bold text-amber-700">{(dashboard?.stats?.savedSparks || 0) + (dashboard?.neuralStrength?.stats?.userSparksCount || 0)}</span>
              </div>
              {/* Perspectives */}
              <div className="flex flex-col items-center gap-1">
                <Search className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">{dashboard?.stats?.perspectives || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SharedAuthLayout>
  );
};

export default PublicProfile;
