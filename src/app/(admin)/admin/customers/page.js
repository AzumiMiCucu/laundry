import { desc, eq, sql } from "drizzle-orm";
import { Users, Mail, Phone } from "lucide-react";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCustomers() {
  try {
    return await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        loyaltyPoints: schema.users.loyaltyPoints,
        createdAt: schema.users.createdAt,
        orderCount: sql`count(${schema.orders.id})`.mapWith(Number),
      })
      .from(schema.users)
      .leftJoin(schema.orders, eq(schema.orders.customerId, schema.users.id))
      .where(eq(schema.users.role, "customer"))
      .groupBy(schema.users.id)
      .orderBy(desc(schema.users.createdAt));
  } catch {
    return [];
  }
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pelanggan</h1>
        <p className="text-sm text-slate-500">Daftar seluruh pelanggan terdaftar.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Belum ada pelanggan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Poin</TableHead>
                  <TableHead>Bergabung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">
                      {c.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{c.orderCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success">{c.loyaltyPoints}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(c.createdAt, false)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
