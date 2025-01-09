import { Composer } from 'telegraf';
import { rules } from '../data/rules';

export const rulesCommand = new Composer();

rulesCommand.command('rules', async (ctx) => {
    await ctx.reply(rules);
});