import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { Entry } from "@shared/schema";

export default function WhatsAppEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [whatsappUsers, setWhatsappUsers] = useState<any[]>([]);
  const [phoneNumberToLink, setPhoneNumberToLink] = useState("");
  const [userIdToLink, setUserIdToLink] = useState("");
  const [linkingStatus, setLinkingStatus] = useState<string | null>(null);
  
  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/current-user");
        const data = await response.json();
        setCurrentUserId(data.userId);
        setUserIdToLink(data.userId.toString());
        console.log("Current user data:", data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError("Failed to fetch current user information");
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Fetch debugging info
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/whatsapp/debug-numbers");
        const data = await response.json();
        setWhatsappUsers(data.whatsappUsers);
        
        // Query entries for authenticated user
        const entriesResponse = await fetch(`/api/entries`, {
          credentials: 'include'
        });
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching debug info:", error);
        setError("Failed to fetch WhatsApp debug information");
        setIsLoading(false);
      }
    };
    
    fetchDebugInfo();
  }, [linkingStatus]); // Refresh when linking status changes
  
  const handleLinkPhoneNumber = async () => {
    try {
      setLinkingStatus("Linking phone number...");
      
      const response = await apiRequest("POST", "/api/whatsapp/link-number", {
        phoneNumber: phoneNumberToLink,
        userId: parseInt(userIdToLink)
      });
      
      const data = await response.json();
      setLinkingStatus(`Success: ${data.message}`);
      
      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error linking phone number:", error);
      setLinkingStatus("Failed to link phone number");
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">WhatsApp Entries Dashboard</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Current User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>User ID:</strong> {currentUserId || "Not logged in"}</p>
              <p className="text-sm text-gray-500 mt-2">
                If you're not seeing user ID 5, you're not correctly authenticated as Aravindh Rajendran.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Link WhatsApp Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number:</label>
                  <input 
                    type="text" 
                    value={phoneNumberToLink}
                    onChange={(e) => setPhoneNumberToLink(e.target.value)}
                    placeholder="e.g. +919003737575"
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include the country code with + prefix</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">User ID:</label>
                  <input 
                    type="text" 
                    value={userIdToLink}
                    onChange={(e) => setUserIdToLink(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <Button onClick={handleLinkPhoneNumber}>Link Phone Number</Button>
                
                {linkingStatus && (
                  <div className={`p-2 rounded-md ${linkingStatus.includes("Success") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {linkingStatus}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Registered WhatsApp Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappUsers.length === 0 ? (
                <p>No WhatsApp numbers registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {whatsappUsers.map((user, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p><strong>User ID:</strong> {user.userId}</p>
                      <p><strong>Phone:</strong> {user.phoneNumber}</p>
                      <p><strong>Active:</strong> {user.active ? "Yes" : "No"}</p>
                      <p><strong>Last Message:</strong> {user.lastMessageSentAt || "Never"}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your WhatsApp Entries (User ID 5)</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p>No WhatsApp entries found.</p>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 border rounded-md hover:bg-gray-50">
                      <h3 className="text-lg font-medium mb-2">{entry.title}</h3>
                      <p className="text-gray-700">{entry.content}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>User ID: {entry.userId}</span> • 
                        <span> Created: {new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}