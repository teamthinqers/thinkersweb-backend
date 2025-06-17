import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import LandingPage from "@/pages/LandingPage";

function SimpleApp() {
  const [isWorking, setIsWorking] = useState(true);
  
  if (!isWorking) {
    return <div>Loading...</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <LandingPage />
      </div>
    </QueryClientProvider>
  );
}

export default SimpleApp;