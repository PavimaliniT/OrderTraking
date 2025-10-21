import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { useFirebase } from './FirebaseContext';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (firebaseCtx) {
      console.debug('OrderContext: Firestore available for syncing', {
        projectId: (firebaseCtx.app as any)?.options?.projectId,
      });
    } else {
      console.debug('OrderContext: Firestore not available, operating in local mode');
    }
  }, [firebaseCtx]);

  // Sync local changes to localStorage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // When firebase becomes available, attempt to load orders from Firestore.
  // If Firestore is empty and localStorage has orders, migrate them.
  useEffect(() => {
    if (!firebaseCtx) return;

    let mounted = true;
    (async () => {
      try {
        console.debug('OrderContext: fetching orders from Firestore');
        const qSnap = await getDocs(collection(firebaseCtx.db, 'orders'));
        if (!mounted) return;

        console.debug('OrderContext: fetched', qSnap.size, 'docs from Firestore');
        if (!qSnap.empty) {
          const remote = qSnap.docs.map(d => d.data() as Order);
          setOrders(remote);
          toast.success('Loaded orders from Firestore');
          return;
        }

        // Firestore empty: try to migrate localStorage orders
        const stored = localStorage.getItem('orders');
        if (stored) {
          const local = JSON.parse(stored);
          for (const o of local) {
            try {
              console.debug('OrderContext: migrating order to Firestore', o.orderId);
              await setDoc(doc(firebaseCtx.db, 'orders', o.orderId), o);
            } catch (err) {
              console.error('Migration write failed for order', o.orderId, err);
            }
          }
          // After migration, reload from Firestore
          const after = await getDocs(collection(firebaseCtx.db, 'orders'));
          if (!mounted) return;
          const remoteAfter = after.docs.map(d => d.data() as Order);
          setOrders(remoteAfter);
          toast.success('Migrated local orders to Firestore');
        }
      } catch (err: any) {
        console.error('Failed to load orders from Firestore', err);
        toast.error('Failed to load orders from Firestore — check console');
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseCtx]);

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
