import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: October 14, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to DotSpark. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our collective Human Intelligence Network platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
              <li><strong>Content:</strong> Thoughts (dots), wheels, chakras, and messages you create</li>
              <li><strong>Usage Data:</strong> How you interact with our platform, features you use, and preferences</li>
              <li><strong>WhatsApp Data:</strong> Messages sent through our WhatsApp integration (if you choose to use it)</li>
              <li><strong>Technical Data:</strong> Device information, IP address, browser type, and session data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Enable you to create, organize, and share thoughts</li>
              <li>Facilitate collaboration in ThinQ Circles</li>
              <li>Display public thoughts in Social Neura (only if you choose to make them public)</li>
              <li>Communicate with you about your account and updates</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Privacy & Control</h2>
            <p>
              <strong>Your thoughts are yours.</strong> By default, all content you create in My Neura is private and visible only to you. You have complete control over what you share:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content remains private unless you explicitly choose to share it publicly</li>
              <li>ThinQ Circles content is visible only to circle members you invite</li>
              <li>You can delete your content at any time</li>
              <li>You can export your data upon request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data only in these circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your explicit consent (e.g., when you publish thoughts publicly)</li>
              <li>With service providers who help us operate the platform (under strict confidentiality agreements)</li>
              <li>When required by law or to protect our legal rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. AI Processing</h2>
            <p>
              We use AI services (including OpenAI) to enhance your experience with features like content summarization and classification. Your content may be processed by these services, but we do not use your data to train third-party AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. However, no system is 100% secure, and we encourage you to use strong passwords and enable available security features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of certain data processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              DotSpark is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes through email or platform notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us through our WhatsApp community or email us at privacy@dotspark.com
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
