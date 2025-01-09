import { Composer } from 'telegraf';
import { menuItems } from '../data/menu';
import { BotContext } from '../types/context';
import { OrderItem } from '../types/order';

export const cartCommand = new Composer<BotContext>();

cartCommand.command('cart', async (ctx) => {
    if (!ctx.session?.cart || ctx.session.cart.length === 0) {
        await ctx.reply('Your cart is empty. Use /menu to browse our items!');
        return;
    }

    const cartMessage = formatCartMessage(ctx.session.cart);
    const keyboard = getCartKeyboard();

    await ctx.reply(cartMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

function formatCartMessage(cart: OrderItem[]): string {
    let total = 0;
    const items = cart.map(item => {
        const menuItem = menuItems.find(i => i.id === item.menuItemId);
        if (!menuItem) return '';
        
        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;
        
        return `
${menuItem.name} x${item.quantity}
Price: $${menuItem.price} × ${item.quantity} = $${itemTotal.toFixed(2)}`;
    });

    return `
🛒 Your Cart:
${items.join('\n')}

Total: $${total.toFixed(2)}

Use /checkout to place your order!`;
}

function getCartKeyboard() {
    return [
        [
            { text: 'Clear Cart', callback_data: 'cart:clear' },
            { text: 'Checkout', callback_data: 'cart:checkout' }
        ]
    ];
}

