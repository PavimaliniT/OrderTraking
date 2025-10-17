import { useNavigate } from 'react-router-dom';
import { format, isBefore, startOfDay } from 'date-fns';
import { useOrders } from '@/contexts/OrderContext';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DeliveryList = () => {
  const { orders, updateOrder } = useOrders();
  const navigate = useNavigate();

  const pendingOrders = orders
    .filter(order => order.deliveryStatus === 'Pending')
    .sort((a, b) => a.expectedDeliveryDate.getTime() - b.expectedDeliveryDate.getTime());

  const today = startOfDay(new Date());
  const overdueOrders = pendingOrders.filter(order => 
    isBefore(startOfDay(order.expectedDeliveryDate), today)
  );
  const upcomingOrders = pendingOrders.filter(order => 
    !isBefore(startOfDay(order.expectedDeliveryDate), today)
  );

  const handleMarkDelivered = (orderId: string, customerName: string) => {
    updateOrder(orderId, { deliveryStatus: 'Delivered' });
    toast.success(`${customerName}'s order marked as delivered!`);
  };

  const OrderCard = ({ order, isOverdue }: { order: typeof orders[0], isOverdue?: boolean }) => (
    <div className="bg-card border rounded-lg p-6 shadow-card hover:shadow-hover transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{order.customerName}</h3>
          <p className="text-sm text-muted-foreground">{order.productName} × {order.quantity}</p>
        </div>
        {isOverdue && (
          <AlertCircle className="h-5 w-5 text-destructive" />
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>{order.villageName} - {order.landmark}</span>
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {format(order.expectedDeliveryDate, 'PPP')}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-lg font-bold text-success">
          ₹{(order.price * order.quantity).toLocaleString()}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/orders/${order.orderId}`)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="bg-gradient-success"
            onClick={() => handleMarkDelivered(order.orderId, order.customerName)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Delivered
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pending Deliveries</h1>
          <p className="text-muted-foreground mt-1">
            {pendingOrders.length} deliveries awaiting completion
          </p>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-card rounded-lg shadow-card p-12 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">All deliveries completed!</p>
            <p className="text-muted-foreground">There are no pending deliveries at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {overdueOrders.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                  <h2 className="text-xl font-semibold text-destructive">
                    Overdue ({overdueOrders.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {overdueOrders.map(order => (
                    <OrderCard key={order.orderId} order={order} isOverdue />
                  ))}
                </div>
              </div>
            )}

            {upcomingOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Upcoming ({upcomingOrders.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingOrders.map(order => (
                    <OrderCard key={order.orderId} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryList;
