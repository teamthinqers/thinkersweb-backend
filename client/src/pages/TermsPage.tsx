import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Terms of Use
        </h1>
        
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: October 14, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using DotSpark, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p>
              DotSpark is a collective Human Intelligence Network platform that enables users to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and organize personal thoughts in My Neura</li>
              <li>Collaborate in private ThinQ Circles with invited partners</li>
              <li>Contribute to Social Neura, the collective intelligence network</li>
              <li>Access features via desktop and WhatsApp integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p>To use DotSpark, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Content</h2>
            <p>
              <strong>Ownership:</strong> You retain all rights to the content you create on DotSpark (dots, wheels, chakras, messages).
            </p>
            <p className="mt-4">
              <strong>License to Us:</strong> By publishing content publicly on Social Neura, you grant DotSpark a non-exclusive, worldwide license to display, distribute, and promote that content within the platform.
            </p>
            <p className="mt-4">
              <strong>Your Responsibilities:</strong> You agree not to post content that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Includes personal information of others without consent</li>
              <li>Contains malware, spam, or deceptive content</li>
              <li>Promotes violence or illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. ThinQ Circles</h2>
            <p>
              When creating or participating in ThinQ Circles:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for managing circle membership</li>
              <li>Circle content is private to invited members only</li>
              <li>Respect the privacy and contributions of other circle members</li>
              <li>Circle creators can remove members and delete circles at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Prohibited Uses</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use automated systems to access the platform (except approved API integrations)</li>
              <li>Attempt to gain unauthorized access to other accounts or systems</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Reverse engineer or copy platform features</li>
              <li>Use the platform for commercial purposes without authorization</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. AI & Data Processing</h2>
            <p>
              DotSpark uses AI technologies to enhance user experience. By using our platform, you consent to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI-powered content analysis and classification</li>
              <li>Automated generation of summaries and insights</li>
              <li>Processing of your content through third-party AI services (as detailed in our Privacy Policy)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Intellectual Property</h2>
            <p>
              The DotSpark platform, including its design, features, code, and branding, is owned by DotSpark and protected by intellectual property laws. You may not copy, modify, or distribute our platform elements without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. You may also delete your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Disclaimers</h2>
            <p>
              DotSpark is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of AI-generated content</li>
              <li>Specific outcomes from using the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, DotSpark shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of DotSpark after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Governing Law</h2>
            <p>
              These Terms are governed by applicable laws. Any disputes shall be resolved through appropriate legal channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact</h2>
            <p>
              For questions about these Terms, please contact us through our WhatsApp community or email us at legal@dotspark.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
