import React, { useEffect } from 'react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { updatePageMeta } from '@/lib/utils/seo'

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSiteSettings()

  useEffect(() => {
    updatePageMeta({
      title: 'Privacy Policy',
      description: `Privacy Policy of ${settings.institute_name || 'SS Tutorial'} — how we collect, use, and protect your personal information.`,
    }, settings.institute_name)
  }, [settings])

  const instituteName = settings.institute_name || 'SS Tutorial'
  const contactEmail = settings.email || ''
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white py-14 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">Privacy Policy</h1>
          <p className="text-sm text-emerald-200 mt-3">Last updated: {today}</p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-8 text-slate-700 dark:text-slate-300 text-base leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
              <p>
                {instituteName} ("we", "our", or "us") operates this website. This Privacy Policy explains how we collect,
                use, disclose, and protect information when you visit our website or submit information through our
                contact and admission forms.
              </p>
              <p className="mt-2">
                By using this website, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Personal information</strong> you provide voluntarily, such as your name, email address, phone
                  number, and class/course of interest when you fill out our admission inquiry or contact form.
                </li>
                <li>
                  <strong>Account information</strong> if you register for a student or parent portal account, including
                  your email address and any profile details you provide.
                </li>
                <li>
                  <strong>Usage data</strong> such as pages visited, time spent, and browser type, collected automatically
                  through standard server logs or analytics tools.
                </li>
              </ul>
              <p className="mt-2">We do not collect sensitive personal data such as payment card numbers, Aadhaar numbers, or medical information through this website.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
              <p>Information we collect is used to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Respond to your inquiry or admission application.</li>
                <li>Provide access to student or parent portal features.</li>
                <li>Send you relevant updates about your enrolment, exam schedules, or results (only if you have enrolled).</li>
                <li>Improve our website content and services.</li>
                <li>Comply with applicable legal obligations.</li>
              </ul>
              <p className="mt-2">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Supabase (hosted infrastructure). We take reasonable technical and
                organizational measures to protect your information from unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the internet is completely secure, and we cannot
                guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Cookies</h2>
              <p>
                Our website may use essential cookies to maintain session state for logged-in users. We do not use
                tracking cookies for advertising purposes. You can configure your browser to refuse cookies, though
                some portal features may not function correctly without them.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites such as Instagram or YouTube. We are not
                responsible for the privacy practices of those websites and encourage you to review their respective
                privacy policies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Children's Privacy</h2>
              <p>
                Our services are intended for use by students, parents, and guardians. If a student is under the age of
                13, account registration must be completed by a parent or guardian. We do not knowingly collect personal
                information from children under 13 without verifiable parental consent.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your data, subject to any legal obligations we may have.</li>
                <li>Withdraw consent for communications at any time.</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, please contact us using the details below.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last
                updated" date at the top of this page. We encourage you to review this page periodically.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">{instituteName}</p>
                {contactEmail && (
                  <p className="mt-1 text-sm">
                    Email:{' '}
                    <a href={`mailto:${contactEmail}`} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                      {contactEmail}
                    </a>
                  </p>
                )}
                <p className="mt-1 text-sm">
                  You can also reach us through the{' '}
                  <a href="/contact" className="text-emerald-700 dark:text-emerald-400 hover:underline">Contact page</a>.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
