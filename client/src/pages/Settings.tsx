import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsAppIntegration from "@/components/settings/WhatsAppIntegration";
import { WhatsAppLinking } from "@/components/settings/WhatsAppLinking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Smartphone, Link } from "lucide-react";

export default function Settings() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center border-b pb-4">
        <SettingsIcon className="mr-2 h-6 w-6" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations" className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-6">
          {/* WhatsApp Account Linking */}
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Link className="h-5 w-5 mr-2 text-indigo-500" />
              Neural Extension Account Linking
            </h2>
            <WhatsAppLinking />
          </div>
          
          {/* Original WhatsApp Integration */}
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Connect DotSpark with external services to capture your learning from anywhere
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WhatsAppIntegration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}