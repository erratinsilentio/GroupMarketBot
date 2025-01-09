require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// Initialize bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command with inline keyboard
bot.command('start', (ctx) => {
    ctx.reply(
        'Welcome to the Shop Bot! Choose an option:',
        Markup.inlineKeyboard([
            Markup.button.callback('View Products', 'view_products'),
            Markup.button.callback('View Cart', 'view_cart'),
            Markup.button.callback('Help', 'help')
        ])
    );
});

// Handle button actions
bot.action('view_products', (ctx) => {
    ctx.reply('Here are our products...');
    // Add logic to display products
});

bot.action('view_cart', (ctx) => {
    ctx.reply('Your cart is empty.');
    // Add logic to display cart contents
});

bot.action('help', (ctx) => {
    ctx.reply('How can we assist you?');
    // Add logic for help or support
});

// Basic error handling
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Create an Express server
const app = express();

// Set the bot to use webhooks
app.use(bot.webhookCallback('/api/webhook'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Set webhook URL
bot.telegram.setWebhook(`https://your-vercel-deployment-url.vercel.app/api/webhook`);
