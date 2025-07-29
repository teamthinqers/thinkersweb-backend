import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authBypass } from '@/lib/authBypass';
import { LogIn } from 'lucide-react';

interface AuthBypassButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export function AuthBypassButton({ 
  onAuthSuccess, 
  onAuthError, 
  className,
  children 
}: AuthBypassButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      const user = await authBypass.signIn();
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${user.displayName}!`
      });
      
      onAuthSuccess?.();
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Authentication failed');
      
      toast({
        title: "Authentication Failed",
        description: authError.message,
        variant: "destructive"
      });
      
      onAuthError?.(authError);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button 
      onClick={handleAuth}
      disabled={isAuthenticating}
      className={className}
    >
      <LogIn className="w-4 h-4 mr-2" />
      {children || (isAuthenticating ? 'Authenticating...' : 'Sign In')}
    </Button>
  );
}