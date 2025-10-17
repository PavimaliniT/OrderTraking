export type DeliveryStatus = 'Pending' | 'Delivered';
export type DeliveryPriority = 'Normal' | 'Urgent';

export interface Order {
  orderId: string;
  orderDate: Date;
  villageName: string;
  customerName: string;
  productName: string;
  quantity: number;
  price: number;
  landmark: string;
  expectedDeliveryDate: Date;
  deliveryStatus: DeliveryStatus;
  deliveryPriority: DeliveryPriority;
  deliveryNotes?: string;
}
