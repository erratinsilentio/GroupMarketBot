import { Composer } from 'telegraf';
import { config } from '../config/config';

export const startCommand = new Composer();

startCommand.command('start', async (ctx) => {
    const welcomeMessage = `
Welcome to ${config.SHOP_NAME}! 👋

Available commands:
/menu - Browse our menu
/rules - View shop rules
/payment - Payment options
/cart - View your cart
/order - Place an order

Need help? Use /help command!
    `;
    
    await ctx.reply(welcomeMessage);
});