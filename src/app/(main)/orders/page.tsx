import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { OrdersListView } from "./_components/orders-list-view";

export const metadata: Metadata = {
  title: "订单",
};

export default function Orders() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="订单" />
      <OrdersListView />
    </div>
  );
}
