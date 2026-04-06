import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | INVITATION.LK",
  description:
    "Learn how INVITATION.LK collects, uses, and protects your personal information when you use our digital wedding invitation platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-400 mb-12">
              Last updated: April 2026
            </p>

            <div className="space-y-10 text-gray-600 leading-relaxed">
              {/* Introduction */}
              <section>
                <p>
                  Welcome to INVITATION.LK (&quot;we&quot;, &quot;us&quot;, or
                  &quot;our&quot;). We are a digital wedding invitation platform
                  based in Colombo, Sri Lanka. This Privacy Policy explains how
                  we collect, use, disclose, and safeguard your information when
                  you visit our website and use our services. Please read this
                  policy carefully. By using INVITATION.LK, you consent to the
                  practices described in this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Information We Collect
                </h2>
                <p className="mb-4">
                  We collect information that you provide directly to us when you
                  create an account, build an invitation, or interact with our
                  services:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Information:</strong> Your name, email
                    address, phone number, and password when you register.
                  </li>
                  <li>
                    <strong>Wedding Details:</strong> Bride and groom names,
                    wedding date, venue details, ceremony information, and any
                    other content you include in your invitation.
                  </li>
                  <li>
                    <strong>Guest Data:</strong> Names, email addresses, phone
                    numbers, and RSVP responses of guests you add to your guest
                    list.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Billing details
                    processed through our payment provider. We do not store
                    credit card numbers on our servers.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you
                    interact with our platform, including page views, features
                    used, and device information.
                  </li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    To provide, maintain, and improve our digital invitation
                    services.
                  </li>
                  <li>
                    To create and manage your account and process your
                    invitations.
                  </li>
                  <li>
                    To send RSVP notifications, reminders, and service-related
                    communications.
                  </li>
                  <li>To process payments and send transaction confirmations.</li>
                  <li>
                    To respond to your inquiries, support requests, and feedback.
                  </li>
                  <li>
                    To monitor and analyze usage trends to improve user
                    experience.
                  </li>
                  <li>
                    To detect, prevent, and address fraud or technical issues.
                  </li>
                </ul>
              </section>

              {/* Data Storage and Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Data Storage and Security
                </h2>
                <p className="mb-4">
                  Your data is stored securely in a PostgreSQL database hosted on
                  DigitalOcean infrastructure. We implement industry-standard
                  security measures to protect your information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encrypted data transmission using SSL/TLS protocols.</li>
                  <li>Encrypted storage for sensitive data at rest.</li>
                  <li>
                    Regular security audits and updates to our infrastructure.
                  </li>
                  <li>
                    Access controls limiting data access to authorized personnel
                    only.
                  </li>
                </ul>
                <p className="mt-4">
                  While we strive to use commercially acceptable means to protect
                  your personal information, no method of transmission over the
                  Internet or electronic storage is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Third-Party Services
                </h2>
                <p className="mb-4">
                  We use trusted third-party services to operate our platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stripe:</strong> For secure payment processing.
                    Stripe handles all credit card and payment data in compliance
                    with PCI-DSS standards. See{" "}
                    <a
                      href="https://stripe.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline"
                    >
                      Stripe&apos;s Privacy Policy
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Resend:</strong> For delivering transactional emails
                    such as RSVP notifications and account confirmations. See{" "}
                    <a
                      href="https://resend.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline"
                    >
                      Resend&apos;s Privacy Policy
                    </a>
                    .
                  </li>
                  <li>
                    <strong>DigitalOcean:</strong> For cloud hosting and database
                    infrastructure.
                  </li>
                </ul>
                <p className="mt-4">
                  These third parties have access to your information only to
                  perform specific tasks on our behalf and are obligated to
                  protect it.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Cookies and Tracking
                </h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your
                  experience:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for
                    authentication and session management.
                  </li>
                  <li>
                    <strong>Analytics:</strong> We collect anonymous page view
                    data to understand how visitors use our platform and to
                    improve our services.
                  </li>
                </ul>
                <p className="mt-4">
                  We do not use third-party advertising trackers or sell your
                  browsing data to advertisers.
                </p>
              </section>

              {/* User Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Your Rights
                </h2>
                <p className="mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal data
                    we hold about you.
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of any
                    inaccurate or incomplete data.
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and all associated data.
                  </li>
                  <li>
                    <strong>Export:</strong> Request an export of your data in a
                    portable format.
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw your consent for
                    data processing at any time by contacting us.
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at{" "}
                  <a
                    href="mailto:hello@invitation.lk"
                    className="text-rose-600 hover:underline"
                  >
                    hello@invitation.lk
                  </a>
                  . We will respond to your request within 30 days.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Data Retention
                </h2>
                <p>
                  We retain your personal data and invitation content for the
                  duration of your active account. After your wedding date, we
                  retain your data for an additional 6 months to allow you to
                  access your guest list, RSVP data, and invitation analytics.
                  After this retention period, your data will be permanently
                  deleted unless you request an extension or export your data
                  beforehand. You may request early deletion of your data at any
                  time.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Children&apos;s Privacy
                </h2>
                <p>
                  INVITATION.LK is intended for users who are at least 18 years
                  of age. We do not knowingly collect personal information from
                  children under 18. If we become aware that we have collected
                  data from a child under 18, we will take steps to delete that
                  information promptly. If you believe a child has provided us
                  with personal data, please contact us at{" "}
                  <a
                    href="mailto:hello@invitation.lk"
                    className="text-rose-600 hover:underline"
                  >
                    hello@invitation.lk
                  </a>
                  .
                </p>
              </section>

              {/* Changes to This Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new policy on
                  this page and updating the &quot;Last updated&quot; date. We
                  encourage you to review this Privacy Policy periodically for
                  any changes. Continued use of our services after changes are
                  posted constitutes acceptance of the revised policy.
                </p>
              </section>

              {/* Contact Us */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Contact Us
                </h2>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy, please contact us:
                </p>
                <ul className="list-none mt-4 space-y-2">
                  <li>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:hello@invitation.lk"
                      className="text-rose-600 hover:underline"
                    >
                      hello@invitation.lk
                    </a>
                  </li>
                  <li>
                    <strong>Location:</strong> Colombo, Sri Lanka
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
