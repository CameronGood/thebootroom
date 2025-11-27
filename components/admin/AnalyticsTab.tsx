"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Spinner from "@/components/Spinner";

interface Metrics {
  usersCount: number;
  quizStarts: number;
  quizCompletions: number;
  affiliateClicks: number;
  topBootClicks: Array<{
    bootId: string;
    brand: string;
    model: string;
    clicks: number;
  }>;
  usersByCountry: Array<{ country: string; count: number }>;
  clicksByRegion: Array<{ region: string; count: number }>;
  clicksByVendor: Array<{ vendor: string; count: number }>;
  topBootClicksWithDetails: Array<{
    bootId: string;
    brand: string;
    model: string;
    clicks: number;
    vendors: Record<string, number>;
    regions: Record<string, number>;
  }>;
  billingMetrics?: {
    purchases: number;
    revenueGBP: number;
    month: string;
  };
  allBillingMetrics?: Array<{
    month: string;
    purchases: number;
    revenueGBP: number;
  }>;
}

export default function AnalyticsTab() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/metrics");
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!metrics) {
    return <div className="text-[#F4F4F4]">Failed to load metrics</div>;
  }

  const completionRate =
    metrics.quizStarts > 0
      ? ((metrics.quizCompletions / metrics.quizStarts) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-[#F4F4F4]">
            {metrics.usersCount}
          </p>
        </div>
        {metrics.billingMetrics && (
          <>
            <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
              <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
                Breakdown Purchases ({metrics.billingMetrics.month})
              </h3>
              <p className="text-3xl font-bold text-[#F4F4F4]">
                {metrics.billingMetrics.purchases}
              </p>
            </div>
            <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
              <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
                Breakdown Revenue ({metrics.billingMetrics.month})
              </h3>
              <p className="text-3xl font-bold text-[#F4F4F4]">
                £{metrics.billingMetrics.revenueGBP.toFixed(2)}
              </p>
            </div>
          </>
        )}
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
            Quiz Starts
          </h3>
          <p className="text-3xl font-bold text-[#F4F4F4]">
            {metrics.quizStarts}
          </p>
        </div>
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
            Completions
          </h3>
          <p className="text-3xl font-bold text-[#F4F4F4]">
            {metrics.quizCompletions}
          </p>
          <p className="text-sm text-[#F4F4F4]/60 mt-1">
            {completionRate}% completion rate
          </p>
        </div>
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h3 className="text-sm font-medium text-[#F4F4F4]/80 mb-2">
            Affiliate Clicks
          </h3>
          <p className="text-3xl font-bold text-[#F4F4F4]">
            {metrics.affiliateClicks}
          </p>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Quiz Funnel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: "Quiz Starts", value: metrics.quizStarts },
              { name: "Completions", value: metrics.quizCompletions },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4/20" />
            <XAxis dataKey="name" stroke="#F4F4F4/80" />
            <YAxis stroke="#F4F4F4/80" />
            <Tooltip contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }} />
            <Bar dataKey="value" fill="#F5E4D0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Boots Chart */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Top 10 Boots by Clicks</h2>
        {metrics.topBootClicks.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metrics.topBootClicks.map((boot) => ({
                name: `${boot.brand} ${boot.model}`,
                clicks: boot.clicks,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4/20" />
              <XAxis type="number" stroke="#F4F4F4/80" />
              <YAxis dataKey="name" type="category" width={200} stroke="#F4F4F4/80" />
              <Tooltip contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }} />
              <Bar dataKey="clicks" fill="#F5E4D0" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#F4F4F4]/60">No clicks yet</p>
        )}
      </div>

      {/* Affiliate Clicks by Region */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">
          Affiliate Clicks by Region
        </h2>
        {metrics.clicksByRegion && metrics.clicksByRegion.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.clicksByRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4/20" />
              <XAxis dataKey="region" stroke="#F4F4F4/80" />
              <YAxis stroke="#F4F4F4/80" />
              <Tooltip contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }} />
              <Bar dataKey="count" fill="#F5E4D0" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#F4F4F4]/60">No region data yet</p>
        )}
      </div>

      {/* Top Vendors */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Top 10 Vendors by Clicks</h2>
        {metrics.clicksByVendor && metrics.clicksByVendor.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metrics.clicksByVendor.map((vendor) => ({
                name: vendor.vendor,
                clicks: vendor.count,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4/20" />
              <XAxis type="number" stroke="#F4F4F4/80" />
              <YAxis dataKey="name" type="category" width={150} stroke="#F4F4F4/80" />
              <Tooltip contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }} />
              <Bar dataKey="clicks" fill="#F5E4D0" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#F4F4F4]/60">No vendor data yet</p>
        )}
      </div>

      {/* Region Distribution Pie Chart */}
      {metrics.clicksByRegion && metrics.clicksByRegion.length > 0 && (
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Region Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.clicksByRegion}
                dataKey="count"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ region, count }) => `${region}: ${count}`}
              >
                {metrics.clicksByRegion.map((entry, index) => {
                  const colors = [
                    "#F5E4D0",
                    "#E8D4B8",
                    "#D4C4A8",
                    "#C0B498",
                    "#ACA088",
                  ];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  );
                })}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }} />
              <Legend wrapperStyle={{ color: '#F4F4F4' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Boots with Vendor/Region Breakdown */}
      {metrics.topBootClicksWithDetails &&
        metrics.topBootClicksWithDetails.length > 0 && (
          <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
            <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">
              Top Boots - Vendor & Region Breakdown
            </h2>
            <div className="space-y-4">
              {metrics.topBootClicksWithDetails.map((boot) => (
                <div key={boot.bootId} className="border border-[#F5E4D0]/20 rounded-lg p-4 bg-[#1a1a1a]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-[#F4F4F4]">
                        {boot.brand} {boot.model}
                      </h3>
                      <p className="text-sm text-[#F4F4F4]/60">
                        Total Clicks: {boot.clicks}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Vendors */}
                    <div>
                      <h4 className="text-sm font-medium text-[#F4F4F4] mb-2">
                        Clicks by Vendor
                      </h4>
                      {Object.keys(boot.vendors).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(boot.vendors)
                            .sort((a, b) => b[1] - a[1])
                            .map(([vendor, count]) => (
                              <div
                                key={vendor}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-[#F4F4F4]/80">{vendor}</span>
                                <span className="font-medium text-[#F4F4F4]">{count}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#F4F4F4]/60">No vendor data</p>
                      )}
                    </div>
                    {/* Regions */}
                    <div>
                      <h4 className="text-sm font-medium text-[#F4F4F4] mb-2">
                        Clicks by Region
                      </h4>
                      {Object.keys(boot.regions).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(boot.regions)
                            .sort((a, b) => b[1] - a[1])
                            .map(([region, count]) => (
                              <div
                                key={region}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-[#F4F4F4]/80">{region}</span>
                                <span className="font-medium text-[#F4F4F4]">{count}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#F4F4F4]/60">No region data</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Revenue Over Time */}
      {metrics.allBillingMetrics && metrics.allBillingMetrics.length > 0 && (
        <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
          <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">
            Breakdown Revenue Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={metrics.allBillingMetrics.sort((a, b) =>
                a.month.localeCompare(b.month)
              )}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4/20" />
              <XAxis dataKey="month" stroke="#F4F4F4/80" />
              <YAxis stroke="#F4F4F4/80" />
              <Tooltip 
                formatter={(value: number) => `£${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#2B2D30', border: '1px solid #F5E4D0/20', color: '#F4F4F4' }}
              />
              <Legend wrapperStyle={{ color: '#F4F4F4' }} />
              <Line
                type="monotone"
                dataKey="revenueGBP"
                stroke="#F5E4D0"
                strokeWidth={2}
                name="Revenue (£)"
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#E8D4B8"
                strokeWidth={2}
                name="Purchases"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Users by Country */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Users by Country</h2>
        {metrics.usersByCountry.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E4D0]/10">
                {metrics.usersByCountry.map((item) => (
                  <tr key={item.country} className="hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#F4F4F4]">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F4F4F4]/80">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#F4F4F4]/60">No country data yet</p>
        )}
      </div>
    </div>
  );
}
