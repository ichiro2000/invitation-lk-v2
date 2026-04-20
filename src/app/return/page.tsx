import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Return & Refund Policy | INVITATION.LK",
  description:
    "Understand when refunds are available on INVITATION.LK, how to request one, and how we handle failed payments or duplicate charges.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Return &amp; Refund Policy
            </h1>
            <p className="text-sm text-gray-400 mb-12">
              Last updated: April 2026
            </p>

            <div className="space-y-10 text-gray-600 leading-relaxed">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Overview
                </h2>
                <p>
                  INVITATION.LK is a digital service. Every paid plan unlocks
                  instant access to templates, editing tools, and your live
                  invitation link. Because the product is delivered digitally
                  and cannot be physically returned, refunds are handled on a
                  case-by-case basis under the conditions below.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. When you can request a refund
                </h2>
                <p className="mb-4">
                  You are eligible for a full refund if <strong>all</strong> of
                  the following are true:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Your payment was completed within the last{" "}
                    <strong>7 days</strong>.
                  </li>
                  <li>
                    Your invitation has <strong>not</strong> been published or
                    shared with guests (the invitation link has not been
                    distributed via WhatsApp, email, or any other channel).
                  </li>
                  <li>
                    You have not sent RSVP links or bulk messages from your
                    guest list.
                  </li>
                </ul>
                <p className="mt-4">
                  If your invitation has already been published or shared, we
                  are unable to offer a refund — the service has already been
                  delivered.
                </p>
              </section>

              {/* Non-refundable */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. What is not refundable
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Invitations that have been published or shared with guests.
                  </li>
                  <li>
                    Payments older than 7 days from the date of purchase.
                  </li>
                  <li>
                    Change of mind after the wedding date has passed.
                  </li>
                  <li>
                    Charges made for add-ons that have already been consumed
                    (e.g. bulk WhatsApp sends, SMS credits).
                  </li>
                </ul>
              </section>

              {/* Failed / duplicate */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Failed or duplicate payments
                </h2>
                <p>
                  If you were charged twice for the same plan, or a payment was
                  debited but your plan was not upgraded, contact us within{" "}
                  <strong>30 days</strong> and we will investigate and refund
                  the duplicate or failed charge in full. Please include your
                  payment reference or bank receipt so we can locate the
                  transaction quickly.
                </p>
              </section>

              {/* Bank transfer */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Bank transfers pending review
                </h2>
                <p>
                  Bank transfers are manually verified before your plan is
                  activated. If your transfer is still pending review and you
                  no longer wish to proceed, email us and we will cancel the
                  order before activation at no cost. Once a bank transfer has
                  been approved and your plan activated, the standard refund
                  conditions in Section 2 apply.
                </p>
              </section>

              {/* How to request */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. How to request a refund
                </h2>
                <p className="mb-4">
                  Email{" "}
                  <a
                    href="mailto:hello@invitation.lk"
                    className="text-rose-600 hover:underline"
                  >
                    hello@invitation.lk
                  </a>{" "}
                  from the email address on your INVITATION.LK account and
                  include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your full name and the plan you purchased.</li>
                  <li>Date of payment and payment method (Stripe or bank transfer).</li>
                  <li>
                    Payment reference or last 4 digits of the card used.
                  </li>
                  <li>A brief reason for the refund request.</li>
                </ul>
                <p className="mt-4">
                  We will acknowledge your request within 2 business days and
                  let you know the outcome.
                </p>
              </section>

              {/* Processing time */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Processing time
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stripe (card) refunds:</strong> 5–10 business days
                    to appear on your statement, depending on your bank.
                  </li>
                  <li>
                    <strong>Bank transfer refunds:</strong> 3–7 business days
                    to the same account the payment was received from.
                  </li>
                </ul>
                <p className="mt-4">
                  Refunds are issued in Sri Lankan Rupees (LKR) for the exact
                  amount originally paid. We do not refund currency conversion
                  fees charged by your card issuer or bank.
                </p>
              </section>

              {/* Cancellations */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Cancellations and account closure
                </h2>
                <p>
                  All INVITATION.LK plans are one-time payments — there are no
                  recurring charges to cancel. If you would like your account
                  and associated data deleted, you may request account closure
                  at any time by contacting us. Account closure does not, by
                  itself, entitle you to a refund outside the conditions in
                  Section 2.
                </p>
              </section>

              {/* Related */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Related policies
                </h2>
                <p>
                  This policy should be read alongside our{" "}
                  <Link href="/terms" className="text-rose-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-rose-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . Where this policy conflicts with the Terms of Service, the
                  terms of this Return &amp; Refund Policy apply to refund
                  matters only.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Contact us
                </h2>
                <p>
                  Questions about this policy or an existing refund request?
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
