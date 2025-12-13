"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen flex flex-col bg-[#040404]">
      <div className="sticky top-0 z-50 bg-[#040404] pt-2 pb-0">
        <Header />
      </div>
      <main className="flex-grow bg-[#040404] pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-[#1C1C1E] via-[#1F1F21] to-[#151517] border border-[#F5E4D0]/25 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-9 space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(245,228,208,0.05),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(245,228,208,0.05),transparent_30%)]" />
              <div className="relative space-y-3 sm:space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#F5E4D0]/40 bg-[#F5E4D0]/5 text-xs font-semibold uppercase tracking-[0.08em] text-[#F5E4D0]">
                  Privacy
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F4]">Privacy Policy</h1>
                <p className="text-[#F4F4F4]/70 text-sm sm:text-base">Last updated: {lastUpdated}</p>
              </div>

            <div className="relative grid gap-5 sm:gap-6 mt-4 sm:mt-6">
              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    1. Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    Welcome to TheBootRoom ("we," "our," or "us"). We are
                    committed to protecting your privacy and ensuring you have a
                    positive experience while using our ski boot matching
                    service. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you visit our
                    website and use our services.
                  </p>
                  <p>
                    By using TheBootRoom, you agree to the collection and use of
                    information in accordance with this policy. If you do not
                    agree with our policies and practices, please do not use our
                    service.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    2. Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-semibold text-[#F5E4D0] mb-3">
                      2.1 Information You Provide
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Quiz Responses:</strong> When you take our ski
                        boot fitting quiz, we collect information including:
                        <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                          <li>Gender/anatomy selection</li>
                          <li>Foot measurements (length, width)</li>
                          <li>Foot characteristics (toe shape, instep height,
                            ankle volume, calf volume)</li>
                          <li>Weight</li>
                          <li>Skiing ability level</li>
                          <li>Boot type preferences</li>
                          <li>Feature preferences (walk mode, rear entry, etc.)</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Account Information:</strong> If you create an
                        account, we collect your email address and authentication
                        information. You may also sign in using Google OAuth.
                      </li>
                      <li>
                        <strong>Payment Information:</strong> When you purchase
                        a detailed fitting breakdown, payment information is
                        processed through Stripe. We do not store your full
                        payment card details on our servers.
                      </li>
                      <li>
                        <strong>Contact Information:</strong> If you contact us
                        directly, we may collect your name, email address, and
                        any other information you choose to provide.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#F5E4D0] mb-3">
                      2.2 Automatically Collected Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Usage Data:</strong> We collect information
                        about how you interact with our service, including pages
                        visited, time spent on pages, and navigation patterns.
                      </li>
                      <li>
                        <strong>Device Information:</strong> We may collect
                        information about your device, including browser type,
                        operating system, IP address, and device identifiers.
                      </li>
                      <li>
                        <strong>Location Data:</strong> We may collect
                        approximate location information based on your IP address
                        for analytics and to provide region-specific content.
                      </li>
                      <li>
                        <strong>Affiliate Click Tracking:</strong> When you click
                        on affiliate links to purchase ski boots, we track
                        these clicks for analytics and commission purposes. This
                        includes the boot ID, session ID, vendor, region, and
                        timestamp.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    3. How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>We use the information we collect for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Service Provision:</strong> To provide, maintain,
                      and improve our ski boot matching service, including
                      processing your quiz responses and generating
                      personalized boot recommendations.
                    </li>
                    <li>
                      <strong>Account Management:</strong> To create and manage
                      your account, authenticate you, and allow you to save and
                      access your quiz results.
                    </li>
                    <li>
                      <strong>Payment Processing:</strong> To process payments
                      for premium features (detailed fitting breakdowns) through
                      our payment processor, Stripe.
                    </li>
                    <li>
                      <strong>Analytics and Improvement:</strong> To analyze
                      usage patterns, track affiliate clicks, and improve our
                      matching algorithm and user experience.
                    </li>
                    <li>
                      <strong>Communication:</strong> To respond to your
                      inquiries, provide customer support, and send you important
                      updates about our service (if you opt in).
                    </li>
                    <li>
                      <strong>Legal Compliance:</strong> To comply with legal
                      obligations, enforce our terms of service, and protect our
                      rights and the rights of our users.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    4. Data Storage and Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    Your data is stored securely using Firebase (Google Cloud
                    Platform). We implement appropriate technical and
                    organizational measures to protect your personal information
                    against unauthorized access, alteration, disclosure, or
                    destruction.
                  </p>
                  <p>
                    However, no method of transmission over the Internet or
                    electronic storage is 100% secure. While we strive to use
                    commercially acceptable means to protect your personal
                    information, we cannot guarantee absolute security.
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-[#F5E4D0] mb-3">
                      Data Retention
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Quiz Sessions:</strong> We retain your quiz
                        responses and results as long as your account is active
                        or as needed to provide our services.
                      </li>
                      <li>
                        <strong>Account Data:</strong> We retain your account
                        information until you delete your account or request
                        deletion.
                      </li>
                      <li>
                        <strong>Analytics Data:</strong> Aggregated analytics
                        data may be retained indefinitely for business purposes.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    5. Third-Party Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    We use the following third-party services that may collect,
                    process, or store your information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Firebase (Google):</strong> We use Firebase for
                      authentication, database storage (Firestore), and hosting.
                      Firebase's privacy policy applies to data processed
                      through their services.{" "}
                      <a
                        href="https://firebase.google.com/support/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        Learn more
                      </a>
                    </li>
                    <li>
                      <strong>Stripe:</strong> We use Stripe to process payments
                      for premium features. Stripe handles all payment card
                      information in accordance with PCI DSS standards.{" "}
                      <a
                        href="https://stripe.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        Learn more
                      </a>
                    </li>
                    <li>
                      <strong>Vercel:</strong> Our website is hosted on Vercel,
                      which may collect certain technical information.{" "}
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        Learn more
                      </a>
                    </li>
                    <li>
                      <strong>Google OAuth:</strong> If you sign in with Google,
                      Google's privacy policy applies to the authentication
                      process.{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        Learn more
                      </a>
                    </li>
                    <li>
                      <strong>Affiliate Partners:</strong> When you click on
                      affiliate links to purchase ski boots, you will be
                      redirected to third-party retailers. These retailers have
                      their own privacy policies that govern how they handle
                      your information.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    6. Cookies and Tracking Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    We use cookies and similar tracking technologies to track
                    activity on our service and hold certain information.
                    Cookies are files with a small amount of data that may
                    include an anonymous unique identifier.
                  </p>
                  <p>We use cookies for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Essential Cookies:</strong> Required for the
                      service to function, including authentication and session
                      management.
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> To understand how
                      visitors interact with our website and improve our
                      service.
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> To remember your
                      preferences and settings.
                    </li>
                  </ul>
                  <p>
                    You can instruct your browser to refuse all cookies or to
                    indicate when a cookie is being sent. However, if you do not
                    accept cookies, you may not be able to use some portions of
                    our service.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    7. Your Rights and Choices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    Depending on your location, you may have certain rights
                    regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Access:</strong> You can request access to the
                      personal information we hold about you.
                    </li>
                    <li>
                      <strong>Correction:</strong> You can request correction of
                      inaccurate or incomplete information.
                    </li>
                    <li>
                      <strong>Deletion:</strong> You can request deletion of
                      your personal information. You can also delete your
                      account and saved quiz results directly from your account
                      page.
                    </li>
                    <li>
                      <strong>Data Portability:</strong> You can request a copy
                      of your data in a structured, machine-readable format.
                    </li>
                    <li>
                      <strong>Opt-Out:</strong> You can opt out of certain data
                      collection and processing activities, where applicable.
                    </li>
                    <li>
                      <strong>Withdraw Consent:</strong> Where we rely on your
                      consent, you can withdraw it at any time.
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the
                    information provided in the "Contact Us" section below.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    8. Children's Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    Our service is not intended for children under the age of
                    13. We do not knowingly collect personal information from
                    children under 13. If you are a parent or guardian and
                    believe your child has provided us with personal
                    information, please contact us immediately.
                  </p>
                  <p>
                    If we discover that we have collected personal information
                    from a child under 13, we will delete that information
                    promptly.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    9. International Data Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    Your information may be transferred to and maintained on
                    computers located outside of your state, province, country,
                    or other governmental jurisdiction where data protection laws
                    may differ from those in your jurisdiction.
                  </p>
                  <p>
                    If you are located outside the United States and choose to
                    provide information to us, please note that we transfer the
                    data to the United States and process it there. By using our
                    service, you consent to the transfer of your information to
                    the United States.
                  </p>
                  <p>
                    For users in the European Economic Area (EEA), United
                    Kingdom, or other regions with data protection laws, we
                    ensure appropriate safeguards are in place for such
                    transfers, including reliance on Standard Contractual Clauses
                    where applicable.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    10. Changes to This Privacy Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    We may update our Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the "Last updated" date.
                  </p>
                  <p>
                    You are advised to review this Privacy Policy periodically
                    for any changes. Changes to this Privacy Policy are effective
                    when they are posted on this page.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#F4F4F4]">
                    11. Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#F4F4F4]/90 leading-relaxed">
                  <p>
                    If you have any questions about this Privacy Policy or wish
                    to exercise your rights, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:hello@thebootroom.app"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        hello@thebootroom.app
                      </a>
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      <Link
                        href="/contact-us"
                        className="text-[#F5E4D0] hover:underline"
                      >
                        Contact Us
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

