
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

export const TenantOverview = () => {
  const tenants = [
    {
      id: 1,
      name: "Mary Wanjiku",
      unit: "Royal Court - Unit 3A",
      phone: "+254 712 345 678",
      leaseEnd: "2024-12-31",
      rentAmount: "KES 45,000",
      status: "Active",
      paymentStatus: "Paid"
    },
    {
      id: 2,
      name: "James Kiprotich",
      unit: "Green Valley - Unit 12B",
      phone: "+254 722 987 654",
      leaseEnd: "2025-03-15",
      rentAmount: "KES 55,000",
      status: "Active",
      paymentStatus: "Overdue"
    },
    {
      id: 3,
      name: "Grace Achieng",
      unit: "Sunrise - Unit 2C",
      phone: "+254 733 456 789",
      leaseEnd: "2024-11-30",
      rentAmount: "KES 38,000",
      status: "Active",
      paymentStatus: "Paid"
    }
  ];

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Tenants</CardTitle>
        <Button size="sm" variant="outline">
          <User className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                  <p className="text-sm text-gray-600">{tenant.unit}</p>
                  <p className="text-sm text-gray-500">{tenant.phone}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {tenant.status}
                  </Badge>
                  <Badge className={getPaymentBadgeColor(tenant.paymentStatus)}>
                    {tenant.paymentStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Monthly Rent</p>
                  <p className="font-semibold text-green-600">{tenant.rentAmount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Lease Ends</p>
                  <p className="font-semibold">{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
