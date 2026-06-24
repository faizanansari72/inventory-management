import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`rounded-md p-2 ${accent || "bg-primary/10 text-primary"}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
