import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetCustomersQuery,
  useGetProductsQuery,
} from "@/features/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatCurrency, formatDate, getApiError } from "@/lib/utils";

const orderSchema = z.object({
  customer_id: z.string().min(1, "Please select a customer"),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Select a product"),
        quantity: z.coerce
          .number({ invalid_type_error: "Qty required" })
          .int("Whole number")
          .min(1, "Qty ≥ 1"),
      })
    )
    .min(1, "Add at least one item"),
});

const DEFAULTS = {
  customer_id: "",
  items: [{ product_id: "", quantity: 1 }],
};

function CreateOrderDialog({ open, onOpenChange }) {
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: DEFAULTS,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) form.reset(DEFAULTS);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [String(p.id), p])),
    [products]
  );

  // Live total recomputed from watched item rows.
  const watchedItems = form.watch("items");
  const total = useMemo(() => {
    return (watchedItems || []).reduce((sum, l) => {
      const p = productById[String(l.product_id)];
      if (!p) return sum;
      return sum + Number(p.price) * Number(l.quantity || 0);
    }, 0);
  }, [watchedItems, productById]);

  async function onSubmit(values) {
    // Client-side stock pre-check (backend remains the source of truth).
    for (const l of values.items) {
      const p = productById[String(l.product_id)];
      if (p && l.quantity > p.quantity) {
        toast.error(`Insufficient stock for ${p.name} (available ${p.quantity})`);
        return;
      }
    }
    const items = values.items.map((l) => ({
      product_id: Number(l.product_id),
      quantity: Number(l.quantity),
    }));
    try {
      await createOrder({ customer_id: Number(values.customer_id), items }).unwrap();
      toast.success("Order created");
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiError(err, "Could not create order"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.full_name} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Items</FormLabel>
              <div className="space-y-3">
                {fields.map((row, index) => (
                  <div key={row.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((prod) => (
                                <SelectItem
                                  key={prod.id}
                                  value={String(prod.id)}
                                  disabled={prod.quantity === 0}
                                >
                                  {prod.name} — {formatCurrency(prod.price)} ({prod.quantity} in stock)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product_id: "", quantity: 1 })}
              >
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted px-4 py-3">
              <span className="text-sm font-medium">Total (calculated)</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Placing…" : "Place Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailsDialog({ order, onOpenChange }) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(v) => !v && onOpenChange(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order?.id}</DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="success">{order.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-bold">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.product_name}</TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(it.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(it.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Orders() {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
  const [deleteOrder, { isLoading: deleting }] = useDeleteOrderMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  async function confirmDelete() {
    try {
      await deleteOrder(toDelete.id).unwrap();
      toast.success("Order cancelled — stock restored");
      setToDelete(null);
    } catch (err) {
      toast.error(getApiError(err, "Could not cancel order"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Create and track customer orders.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Create Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">Failed to load orders.</p>
          ) : orders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No orders yet. Click “Create Order” to place one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">#{o.id}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{o.items?.length ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(o.total_amount)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(o.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewing(o)} aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(o)} aria-label="Cancel order">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
      <OrderDetailsDialog order={viewing} onOpenChange={setViewing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Cancel this order?"
        description={toDelete ? `Order #${toDelete.id} will be cancelled and its stock restored.` : ""}
        confirmLabel="Cancel order"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
