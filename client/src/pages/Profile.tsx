import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Camera, Pencil, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CognitiveIdentityCard } from "@/components/CognitiveIdentityCard";
import { apiRequest } from "@/lib/queryClient";

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutMeText, setAboutMeText] = useState((user as any)?.aboutMe || '');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: (user as any)?.fullName || '',
    headline: (user as any)?.linkedinHeadline || '',
    linkedinUrl: (user as any)?.linkedinProfileUrl || '',
    bio: (user as any)?.bio || '',
    avatarFile: null as File | null,
  });

  // Update formData when user changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        fullName: (user as any)?.fullName || '',
        headline: (user as any)?.linkedinHeadline || '',
        linkedinUrl: (user as any)?.linkedinProfileUrl || '',
        bio: (user as any)?.bio || '',
        avatarFile: null,
      });
    }
  }, [user, isEditing]);

  // Update aboutMeText when user changes
  useEffect(() => {
    if (user) {
      const newAboutMe = (user as any)?.aboutMe || '';
      console.log('User aboutMe updated:', newAboutMe);
      setAboutMeText(newAboutMe);
    }
  }, [user?.id, (user as any)?.aboutMe]);

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

  // Update About Me mutation
  const updateAboutMeMutation = useMutation({
    mutationFn: async (aboutMe: string) => {
      return apiRequest('PATCH', '/api/users/about-me', { aboutMe });
    },
    onSuccess: async (data, aboutMe) => {
      // Update local state immediately
      setAboutMeText(aboutMe);
      setIsEditingAbout(false);
      
      // Then refresh auth to sync with backend
      await checkAuth();
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "About Me Updated",
        description: "Your professional story has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update About Me. Please try again.",
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
    data.append('bio', formData.bio);
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
      bio: (user as any)?.bio || '',
      avatarFile: null,
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleSaveAboutMe = () => {
    updateAboutMeMutation.mutate(aboutMeText);
  };

  const handleCancelAboutMe = () => {
    setAboutMeText((user as any)?.aboutMe || '');
    setIsEditingAbout(false);
  };

  const profilePhoto = imagePreview || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || (user as any)?.avatarUrl || (user as any)?.avatar;
  const displayName = (user as any)?.fullName || (user as any)?.displayName || "User Name";
  const displayHeadline = (user as any)?.linkedinHeadline || "Professional Headline";
  const linkedinProfileUrl = (user as any)?.linkedinProfileUrl || "";
  const hasLinkedIn = !!linkedinProfileUrl;

  // Get cognitive profile from user data (if available)
  const cognitiveProfile = {
    primaryArchetype: (user as any)?.primaryArchetype,
    secondaryArchetype: (user as any)?.secondaryArchetype,
    thinkingStyle: (user as any)?.thinkingStyle,
    emotionalPattern: (user as any)?.emotionalPattern,
    lifePhilosophy: (user as any)?.lifePhilosophy,
    coreValues: (user as any)?.coreValues ? JSON.parse((user as any).coreValues) : [],
  };

  return (
    <SharedAuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Cognitive Identity Card */}
          <div className="lg:col-span-1">
            <CognitiveIdentityCard
              userId={(user as any)?.id}
              isPublic={(user as any)?.cognitiveIdentityPublic || false}
              cognitiveProfile={cognitiveProfile}
              isOwnProfile={true}
            />
          </div>

          {/* MIDDLE COLUMN - Profile Details */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm h-full">
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

          {/* RIGHT COLUMN - About Me Section */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
                  {!isEditingAbout ? (
                    <Button
                      onClick={() => setIsEditingAbout(true)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancelAboutMe}
                        variant="ghost"
                        size="sm"
                        disabled={updateAboutMeMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={handleSaveAboutMe}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        disabled={updateAboutMeMutation.isPending}
                      >
                        {updateAboutMeMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {isEditingAbout ? (
                  <Textarea
                    value={aboutMeText}
                    onChange={(e) => setAboutMeText(e.target.value)}
                    className="min-h-[300px]"
                    placeholder="Share your professional story, achievements, and what drives you..."
                    maxLength={2600}
                  />
                ) : (
                  <div>
                    {aboutMeText ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{aboutMeText}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No summary added yet. Click the edit icon to add your professional story.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SharedAuthLayout>
  );
};

export default Profile;
