import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Last updated: October 14, 2025</p>
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-gray-600">
                  Welcome to DotSpark ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Human Intelligence Network platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                    <p className="text-gray-600">
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                      <li>Name and email address</li>
                      <li>Profile information including LinkedIn data (when you connect your LinkedIn account)</li>
                      <li>User-generated content (dots, wheels, chakras, thoughts, and social posts)</li>
                      <li>Communications with other users</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Usage Information</h3>
                    <p className="text-gray-600">
                      We automatically collect information about your interactions with our platform, including:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                      <li>Device information and browser type</li>
                      <li>IP address and location data</li>
                      <li>Usage patterns and preferences</li>
                      <li>Activity logs and analytics</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p className="text-gray-600 mb-2">We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Personalize your experience and provide AI-powered insights</li>
                  <li>Facilitate social connections and thought sharing</li>
                  <li>Send you notifications and updates about your account</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Analyze usage patterns to enhance platform functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. AI Processing and Data Usage</h2>
                <p className="text-gray-600">
                  DotSpark uses AI technologies to enhance your learning experience. When you create content on our platform:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                  <li>Your input may be processed by AI systems to generate insights and classifications</li>
                  <li>We use OpenAI's services for natural language processing and content generation</li>
                  <li>Your data is processed in accordance with our AI partners' privacy policies</li>
                  <li>You can control AI processing preferences in your settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 mb-2">We may share your information:</p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li><strong>With other users:</strong> When you share thoughts or engage in social features</li>
                  <li><strong>With service providers:</strong> To help us operate and improve our platform</li>
                  <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
                  <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  We will never sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
                <p className="text-gray-600">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights and Choices</h2>
                <p className="text-gray-600 mb-2">You have the right to:</p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
                <p className="text-gray-600">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will remove or anonymize your personal data within 30 days, except where we are required to retain it for legal purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Services</h2>
                <p className="text-gray-600">
                  Our platform may contain links to third-party websites or integrate with third-party services (such as LinkedIn). We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
                <p className="text-gray-600">
                  DotSpark is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 font-semibold">DotSpark Privacy Team</p>
                  <p className="text-gray-600">Email: privacy@dotspark.ai</p>
                  <p className="text-gray-600">Website: www.dotspark.ai</p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
