import { Composer } from 'telegraf';
import { config } from '../config/config';
import { Order, OrderItem } from '../types/order';
import { menuItems } from '../data/menuItems';
import { BotContext } from '../types/context';

// Update BotContext interface to include order state
declare module '../types/context' {
    interface BotContext {
        session: {
            cart: OrderItem[];
            orderState?: 'awaiting_address' | 'awaiting_payment';
            deliveryAddress?: string;
        }
    }
}

export const orderCommand = new Composer<BotContext>();

// Start checkout process
orderCommand.action('cart:checkout', async (ctx) => {
    if (!ctx.session?.cart || ctx.session.cart.length === 0) {
        await ctx.editMessageText('Your cart is empty!');
        return;
    }

    await ctx.reply('Please provide your delivery address:');
    ctx.session.orderState = 'awaiting_address';
});

// Handle address input
orderCommand.on('text', async (ctx) => {
    if (!ctx.session?.orderState) return;

    switch (ctx.session.orderState) {
        case 'awaiting_address':
            ctx.session.deliveryAddress = ctx.message.text;
            await ctx.reply('Please choose your payment method:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Credit Card', callback_data: 'pay:card' }],
                        [{ text: 'PayPal', callback_data: 'pay:paypal' }],
                        [{ text: 'Cash', callback_data: 'pay:cash' }]
                    ]
                }
            });
            ctx.session.orderState = 'awaiting_payment';
            break;
            
        // Add more states as needed
    }
});

// Handle payment selection
orderCommand.action(/^pay:(.+)$/, async (ctx) => {
    const paymentMethod = ctx.match[1];
    
    if (!ctx.session?.cart || !ctx.session.deliveryAddress) {
        await ctx.reply('Something went wrong. Please start over with /cart');
        return;
    }

    // Create order
    const order = createOrder(ctx, paymentMethod);
    
    // Send to channel
    await sendOrderToChannel(ctx, order);
    
    // Clear cart and state
    ctx.session.cart = [];
    ctx.session.orderState = undefined;
    ctx.session.deliveryAddress = undefined;

    await ctx.editMessageText('Thank you for your order! We will process it shortly.');
});

function createOrder(ctx: BotContext, paymentMethod: string): Order {
    if (!ctx.session?.cart || !ctx.from) {
        throw new Error('Invalid session or user data');
    }

    const total = calculateTotal(ctx.session.cart);

    return {
        userId: ctx.from.id.toString(),
        username: ctx.from.username || 'Unknown',
        items: ctx.session.cart,
        totalAmount: total,
        paymentMethod,
        deliveryAddress: ctx.session.deliveryAddress,
        timestamp: new Date()
    };
}

function calculateTotal(cart: OrderItem[]): number {
    return cart.reduce((total, item) => {
        const menuItem = menuItems.find(i => i.id === item.menuItemId);
        if (!menuItem) return total;
        return total + (menuItem.price * item.quantity);
    }, 0);
}

async function sendOrderToChannel(ctx: BotContext, order: Order) {
    const message = formatOrderMessage(order);
    
    await ctx.telegram.sendMessage(config.CHANNEL_ID, message, {
        parse_mode: 'HTML'
    });
}

function formatOrderMessage(order: Order): string {
    const items = order.items.map(item => {
        const menuItem = menuItems.find(i => i.id === item.menuItemId);
        if (!menuItem) return '';
        return `${menuItem.name} x${item.quantity} ($${menuItem.price * item.quantity})`;
    });

    return `
🆕 New Order!

Customer: @${order.username}
Order ID: #${order.timestamp.getTime().toString().slice(-6)}

Items:
${items.join('\n')}

Total Amount: $${order.totalAmount.toFixed(2)}
Payment Method: ${order.paymentMethod}

Delivery Address:
${order.deliveryAddress}

Time: ${order.timestamp.toLocaleString()}
`;
}
