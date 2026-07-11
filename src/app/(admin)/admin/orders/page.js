import { AdminOrdersTable } from "@/components/dashboard/AdminOrdersTable";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Order</h1>
        <p className="text-sm text-slate-500">Pantau dan perbarui status pesanan.</p>
      </div>
      <AdminOrdersTable />
    </div>
  );
}
