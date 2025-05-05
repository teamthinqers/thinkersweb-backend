import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectionErrorProps {
  title?: string;
  message?: string;
  retryAction?: () => void;
  className?: string;
}

/**
 * Simplified connection error component to prevent rendering issues
 */
export function ConnectionError({
  title = "Connection Error",
  message = "We're having trouble connecting to the server. Please check your connection and try again.",
  retryAction,
  className = "",
}: ConnectionErrorProps) {
  // Handle manual reload
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <Card className={`shadow-md border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          Please try the following:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Check your internet connection</li>
            <li>Reload the page</li>
            <li>Sign in again if you were previously logged in</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={retryAction || handleReload}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload Page
        </Button>
      </CardFooter>
    </Card>
  );
}