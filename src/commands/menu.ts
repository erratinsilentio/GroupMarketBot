import { Composer } from 'telegraf';
import { menuItems } from '../data/menu';

export const menuCommand = new Composer();

menuCommand.command('menu', async (ctx) => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    const keyboard = categories.map(category => [{
        text: category,
        callback_data: `category:${category}`
    }]);
    
    await ctx.reply('Choose a category:', {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

menuCommand.action(/^category:(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    const items = menuItems.filter(item => item.category === category);
    
    const message = items.map(item => `
${item.name} - $${item.price}
${item.description}
/add_${item.id} to cart
    `).join('\n');
    
    await ctx.editMessageText(message, {
        reply_markup: {
            inline_keyboard: [[{
                text: '← Back to categories',
                callback_data: 'menu:main'
            }]]
        }
    });
});