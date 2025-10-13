import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-new";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AuthDebug() {
  const { user, loginWithGoogle, checkAuth } = useAuth();
  const [logs, setLogs] = useState<Array<{ type: string; message: string; time: string }>>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, time }]);
    console.log(`[${type}] ${message}`);
  };

  const testAuth = async () => {
    setTesting(true);
    setLogs([]);

    try {
      // Test 1: Check current auth status
      addLog("info", "Checking current authentication status...");
      const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
      const authData = await authResponse.json();
      
      if (authResponse.ok && authData.user) {
        addLog("success", `Already authenticated as ${authData.user.email}`);
      } else {
        addLog("error", "No active session found");
      }

      // Test 2: Check Firebase state
      addLog("info", "Checking Firebase authentication...");
      const { auth } = await import('@/lib/firebase');
      if (auth.currentUser) {
        addLog("success", `Firebase user: ${auth.currentUser.email}`);
        addLog("info", `Firebase UID: ${auth.currentUser.uid}`);
      } else {
        addLog("error", "No Firebase user");
      }

      // Test 3: Check session cookie
      addLog("info", "Checking session cookie...");
      const hasCookie = document.cookie.includes('connect.sid');
      if (hasCookie) {
        addLog("success", "Session cookie exists");
      } else {
        addLog("error", "No session cookie found");
      }

      // Test 4: Try notifications endpoint
      addLog("info", "Testing notifications endpoint...");
      const notifResponse = await fetch('/api/notifications', { credentials: 'include' });
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        addLog("success", `Notifications accessible - ${notifData.notifications?.length || 0} notifications`);
      } else {
        addLog("error", `Notifications blocked: ${notifResponse.status} ${notifResponse.statusText}`);
      }

    } catch (error: any) {
      addLog("error", `Test error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const performLogin = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      addLog("info", "Starting Google login flow...");
      await loginWithGoogle();
      addLog("success", "Login completed");
      
      // Check auth after login
      addLog("info", "Verifying session...");
      await checkAuth();
      addLog("success", "Session verified");
      
      // Reload page to ensure fresh state
      addLog("info", "Reloading page...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      addLog("error", `Login failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debugger</CardTitle>
          <CardDescription>Diagnose authentication and session issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {user ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {user ? `Authenticated as ${user.email}` : "Not authenticated"}
                </span>
              </div>
              {user && (
                <div className="ml-7 text-sm text-gray-600">
                  <div>User ID: {user.id}</div>
                  <div>Username: {user.username}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={testAuth} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Run Diagnostic Test
            </Button>
            {!user && (
              <Button onClick={performLogin} disabled={testing} variant="default">
                {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Login with Google
              </Button>
            )}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results</h3>
              <div className="bg-black text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    <span className="text-gray-500">[{log.time}]</span>{" "}
                    <span
                      className={
                        log.type === "success"
                          ? "text-green-400"
                          : log.type === "error"
                          ? "text-red-400"
                          : "text-blue-400"
                      }
                    >
                      [{log.type.toUpperCase()}]
                    </span>{" "}
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
