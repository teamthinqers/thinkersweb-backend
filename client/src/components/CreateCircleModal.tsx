import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Search, Mail, Plus } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateCircleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSearchResult {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  linkedinPhotoUrl?: string;
}

export function CreateCircleModal({ open, onOpenChange }: CreateCircleModalProps) {
  const { toast } = useToast();
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [emailInvites, setEmailInvites] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  // Search users
  const { data: searchResults } = useQuery<{ success: boolean; users: UserSearchResult[] }>({
    queryKey: ['/api/users/search', { q: userSearchQuery }],
    enabled: userSearchQuery.length >= 2,
  });

  // Create circle mutation
  const createCircleMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest('POST', '/api/thinq-circles', data);
      return await res.json();
    },
    onSuccess: async (response: any) => {
      const circleId = response.circle.id;

      // Send invites if any
      if (selectedUsers.length > 0 || emailInvites.length > 0) {
        await apiRequest('POST', `/api/thinq-circles/${circleId}/invite`, {
          existingUserIds: selectedUsers.map(u => u.id),
          emailInvites: emailInvites,
        });
      }

      toast({
        title: 'Circle created!',
        description: `${circleName} has been created successfully.`,
      });

      // Force refetch all circles queries immediately (not just invalidate)
      await queryClient.refetchQueries({ queryKey: ['/api/thinq-circles/my-circles'] });
      
      // Reset form
      setCircleName('');
      setCircleDescription('');
      setSelectedUsers([]);
      setEmailInvites([]);
      setUserSearchQuery('');
      setEmailInput('');
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create circle',
        variant: 'destructive',
      });
    },
  });

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (emailInvites.includes(email)) {
      toast({
        title: 'Already added',
        description: 'This email is already in the invite list',
        variant: 'destructive',
      });
      return;
    }

    setEmailInvites([...emailInvites, email]);
    setEmailInput('');
  };

  const handleSelectUser = (user: UserSearchResult) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
    setUserSearchQuery('');
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleRemoveEmail = (email: string) => {
    setEmailInvites(emailInvites.filter(e => e !== email));
  };

  const handleCreate = () => {
    if (!circleName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a circle name',
        variant: 'destructive',
      });
      return;
    }

    createCircleMutation.mutate({
      name: circleName.trim(),
      description: circleDescription.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create ThinQ Circle</DialogTitle>
          <DialogDescription>
            Create a private brainstorming space to collaborate with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Circle Name */}
          <div className="space-y-2">
            <Label htmlFor="circle-name">Circle Name *</Label>
            <Input
              id="circle-name"
              placeholder="e.g., Product Ideas, Book Club"
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Circle Description */}
          <div className="space-y-2">
            <Label htmlFor="circle-description">Purpose (Optional)</Label>
            <Textarea
              id="circle-description"
              placeholder="What's this circle for?"
              value={circleDescription}
              onChange={(e) => setCircleDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Invite Users */}
          <div className="space-y-3">
            <Label>Invite Members</Label>
            
            {/* Search existing users */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-9"
              />
              
              {/* Search results dropdown */}
              {userSearchQuery.length >= 2 && searchResults?.users && searchResults.users.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.users.map((user: UserSearchResult) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      disabled={selectedUsers.find(u => u.id === user.id) !== undefined}
                    >
                      {user.linkedinPhotoUrl || user.avatar ? (
                        <img 
                          src={user.linkedinPhotoUrl || user.avatar} 
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                      </div>
                      {selectedUsers.find(u => u.id === user.id) && (
                        <Badge variant="secondary">Added</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email invite */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Or invite by email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleAddEmail} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected users and email invites */}
            {(selectedUsers.length > 0 || emailInvites.length > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Inviting ({selectedUsers.length + emailInvites.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <Badge key={user.id} variant="secondary" className="gap-1">
                      {user.fullName}
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {emailInvites.map(email => (
                    <Badge key={email} variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={createCircleMutation.isPending || !circleName.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {createCircleMutation.isPending ? 'Creating...' : 'Create Circle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
