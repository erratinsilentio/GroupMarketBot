interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Session {
  cart: OrderItem[];
  orderState?: "awaiting_address" | "awaiting_payment";
  deliveryAddress?: string;
  currentView?: "menu" | "orders" | "payment" | "rules";
} 