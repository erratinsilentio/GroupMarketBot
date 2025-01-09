require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// Initialize bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command with inline keyboard
bot.command('start', (ctx) => {
    ctx.session.currentView = 'menu';
    ctx.reply(
        'Welcome to the Shop Bot! Choose an option:',
        Markup.inlineKeyboard([
            Markup.button.callback('Menu', 'menu'),
            Markup.button.callback('Orders', 'orders'),
            Markup.button.callback('Payment', 'payment'),
            Markup.button.callback('Rules', 'rules')
        ])
    );
});

// Handle button actions
bot.action('menu', (ctx) => {
    ctx.session.currentView = 'menu';
    ctx.reply('Here is our menu...');
    // Add logic to display menu items
});

bot.action('orders', (ctx) => {
    ctx.session.currentView = 'orders';
    ctx.reply('Here are your current orders...');
    // Add logic to display current orders
});

bot.action('payment', (ctx) => {
    ctx.session.currentView = 'payment';
    ctx.reply('Payment options...');
    // Add logic to handle payment
});

bot.action('rules', (ctx) => {
    ctx.session.currentView = 'rules';
    ctx.reply('Here are the rules...');
    // Add logic to display rules
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