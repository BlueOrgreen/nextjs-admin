"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UpdateProductDto } from "@/lib/api/productApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateProductMutation } from "../_hooks/use-product-mutations";
import {
  getProductStatusSelectTriggerClassName,
  PRODUCT_STATUS_OPTIONS,
} from "../_lib/product-status";
import type { ProductViewModel } from "../_lib/products-list.types";

type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductViewModel | null;
};

const EMPTY_EDIT_FORM: UpdateProductDto = {};

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const [form, setForm] = useState<UpdateProductDto>(EMPTY_EDIT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const updateProduct = useUpdateProductMutation();

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_EDIT_FORM);
      setFormError(null);
      return;
    }
    if (product) {
      setForm({
        name: product.name,
        status: product.status,
        description: product.description ?? "",
        price: Number(product.price),
        stock: product.stock,
      });
    }
  }, [open, product]);

  const statusValue = form.status ?? product?.status ?? "active";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!product) return;
    if (form.price !== undefined && form.price <= 0) {
      setFormError("价格必须大于 0");
      return;
    }
    if (form.stock !== undefined && form.stock < 0) {
      setFormError("库存不能为负数");
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        data: {
          name: form.name?.trim(),
          price: form.price,
          stock: form.stock,
          status: form.status,
          description: form.description?.trim() || null,
        },
      });
      toast.success("商品修改成功");
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "修改失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>编辑商品</DialogTitle>
          <DialogDescription>修改商品信息后保存。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">商品 ID：</span>
              <span className="font-mono">{product?.id}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-name">商品名称</Label>
              <Input
                id="edit-product-name"
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-status">状态</Label>
                <Select
                  modal={false}
                  value={statusValue}
                  items={[...PRODUCT_STATUS_OPTIONS]}
                  onValueChange={(status) =>
                    setForm((f) => ({
                      ...f,
                      status: (status ?? "active") as UpdateProductDto["status"],
                    }))
                  }
                >
                  <SelectTrigger
                    id="edit-product-status"
                    className={getProductStatusSelectTriggerClassName(statusValue)}
                  >
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-product-price">价格</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  min={0}
                  // step={1}
                  value={form.price ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-stock">库存</Label>
              <Input
                id="edit-product-stock"
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-description">描述</Label>
              <Textarea
                id="edit-product-description"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={updateProduct.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {updateProduct.isPending ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
