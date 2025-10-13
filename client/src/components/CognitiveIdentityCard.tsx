import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Brain, Heart, Target, Zap, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CognitiveIdentityCardProps {
  userId: number;
  isPublic: boolean;
  cognitiveProfile?: {
    primaryArchetype?: string;
    secondaryArchetype?: string;
    thinkingStyle?: string;
    emotionalPattern?: string;
    lifePhilosophy?: string;
    coreValues?: string[];
  };
  isOwnProfile?: boolean;
}

export function CognitiveIdentityCard({ 
  userId, 
  isPublic, 
  cognitiveProfile,
  isOwnProfile = false 
}: CognitiveIdentityCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePrivacyMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      return apiRequest('PATCH', '/api/users/cognitive-identity-privacy', { isPublic: newIsPublic });
    },
    onSuccess: (data, newIsPublic) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
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

  // If not own profile and not public, show private message
  const showPrivateState = !isOwnProfile && !isPublic;

  return (
    <div className="space-y-4">
      {/* Header Card with Toggle/Status */}
      <Card className="border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Cognitive Identity
              </h3>
            </div>
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="privacy-toggle" className="text-sm text-gray-600 flex items-center gap-1">
                  {isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {isPublic ? 'Public' : 'Private'}
                </Label>
                <Switch
                  id="privacy-toggle"
                  checked={isPublic}
                  onCheckedChange={handlePrivacyToggle}
                  disabled={updatePrivacyMutation.isPending}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {showPrivateState ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span>{showPrivateState ? 'Private' : 'Public'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity Tags Card */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6 space-y-4">
        {showPrivateState ? (
          <div className="text-center py-6">
            <Lock className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">User has chosen to keep their cognitive identity private</p>
          </div>
        ) : (
          <>
        {/* Primary Archetype */}
        {cognitiveProfile?.primaryArchetype && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Primary Archetype</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{cognitiveProfile.primaryArchetype}</p>
            </div>
          </div>
        )}

        {/* Thinking Style */}
        {cognitiveProfile?.thinkingStyle && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Thinking Style</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{cognitiveProfile.thinkingStyle}</p>
            </div>
          </div>
        )}

        {/* Emotional Pattern */}
        {cognitiveProfile?.emotionalPattern && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100">
              <Heart className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Emotional Pattern</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{cognitiveProfile.emotionalPattern}</p>
            </div>
          </div>
        )}

        {/* Core Values */}
        {cognitiveProfile?.coreValues && cognitiveProfile.coreValues.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Core Values</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {cognitiveProfile.coreValues.map((value, index) => (
                  <span 
                    key={index}
                    className="text-xs px-3 py-1.5 font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full border border-amber-200"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Life Philosophy */}
        {cognitiveProfile?.lifePhilosophy && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Life Philosophy</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{cognitiveProfile.lifePhilosophy}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!cognitiveProfile || Object.keys(cognitiveProfile).length === 0) && (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Complete your cognitive identity to unlock personalized insights</p>
          </div>
        )}
        </>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
