"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

/**
 * 7-day revenue line chart.
 * @param {{data: Array<{date:string, revenue:number}>}} props
 */
export function RevenueChart({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={70}
                tickFormatter={(v) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                }
              />
              <Tooltip
                formatter={(value) => [formatRupiah(value), "Pendapatan"]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.8rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#2563EB" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
