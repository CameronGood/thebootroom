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
} from "recharts";
import Spinner from "@/components/Spinner";

interface Metrics {
  usersCount: number;
  quizStarts: number;
  quizCompletions: number;
  affiliateClicks: number;
  topBootClicks: Array<{ bootId: string; brand: string; model: string; clicks: number }>;
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
    return <div>Failed to load metrics</div>;
  }

  const completionRate =
    metrics.quizStarts > 0
      ? ((metrics.quizCompletions / metrics.quizStarts) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.usersCount}
          </p>
        </div>
        {metrics.billingMetrics && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Breakdown Purchases ({metrics.billingMetrics.month})
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {metrics.billingMetrics.purchases}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Breakdown Revenue ({metrics.billingMetrics.month})
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                £{metrics.billingMetrics.revenueGBP.toFixed(2)}
              </p>
            </div>
          </>
        )}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Quiz Starts
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.quizStarts}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Completions
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.quizCompletions}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {completionRate}% completion rate
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Affiliate Clicks
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.affiliateClicks}
          </p>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quiz Funnel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: "Quiz Starts", value: metrics.quizStarts },
            { name: "Completions", value: metrics.quizCompletions },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Boots Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top 10 Boots by Clicks</h2>
        {metrics.topBootClicks.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metrics.topBootClicks.map((boot) => ({
                name: `${boot.brand} ${boot.model}`,
                clicks: boot.clicks,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600">No clicks yet</p>
        )}
      </div>

      {/* Affiliate Clicks by Region */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Affiliate Clicks by Region</h2>
        {metrics.clicksByRegion && metrics.clicksByRegion.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.clicksByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600">No region data yet</p>
        )}
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top 10 Vendors by Clicks</h2>
        {metrics.clicksByVendor && metrics.clicksByVendor.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metrics.clicksByVendor.map((vendor) => ({
                name: vendor.vendor,
                clicks: vendor.count,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600">No vendor data yet</p>
        )}
      </div>

      {/* Region Distribution Pie Chart */}
      {metrics.clicksByRegion && metrics.clicksByRegion.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Region Distribution</h2>
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
                  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Boots with Vendor/Region Breakdown */}
      {metrics.topBootClicksWithDetails && metrics.topBootClicksWithDetails.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Boots - Vendor & Region Breakdown</h2>
          <div className="space-y-4">
            {metrics.topBootClicksWithDetails.map((boot) => (
              <div key={boot.bootId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {boot.brand} {boot.model}
                    </h3>
                    <p className="text-sm text-gray-600">Total Clicks: {boot.clicks}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Vendors */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Clicks by Vendor</h4>
                    {Object.keys(boot.vendors).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(boot.vendors)
                          .sort((a, b) => b[1] - a[1])
                          .map(([vendor, count]) => (
                            <div key={vendor} className="flex justify-between text-sm">
                              <span className="text-gray-600">{vendor}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No vendor data</p>
                    )}
                  </div>
                  {/* Regions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Clicks by Region</h4>
                    {Object.keys(boot.regions).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(boot.regions)
                          .sort((a, b) => b[1] - a[1])
                          .map(([region, count]) => (
                            <div key={region} className="flex justify-between text-sm">
                              <span className="text-gray-600">{region}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No region data</p>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Breakdown Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.allBillingMetrics.sort((a, b) => a.month.localeCompare(b.month))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `£${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenueGBP" stroke="#10b981" strokeWidth={2} name="Revenue (£)" />
              <Line type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} name="Purchases" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Users by Country */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Users by Country</h2>
        {metrics.usersByCountry.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {metrics.usersByCountry.map((item) => (
                  <tr key={item.country}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No country data yet</p>
        )}
      </div>
    </div>
  );
}

