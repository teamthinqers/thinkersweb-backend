import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Fingerprint } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateCognitiveIdentityTags } from '@/lib/cognitiveIdentityTags';
import { useState, useEffect } from 'react';

interface CognitiveIdentityCardProps {
  userId: number;
  isPublic: boolean;
  isOwnProfile?: boolean;
}

export function CognitiveIdentityCard({ 
  userId, 
  isPublic: initialIsPublic, 
  isOwnProfile = false 
}: CognitiveIdentityCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch real cognitive identity data for this user
  const { data: cognitiveData } = useQuery<{ success: boolean; data: any; isPublic: boolean; configured: boolean }>({
    queryKey: [`/api/users/${userId}/cognitive-identity`],
    enabled: !!userId,
  });
  
  const cognitiveIdentityTags = generateCognitiveIdentityTags(cognitiveData?.data || {});
  
  // Local state for toggle to ensure UI updates
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  // Sync with prop changes
  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  const updatePrivacyMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      return apiRequest('PATCH', '/api/users/cognitive-identity-privacy', { isPublic: newIsPublic });
    },
    onSuccess: (data, newIsPublic) => {
      setIsPublic(newIsPublic); // Update local state immediately
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/cognitive-identity`] });
      toast({
        title: "Privacy Updated",
        description: `Your cognitive identity is now ${newIsPublic ? 'public' : 'private'}.`,
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePrivacyToggle = (checked: boolean) => {
    updatePrivacyMutation.mutate(checked);
  };

  // If viewing someone else's profile and it's private, show private message
  const showPrivateMessage = !isOwnProfile && !isPublic;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Card with Toggle/Status - Purple gradient matching /mydotspark */}
      <Card className="border-0 bg-gradient-to-br from-[#a78bfa] via-[#9575cd] to-[#8b5cf6] shadow-[0_8px_30px_rgba(139,92,246,0.2)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center">
                <Fingerprint className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white drop-shadow-lg">Cognitive Identity</h3>
              </div>
            </div>
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="privacy-toggle" className="text-sm text-white/90 flex items-center gap-1">
                  {isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {isPublic ? 'Public' : 'Private'}
                </Label>
                <Switch
                  id="privacy-toggle"
                  checked={isPublic}
                  onCheckedChange={handlePrivacyToggle}
                  disabled={updatePrivacyMutation.isPending}
                  className="data-[state=checked]:bg-white/40 data-[state=unchecked]:bg-white/20"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-white/90 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                {showPrivateMessage ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span>{showPrivateMessage ? 'Private' : 'Public'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity Tags Card - Purple gradient */}
      <Card className="border-0 bg-gradient-to-br from-[#a78bfa] via-[#9575cd] to-[#8b5cf6] shadow-[0_8px_30px_rgba(139,92,246,0.2)] flex-1">
        <CardContent className="p-6">
          {showPrivateMessage ? (
            <div className="text-center py-6">
              <Lock className="h-12 w-12 text-white/40 mx-auto mb-3" />
              <p className="text-sm text-white/80">User has chosen to keep their cognitive identity private</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-3 gap-y-2.5 items-center justify-center">
              {cognitiveIdentityTags.length > 0 ? (
                cognitiveIdentityTags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-sm px-4 py-1.5 bg-white/35 font-bold backdrop-blur-sm rounded-full text-white drop-shadow-md"
                    style={{
                      marginLeft: index % 3 === 1 ? '2rem' : index % 3 === 2 ? '4rem' : '0',
                      marginTop: index > 0 ? `${(index % 4) * 0.5}rem` : '0'
                    }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm px-4 py-1.5 bg-white/35 font-bold backdrop-blur-sm rounded-full text-white drop-shadow-md">
                  Configure your identity to see tags
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
