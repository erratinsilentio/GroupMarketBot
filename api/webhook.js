const TelegramBot = require('node-telegram-bot-api');

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in environment variables');
}

const bot = new TelegramBot(process.env.BOT_TOKEN);

// Forbidden words list
const FORBIDDEN_WORDS = ['wts', 'wtb', '#wts', '#wtb', 'Wts', 'Wtb', '#Wts', '#Wtb'];

// In-memory storage for user activity (use a database in production)
const userActivity = {};

const handleMessage = async (message) => {
  try {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text?.toLowerCase() || '';
    const messageThreadId = message.message_thread_id;

    // Update user activity
    userActivity[userId] = Date.now();

    // Check for forbidden words
    if (FORBIDDEN_WORDS.some(word => text.includes(word))) {
      await bot.banChatMember(chatId, userId);
      await bot.unbanChatMember(chatId, userId);
      await bot.deleteMessage(chatId, message.message_id);
      await bot.sendMessage(chatId, `User ${message.from.username || message.from.first_name} has been removed for using prohibited words.`, {
        message_thread_id: messageThreadId
      });
      return;
    }

    // Handle /halo command
    if (text === '/halo') {
      await bot.sendMessage(chatId, 'Zostałem zaprogramowany do pilnowania porządku w Wilkowyjach. To wymagająca ale satysfakcjonująca praca. Osobiście dopilnuję by zakaz handlu był przestrzegany przez każdego członka stada.', {
        message_thread_id: messageThreadId
      });
    }

    // Handle /clean command
    if (text === '/clean') {
      await checkInactiveUsers(chatId);
      await bot.sendMessage(chatId, 'Inactive users have been checked and removed if necessary.', {
        message_thread_id: messageThreadId
      });
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

const checkInactiveUsers = async (chatId) => {
  try {
    const now = Date.now();
    const inactiveThreshold = 31 * 24 * 60 * 60 * 1000; // 31 days in milliseconds

    for (const userId in userActivity) {
      if (now - userActivity[userId] > inactiveThreshold) {
        await bot.banChatMember(chatId, userId);
        await bot.unbanChatMember(chatId, userId);
        await bot.sendMessage(chatId, `User with ID ${userId} has been removed for being inactive for over 31 days.`);
        delete userActivity[userId]; // Remove user from tracking
      }
    }
  } catch (error) {
    console.error('Error checking inactive users:', error);
  }
};

bot.callbackQuery(/^category_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  const items = await getItemsByCategory(category); // You'll need to implement this

  const keyboard = new InlineKeyboard();
  items.forEach(item => {
    keyboard.text(`${item.name} - $${item.price}`, `add_item_${item.id}`).row();
  });
  keyboard.text("« Back to Menu", "menu");

  await ctx.reply("Select an item to add to cart:", { reply_markup: keyboard });
});

bot.callbackQuery(/^add_item_(.+)$/, async (ctx) => {
  const itemId = ctx.match[1];
  const keyboard = new InlineKeyboard()
    .text("1", `qty_${itemId}_1`)
    .text("2", `qty_${itemId}_2`)
    .text("3", `qty_${itemId}_3`)
    .row()
    .text("« Back", "menu");

  await ctx.reply("Select quantity:", { reply_markup: keyboard });
});

bot.callbackQuery("view_cart", async (ctx) => {
  const cart = await getCart(ctx.from.id); // You'll need to implement this
  
  if (!cart || cart.length === 0) {
    return ctx.reply("Your cart is empty!");
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const keyboard = new InlineKeyboard()
    .text("🛍️ Checkout", "checkout")
    .row()
    .text("🗑️ Clear Cart", "clear_cart")
    .text("« Back to Menu", "menu");

  await ctx.reply(
    `🛒 Your Cart:\n\n${cart.map(item => 
      `${item.name} x${item.quantity} - $${item.price * item.quantity}`
    ).join('\n')}\n\nTotal: $${total}`,
    { reply_markup: keyboard }
  );
});

bot.callbackQuery("checkout", async (ctx) => {
  await ctx.reply("Please enter your delivery address:");
  // Set user state to awaiting_address
  await setUserState(ctx.from.id, "awaiting_address");
});

// Handle address input
bot.on("message:text", async (ctx) => {
  const userState = await getUserState(ctx.from.id);
  
  if (userState === "awaiting_address") {
    const keyboard = new InlineKeyboard()
      .text("💳 Pay Now", "process_payment")
      .row()
      .text("« Cancel Order", "cancel_order");

    await setDeliveryAddress(ctx.from.id, ctx.message.text);
    await ctx.reply(
      "Address saved! Ready to proceed with payment?",
      { reply_markup: keyboard }
    );
  }
});

bot.callbackQuery("process_payment", async (ctx) => {
  // Here you would integrate with your payment provider
  const keyboard = new InlineKeyboard()
    .text("💳 Credit Card", "pay_card")
    .text("💰 Cash", "pay_cash");

  await ctx.reply(
    "Choose payment method:",
    { reply_markup: keyboard }
  );
});

bot.callbackQuery(/^pay_(.+)$/, async (ctx) => {
  const paymentMethod = ctx.match[1];
  const orderId = generateOrderId();
  
  await ctx.reply(
    `✅ Order Confirmed!\n\nOrder ID: ${orderId}\nPayment: ${paymentMethod}\n\nThank you for your order! We'll start preparing it right away.`
  );

  // Clear cart and reset state
  await clearCart(ctx.from.id);
  await clearUserState(ctx.from.id);
});

bot.callbackQuery("menu", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🍕 Pizza", "category_pizza")
    .text("🍔 Burgers", "category_burgers")
    .row()
    .text("🥗 Salads", "category_salads")
    .text("🥤 Drinks", "category_drinks")
    .row()
    .text("🛒 View Cart", "view_cart")
    .text("« Back", "start");

  await ctx.reply("Choose a category:", { reply_markup: keyboard });
});

module.exports = async (request, response) => {
  try {
    if (request.method === 'POST') {
      const { message } = request.body;
      
      if (message) {
        await handleMessage(message);
      }
      
      return response.status(200).json({ ok: true });
    }

    return response.status(200).json({ 
      status: 'active',
      timestamp: new Date().toISOString(),
      hasToken: !!process.env.BOT_TOKEN
    });
    
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return response.status(500).json({ error: error.message });
  }
}; 