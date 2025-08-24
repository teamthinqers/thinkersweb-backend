import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [customEmotion, setCustomEmotion] = useState('');
  const [formData, setFormData] = useState({
    // Dot fields
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: '',
    
    // Wheel fields
    name: '',
    heading: '',
    goals: '',
    timeline: '',
    category: 'Personal',
    chakraId: '', // For wheels that belong to chakras
    
    // Chakra fields
    purpose: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = contentType === 'dot' 
        ? '/api/user-content/dots' 
        : contentType === 'wheel' 
          ? '/api/user-content/wheels'
          : '/api/user-content/chakras';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // CRITICAL: Include session cookies
        body: JSON.stringify(data)
      });
      
      console.log(`🔄 Creating ${contentType}:`, data);
      console.log(`📊 Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to create ${contentType}:`, errorText);
        throw new Error(`Failed to create ${contentType}: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ ${contentType} created successfully:`, result);
      return result;
    },
    onSuccess: (result) => {
      console.log(`✅ ${contentType} creation mutation succeeded:`, result);
      
      toast({
        title: 'Success!',
        description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully.`
      });
      
      // Force invalidate ALL related queries with specific keys
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/dots'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/wheels'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/chakras'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/stats'],
        exact: false 
      });
      
      // Also invalidate any query that matches the pattern
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/user-content');
        }
      });
      
      console.log('🔄 Cache invalidated, refreshing data...');
      
      // Reset form
      setFormData({
        summary: '',
        anchor: '',
        pulse: '',
        wheelId: '',
        name: '',
        heading: '',
        goals: '',
        timeline: '',
        category: 'Personal',
        chakraId: '',
        purpose: ''
      });
      
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create content',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contentType === 'dot') {
      // Validate wheel selection
      if (!formData.wheelId) {
        toast({
          title: 'Error',
          description: 'Please select which wheel this dot belongs to or choose standalone.',
          variant: 'destructive'
        });
        return;
      }
      
      createContentMutation.mutate({
        summary: formData.summary,
        anchor: formData.anchor,
        pulse: formData.pulse,
        wheelId: formData.wheelId === 'standalone' ? null : formData.wheelId,
        sourceType: 'text',
        captureMode: 'natural'
      });
    } else if (contentType === 'wheel') {
      // Validate chakra selection
      if (!formData.chakraId) {
        toast({
          title: 'Error',
          description: 'Please select which chakra this wheel belongs to or choose standalone.',
          variant: 'destructive'
        });
        return;
      }
      
      createContentMutation.mutate({
        name: formData.name,
        heading: formData.heading,
        goals: formData.goals,
        timeline: formData.timeline,
        category: formData.category,
        chakraId: formData.chakraId === 'standalone' ? null : formData.chakraId
      });
    } else if (contentType === 'chakra') {
      createContentMutation.mutate({
        heading: formData.heading,
        purpose: formData.purpose,
        timeline: formData.timeline,
        sourceType: 'text'
      });
    }
  };

  const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];
  const categories = ['Personal', 'Professional', 'Health', 'Finance', 'Learning', 'Business'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSuccess}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grid
        </Button>
        <h2 className="text-2xl font-bold text-amber-800">Create New Content</h2>
      </div>

      {/* Content Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like to create?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={contentType === 'dot' ? 'default' : 'outline'}
              className={contentType === 'dot' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}
              onClick={() => setContentType('dot')}
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mr-2"></div>
              Dot
            </Button>
            <Button
              variant={contentType === 'wheel' ? 'default' : 'outline'}
              className={contentType === 'wheel' ? 'bg-gradient-to-r from-orange-500 to-amber-600' : ''}
              onClick={() => setContentType('wheel')}
            >
              <div className="w-4 h-4 border-2 border-orange-500 rounded-full mr-2"></div>
              Wheel
            </Button>
            <Button
              variant={contentType === 'chakra' ? 'default' : 'outline'}
              className={contentType === 'chakra' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : ''}
              onClick={() => setContentType('chakra')}
            >
              <div className="w-4 h-4 border-2 border-amber-600 rounded-full mr-2 relative">
                <div className="absolute inset-1 bg-amber-600 rounded-full"></div>
              </div>
              Chakra
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {contentType === 'dot' && 'Create New Dot'}
            {contentType === 'wheel' && 'Create New Wheel'}
            {contentType === 'chakra' && 'Create New Chakra'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {contentType === 'dot' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Summary (max 220 chars)</label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    maxLength={220}
                    required
                    placeholder="What's your thought?"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.summary.length}/220 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Memory Anchor (max 300 chars)</label>
                  <Textarea
                    value={formData.anchor}
                    onChange={(e) => setFormData({ ...formData, anchor: e.target.value })}
                    maxLength={300}
                    required
                    placeholder="What's the context that helps you recall?"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.anchor.length}/300 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What's the emotion associated with your thought?</label>
                  <div className="space-y-3">
                    {/* Emotion buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {emotions.map((emotion) => (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, pulse: emotion });
                            setCustomEmotion('');
                          }}
                          className={`p-2 text-sm rounded-lg border transition-all ${
                            formData.pulse === emotion
                              ? 'bg-amber-100 border-amber-300 text-amber-800 font-medium'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom emotion input */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Or enter your own:</label>
                      <Input
                        value={customEmotion}
                        onChange={(e) => {
                          setCustomEmotion(e.target.value);
                          if (e.target.value.trim()) {
                            setFormData({ ...formData, pulse: e.target.value.trim() });
                          }
                        }}
                        placeholder="Type your emotion..."
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Which wheel does this belong to? *</label>
                  <Select value={formData.wheelId} onValueChange={(value) => setFormData({ ...formData, wheelId: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a wheel or standalone..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standalone">Standalone</SelectItem>
                      {availableWheels.map((wheel) => (
                        <SelectItem key={wheel.id} value={wheel.id}>
                          {wheel.name || wheel.heading}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder={`Enter ${contentType} name...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Heading (optional)</label>
                  <Input
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    placeholder="Display heading..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {contentType === 'chakra' ? 'Purpose' : 'Goals'}
                  </label>
                  <Textarea
                    value={contentType === 'chakra' ? formData.purpose : formData.goals}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [contentType === 'chakra' ? 'purpose' : 'goals']: e.target.value 
                    })}
                    placeholder={contentType === 'chakra' ? 'Life-level purpose and vision...' : 'Goals and objectives...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline (optional)</label>
                  <Input
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g., 6 months, 2 years..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {contentType === 'wheel' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Which chakra does this belong to? *</label>
                    <Select value={formData.chakraId} onValueChange={(value) => setFormData({ ...formData, chakraId: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chakra or standalone..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standalone">Standalone</SelectItem>
                        {availableChakras.map((chakra) => (
                          <SelectItem key={chakra.id} value={chakra.id}>
                            {chakra.name || chakra.heading}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onSuccess}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createContentMutation.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
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
    </div>
  );
};

export default UserContentCreation;