import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({
          ...prev,
          ...parsed,
          email: user?.email || parsed.email // Always use latest email from auth
        }));
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
      }
    }
    
    // Auto-populate from user auth data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || prev.email,
        profileImage: user.photoURL || prev.profileImage,
        firstName: prev.firstName || (user.displayName?.split(' ')[0] || ''),
        lastName: prev.lastName || (user.displayName?.split(' ').slice(1).join(' ') || '')
      }));
    }
  }, [user]);

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
        setProfileData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setProfileData(prev => ({ ...prev, profileImage: '' }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    setIsEditing(false);
    setImagePreview(null);
    toast({
      title: "Profile Updated",
      description: `Profile completion: ${completionPercentage}%`,
    });
  };

  const handleCancel = () => {
    // Reload from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({
          ...prev,
          ...parsed,
          email: user?.email || parsed.email
        }));
      } catch (error) {
        console.error('Failed to reload profile:', error);
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
              <div>
                <Label htmlFor="firstName" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>First Name</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Last Name</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center space-x-1">
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
                <p className="text-xs text-gray-500 mt-1">Email is automatically synced from your account</p>
              </div>

              {/* Mobile Number */}
              <div>
                <Label htmlFor="mobileNumber" className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Mobile Number</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="dateOfBirth" className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date of Birth</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Years of Experience */}
              <div>
                <Label htmlFor="yearsOfExperience" className="flex items-center space-x-1">
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
                  onChange={(e) => setProfileData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* LinkedIn Profile */}
              <div>
                <Label htmlFor="linkedInProfile" className="flex items-center space-x-1">
                  <ExternalLink className="h-4 w-4" />
                  <span>LinkedIn Profile</span>
                </Label>
                <Input
                  id="linkedInProfile"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileData.linkedInProfile}
                  onChange={(e) => setProfileData(prev => ({ ...prev, linkedInProfile: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
                {profileData.linkedInProfile && !isEditing && (
                  <a 
                    href={profileData.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
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