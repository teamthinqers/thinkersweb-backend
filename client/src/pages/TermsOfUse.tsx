import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Last updated: October 14, 2025</p>
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600">
                  By accessing or using DotSpark ("the Platform"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, please do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
                <p className="text-gray-600">
                  DotSpark is a Human Intelligence Network platform designed to enhance cognitive capabilities through personalized learning management, AI-powered insights, and social knowledge sharing. Our services include:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                  <li>Personal knowledge management (Dots, Wheels, Chakras)</li>
                  <li>AI-powered content processing and classification</li>
                  <li>Social thought sharing and engagement</li>
                  <li>Collaborative learning through Thought Circles</li>
                  <li>Integration with third-party services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Account Registration</h3>
                    <p className="text-gray-600">
                      To use certain features of the Platform, you must register for an account. You agree to:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and update your information to keep it accurate</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized access</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Account Termination</h3>
                    <p className="text-gray-600">
                      We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Content and Conduct</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Content Ownership</h3>
                    <p className="text-gray-600">
                      You retain ownership of all content you create on the Platform. By posting content, you grant DotSpark a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of operating and improving the Platform.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Prohibited Conduct</h3>
                    <p className="text-gray-600 mb-2">You agree not to:</p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                      <li>Post illegal, harmful, threatening, abusive, or offensive content</li>
                      <li>Impersonate any person or entity</li>
                      <li>Violate intellectual property rights of others</li>
                      <li>Transmit spam, viruses, or malicious code</li>
                      <li>Interfere with or disrupt the Platform's operation</li>
                      <li>Scrape, harvest, or collect user data without permission</li>
                      <li>Use the Platform for commercial purposes without authorization</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. AI-Powered Features</h2>
                <p className="text-gray-600">
                  DotSpark uses artificial intelligence to provide enhanced learning experiences. By using AI-powered features, you acknowledge that:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                  <li>AI-generated content may not always be accurate or complete</li>
                  <li>You are responsible for reviewing and validating AI-generated insights</li>
                  <li>Your content may be processed by third-party AI services</li>
                  <li>You can control AI processing preferences in your settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property Rights</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Platform Content</h3>
                    <p className="text-gray-600">
                      All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, and software, are the property of DotSpark and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Trademarks</h3>
                    <p className="text-gray-600">
                      "DotSpark," the DotSpark logo, and other marks are trademarks of DotSpark. You may not use these marks without our prior written permission.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy and Data Protection</h2>
                <p className="text-gray-600">
                  Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Services and Links</h2>
                <p className="text-gray-600">
                  The Platform may contain links to or integrate with third-party websites and services (such as LinkedIn, WhatsApp, or OpenAI). We are not responsible for the content, privacy policies, or practices of any third-party services. Your use of third-party services is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
                <p className="text-gray-600">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. YOUR USE OF THE PLATFORM IS AT YOUR SOLE RISK.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
                <p className="text-gray-600">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DOTSPARK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                  <li>Your use or inability to use the Platform</li>
                  <li>Any unauthorized access to or use of our servers</li>
                  <li>Any interruption or cessation of transmission to or from the Platform</li>
                  <li>Any bugs, viruses, or other harmful code</li>
                  <li>Any errors or omissions in any content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
                <p className="text-gray-600">
                  You agree to indemnify, defend, and hold harmless DotSpark and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the Platform or your violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Subscription and Payments</h2>
                <p className="text-gray-600">
                  Some features of the Platform may require a paid subscription. By subscribing to a paid plan:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                  <li>You agree to pay all fees associated with your subscription</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Refunds are provided only as required by law or at our discretion</li>
                  <li>We reserve the right to change pricing with notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-600">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DotSpark is registered, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Modifications to Service</h2>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue the Platform or any features at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Severability</h2>
                <p className="text-gray-600">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Contact Information</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms of Use, please contact us at:
                </p>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 font-semibold">DotSpark Legal Team</p>
                  <p className="text-gray-600">Email: legal@dotspark.ai</p>
                  <p className="text-gray-600">Website: www.dotspark.ai</p>
                </div>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-gray-500 italic">
                  By using DotSpark, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
