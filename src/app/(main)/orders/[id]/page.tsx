import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { OrderDetailView } from "./_components/order-detail-view";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `订单 ${id}`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="订单详情" />
      <OrderDetailView orderId={id} />
    </div>
  );
}
