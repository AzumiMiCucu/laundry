import { OrderTrackingView } from "@/components/order/OrderTrackingView";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <OrderTrackingView orderId={id} />
    </div>
  );
}
