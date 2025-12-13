import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040404]">
      <div className="sticky top-0 z-50 bg-[#040404] pt-2 pb-0">
        <Header />
      </div>

      <main className="flex-grow bg-[#040404] pb-12">
        <div className="w-full px-4 md:px-[50px] pt-28 sm:pt-32 md:pt-36 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1C1C1E] via-[#1F1F21] to-[#151517] border border-[#F5E4D0]/25 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-9 space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(245,228,208,0.05),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(245,228,208,0.05),transparent_30%)]" />
            <div className="relative space-y-3 sm:space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#F5E4D0]/40 bg-[#F5E4D0]/5 text-xs font-semibold uppercase tracking-[0.08em] text-[#F5E4D0]">
                Contact Us
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F4]">We&apos;d love to hear from you</h1>
              <p className="text-[#F4F4F4]/70 text-base sm:text-lg max-w-3xl">
                Questions about your fit, feedback about the site, or partnership inquiries—drop us a line.
              </p>
            </div>

            <div className="relative grid gap-5 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md space-y-2">
                <h2 className="text-xl font-semibold text-[#F4F4F4]">Email</h2>
                <p className="text-[#F4F4F4]/80">
                  <Link href="mailto:hello@thebootroom.com" className="text-[#F5E4D0] underline underline-offset-4 hover:text-[#E8D4B8]">
                    hello@thebootroom.com
                  </Link>
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md space-y-2">
                <h2 className="text-xl font-semibold text-[#F4F4F4]">Support hours</h2>
                <p className="text-[#F4F4F4]/80">
                  Monday – Friday, 9:00–17:00 (UK time). We aim to respond within one business day.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

