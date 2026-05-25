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
import type { CreateProductDto } from "@/lib/api/productApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateProductMutation } from "../_hooks/use-product-mutations";
import {
  getProductStatusSelectTriggerClassName,
  PRODUCT_STATUS_OPTIONS,
} from "../_lib/product-status";

type CreateProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: CreateProductDto = {
  name: "",
  price: 0,
  stock: 0,
  status: "active",
  description: "",
};

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const createProduct = useCreateProductMutation();

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("请填写商品名称");
      return;
    }
    if (form.price <= 0) {
      setFormError("价格必须大于 0");
      return;
    }
    if (form.stock < 0) {
      setFormError("库存不能为负数");
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: form.name.trim(),
        price: form.price,
        stock: form.stock,
        status: form.status ?? "active",
        description: form.description?.trim() || null,
      });
      toast.success("商品创建成功");
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "创建失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>新建商品</DialogTitle>
          <DialogDescription>填写商品信息后提交创建。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">商品名称 *</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="输入商品名称"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product-status">状态</Label>
                <Select
                  modal={false}
                  value={form.status ?? "active"}
                  items={[...PRODUCT_STATUS_OPTIONS]}
                  onValueChange={(status) =>
                    setForm((f) => ({ ...f, status: status ?? "active" }))
                  }
                >
                  <SelectTrigger
                    id="product-status"
                    className={getProductStatusSelectTriggerClassName(
                      form.status ?? "active",
                    )}
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
                <Label htmlFor="product-price">价格 *</Label>
                <Input
                  id="product-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-stock">库存 *</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-description">描述</Label>
              <Textarea
                id="product-description"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="可选"
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
              disabled={createProduct.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createProduct.isPending ? "创建中..." : "创建商品"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
