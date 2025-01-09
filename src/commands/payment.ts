import { Composer } from 'telegraf';
import { paymentOptions } from '../data/payments';

export const paymentCommand = new Composer();

paymentCommand.command('payment', async (ctx) => {
    await ctx.reply(paymentOptions);
});