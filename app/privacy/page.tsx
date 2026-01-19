import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e7e6e2] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Shield className="size-10 text-[#23d57c]" />
            <h1 className="font-sans text-4xl font-bold text-[#292827]">
              Privacy Policy
            </h1>
          </div>
          <p className="mt-4 font-mono text-sm text-[#666]">
            Last updated: January 19, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed text-[#292827]">
              Welcome to Novita Arena. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              platform and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Database className="size-6 text-[#23d57c]" />
              <h2 className="font-sans text-2xl font-semibold text-[#292827]">
                Data We Collect
              </h2>
            </div>
            <div className="space-y-4 text-[#292827]">
              <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li><strong>Identity Data:</strong> Username, email address, profile information</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> Information about how you use our platform</li>
                <li><strong>Content Data:</strong> AI conversations, generated content, preferences</li>
              </ul>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Eye className="size-6 text-[#23d57c]" />
              <h2 className="font-sans text-2xl font-semibold text-[#292827]">
                How We Use Your Data
              </h2>
            </div>
            <div className="space-y-4 text-[#292827]">
              <p>We use your personal data for the following purposes:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>To provide and maintain our service</li>
                <li>To authenticate and manage your account</li>
                <li>To improve and personalize your experience</li>
                <li>To communicate with you about updates and features</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Lock className="size-6 text-[#23d57c]" />
              <h2 className="font-sans text-2xl font-semibold text-[#292827]">
                Data Security
              </h2>
            </div>
            <div className="space-y-4 text-[#292827]">
              <p>
                We have put in place appropriate security measures to prevent your personal data from being 
                accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use 
                industry-standard encryption and security protocols to protect your data.
              </p>
              <p>
                All data transmission is encrypted using SSL/TLS. We regularly review our security practices 
                and update them as necessary to maintain the highest level of protection.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <UserCheck className="size-6 text-[#23d57c]" />
              <h2 className="font-sans text-2xl font-semibold text-[#292827]">
                Your Rights
              </h2>
            </div>
            <div className="space-y-4 text-[#292827]">
              <p>Under data protection laws, you have rights including:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li><strong>Right to access:</strong> Request copies of your personal data</li>
                <li><strong>Right to rectification:</strong> Correct any inaccurate personal data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to restrict processing:</strong> Request limitation on use of your data</li>
                <li><strong>Right to data portability:</strong> Transfer your data to another service</li>
                <li><strong>Right to object:</strong> Object to processing of your personal data</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <FileText className="size-6 text-[#23d57c]" />
              <h2 className="font-sans text-2xl font-semibold text-[#292827]">
                Third-Party Services
              </h2>
            </div>
            <div className="space-y-4 text-[#292827]">
              <p>
                Our platform integrates with third-party services including Novita AI for model inference. 
                These services have their own privacy policies, and we encourage you to review them:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Novita AI - AI model inference and API services</li>
                <li>Supabase - Authentication and database services</li>
                <li>Vercel - Hosting and deployment services</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-lg border border-[#e7e6e2] bg-[#f5f5f3] p-6">
            <h2 className="mb-4 font-sans text-2xl font-semibold text-[#292827]">
              Contact Us
            </h2>
            <p className="text-[#292827]">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="mt-4 font-mono text-sm text-[#23d57c]">
              privacy@novita.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
