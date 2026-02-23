'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#1a1a1a', '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const now = new Date();
  const [from, setFrom] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
  );
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState('day');

  const setRange = (range: string) => {
    const today = new Date();
    if (range === 'this_month') {
      setFrom(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`);
      setTo(today.toISOString().slice(0, 10));
    } else if (range === 'last_month') {
      const last = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      setFrom(last.toISOString().slice(0, 10));
      setTo(lastEnd.toISOString().slice(0, 10));
    } else if (range === 'last_7') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      setFrom(d.toISOString().slice(0, 10));
      setTo(today.toISOString().slice(0, 10));
    } else if (range === 'last_30') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      setFrom(d.toISOString().slice(0, 10));
      setTo(today.toISOString().slice(0, 10));
    } else if (range === 'ytd') {
      setFrom(`${today.getFullYear()}-01-01`);
      setTo(today.toISOString().slice(0, 10));
    }
  };

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-report', from, to, groupBy],
    queryFn: async () => {
      const res = await api.get('/bookings/reports/revenue', {
        params: { from, to, group_by: groupBy },
      });
      return res.data;
    },
  });

  const { data: driverData, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-report', from, to],
    queryFn: async () => {
      const res = await api.get('/bookings/reports/drivers', { params: { from, to } });
      return res.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['report-summary', from, to],
    queryFn: async () => {
      const res = await api.get('/bookings/reports/summary', { params: { from, to } });
      return res.data;
    },
  });

  const currency = revenueData?.currency ?? 'AUD';

  const StatCard = ({
    label,
    value,
    sub,
  }: {
    label: string;
    value: string | number;
    sub?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revenue, bookings and driver performance</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'last_7', label: 'Last 7 days' },
              { key: 'last_30', label: 'Last 30 days' },
              { key: 'this_month', label: 'This month' },
              { key: 'last_month', label: 'Last month' },
              { key: 'ytd', label: 'Year to date' },
            ].map((r) => (
              <Button key={r.key} size="sm" variant="outline" onClick={() => setRange(r.key)}>
                {r.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Group by</Label>
              <div className="flex gap-1">
                {['day', 'week', 'month'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupBy(g)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      groupBy === g
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Bookings" value={summary?.total_bookings ?? 0} />
        <StatCard
          label="Total Revenue"
          value={`${currency} $${(summary?.total_revenue ?? 0).toFixed(2)}`}
        />
        <StatCard
          label="Completion Rate"
          value={`${summary?.completion_rate ?? 0}%`}
          sub={`${summary?.completed ?? 0} completed`}
        />
        <StatCard
          label="Cancellation Rate"
          value={`${summary?.cancellation_rate ?? 0}%`}
          sub={`${summary?.cancelled ?? 0} cancelled`}
        />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={revenueData?.timeline ?? []}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-gray-400 uppercase">
                      <th className="text-left py-2">Period</th>
                      <th className="text-right py-2">Bookings</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">Avg Fare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(revenueData?.timeline ?? []).map((row: any) => (
                      <tr key={row.date}>
                        <td className="py-2 font-mono text-xs">{row.date}</td>
                        <td className="py-2 text-right">{row.bookings}</td>
                        <td className="py-2 text-right font-medium">
                          {currency} ${row.revenue.toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {currency} ${row.avg_fare.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right">{revenueData?.total_bookings ?? 0}</td>
                      <td className="py-2 text-right">
                        {currency} ${(revenueData?.total_revenue ?? 0).toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bookings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={revenueData?.timeline ?? []}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Completed"
              value={summary?.completed ?? 0}
              sub={`${summary?.completion_rate ?? 0}%`}
            />
            <StatCard
              label="Cancelled"
              value={summary?.cancelled ?? 0}
              sub={`${summary?.cancellation_rate ?? 0}%`}
            />
            <StatCard label="Pending" value={summary?.pending ?? 0} sub="Awaiting confirmation" />
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Driver Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {driverLoading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
              ) : (driverData?.drivers ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No completed jobs in this period
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={(driverData?.drivers ?? []).slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="driver_name"
                        tick={{ fontSize: 11 }}
                        width={55}
                      />
                      <Tooltip formatter={(v: any) => [`${v} jobs`, 'Jobs']} />
                      <Bar dataKey="total_jobs" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-gray-400 uppercase">
                          <th className="text-left py-2">Driver</th>
                          <th className="text-right py-2">Jobs</th>
                          <th className="text-right py-2">Earnings</th>
                          <th className="text-right py-2">Avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(driverData?.drivers ?? []).map((d: any) => (
                          <tr key={d.driver_id}>
                            <td className="py-2 font-medium">{d.driver_name}</td>
                            <td className="py-2 text-right">{d.total_jobs}</td>
                            <td className="py-2 text-right">
                              {currency} ${d.total_earnings.toFixed(2)}
                            </td>
                            <td className="py-2 text-right text-gray-500">
                              {currency} ${d.avg_earnings.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Vehicle Class</CardTitle>
              </CardHeader>
              <CardContent>
                {(revenueData?.by_vehicle_class ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={revenueData?.by_vehicle_class ?? []}
                          dataKey="bookings"
                          nameKey="vehicle_class"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ vehicle_class }: any) => vehicle_class}
                        >
                          {(revenueData?.by_vehicle_class ?? []).map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {(revenueData?.by_vehicle_class ?? []).map((vc: any, i: number) => (
                        <div key={vc.vehicle_class} className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span>{vc.vehicle_class}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{vc.bookings} jobs</span>
                            <span className="text-gray-400 ml-2">${vc.revenue.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                {(revenueData?.by_service_type ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={revenueData?.by_service_type ?? []}
                          dataKey="count"
                          nameKey="service_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ service_type }: any) =>
                            service_type.replace('_', ' ').slice(0, 8)
                          }
                        >
                          {(revenueData?.by_service_type ?? []).map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {(revenueData?.by_service_type ?? []).map((st: any, i: number) => (
                        <div key={st.service_type} className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span>{st.service_type.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="font-medium">{st.count} bookings</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
