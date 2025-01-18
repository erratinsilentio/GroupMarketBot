import TelegramBot from 'node-telegram-bot-api';
import { DELIVERY_INFO, CONTACT_INFO, ORDER_TEMPLATE, RULES } from './data/rules.js';
import dotenv from 'dotenv';
import { MENU } from './data/menu.js';

dotenv.config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let globalCart = ''

// Helper function to show main menu
const showMainMenu = (chatId) => {
  return bot.sendMessage(chatId, 'Wybierz opcję:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🍽️ Menu", callback_data: "menu" }],
        [
          { text: "🛒 Koszyk", callback_data: "cart" },
          { text: "🚚 Dostawa", callback_data: "delivery" }
        ],
        [{ text: "📞 Kontakt", callback_data: "contact" }]
      ]
    }
  });
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, RULES, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "TAK", callback_data: "yes" },
          { text: "NIE", callback_data: "no" }
        ],
        [{ text: "REGULAMIN", url: "https://t.me/c/2007671653/607/80935" }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  
  if (query.data === 'yes') {
    bot.deleteMessage(chatId, messageId);
    showMainMenu(chatId);
  }
  
  if (query.data === 'no') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, 'Niestety, nie możesz kupować w naszym sklepie.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Zacznijmy od nowa", callback_data: "restart" }]
        ]
      }
    });
  }

  if (query.data === 'restart') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, RULES, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "TAK", callback_data: "yes" },
            { text: "NIE", callback_data: "no" }
          ],
          [{ text: "REGULAMIN", url: "https://t.me/c/2007671653/607/80935" }]
        ]
      }
    });
  }

  // Handle new button actions with back buttons
  if (query.data === 'menu') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, MENU, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "« Powrót", callback_data: "back_to_main" }]
        ]
      }
    });
  }

  if (query.data === 'cart') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, ORDER_TEMPLATE, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "EDYTUJ KOSZYK", callback_data: "edit_cart" }],
          [{ text: "ZLOŻ ZAMÓWIENIE", callback_data: "place_order" }],
          [{ text: "« Powrót", callback_data: "back_to_main" }],
        ]
      }
    });
  }

  if (query.data === 'delivery') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, DELIVERY_INFO, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "« Powrót", callback_data: "back_to_main" }]
        ]
      }
    });
  }

  if (query.data === 'contact') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, CONTACT_INFO, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "« Powrót", callback_data: "back_to_main" }]
        ]
      }
    });
  }


    if (query.data === 'edit_cart') {
        bot.deleteMessage(chatId, messageId);
        bot.sendMessage(chatId, `Current cart: ${globalCart}\nPlease enter new cart contents:`, {
            reply_markup: {
                force_reply: true
            }
        }).then(sentMessage => {
            const replyToMessageId = sentMessage.message_id;

            // Listen for the user's reply
            bot.onReplyToMessage(chatId, replyToMessageId, (reply) => {
                globalCart = reply.text; // Update the global cart variable
                bot.sendMessage(chatId, `Cart updated to: ${globalCart}`);
            });

        });
    }

  // Handle back button
  if (query.data === 'back_to_main') {
    bot.deleteMessage(chatId, messageId);
    showMainMenu(chatId);
  }
});

bot.on('polling_error', console.error);