import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from '@/hooks/use-auth-new';
import { getRemainingPrompts } from "@/lib/usageLimits";

interface UsageLimitMessageProps {
  isLimitExceeded: boolean;
  message: string;
}

export function UsageLimitMessage({ 
  isLimitExceeded, 
  message 
}: UsageLimitMessageProps) {
  const { user } = useAuth();
  const isRegistered = !!user;
  const remainingPrompts = getRemainingPrompts(isRegistered);
  
  if (isLimitExceeded) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Usage Limit Reached</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{message}</p>
          {!isRegistered && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/auth">Register Now</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show warning when close to limit (less than 20% of limit remaining)
  const warningThreshold = isRegistered ? 5 : 2;
  
  if (remainingPrompts <= warningThreshold && remainingPrompts > 0) {
    return (
      <Alert className="my-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-700 dark:text-yellow-300">Usage Limit Warning</AlertTitle>
        <AlertDescription>
          <p>You have {remainingPrompts} prompt{remainingPrompts !== 1 ? 's' : ''} remaining.</p>
          {!isRegistered && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/auth">Register for More</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}