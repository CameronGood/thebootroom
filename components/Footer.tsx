import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2B2D30] border-t border-[#F5E4D0]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Navigation Links */}
          <nav aria-label="Footer navigation">
            <h2 className="text-lg font-semibold text-[#F4F4F4] mb-4">
              Navigation
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  prefetch={false}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  prefetch={false}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  prefetch={false}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal Links */}
          <nav aria-label="Legal links">
            <h2 className="text-lg font-semibold text-[#F4F4F4] mb-4">
              Legal
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  prefetch={false}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate-disclosure"
                  prefetch={true}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  prefetch={false}
                  className="text-[#F4F4F4]/80 hover:text-[#F5E4D0] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* SEO Links */}
          <div>
            <h2 className="text-lg font-semibold text-[#F4F4F4] mb-4">
              Contact Us
            </h2>
            <p className="text-[#F4F4F4]/80">
              <a
                href="mailto:hello@thebootroom.com"
                className="text-[#F5E4D0] hover:text-[#E8D4B8] underline underline-offset-4"
              >
                hello@thebootroom.com
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#F5E4D0]/20 pt-6 text-center text-[#F4F4F4]/80">
          <p>
            &copy; {currentYear} TheBootRoom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
