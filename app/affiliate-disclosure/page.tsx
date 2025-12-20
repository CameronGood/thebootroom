import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | The Boot Room",
  description: "Learn about how The Boot Room uses affiliate links and our commitment to transparency.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040404]">
      <div className="sticky top-0 z-50 bg-[#040404] pt-2 pb-0">
        <Header />
      </div>

      <main className="flex-grow bg-[#040404] pb-12">
        <div className="w-full px-4 md:px-[50px] pt-28 sm:pt-32 md:pt-36 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1C1C1E] via-[#1F1F21] to-[#151517] border border-[#F5E4D0]/25 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-9 space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(245,228,208,0.04),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(245,228,208,0.04),transparent_30%)]" />
            <div className="relative space-y-3 sm:space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#F5E4D0]/40 bg-[#F5E4D0]/5 text-xs font-semibold uppercase tracking-[0.08em] text-[#F5E4D0]">
                Transparency
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F4]">Affiliate Disclosure</h1>
              <p className="text-[#F4F4F4]/70 text-base sm:text-lg max-w-3xl">
                How we use affiliate links, why we include them, and what that means for you.
              </p>
            </div>

            <div className="relative grid gap-5 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-[#F4F4F4] mb-2">What are affiliate links?</h2>
                <p className="text-[#F4F4F4]/80 leading-relaxed">
                  Some product links on The Boot Room are affiliate links. If you click and buy, we may earn a small
                  commission at no extra cost to you. These links never affect the price you pay.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-[#F4F4F4] mb-2">How we choose products</h2>
                <p className="text-[#F4F4F4]/80 leading-relaxed">
                  We only recommend boots and gear we genuinely believe in based on fit, performance, and value. Earning
                  a commission never influences our matching results or recommendations.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-[#F4F4F4] mb-2">Why we use them</h2>
                <p className="text-[#F4F4F4]/80 leading-relaxed">
                  Affiliate commissions help keep the site running and fund improvements to our quiz, fit guidance, and
                  tools—without relying on intrusive ads.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/15 bg-[#0B0B0C]/60 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-[#F4F4F4] mb-2">What you should know</h2>
                <ul className="list-disc list-inside text-[#F4F4F4]/80 leading-relaxed space-y-2">
                  <li>Prices and availability can change—please confirm details on the retailer’s site.</li>
                  <li>Clicking affiliate links is optional; you can search for the product directly if you prefer.</li>
                  <li>Your support helps us stay independent and continue improving your experience.</li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-[#F5E4D0]/25 bg-[#F5E4D0]/5 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-[#F4F4F4] mb-2">Questions?</h2>
                <p className="text-[#F4F4F4]/80 leading-relaxed">
                  If you have any questions about our affiliate relationships or recommendations, please reach out via our
                  contact page. We value transparency and your trust.
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

