// Command handlers
export function setupCommands(bot) {
  // Start command
  bot.start((ctx) => {
    const isGroup = ctx.chat.type !== 'private';
    
    if (isGroup) {
      return ctx.reply(
        `🤖 *PowerBot Activated!*\n\n` +
        `I'm now protecting and enhancing this group.\n\n` +
        `*Features:*\n` +
        `• Anti-spam protection\n` +
        `• Welcome messages\n` +
        `• Crypto price alerts\n` +
        `• Group management\n\n` +
        `Use /help to see all commands.`,
        { parse_mode: 'Markdown' }
      );
    }
    
    return ctx.reply(
      `👋 *Welcome to PowerBot!*\n\n` +
      `I'm a powerful Telegram bot for:\n` +
      `• 📊 Crypto price tracking\n` +
      `• 🛡️ Group management\n` +
      `• 🚫 Anti-spam protection\n` +
      `• 👋 Custom welcome messages\n\n` +
      `*Commands:*\n` +
      `/price <coin> - Get crypto price\n` +
      `/alert <coin> <price> - Set price alert\n` +
      `/help - Full command list\n\n` +
      `Add me to your group to get started!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Help command
  bot.help((ctx) => {
    return ctx.reply(
      `📚 *PowerBot Commands*\n\n` +
      `*Crypto:*\n` +
      `/price <coin> - Get current price\n` +
      `/top - Top 10 coins by market cap\n` +
      `/alert <coin> <price> - Set price alert\n` +
      `/alerts - View your alerts\n\n` +
      `*Group Management (Admins):*\n` +
      `/ban - Reply to ban user\n` +
      `/kick - Reply to kick user\n` +
      `/mute <duration> - Mute user (1h, 1d, etc)\n` +
      `/warn - Warn user\n` +
      `/setwelcome <message> - Set welcome message\n` +
      `/setspam <level> - Set anti-spam (low/medium/high/off)\n\n` +
      `*Utility:*\n` +
      `/stats - Group statistics\n` +
      `/id - Get user/chat ID\n`,
      { parse_mode: 'Markdown' }
    );
  });

  // ID command
  bot.command('id', (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const username = ctx.from.username || 'N/A';
    
    return ctx.reply(
      `👤 *Your Info:*\n` +
      `ID: \`${userId}\`\n` +
      `Username: @${username}\n\n` +
      `💬 *Chat ID:* \`${chatId}\``,
      { parse_mode: 'Markdown' }
    );
  });
}
