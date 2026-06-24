import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/features/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatCurrency, getApiError } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  price: z.coerce
    .number({ invalid_type_error: "Price is required" })
    .min(0, "Price must be 0 or more"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity is required" })
    .int("Must be a whole number")
    .min(0, "Quantity must be 0 or more"),
  description: z.string().optional(),
});

const DEFAULTS = { name: "", sku: "", price: "", quantity: "", description: "" };

function ProductDialog({ open, onOpenChange, product }) {
  const isEdit = Boolean(product);
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const saving = creating || updating;

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULTS,
  });

  // Reset the form whenever the dialog opens for a product (or for "add").
  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name ?? "",
              sku: product.sku ?? "",
              price: String(product.price ?? ""),
              quantity: String(product.quantity ?? ""),
              description: product.description ?? "",
            }
          : DEFAULTS
      );
    }
  }, [open, product]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values) {
    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      description: values.description?.trim() || null,
      price: values.price,
      quantity: values.quantity,
    };
    try {
      if (isEdit) {
        await updateProduct({ id: product.id, ...payload }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiError(err, "Could not save product"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Wireless Mouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU / Code</FormLabel>
                  <FormControl>
                    <Input placeholder="WM-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Products() {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteProduct(toDelete.id).unwrap();
      toast.success("Product deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getApiError(err, "Could not delete product"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">Failed to load products.</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No products yet. Click “Add Product” to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.name}
                      {/* SKU shown inline on mobile since its column is hidden */}
                      <span className="block text-xs text-muted-foreground md:hidden">{p.sku}</span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{p.sku}</TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.quantity === 0 ? "destructive" : p.quantity <= 10 ? "warning" : "secondary"}>
                        {p.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(p)} aria-label="Delete">
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

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete product?"
        description={toDelete ? `“${toDelete.name}” will be permanently removed.` : ""}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
