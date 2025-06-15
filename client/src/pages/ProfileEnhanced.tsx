import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  User, 
  Mail, 
  Calendar as CalendarIcon, 
  Briefcase, 
  Camera, 
  ExternalLink,
  Phone,
  Star,
  Trophy,
  Target,
  X,
  Save,
  Edit,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-minimal";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileData {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  yearsOfExperience?: number;
  profileImage?: string;
  linkedInProfile?: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Storage key for cross-platform synchronization
const PROFILE_STORAGE_KEY = 'dotSpark_userProfile';

const ProfileEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Fetch profile data from backend
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  // Local state for form data with backend synchronization
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    mobileNumber: '',
    dateOfBirth: '',
    yearsOfExperience: 0,
    profileImage: user?.photoURL || '',
    linkedInProfile: ''
  });

  // Cross-platform data synchronization
  useEffect(() => {
    // Load from localStorage for immediate display
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          email: user?.email || parsed.email // Always use latest email from auth
        }));
        
        // Set date picker if date exists
        if (parsed.dateOfBirth) {
          const date = parseISO(parsed.dateOfBirth);
          if (isValid(date)) {
            setSelectedDate(date);
          }
        }
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
      }
    }
  }, [user]);

  // Sync with backend data when loaded
  useEffect(() => {
    if (profileData && typeof profileData === 'object') {
      const profile = profileData as ProfileData;
      const updatedData: ProfileData = {
        ...profile,
        email: user?.email || profile.email,
        profileImage: profile.profileImage || user?.photoURL || '',
        firstName: profile.firstName || (user?.displayName?.split(' ')[0] || ''),
        lastName: profile.lastName || (user?.displayName?.split(' ').slice(1).join(' ') || '')
      };
      
      setFormData(updatedData);
      
      // Save to localStorage for cross-platform sync
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedData));
      
      // Set date picker if date exists
      if (updatedData.dateOfBirth) {
        const date = parseISO(updatedData.dateOfBirth);
        if (isValid(date)) {
          setSelectedDate(date);
        }
      }
    }
  }, [profileData, user]);

  // Auto-populate from user auth data if no backend data
  useEffect(() => {
    if (user && !profileData && !isLoadingProfile) {
      const authData = {
        email: user.email || '',
        profileImage: user.photoURL || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
      };
      
      setFormData(prev => ({
        ...prev,
        ...authData
      }));
    }
  }, [user, profileData, isLoadingProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (updatedProfile) => {
      // Update cache
      queryClient.setQueryData(['/api/profile'], updatedProfile);
      
      // Update localStorage for cross-platform sync
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      
      setIsEditing(false);
      setImagePreview(null);
      
      toast({
        title: "Profile Updated Successfully",
        description: `Your profile has been saved across all devices. Completion: ${calculateCompletionPercentage()}%`,
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Calculate profile completion percentage
  const calculateCompletionPercentage = (): number => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.mobileNumber,
      formData.dateOfBirth,
      formData.yearsOfExperience?.toString(),
      formData.profileImage,
      formData.linkedInProfile
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profileImage: '' }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({ 
        ...prev, 
        dateOfBirth: format(date, 'yyyy-MM-dd') 
      }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
    setIsDatePickerOpen(false);
  };

  const handleSave = async () => {
    try {
      // Prepare data for backend
      const dataToSave = {
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        mobileNumber: formData.mobileNumber?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        yearsOfExperience: formData.yearsOfExperience || undefined,
        linkedInProfile: formData.linkedInProfile?.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      };

      // Save to localStorage immediately for cross-platform sync
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        ...formData,
        ...dataToSave
      }));

      // Save to backend
      await updateProfileMutation.mutateAsync(dataToSave);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    // Reload from backend or localStorage
    if (profileData) {
      setFormData(profileData);
    } else {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            email: user?.email || parsed.email
          }));
        } catch (error) {
          console.error('Failed to reload profile:', error);
        }
      }
    }
    setIsEditing(false);
    setImagePreview(null);
  };

  const getCompletionLevel = (): { title: string; icon: React.ReactNode; color: string } => {
    if (completionPercentage >= 100) {
      return {
        title: "Profile Master",
        icon: <Trophy className="h-5 w-5" />,
        color: "text-yellow-600"
      };
    } else if (completionPercentage >= 75) {
      return {
        title: "Almost There",
        icon: <Star className="h-5 w-5" />,
        color: "text-blue-600"
      };
    } else if (completionPercentage >= 50) {
      return {
        title: "Getting Started",
        icon: <Target className="h-5 w-5" />,
        color: "text-green-600"
      };
    } else {
      return {
        title: "Just Beginning",
        icon: <User className="h-5 w-5" />,
        color: "text-gray-600"
      };
    }
  };

  const level = getCompletionLevel();

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Profile Completion Card with enhanced spacing */}
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full bg-white shadow-sm ${level.color}`}>
                  {level.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">Profile Completion</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{level.title}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-700">{completionPercentage}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={completionPercentage} className="h-4 mb-3" />
            <p className="text-sm text-gray-600">
              {completionPercentage === 100 
                ? "🎉 Your profile is complete! You're ready to maximize your DotSpark experience."
                : "Fill out your profile to get the most out of your DotSpark experience."
              }
            </p>
          </CardContent>
        </Card>

        {/* Profile Information Card with enhanced spacing */}
        <Card>
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <User className="h-6 w-6" />
                <span>Profile Information</span>
              </CardTitle>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Image Section with better spacing */}
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24 border-4 border-gray-100">
                {(imagePreview || formData.profileImage) ? (
                  <AvatarImage src={imagePreview || formData.profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-xl">
                    {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <div className="flex-1">
                  <Label htmlFor="profileImageUpload" className="text-base font-medium">Profile Picture</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="profileImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    {(imagePreview || formData.profileImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Upload an image (max 5MB)</p>
                </div>
              )}
            </div>

            {/* Form Fields with enhanced spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center space-x-2 text-base font-medium">
                  <User className="h-4 w-4" />
                  <span>First Name</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className={cn(
                    "h-11 text-base",
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "border-gray-300 focus:border-amber-500"
                  )}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center space-x-2 text-base font-medium">
                  <User className="h-4 w-4" />
                  <span>Last Name</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className={cn(
                    "h-11 text-base",
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "border-gray-300 focus:border-amber-500"
                  )}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2 text-base font-medium">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  disabled={true}
                  className="bg-gray-50 cursor-not-allowed h-11 text-base"
                />
                <p className="text-sm text-gray-500">Email is automatically synced from your account</p>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center space-x-2 text-base font-medium">
                  <Phone className="h-4 w-4" />
                  <span>Mobile Number</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  disabled={!isEditing}
                  className={cn(
                    "h-11 text-base",
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "border-gray-300 focus:border-amber-500"
                  )}
                />
              </div>

              {/* Enhanced Date of Birth with better date picker */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center space-x-2 text-base font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Date of Birth</span>
                </Label>
                {isEditing ? (
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start text-left font-normal text-base",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    value={formData.dateOfBirth ? format(parseISO(formData.dateOfBirth), "PPP") : ''}
                    disabled={true}
                    className="bg-gray-50 cursor-not-allowed h-11 text-base"
                    placeholder="Not set"
                  />
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience" className="flex items-center space-x-2 text-base font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>Years of Experience</span>
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="70"
                  placeholder="e.g., 5"
                  value={formData.yearsOfExperience || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  disabled={!isEditing}
                  className={cn(
                    "h-11 text-base",
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "border-gray-300 focus:border-amber-500"
                  )}
                />
              </div>

              {/* LinkedIn Profile - spanning both columns */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="linkedInProfile" className="flex items-center space-x-2 text-base font-medium">
                  <ExternalLink className="h-4 w-4" />
                  <span>LinkedIn Profile</span>
                </Label>
                <Input
                  id="linkedInProfile"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedInProfile || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedInProfile: e.target.value }))}
                  disabled={!isEditing}
                  className={cn(
                    "h-11 text-base",
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "border-gray-300 focus:border-amber-500"
                  )}
                />
                {formData.linkedInProfile && !isEditing && (
                  <a 
                    href={formData.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons with enhanced spacing */}
            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 flex items-center space-x-2 px-6 py-3"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEnhanced;