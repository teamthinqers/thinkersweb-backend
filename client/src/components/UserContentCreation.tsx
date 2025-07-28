import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Settings, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DotCreationFormData {
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: number;
  sourceType: 'text' | 'voice';
  captureMode: 'natural' | 'ai';
}

interface WheelCreationFormData {
  name: string;
  heading?: string;
  goals?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  chakraId?: number;
}

interface UserContentCreationProps {
  availableWheels?: any[];
  availableChakras?: any[];
  onSuccess?: () => void;
}

const UserContentCreation: React.FC<UserContentCreationProps> = ({ 
  availableWheels = [], 
  availableChakras = [],
  onSuccess 
}) => {
  const [creationType, setCreationType] = useState<'dot' | 'wheel' | 'chakra' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dot creation form state
  const [dotForm, setDotForm] = useState<DotCreationFormData>({
    summary: '',
    anchor: '',
    pulse: '',
    sourceType: 'text',
    captureMode: 'natural'
  });

  // Wheel creation form state
  const [wheelForm, setWheelForm] = useState<WheelCreationFormData>({
    name: '',
    heading: '',
    goals: '',
    timeline: '',
    category: 'Personal',
    color: '#EA580C'
  });

  // Chakra creation form state
  const [chakraForm, setChakraForm] = useState<WheelCreationFormData>({
    name: '',
    heading: '',
    purpose: '',
    timeline: '',
    category: 'Personal', 
    color: '#B45309'
  });

  // Create dot mutation
  const createDotMutation = useMutation({
    mutationFn: async (data: DotCreationFormData) => {
      const response = await fetch('/api/user-content/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your dot has been created and stored for intelligence analysis.",
      });
      setDotForm({
        summary: '', anchor: '', pulse: '', sourceType: 'text', captureMode: 'natural'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/stats'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create wheel mutation
  const createWheelMutation = useMutation({
    mutationFn: async (data: WheelCreationFormData) => {
      const response = await fetch('/api/user-content/wheels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create wheel');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your wheel has been created and stored for intelligence analysis.",
      });
      setWheelForm({
        name: '', heading: '', goals: '', timeline: '', category: 'Personal', color: '#EA580C'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/stats'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create chakra mutation
  const createChakraMutation = useMutation({
    mutationFn: async (data: WheelCreationFormData) => {
      const response = await fetch('/api/user-content/wheels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, chakraId: null })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create chakra');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your chakra has been created and stored for intelligence analysis.",
      });
      setChakraForm({
        name: '', heading: '', purpose: '', timeline: '', category: 'Personal', color: '#B45309'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-content/stats'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateDot = () => {
    if (!dotForm.summary.trim() || !dotForm.anchor.trim() || !dotForm.pulse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all three layers (summary, anchor, pulse)",
        variant: "destructive"
      });
      return;
    }
    createDotMutation.mutate(dotForm);
  };

  const handleCreateWheel = () => {
    if (!wheelForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for your wheel",
        variant: "destructive"
      });
      return;
    }
    createWheelMutation.mutate(wheelForm);
  };

  const handleCreateChakra = () => {
    if (!chakraForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for your chakra",
        variant: "destructive"
      });
      return;
    }
    createChakraMutation.mutate(chakraForm);
  };

  if (!creationType) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Create New Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dot Creation */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreationType('dot')}>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-2 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-amber-800">Create Dot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Capture a single insight with three layers: summary, anchor, and pulse</p>
            </CardContent>
          </Card>

          {/* Wheel Creation */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreationType('wheel')}>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-2 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-orange-800">Create Wheel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Organize multiple dots around a goal or project</p>
            </CardContent>
          </Card>

          {/* Chakra Creation */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreationType('chakra')}>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 mx-auto mb-2 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-amber-900">Create Chakra</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Define a top-level purpose that contains multiple wheels</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button 
        variant="outline" 
        onClick={() => setCreationType(null)}
        className="mb-4"
      >
        ← Back to Creation Types
      </Button>

      {/* Dot Creation Form */}
      {creationType === 'dot' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-800">Create New Dot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="summary">Layer 1: Summary (max 220 chars)</Label>
              <Textarea
                id="summary"
                value={dotForm.summary}
                onChange={(e) => setDotForm({ ...dotForm, summary: e.target.value })}
                placeholder="Brief summary of your insight..."
                maxLength={220}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                {dotForm.summary.length}/220 characters
              </div>
            </div>

            <div>
              <Label htmlFor="anchor">Layer 2: Anchor (max 300 chars)</Label>
              <Textarea
                id="anchor"
                value={dotForm.anchor}
                onChange={(e) => setDotForm({ ...dotForm, anchor: e.target.value })}
                placeholder="Memory anchor with context and details..."
                maxLength={300}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                {dotForm.anchor.length}/300 characters
              </div>
            </div>

            <div>
              <Label htmlFor="pulse">Layer 3: Pulse (emotion word)</Label>
              <Input
                id="pulse"
                value={dotForm.pulse}
                onChange={(e) => setDotForm({ ...dotForm, pulse: e.target.value })}
                placeholder="excited, curious, focused..."
                maxLength={50}
                className="mt-1"
              />
            </div>

            {availableWheels.length > 0 && (
              <div>
                <Label>Assign to Wheel (optional)</Label>
                <Select
                  value={dotForm.wheelId?.toString() || ""}
                  onValueChange={(value) => setDotForm({ ...dotForm, wheelId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wheel..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No wheel (free dot)</SelectItem>
                    {availableWheels.map((wheel) => (
                      <SelectItem key={wheel.id} value={wheel.id.toString()}>
                        {wheel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleCreateDot}
              disabled={createDotMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {createDotMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Dot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wheel Creation Form */}
      {creationType === 'wheel' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-800">Create New Wheel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wheel-name">Wheel Name</Label>
              <Input
                id="wheel-name"
                value={wheelForm.name}
                onChange={(e) => setWheelForm({ ...wheelForm, name: e.target.value })}
                placeholder="Name your wheel..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="wheel-heading">Heading (optional)</Label>
              <Input
                id="wheel-heading"
                value={wheelForm.heading}
                onChange={(e) => setWheelForm({ ...wheelForm, heading: e.target.value })}
                placeholder="Brief heading for your wheel..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="wheel-goals">Goals</Label>
              <Textarea
                id="wheel-goals"
                value={wheelForm.goals}
                onChange={(e) => setWheelForm({ ...wheelForm, goals: e.target.value })}
                placeholder="What goals does this wheel help achieve..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="wheel-timeline">Timeline (optional)</Label>
              <Input
                id="wheel-timeline"
                value={wheelForm.timeline}
                onChange={(e) => setWheelForm({ ...wheelForm, timeline: e.target.value })}
                placeholder="3 months, 1 year, ongoing..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={wheelForm.category}
                onValueChange={(value) => setWheelForm({ ...wheelForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableChakras.length > 0 && (
              <div>
                <Label>Assign to Chakra (optional)</Label>
                <Select
                  value={wheelForm.chakraId?.toString() || ""}
                  onValueChange={(value) => setWheelForm({ ...wheelForm, chakraId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chakra..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No chakra (independent wheel)</SelectItem>
                    {availableChakras.map((chakra) => (
                      <SelectItem key={chakra.id} value={chakra.id.toString()}>
                        {chakra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleCreateWheel}
              disabled={createWheelMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {createWheelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Wheel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chakra Creation Form */}
      {creationType === 'chakra' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-900">Create New Chakra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chakra-name">Chakra Name</Label>
              <Input
                id="chakra-name"
                value={chakraForm.name}
                onChange={(e) => setChakraForm({ ...chakraForm, name: e.target.value })}
                placeholder="Name your chakra..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="chakra-heading">Heading (optional)</Label>
              <Input
                id="chakra-heading"
                value={chakraForm.heading}
                onChange={(e) => setChakraForm({ ...chakraForm, heading: e.target.value })}
                placeholder="Brief heading for your chakra..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="chakra-purpose">Purpose</Label>
              <Textarea
                id="chakra-purpose"
                value={chakraForm.purpose}
                onChange={(e) => setChakraForm({ ...chakraForm, purpose: e.target.value })}
                placeholder="What is the higher purpose this chakra serves..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="chakra-timeline">Timeline (optional)</Label>
              <Input
                id="chakra-timeline"
                value={chakraForm.timeline}
                onChange={(e) => setChakraForm({ ...chakraForm, timeline: e.target.value })}
                placeholder="5-10 years, lifetime, ongoing..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={chakraForm.category}
                onValueChange={(value) => setChakraForm({ ...chakraForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Spiritual">Spiritual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateChakra}
              disabled={createChakraMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900"
            >
              {createChakraMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Chakra
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserContentCreation;