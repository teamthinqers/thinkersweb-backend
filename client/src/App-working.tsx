import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";

function WorkingApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">DotSpark</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}

export default WorkingApp;