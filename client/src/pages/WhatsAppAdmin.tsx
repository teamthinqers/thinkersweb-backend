import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-new";
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Loader2, AlertTriangle, CheckCircle2, Trash2, Clock, PhoneCall } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WhatsAppUser {
  id: number;
  phone_number: string;
  active: boolean;
  user_id: number;
  created_at: string;
}

interface ConversationAttempt {
  id: number;
  phone_number: string;
  state: string;
  created_at: string;
  updated_at: string;
  email_validation_error?: boolean;
  email_not_found?: boolean;
  attempted_email?: string;
}

export default function WhatsAppAdmin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const queryClient = useQueryClient();

  const { data: registeredNumbers = [], isLoading } = useQuery<WhatsAppUser[]>({
    queryKey: ['/api/whatsapp/admin/numbers'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user
  });

  const { data: conversationAttempts = [], isLoading: attemptsLoading } = useQuery<ConversationAttempt[]>({
    queryKey: ['/api/whatsapp/admin/attempts'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  const registerMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest('POST', '/api/whatsapp/admin/register', { phoneNumber });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp number registered",
        description: `The number ${phoneNumber} has been registered successfully.`,
      });
      setPhoneNumber('');
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/admin/numbers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/whatsapp/admin/number/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp number deactivated",
        description: "The number has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/admin/numbers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deactivation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(phoneNumber);
  };

  const handleDeactivate = (id: number, phoneNumber: string) => {
    if (confirm(`Are you sure you want to deactivate ${phoneNumber}?`)) {
      deactivateMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Admin</h1>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              WhatsApp Bot Monitoring
            </CardTitle>
            <CardDescription>
              Real-time monitoring of unregistered users attempting to contact the bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attemptsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversationAttempts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No conversation attempts yet.</p>
              </div>
            ) : (
              <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                {conversationAttempts?.map((attempt: ConversationAttempt) => (
                  <div key={attempt.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-primary" />
                        <span className="font-medium">{attempt.phone_number}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(attempt.updated_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">State:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          attempt.state === 'awaiting_email' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {attempt.state}
                        </span>
                      </div>
                      
                      {attempt.attempted_email && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Attempted Email:</span>
                          <span className="font-mono text-xs">{attempt.attempted_email}</span>
                        </div>
                      )}
                      
                      {attempt.email_validation_error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Invalid email format</span>
                        </div>
                      )}
                      
                      {attempt.email_not_found && (
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Email not registered</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-1">
                        First contact: {new Date(attempt.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Auto-refreshes every 10 seconds • Showing last 100 attempts
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Register WhatsApp Number</CardTitle>
            <CardDescription>
              Add a test phone number to allow it to interact with the DotSpark WhatsApp chatbot without verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Number"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Numbers must include country code (e.g., +1 for USA, +44 for UK).
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Numbers</CardTitle>
            <CardDescription>
              Currently registered WhatsApp numbers in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : registeredNumbers?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No WhatsApp numbers registered yet.</p>
              </div>
            ) : (
              <div className="border rounded-md divide-y">
                {registeredNumbers?.map((number: WhatsAppUser) => (
                  <div key={number.id} className="flex justify-between items-center p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{number.phone_number}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeactivate(number.id, number.phone_number)}
                    >
                      <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}