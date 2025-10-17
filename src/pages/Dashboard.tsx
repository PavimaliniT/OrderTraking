import { useOrders } from '@/contexts/OrderContext';
import { SummaryCard } from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/NavBar';
import { Package, TruckIcon, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysOrders = orders.filter(
    order => format(order.orderDate, 'yyyy-MM-dd') === today
  );
  const pendingDeliveries = orders.filter(
    order => order.deliveryStatus === 'Pending'
  );
  const totalRevenue = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <Button 
            size="lg"
            className="bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate('/add-order')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Order
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <SummaryCard
            title="Today's Orders"
            value={todaysOrders.length}
            icon={Package}
            variant="default"
            onClick={() => navigate('/orders')}
          />
          <SummaryCard
            title="Pending Deliveries"
            value={pendingDeliveries.length}
            icon={TruckIcon}
            variant="warning"
            onClick={() => navigate('/deliveries')}
          />
          <SummaryCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {orders.slice(-5).reverse().map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors"
                onClick={() => navigate(`/orders/${order.orderId}`)}
              >
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.villageName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(order.price * order.quantity).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.deliveryStatus === 'Delivered' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-warning/20 text-warning'
                  }`}>
                    {order.deliveryStatus}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                <span className="font-medium">Delivered</span>
                <span className="text-2xl font-bold text-success">
                  {orders.filter(o => o.deliveryStatus === 'Delivered').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg">
                <span className="font-medium">Pending</span>
                <span className="text-2xl font-bold text-warning">
                  {pendingDeliveries.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
