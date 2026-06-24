import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
} from "@/features/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getApiError } from "@/lib/utils";

const customerSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
});

const DEFAULTS = { full_name: "", email: "", phone: "" };

function CustomerDialog({ open, onOpenChange }) {
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) form.reset(DEFAULTS);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values) {
    try {
      await createCustomer({
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
      }).unwrap();
      toast.success("Customer created");
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiError(err, "Could not create customer"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alice Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="alice@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="555-0101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const { data: customers = [], isLoading, isError } = useGetCustomersQuery();
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  async function confirmDelete() {
    try {
      await deleteCustomer(toDelete.id).unwrap();
      toast.success("Customer deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getApiError(err, "Could not delete customer"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">Failed to load customers.</p>
          ) : customers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No customers yet. Click “Add Customer” to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> <span className="break-all">{c.email}</span>
                      </span>
                      {/* Phone shown inline on mobile since its column is hidden */}
                      {c.phone && (
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.phone ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" /> {c.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(c)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete customer?"
        description={toDelete ? `“${toDelete.full_name}” will be permanently removed.` : ""}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
