import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ProductsListView } from "./_components/products-list-view";

export const metadata: Metadata = {
  title: "商品",
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="商品" />
      <ProductsListView />
    </div>
  );
}
