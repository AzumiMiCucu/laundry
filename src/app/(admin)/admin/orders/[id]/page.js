import { AdminOrderDetail } from "@/components/dashboard/AdminOrderDetail";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  return <AdminOrderDetail orderId={id} />;
}
