import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";

const Profile = () => {
  const { user } = useAuth();

  const linkedinProfileUrl = (user as any)?.linkedinProfileUrl || "https://linkedin.com";
  const profilePhoto = (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || (user as any)?.avatar;
  const fullName = (user as any)?.fullName || (user as any)?.displayName || "User Name";
  const headline = (user as any)?.linkedinHeadline || "Professional Headline";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6">
            {/* Profile Picture */}
            <Avatar className="h-24 w-24 border-2 border-gray-200">
              {profilePhoto ? (
                <AvatarImage src={profilePhoto} alt={fullName} />
              ) : (
                <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Name and LinkedIn Icon */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <a
                  href={linkedinProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-sm w-6 h-6 bg-[#0A66C2] hover:bg-[#004182] transition-colors"
                  title="View LinkedIn Profile"
                >
                  <Linkedin className="h-4 w-4 text-white" fill="currentColor" />
                </a>
              </div>

              {/* Professional Headline */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {headline}
              </p>
            </div>
          </div>

          {/* View Profile Button */}
          <a href={linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button 
              variant="outline" 
              className="w-full border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white font-semibold text-base py-6 rounded-full transition-all duration-200"
            >
              View Profile
            </Button>
          </a>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Email</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Integration Notice */}
      {!(user as any)?.linkedinId && (
        <Card className="mt-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Linkedin className="h-5 w-5 text-amber-700 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Connect Your LinkedIn</h3>
                <p className="text-sm text-amber-800">
                  Sign in with LinkedIn to automatically sync your professional profile picture and headline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
