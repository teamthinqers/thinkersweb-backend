import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2, Settings, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserContentCreationProps {
  availableWheels: any[];
  availableChakras: any[];
  onSuccess: () => void;
}

const UserContentCreation: React.FC<UserContentCreationProps> = ({
  availableWheels,
  availableChakras,
  onSuccess
}) => {
  const [contentType, setContentType] = useState<'dot' | 'wheel' | 'chakra'>('dot');
  const [formData, setFormData] = useState({
    // Dot fields
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: '',
    sourceType: 'text' as 'text' | 'voice',
    captureMode: 'natural' as 'natural' | 'ai',
    
    // Wheel fields
    name: '',
    heading: '',
    goals: '',
    timeline: '',
    category: '',
    chakraId: '',
    
    // Chakra fields (uses wheel fields but with purpose instead of goals)
    purpose: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      let endpoint = '';
      let payload = {};

      if (contentType === 'dot') {
        endpoint = '/api/user-content/dots';
        payload = {
          summary: data.summary,
          anchor: data.anchor,
          pulse: data.pulse,
          wheelId: data.wheelId || null,
          sourceType: data.sourceType,
          captureMode: data.captureMode
        };
      } else if (contentType === 'wheel' || contentType === 'chakra') {
        endpoint = '/api/user-content/wheels';
        payload = {
          name: data.name,
          heading: data.heading,
          goals: contentType === 'wheel' ? data.goals : undefined,
          purpose: contentType === 'chakra' ? data.purpose : undefined,
          timeline: data.timeline,
          category: data.category,
          chakraId: contentType === 'wheel' ? (data.chakraId || null) : null
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/stats'] });
      
      // Reset form
      setFormData({
        summary: '',
        anchor: '',
        pulse: '',
        wheelId: '',
        sourceType: 'text',
        captureMode: 'natural',
        name: '',
        heading: '',
        goals: '',
        timeline: '',
        category: '',
        chakraId: '',
        purpose: ''
      });
      
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to create content',
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-amber-800">Create New Content</CardTitle>
          <Button variant="outline" size="sm" onClick={onSuccess}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Content Type Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            What would you like to create?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant={contentType === 'dot' ? 'default' : 'outline'}
              onClick={() => setContentType('dot')}
              className={contentType === 'dot' ? 
                'bg-gradient-to-r from-amber-500 to-orange-500' : 
                'border-amber-200 hover:bg-amber-50'
              }
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 mr-2"></div>
              Dot
            </Button>
            <Button
              variant={contentType === 'wheel' ? 'default' : 'outline'}
              onClick={() => setContentType('wheel')}
              className={contentType === 'wheel' ? 
                'bg-gradient-to-r from-orange-500 to-amber-600' : 
                'border-orange-200 hover:bg-orange-50'
              }
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Wheel
            </Button>
            <Button
              variant={contentType === 'chakra' ? 'default' : 'outline'}
              onClick={() => setContentType('chakra')}
              className={contentType === 'chakra' ? 
                'bg-gradient-to-r from-amber-600 to-orange-600' : 
                'border-amber-300 hover:bg-amber-50'
              }
            >
              <Settings className="w-4 h-4 mr-2" />
              Chakra
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dot Creation Form */}
          {contentType === 'dot' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Summary (max 220 characters)
                </label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Enter your thought summary..."
                  maxLength={220}
                  required
                  className="resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.summary.length}/220 characters
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Anchor (max 300 characters)
                </label>
                <Textarea
                  value={formData.anchor}
                  onChange={(e) => handleInputChange('anchor', e.target.value)}
                  placeholder="Memory anchor or context..."
                  maxLength={300}
                  required
                  className="resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.anchor.length}/300 characters
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Pulse (one word emotion)
                </label>
                <Select
                  value={formData.pulse}
                  onValueChange={(value) => handleInputChange('pulse', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'].map(emotion => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableWheels.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assign to Wheel (optional)
                  </label>
                  <Select
                    value={formData.wheelId}
                    onValueChange={(value) => handleInputChange('wheelId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a wheel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No wheel</SelectItem>
                      {availableWheels.map(wheel => (
                        <SelectItem key={wheel.id} value={wheel.id}>
                          {wheel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Source Type
                  </label>
                  <Select
                    value={formData.sourceType}
                    onValueChange={(value: 'text' | 'voice') => handleInputChange('sourceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Capture Mode
                  </label>
                  <Select
                    value={formData.captureMode}
                    onValueChange={(value: 'natural' | 'ai') => handleInputChange('captureMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Wheel/Chakra Creation Form */}
          {(contentType === 'wheel' || contentType === 'chakra') && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={`Enter ${contentType} name...`}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Heading
                </label>
                <Input
                  value={formData.heading}
                  onChange={(e) => handleInputChange('heading', e.target.value)}
                  placeholder="Enter heading..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {contentType === 'chakra' ? 'Purpose' : 'Goals'}
                </label>
                <Textarea
                  value={contentType === 'chakra' ? formData.purpose : formData.goals}
                  onChange={(e) => handleInputChange(contentType === 'chakra' ? 'purpose' : 'goals', e.target.value)}
                  placeholder={`Enter ${contentType === 'chakra' ? 'purpose' : 'goals'}...`}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Timeline
                  </label>
                  <Input
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    placeholder="e.g., 6 months, 2 years"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Relationships">Relationships</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {contentType === 'wheel' && availableChakras.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assign to Chakra (optional)
                  </label>
                  <Select
                    value={formData.chakraId}
                    onValueChange={(value) => handleInputChange('chakraId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chakra" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No chakra</SelectItem>
                      {availableChakras.map(chakra => (
                        <SelectItem key={chakra.id} value={chakra.id}>
                          {chakra.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={createContentMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {createContentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserContentCreation;