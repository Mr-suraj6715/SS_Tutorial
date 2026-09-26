import React, { useEffect } from 'react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { updatePageMeta } from '@/lib/utils/seo'

export const TermsPage: React.FC = () => {
  const { settings } = useSiteSettings()

  useEffect(() => {
    updatePageMeta({
      title: 'Terms and Conditions',
      description: `Terms and Conditions of ${settings.institute_name || 'SS Tutorial'} — please read before using our website or enrolling.`,
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">Terms and Conditions</h1>
          <p className="text-sm text-emerald-200 mt-3">Last updated: {today}</p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-slate-700 dark:text-slate-300 text-base leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the {instituteName} website and its associated online portals, you agree to be
                bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Use of the Website</h2>
              <p>You agree to use this website only for lawful purposes and in a manner that does not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Infringe the rights of any third party.</li>
                <li>Attempt to gain unauthorized access to any part of our systems.</li>
                <li>Transmit any harmful, offensive, or misleading content.</li>
                <li>Scrape, harvest, or otherwise collect data from this website without prior written consent.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Admission and Enrollment</h2>
              <p>
                Submitting an admission inquiry or application form on this website does not guarantee enrollment.
                Admission is subject to seat availability, eligibility criteria, and verification of information
                provided. {instituteName} reserves the right to accept or decline any application at its sole discretion.
              </p>
              <p className="mt-2">
                Fee structures, batch timings, course content, and other institute details are subject to change.
                Current information will be provided by our administrative staff at the time of admission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Student and Parent Accounts</h2>
              <p>
                If you create an account on our portal, you are responsible for maintaining the confidentiality of
                your login credentials and for all activities that occur under your account. Please notify us
                immediately if you suspect any unauthorized use of your account.
              </p>
              <p className="mt-2">
                Accounts must only be used by the registered individual. Sharing login credentials with others is
                not permitted.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Intellectual Property</h2>
              <p>
                All content on this website, including text, images, logos, study materials, and videos, is the
                property of {instituteName} or its respective creators and is protected under applicable copyright
                laws. You may not reproduce, distribute, or use any content without prior written permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Uploaded Content</h2>
              <p>
                If you upload any content (such as profile photos or documents) through the portal, you represent
                that you have the right to upload such content and grant {instituteName} a non-exclusive license to
                use it solely for the purpose of operating the portal and providing services to you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Disclaimer of Warranties</h2>
              <p>
                This website and its content are provided "as is" without warranties of any kind, either express or
                implied. We do not guarantee that the website will be uninterrupted, error-free, or free of harmful
                components. Use of this website is at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, {instituteName} shall not be liable for any indirect,
                incidental, special, or consequential damages arising from your use of or inability to use this
                website or its content.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Third-Party Services</h2>
              <p>
                Our website may link to or use third-party services (such as Google for authentication or Instagram
                for social content). We are not responsible for the practices, content, or policies of any
                third-party services. Your use of such services is governed by their respective terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Governing Law</h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts
                located in the appropriate jurisdiction as per applicable Indian law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Updated terms will be
                published on this page with a revised "Last updated" date. Continued use of the website after
                any changes constitutes your acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Contact Us</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
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
