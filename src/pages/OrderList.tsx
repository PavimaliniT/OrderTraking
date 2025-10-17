import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useOrders } from '@/contexts/OrderContext';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';

const OrderList = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.deliveryStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const dateKey = format(order.orderDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][order.villageName]) {
      acc[dateKey][order.villageName] = [];
    }
    acc[dateKey][order.villageName].push(order);
    return acc;
  }, {} as Record<string, Record<string, typeof orders>>);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your orders
            </p>
          </div>
          <Button 
            className="bg-gradient-primary"
            onClick={() => navigate('/add-order')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by customer, village, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {Object.keys(groupedOrders).length === 0 ? (
          <div className="bg-card rounded-lg shadow-card p-12 text-center">
            <p className="text-muted-foreground text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).sort(([a], [b]) => b.localeCompare(a)).map(([date, villages]) => (
              <div key={date} className="bg-card rounded-lg shadow-card overflow-hidden">
                <div className="bg-primary text-primary-foreground px-6 py-3">
                  <h2 className="text-lg font-semibold">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {Object.entries(villages).map(([village, villageOrders]) => (
                    <div key={village}>
                      <h3 className="text-md font-semibold text-primary mb-3">{village}</h3>
                      <div className="space-y-2">
                        {villageOrders.map((order) => (
                          <div
                            key={order.orderId}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.productName} × {order.quantity}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-medium">₹{(order.price * order.quantity).toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                Due: {format(order.expectedDeliveryDate, 'MMM d')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.deliveryStatus === 'Delivered'
                                ? 'bg-success/20 text-success'
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {order.deliveryStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderList;
