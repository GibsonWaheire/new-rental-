
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";

export const PropertyOverview = () => {
  const properties = [
    {
      id: 1,
      name: "Royal Court Apartments",
      location: "Ruiru, Kiambu County",
      totalUnits: 12,
      occupiedUnits: 10,
      monthlyRevenue: "KES 1,200,000",
      status: "Active"
    },
    {
      id: 2,
      name: "Green Valley Estate",
      location: "Thika, Kiambu County", 
      totalUnits: 24,
      occupiedUnits: 22,
      monthlyRevenue: "KES 2,400,000",
      status: "Active"
    },
    {
      id: 3,
      name: "Sunrise Apartments",
      location: "Kasarani, Nairobi",
      totalUnits: 8,
      occupiedUnits: 6,
      monthlyRevenue: "KES 480,000",
      status: "Active"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Properties Overview</CardTitle>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{property.name}</h4>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {property.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Occupancy</p>
                  <p className="font-semibold">{property.occupiedUnits}/{property.totalUnits} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Rate</p>
                  <p className="font-semibold">{Math.round((property.occupiedUnits / property.totalUnits) * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Revenue</p>
                  <p className="font-semibold text-green-600">{property.monthlyRevenue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
