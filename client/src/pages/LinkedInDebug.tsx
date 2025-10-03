import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function LinkedInDebug() {
  const [copied, setCopied] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['/api/auth/linkedin/config'],
  });

  const copyToClipboard = () => {
    if (config?.redirectUri) {
      navigator.clipboard.writeText(config.redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">LinkedIn OAuth Configuration</h1>

        {config && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                Redirect URI (Copy This Exactly)
              </h2>
              <div className="bg-white border border-gray-300 rounded p-4 mt-2 font-mono text-sm break-all">
                {config.redirectUri}
              </div>
              <Button 
                onClick={copyToClipboard}
                className="mt-3"
                variant={copied ? "outline" : "default"}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Redirect URI
                  </>
                )}
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                Add to LinkedIn Developer Portal
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">LinkedIn Developer Apps</a></li>
                <li>Click on your app (Client ID: <code className="bg-gray-100 px-1 rounded">{config.clientId}</code>)</li>
                <li>Click the <strong>"Auth"</strong> tab</li>
                <li>Scroll to <strong>"OAuth 2.0 settings"</strong></li>
                <li>Under <strong>"Redirect URLs"</strong>:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Remove any old/incorrect URLs</li>
                    <li>Click "+ Add redirect URL"</li>
                    <li>Paste the URL from Step 1 (use the Copy button above)</li>
                    <li>Make sure there are NO spaces, NO trailing slashes</li>
                  </ul>
                </li>
                <li>Click <strong>"Update"</strong> at the bottom to save</li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">3️⃣</span>
                Verify Products Access
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In the same app, click the <strong>"Products"</strong> tab</li>
                <li>Make sure <strong>"Sign In with LinkedIn using OpenID Connect"</strong> is added/requested</li>
                <li>If it says "Pending", you may need to wait for LinkedIn approval</li>
                <li>If it's not listed, click "Request access" and wait for approval (can take a few minutes to hours)</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">4️⃣</span>
                Configuration Status
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Client ID configured: <code className="bg-gray-100 px-1 rounded">{config.clientId}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Client Secret configured: {config.hasClientSecret ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Redirect URI set: Yes</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Go to Login Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
