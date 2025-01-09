import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// Start command with inline keyboard
bot.command("start", (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Menu", "menu")
    .text("Orders", "orders")
    .row()
    .text("Payment", "payment")
    .text("Rules", "rules");

  ctx.reply("Welcome to the Shop Bot! Choose an option:", {
    reply_markup: keyboard,
  });
});

// Handle button actions
bot.callbackQuery("menu", (ctx) => ctx.reply("Here is our menu..."));
bot.callbackQuery("orders", (ctx) => ctx.reply("Here are your current orders..."));
bot.callbackQuery("payment", (ctx) => ctx.reply("Payment options..."));
bot.callbackQuery("rules", (ctx) => ctx.reply("Here are the rules..."));

// Start the bot
bot.start(); 