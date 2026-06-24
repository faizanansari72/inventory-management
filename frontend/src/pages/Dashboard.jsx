import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react";

import { useGetDashboardQuery } from "@/features/api/apiSlice";
import StatCard from "@/components/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory and orders.
        </p>
      </div>

      {isError && (
        <Card>
          <CardContent className="py-6 text-center text-destructive">
            Could not reach the backend API. Check that it is running and that
            the API URL is configured correctly.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={isLoading ? "…" : data?.total_products ?? 0}
          icon={Package}
        />
        <StatCard
          title="Total Customers"
          value={isLoading ? "…" : data?.total_customers ?? 0}
          icon={Users}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={isLoading ? "…" : data?.total_orders ?? 0}
          icon={ShoppingCart}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Low Stock"
          value={isLoading ? "…" : data?.low_stock_count ?? 0}
          icon={AlertTriangle}
          accent="bg-amber-500/10 text-amber-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>
            Products at or below {data?.low_stock_threshold ?? 10} units in stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : data?.low_stock_products?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">In Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.low_stock_products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{p.sku}</TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.quantity === 0 ? "destructive" : "warning"}>
                        {p.quantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              All products are well stocked. 🎉
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
