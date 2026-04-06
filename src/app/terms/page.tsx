import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | INVITATION.LK",
  description:
    "Read the terms and conditions for using INVITATION.LK, the digital wedding invitation platform for Sri Lankan celebrations.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-400 mb-12">
              Last updated: April 2026
            </p>

            <div className="space-y-10 text-gray-600 leading-relaxed">
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using INVITATION.LK (&quot;the
                  Service&quot;), you agree to be bound by these Terms of
                  Service (&quot;Terms&quot;). If you do not agree to these
                  Terms, you may not access or use the Service. These Terms
                  constitute a legally binding agreement between you and
                  INVITATION.LK, operated from Colombo, Sri Lanka.
                </p>
              </section>

              {/* Description of Service */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Description of Service
                </h2>
                <p>
                  INVITATION.LK is a digital wedding invitation platform that
                  enables users to create, customize, and share beautiful
                  wedding invitations online. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>
                    Creating and customizing digital wedding invitations from
                    professionally designed templates.
                  </li>
                  <li>
                    Managing guest lists with contact information and grouping.
                  </li>
                  <li>
                    Collecting and tracking RSVP responses from guests.
                  </li>
                  <li>
                    Sharing invitations via unique links and QR codes.
                  </li>
                  <li>
                    Providing analytics on invitation views and guest
                    engagement.
                  </li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. User Accounts
                </h2>
                <p className="mb-4">
                  To use certain features of the Service, you must register for
                  an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide accurate, current, and complete information during
                    registration.
                  </li>
                  <li>
                    Maintain the security of your password and account
                    credentials.
                  </li>
                  <li>
                    Accept responsibility for all activities that occur under
                    your account.
                  </li>
                  <li>
                    Maintain only one account per person. Duplicate accounts may
                    be terminated.
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account.
                  </li>
                </ul>
                <p className="mt-4">
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms or that have been inactive for an extended
                  period.
                </p>
              </section>

              {/* Plans and Pricing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Plans and Pricing
                </h2>
                <p className="mb-4">
                  INVITATION.LK offers the following plans with one-time
                  pricing:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Free Preview:</strong> Create and preview your
                    invitation at no cost before publishing.
                  </li>
                  <li>
                    <strong>Basic Plan — Rs. 2,500:</strong> Essential features
                    for your digital invitation.
                  </li>
                  <li>
                    <strong>Standard Plan — Rs. 5,000:</strong> Enhanced
                    features including additional customization options.
                  </li>
                  <li>
                    <strong>Premium Plan — Rs. 10,000:</strong> Full access to
                    all features, premium templates, and priority support.
                  </li>
                </ul>
                <p className="mt-4">
                  All prices are listed in Sri Lankan Rupees (LKR) and are
                  one-time payments, not recurring subscriptions. We reserve the
                  right to modify pricing at any time, but changes will not
                  affect existing paid plans.
                </p>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Payment Terms
                </h2>
                <p className="mb-4">
                  Payments can be made through the following methods:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stripe:</strong> Credit card, debit card, and other
                    online payment methods processed securely through Stripe.
                  </li>
                  <li>
                    <strong>Bank Transfer:</strong> Direct bank transfer to our
                    designated account, subject to manual verification.
                  </li>
                </ul>
                <p className="mt-4">
                  <strong>Refund Policy:</strong> Payments are non-refundable
                  once your invitation has been published and shared with
                  guests. If you have not yet published your invitation, you may
                  request a refund within 7 days of payment by contacting us at{" "}
                  <a
                    href="mailto:hello@invitation.lk"
                    className="text-rose-600 hover:underline"
                  >
                    hello@invitation.lk
                  </a>
                  .
                </p>
              </section>

              {/* User Content */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. User Content
                </h2>
                <p className="mb-4">
                  You retain full ownership of any content you upload or create
                  on the Service, including text, images, and wedding details
                  (&quot;User Content&quot;). By using the Service, you grant
                  INVITATION.LK a non-exclusive, worldwide, royalty-free license
                  to use, display, and distribute your User Content solely for
                  the purpose of providing and operating the Service.
                </p>
                <p>
                  You represent and warrant that you own or have the necessary
                  rights and permissions to use and authorize us to display your
                  User Content, and that your content does not infringe on the
                  intellectual property rights of any third party.
                </p>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Acceptable Use
                </h2>
                <p className="mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Upload, share, or distribute any illegal, harmful,
                    threatening, abusive, or otherwise objectionable content.
                  </li>
                  <li>
                    Send unsolicited messages, spam, or bulk communications to
                    individuals who have not consented.
                  </li>
                  <li>
                    Impersonate any person or entity or misrepresent your
                    affiliation.
                  </li>
                  <li>
                    Attempt to gain unauthorized access to the Service or its
                    related systems.
                  </li>
                  <li>
                    Introduce malware, viruses, or any other harmful code.
                  </li>
                  <li>
                    Use the Service for any purpose other than creating
                    legitimate wedding or event invitations.
                  </li>
                  <li>
                    Scrape, crawl, or collect data from the Service through
                    automated means without our consent.
                  </li>
                </ul>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Service Availability
                </h2>
                <p>
                  We strive to keep INVITATION.LK available at all times.
                  However, we do not guarantee 100% uptime. The Service may be
                  temporarily unavailable due to maintenance, updates, server
                  issues, or circumstances beyond our control. We will make
                  reasonable efforts to notify users of planned downtime in
                  advance. We are not liable for any loss or inconvenience
                  caused by service interruptions.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Intellectual Property
                </h2>
                <p>
                  The INVITATION.LK platform, including its design, templates,
                  source code, logos, and all related intellectual property, is
                  owned by INVITATION.LK and is protected by applicable
                  copyright and trademark laws. You may not copy, modify,
                  distribute, sell, or lease any part of the Service or its
                  underlying technology without our prior written consent.
                  Templates provided by the Service are licensed for use within
                  the platform only and may not be extracted or repurposed.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Limitation of Liability
                </h2>
                <p className="mb-4">
                  To the fullest extent permitted by law, INVITATION.LK and its
                  operators, employees, and affiliates shall not be liable for
                  any indirect, incidental, special, consequential, or punitive
                  damages arising out of or relating to your use of the Service.
                </p>
                <p>
                  Our total liability for any claim arising from or relating to
                  the Service shall not exceed the amount you paid to us in the
                  12 months preceding the claim. The Service is provided on an
                  &quot;as is&quot; and &quot;as available&quot; basis without
                  warranties of any kind, either express or implied.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  11. Termination
                </h2>
                <p className="mb-4">
                  We may suspend or terminate your access to the Service at any
                  time, with or without notice, for conduct that we believe
                  violates these Terms or is harmful to other users, the
                  Service, or third parties.
                </p>
                <p>
                  You may terminate your account at any time by contacting us.
                  Upon termination, your right to use the Service will cease
                  immediately. Any data associated with your account may be
                  deleted after termination, subject to our data retention
                  policy.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  12. Governing Law
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of Sri Lanka. Any disputes arising under or in
                  connection with these Terms shall be subject to the exclusive
                  jurisdiction of the courts of Sri Lanka.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  13. Contact Information
                </h2>
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us:
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
