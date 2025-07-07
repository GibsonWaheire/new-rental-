
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const PaymentOverview = () => {
  const payments = [
    {
      id: 1,
      tenant: "Mary Wanjiku",
      amount: "KES 45,000",
      method: "M-Pesa",
      date: "2024-01-05",
      status: "Completed",
      reference: "MPX123456789"
    },
    {
      id: 2,
      tenant: "Grace Achieng",
      amount: "KES 38,000",
      method: "Bank Transfer",
      date: "2024-01-03",
      status: "Completed",
      reference: "BT987654321"
    },
    {
      id: 3,
      tenant: "James Kiprotich",
      amount: "KES 55,000",
      method: "Cash",
      date: "2023-12-28",
      status: "Overdue",
      reference: "CASH001"
    }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'M-Pesa':
        return '📱';
      case 'Bank Transfer':
        return '🏦';
      case 'Cash':
        return '💵';
      default:
        return '💳';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
        <Button size="sm" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{payment.tenant}</h4>
                  <p className="text-sm text-gray-600">Ref: {payment.reference}</p>
                </div>
                <Badge className={getStatusBadgeColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600">{payment.amount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Method</p>
                  <p className="font-semibold flex items-center">
                    <span className="mr-1">{getMethodIcon(payment.method)}</span>
                    {payment.method}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
