"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import { useAuth } from "@/lib/auth";
import BootsTab from "@/components/admin/BootsTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"boots" | "analytics">("boots");

  // Temporary: Allow specific emails for development
  // TODO: Remove this and use proper admin claims in production
  const DEV_ADMIN_EMAILS = ["19camerongood96@gmail.com"];

  const isDevAdmin = user?.email && DEV_ADMIN_EMAILS.includes(user.email);
  const hasAdminAccess = isAdmin || isDevAdmin;

  useEffect(() => {
    if (!loading && (!user || !hasAdminAccess)) {
      router.push("/");
    }
  }, [user, hasAdminAccess, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#040404]">
        <div className="sticky top-0 z-50 bg-[#040404] pt-4">
        <Header />
        </div>
        <main className="flex-grow flex items-center justify-center bg-[#040404]">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#040404]">
      <div className="sticky top-0 z-50 bg-[#040404] pt-4">
      <Header />
      </div>
      <main className="flex-grow bg-[#040404] pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <h1 className="text-3xl font-bold mb-8 text-[#F4F4F4]">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="border-b border-[#F5E4D0]/20 mb-6">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab("boots")}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === "boots"
                    ? "border-[#F5E4D0] text-[#F5E4D0]"
                    : "border-transparent text-[#F4F4F4]/60 hover:text-[#F4F4F4]"
                }`}
              >
                Boots
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === "analytics"
                    ? "border-[#F5E4D0] text-[#F5E4D0]"
                    : "border-transparent text-[#F4F4F4]/60 hover:text-[#F4F4F4]"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "boots" && <BootsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
