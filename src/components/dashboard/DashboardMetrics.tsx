
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DashboardMetrics = () => {
  const metrics = [
    {
      title: "Total Properties",
      value: "5",
      change: "+1 this month",
      changeType: "positive" as const,
      icon: "🏢"
    },
    {
      title: "Occupancy Rate",
      value: "87.5%",
      change: "+2.1% from last month",
      changeType: "positive" as const,
      icon: "📊"
    },
    {
      title: "Monthly Revenue",
      value: "KES 2,847,500",
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: "💰"
    },
    {
      title: "Outstanding Rent",
      value: "KES 425,000",
      change: "-8.2% from last month",
      changeType: "negative" as const,
      icon: "⚠️"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <span className="text-2xl">{metric.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <Badge 
              variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {metric.change}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
