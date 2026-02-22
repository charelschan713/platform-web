'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function AdminRevenuePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue', year],
    queryFn: async () => {
      const res = await api.get(`/admin/revenue?year=${year}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revenue Report</h1>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Annual GMV', value: `$${(data?.totals?.annual_gmv ?? 0).toLocaleString()}` },
          {
            label: 'Platform Fee',
            value: `$${(data?.totals?.annual_platform_fee ?? 0).toLocaleString()}`,
          },
          { label: 'Transactions', value: data?.totals?.annual_transactions ?? 0 },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b">
                  <th className="text-left py-2">Month</th>
                  <th className="text-right py-2">GMV</th>
                  <th className="text-right py-2">Platform Fee</th>
                  <th className="text-right py-2">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.monthly ?? []).map((row: any) => (
                  <tr key={row.month} className="border-b last:border-0">
                    <td className="py-2 text-gray-600">{row.month}</td>
                    <td className="py-2 text-right font-medium">${row.gmv.toLocaleString()}</td>
                    <td className="py-2 text-right text-green-600">
                      ${row.platform_fee.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-gray-500">{row.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
