import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-new";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return <>{children}</>;
}
