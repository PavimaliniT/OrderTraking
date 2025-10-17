import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useOrders } from '@/contexts/OrderContext';
import { useVillage } from '@/contexts/VillageContext';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  villageName: z.string().min(1, 'Village name is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  landmark: z.string().min(1, 'Landmark is required'),
  deliveryPriority: z.enum(['Normal', 'Urgent']),
  expectedDeliveryDate: z.date(),
  deliveryNotes: z.string().optional(),
});

const AddOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { activeVillage } = useVillage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      villageName: activeVillage || '',
      customerName: '',
      productName: '',
      quantity: 1,
      price: 0,
      landmark: '',
      deliveryPriority: 'Normal',
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryNotes: '',
    },
  });

  // Update village field when active village changes
  useEffect(() => {
    if (activeVillage) {
      form.setValue('villageName', activeVillage);
    }
  }, [activeVillage, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const newOrder = {
        orderId: `ORD-${Date.now()}`,
        orderDate: new Date(),
        villageName: values.villageName,
        customerName: values.customerName,
        productName: values.productName,
        quantity: values.quantity,
        price: values.price,
        landmark: values.landmark,
        deliveryPriority: values.deliveryPriority,
        expectedDeliveryDate: values.expectedDeliveryDate,
        deliveryNotes: values.deliveryNotes,
        deliveryStatus: 'Pending' as const,
      };
      
      addOrder(newOrder);
      toast.success('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Order</h1>
          <p className="text-muted-foreground mt-1">Fill in the order details below</p>
        </div>

        <div className="bg-card rounded-lg shadow-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="villageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter village name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landmark</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nearby landmark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="deliveryPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "EEE, PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deliveryNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions or notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Order'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default AddOrder;
