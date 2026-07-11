import { AdminServicesManager } from "@/components/dashboard/AdminServicesManager";

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Layanan</h1>
        <p className="text-sm text-slate-500">Tambah, ubah, dan atur ketersediaan layanan.</p>
      </div>
      <AdminServicesManager />
    </div>
  );
}
