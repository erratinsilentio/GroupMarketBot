export interface OrderItem {
    menuItemId: string;
    quantity: number;
}

export interface Order {
    userId: string;
    username: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod?: string;
    contactInfo?: string;
    deliveryAddress?: string;
    timestamp: Date;
}