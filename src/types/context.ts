import { Context } from 'telegraf';

export interface BotContext extends Context {
    session?: {
        cart: OrderItem[];
    }
}

interface OrderItem {
    menuItemId: string;
    quantity: number;
}