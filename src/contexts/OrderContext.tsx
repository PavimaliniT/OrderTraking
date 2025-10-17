import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { useFirebase } from './FirebaseContext';
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored, (key, value) => {
      if (key === 'orderDate' || key === 'expectedDeliveryDate') {
        return new Date(value);
      }
      return value;
    }) : [];
  });

  const firebaseCtx = (() => {
    try {
      return useFirebase();
    } catch {
      return null;
    }
  })();

  // Sync local changes to localStorage and to Firestore when available
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));

    if (!firebaseCtx) return;
    const sync = async () => {
      try {
        // Write each order as a document under collection 'orders' with id = orderId
        for (const o of orders) {
          await setDoc(doc(firebaseCtx.db, 'orders', o.orderId), o);
        }
      } catch (err) {
        // ignore sync errors; localStorage remains the source of truth offline
        console.error('Failed to sync orders to Firestore', err);
      }
    };
    sync();
  }, [orders, firebaseCtx]);

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
    // attempt to persist immediately to Firestore
    (async () => {
      if (!firebaseCtx) return;
      try {
        await setDoc(doc(firebaseCtx.db, 'orders', order.orderId), order);
      } catch (err) {
        console.error('Failed to add order to Firestore', err);
      }
    })();
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.orderId === orderId ? { ...order, ...updates } : order
    ));
    if (!firebaseCtx) return;
    (async () => {
      try {
        const existing = (orders.find(o => o.orderId === orderId) || {}) as any;
        const merged = { ...existing, ...updates };
        await setDoc(doc(firebaseCtx.db, 'orders', orderId), merged);
      } catch (err) {
        console.error('Failed to update order in Firestore', err);
      }
    })();
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.orderId !== orderId));
    if (!firebaseCtx) return;
    (async () => {
      try {
        await deleteDoc(doc(firebaseCtx.db, 'orders', orderId));
      } catch (err) {
        console.error('Failed to delete order from Firestore', err);
      }
    })();
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.orderId === orderId);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
