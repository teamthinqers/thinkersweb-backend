import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Camera, Pencil, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: (user as any)?.fullName || '',
    headline: (user as any)?.linkedinHeadline || '',
    linkedinUrl: (user as any)?.linkedinProfileUrl || '',
    avatarFile: null as File | null,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: async () => {
      // Refresh auth state to get updated user data
      await checkAuth();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
      setImagePreview(null);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('headline', formData.headline);
    data.append('linkedinUrl', formData.linkedinUrl);
    if (formData.avatarFile) {
      data.append('avatar', formData.avatarFile);
    }
    
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    setFormData({
      fullName: (user as any)?.fullName || '',
      headline: (user as any)?.linkedinHeadline || '',
      linkedinUrl: (user as any)?.linkedinProfileUrl || '',
      avatarFile: null,
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  const profilePhoto = imagePreview || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || (user as any)?.avatarUrl || (user as any)?.avatar;
  const displayName = (user as any)?.fullName || (user as any)?.displayName || "User Name";
  const displayHeadline = (user as any)?.linkedinHeadline || "Professional Headline";
  const linkedinProfileUrl = (user as any)?.linkedinProfileUrl || "";
  const hasLinkedIn = !!linkedinProfileUrl;

  return (
    <SharedAuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {/* Edit/Save Buttons */}
            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={updateProfileMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-gradient-to-br from-amber-400 to-orange-500">
                  {profilePhoto ? (
                    <AvatarImage src={profilePhoto} alt={displayName} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {isEditing && (
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full cursor-pointer hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                  >
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                ) : (
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
                )}
              </div>

              {/* Professional Headline */}
              <div>
                <Label htmlFor="headline" className="text-sm font-medium text-gray-700">
                  Professional Headline
                </Label>
                {isEditing ? (
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., Software Engineer at Tech Corp"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600">{displayHeadline}</p>
                )}
              </div>

              {/* LinkedIn Profile URL */}
              <div>
                <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">
                  LinkedIn Profile URL
                </Label>
                {isEditing ? (
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="mt-1"
                    placeholder="https://www.linkedin.com/in/yourname"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    {linkedinProfileUrl || "Not set"}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <p className="mt-1 text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SharedAuthLayout>
  );
};

export default Profile;
