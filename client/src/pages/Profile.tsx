import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  Camera, 
  ExternalLink,
  Phone,
  Star,
  Trophy,
  Target,
  X,
  CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  yearsOfExperience: string;
  profileImage: string;
  linkedInProfile: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    mobileNumber: '',
    dateOfBirth: '',
    yearsOfExperience: '',
    profileImage: user?.photoURL || '',
    linkedInProfile: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    // Default to a reasonable birth year (30 years ago)
    const defaultYear = new Date().getFullYear() - 30;
    return new Date(defaultYear, 0, 1);
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate profile completion percentage
  const calculateCompletionPercentage = (): number => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.mobileNumber,
      profileData.dateOfBirth,
      profileData.yearsOfExperience,
      profileData.profileImage,
      profileData.linkedInProfile
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  // Enhanced cross-platform data synchronization
  const loadProfileData = () => {
    try {
      // Try multiple storage keys for cross-platform compatibility (browser + PWA)
      const storageKeys = ['userProfile', 'dotspark_userProfile', 'dotSpark_profile', 'profile_data'];
      let savedProfile = null;
      
      for (const key of storageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          savedProfile = JSON.parse(data);
          console.log(`Profile data loaded from ${key}`);
          break;
        }
      }
      
      if (savedProfile && Object.keys(savedProfile).length > 0) {
        // Only populate fields that have actual user data, keep others empty with placeholders
        setProfileData(prev => ({
          ...prev,
          firstName: savedProfile.firstName || '',
          lastName: savedProfile.lastName || '',
          email: user?.email || savedProfile.email || '',
          mobileNumber: savedProfile.mobileNumber || '', // Keep empty until user fills
          dateOfBirth: savedProfile.dateOfBirth || '', // Keep empty until user fills
          yearsOfExperience: savedProfile.yearsOfExperience || '',
          profileImage: savedProfile.profileImage || user?.photoURL || '',
          linkedInProfile: savedProfile.linkedInProfile || ''
        }));
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const saveProfileData = (data: ProfileData) => {
    try {
      // Only save actual user data, don't save empty fields
      const profileToSave = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        yearsOfExperience: data.yearsOfExperience || '',
        profileImage: data.profileImage || '',
        linkedInProfile: data.linkedInProfile || ''
      };
      
      const profileDataString = JSON.stringify(profileToSave);
      
      // Save to multiple keys for cross-platform compatibility (browser + PWA)
      localStorage.setItem('userProfile', profileDataString);
      localStorage.setItem('dotspark_userProfile', profileDataString);
      localStorage.setItem('dotSpark_profile', profileDataString);
      localStorage.setItem('profile_data', profileDataString);
      
      // Trigger storage event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userProfile',
        newValue: profileDataString,
        storageArea: localStorage
      }));
      
      console.log('Profile data saved across all storage keys for browser/PWA compatibility');
    } catch (error) {
      console.error('Failed to save profile data:', error);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    
    // Only auto-populate email and profile image from auth data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || prev.email,
        profileImage: user.photoURL || prev.profileImage,
        // Only auto-fill name fields if they're empty AND no saved data exists
        firstName: prev.firstName || (localStorage.getItem('userProfile') ? '' : (user.displayName?.split(' ')[0] || '')),
        lastName: prev.lastName || (localStorage.getItem('userProfile') ? '' : (user.displayName?.split(' ').slice(1).join(' ') || ''))
      }));
    }
  }, [user]);

  // Listen for storage changes across tabs/PWA
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile' && e.newValue) {
        try {
          const updatedProfile = JSON.parse(e.newValue);
          setProfileData(prev => ({
            ...prev,
            ...updatedProfile,
            email: user?.email || updatedProfile.email
          }));
        } catch (error) {
          console.error('Failed to sync profile data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

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
        const updatedData = { ...profileData, profileImage: result };
        setProfileData(updatedData);
        // Auto-save image for immediate cross-platform sync
        saveProfileData(updatedData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    const updatedData = { ...profileData, profileImage: '' };
    setProfileData(updatedData);
    // Auto-save removal for immediate cross-platform sync
    saveProfileData(updatedData);
  };

  // Auto-save function with debouncing
  
  const autoSaveProfile = (data: ProfileData) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveProfileData(data);
    }, 1500); // Auto-save after 1.5 seconds of inactivity
    
    setSaveTimeout(timeout);
  };

  // Enhanced field change handler with auto-save
  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    const updatedData = { ...profileData, [field]: value };
    setProfileData(updatedData);
    
    // Auto-save if in editing mode
    if (isEditing) {
      autoSaveProfile(updatedData);
    }
  };

  const handleSave = () => {
    // Use enhanced save function for cross-platform sync
    saveProfileData(profileData);
    
    setIsEditing(false);
    setImagePreview(null);
    toast({
      title: "Profile Updated",
      description: `Profile completion: ${completionPercentage}% - Synced across all devices`,
    });
  };

  const handleCancel = () => {
    // Reload using enhanced load function
    loadProfileData();
    setIsEditing(false);
    setImagePreview(null);
  };

  // Enhanced date picker functions
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleFieldChange('dateOfBirth', formattedDate);
      setDatePickerOpen(false);
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const currentYear = calendarMonth.getFullYear();
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    const newMonth = new Date(newYear, calendarMonth.getMonth(), 1);
    setCalendarMonth(newMonth);
  };

  const navigateToYear = (year: number) => {
    const newMonth = new Date(year, calendarMonth.getMonth(), 1);
    setCalendarMonth(newMonth);
  };

  // Generate year options for quick selection (birth years typically range from 1930 to current year - 10)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1930;
    const endYear = currentYear - 10; // Minimum age of 10
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Completion Card */}
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-white shadow-sm ${level.color}`}>
                  {level.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                  <p className="text-sm text-gray-600">{level.title}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-700">{completionPercentage}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              {completionPercentage === 100 
                ? "🎉 Your profile is complete! You're ready to maximize your DotSpark experience."
                : "Fill out your profile to get the most out of your DotSpark experience."
              }
            </p>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {(imagePreview || profileData.profileImage) ? (
                  <AvatarImage src={imagePreview || profileData.profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <div className="flex-1">
                  <Label htmlFor="profileImageUpload">Profile Picture</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="profileImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    {(imagePreview || profileData.profileImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image (max 5MB)</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  <span>First Name</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={profileData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Last Name</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={profileData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email is automatically synced from your account</p>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>Mobile Number</span>
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-sm text-gray-600">
                    +91
                  </div>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter 10 digit mobile number"
                    value={profileData.mobileNumber}
                    onChange={(e) => {
                      // Only allow 10 digit numbers
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleFieldChange('mobileNumber', value);
                    }}
                    disabled={!isEditing}
                    className={`rounded-l-none ${!isEditing ? "bg-gray-50" : ""} ${
                      profileData.mobileNumber && profileData.mobileNumber.length === 10 
                        ? "border-green-300 bg-green-50/50" 
                        : ""
                    }`}
                    maxLength={10}
                  />
                </div>
                {profileData.mobileNumber && profileData.mobileNumber.length === 10 && (
                  <p className="text-xs text-green-600 font-medium">✓ Valid mobile number: +91 {profileData.mobileNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>Date of Birth</span>
                </Label>
                {isEditing ? (
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        onClick={() => setDatePickerOpen(true)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {profileData.dateOfBirth ? (
                          <span className="text-green-700 font-medium">
                            {format(new Date(profileData.dateOfBirth), 'MMMM dd, yyyy')}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Select your date of birth</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex flex-col">
                        {/* Year Navigation Header */}
                        <div className="flex items-center justify-between p-3 border-b">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateYear('prev')}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold">
                              {calendarMonth.getFullYear()}
                            </span>
                            <select
                              value={calendarMonth.getFullYear()}
                              onChange={(e) => navigateToYear(parseInt(e.target.value))}
                              className="text-sm border rounded px-1 py-0"
                            >
                              {generateYearOptions().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateYear('next')}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Calendar Component */}
                        <CalendarComponent
                          mode="single"
                          selected={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined}
                          onSelect={handleDateSelect}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          disabled={(date) => 
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 border rounded-md">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {profileData.dateOfBirth ? (
                      <span className="text-green-700 font-medium">
                        {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Date not set</span>
                    )}
                  </div>
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Briefcase className="h-4 w-4" />
                  <span>Years of Experience</span>
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 5"
                  value={profileData.yearsOfExperience}
                  onChange={(e) => handleFieldChange('yearsOfExperience', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* LinkedIn Profile */}
              <div className="space-y-2">
                <Label htmlFor="linkedInProfile" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ExternalLink className="h-4 w-4" />
                  <span>LinkedIn Profile</span>
                </Label>
                <Input
                  id="linkedInProfile"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileData.linkedInProfile}
                  onChange={(e) => handleFieldChange('linkedInProfile', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
                {profileData.linkedInProfile && !isEditing && (
                  <a 
                    href={profileData.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t">
                <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline">
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

export default Profile;