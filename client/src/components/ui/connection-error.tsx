import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { networkStatus } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";

interface ConnectionErrorProps {
  title?: string;
  message?: string;
  retryAction?: () => void;
  className?: string;
}

export function ConnectionError({
  title = "Connection Error",
  message = "We're having trouble connecting to the server. This might be due to network issues or server maintenance.",
  retryAction,
  className = "",
}: ConnectionErrorProps) {
  const [retrying, setRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetry, setAutoRetry] = useState(retryCount < 2); // Auto retry first 2 times

  // Handle the retry logic
  const handleRetry = async () => {
    if (retrying) return;
    
    setRetrying(true);
    setProgress(0);
    setRetryCount(prev => prev + 1);
    
    // Animate progress bar
    const duration = 2000; // 2 seconds
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 99));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        
        // Execute the retry action
        try {
          if (retryAction) {
            retryAction();
          } else {
            // Default retry - invalidate all queries to force refetch
            queryClient.invalidateQueries();
          }
        } finally {
          // Small delay to allow queries to start refetching
          setTimeout(() => {
            setProgress(100);
            setRetrying(false);
          }, 500);
        }
      }
    }, interval);
  };
  
  // Auto-retry logic with increasing intervals
  useEffect(() => {
    if (autoRetry && !retrying && networkStatus.isOnline) {
      const delay = Math.min(2000 * Math.pow(2, retryCount), 30000); // Exponential backoff capped at 30s
      const timerId = setTimeout(handleRetry, delay);
      return () => clearTimeout(timerId);
    }
  }, [autoRetry, retrying, retryCount, networkStatus.isOnline]);
  
  // Listen for online status changes
  useEffect(() => {
    // When we go online, trigger a retry
    const handleOnline = () => {
      if (networkStatus.isOnline && !retrying) {
        handleRetry();
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [retrying]);
  
  return (
    <Card className={`shadow-md border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          {networkStatus.isOnline ? (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500 mr-2" />
          )}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>
          {networkStatus.isOnline
            ? message
            : "You appear to be offline. Please check your internet connection."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {retrying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reconnecting</span>
              <span className="text-xs text-muted-foreground">{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center text-sm">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              networkStatus.isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span>
            {networkStatus.isOnline ? (
              <span className="flex items-center">
                <Wifi className="h-3 w-3 mr-1" /> Online
              </span>
            ) : (
              <span className="flex items-center">
                <WifiOff className="h-3 w-3 mr-1" /> Offline
              </span>
            )}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={retrying || !networkStatus.isOnline}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Reconnecting..." : "Retry"}
        </Button>
      </CardFooter>
    </Card>
  );
}