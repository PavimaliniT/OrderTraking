import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useOrders } from '@/contexts/OrderContext';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, deleteOrder } = useOrders();
  
  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkDelivered = () => {
    updateOrder(order.orderId, { deliveryStatus: 'Delivered' });
    toast.success('Order marked as delivered!');
  };

  const handleDelete = () => {
    deleteOrder(order.orderId);
    toast.success('Order deleted successfully');
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="bg-card rounded-lg shadow-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.customerName}</h1>
              <p className="text-muted-foreground">Order #{order.orderId}</p>
            </div>
            <Badge className={
              order.deliveryStatus === 'Delivered'
                ? 'bg-success text-success-foreground'
                : 'bg-warning text-warning-foreground'
            }>
              {order.deliveryStatus}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{order.villageName}</p>
                  <p className="text-sm text-muted-foreground">{order.landmark}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{format(order.orderDate, 'EEE, PPP')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">{format(order.expectedDeliveryDate, 'EEE, PPP')}</p>
                  <Badge variant={order.deliveryPriority === 'Urgent' ? 'destructive' : 'secondary'} className="mt-1">
                    {order.deliveryPriority}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-success">
                    ₹{(order.price * order.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.deliveryNotes && (
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Delivery Notes</p>
              <p>{order.deliveryNotes}</p>
            </div>
          )}

          <div className="flex gap-4">
            {order.deliveryStatus === 'Pending' && (
              <Button
                className="flex-1 bg-gradient-success"
                onClick={handleMarkDelivered}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Delivered
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the order.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
