// Anti-spam protection
const spamSettings = new Map(); // In production, use database
const userMessageCounts = new Map();
const userLastMessage = new Map();

// Spam detection thresholds
const THRESHOLDS = {
  off: { messages: Infinity, interval: 0, duplicateCount: Infinity },
  low: { messages: 10, interval: 5000, duplicateCount: 5 },
  medium: { messages: 6, interval: 5000, duplicateCount: 3 },
  high: { messages: 3, interval: 5000, duplicateCount: 2 },
};

export function setupAntiSpam(bot) {
  // Set spam level command
  bot.command('setspam', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can configure anti-spam.');
    }

    const level = ctx.message.text.split(' ')[1]?.toLowerCase();
    
    if (!level || !['off', 'low', 'medium', 'high'].includes(level)) {
      const current = spamSettings.get(ctx.chat.id) || 'off';
      return ctx.reply(
        `🛡️ *Anti-Spam Settings*\n\n` +
        `Current level: *${current}*\n\n` +
        `Usage: /setspam <level>\n\n` +
        `Levels:\n` +
        `• off - Disabled\n` +
        `• low - Lenient (10 msg/5s)\n` +
        `• medium - Moderate (6 msg/5s)\n` +
        `• high - Strict (3 msg/5s)`,
        { parse_mode: 'Markdown' }
      );
    }

    spamSettings.set(ctx.chat.id, level);
    
    const emoji = level === 'off' ? '⚠️' : '✅';
    return ctx.reply(`${emoji} Anti-spam set to *${level}*`, { parse_mode: 'Markdown' });
  });

  // Spam detection middleware
  bot.on('message', async (ctx, next) => {
    // Only check in groups
    if (ctx.chat.type === 'private') return next();
    
    const level = spamSettings.get(ctx.chat.id);
    if (!level || level === 'off') return next();
    
    const threshold = THRESHOLDS[level];
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const key = `${chatId}_${userId}`;
    const now = Date.now();
    
    // Skip admins
    if (await ctx.isAdmin()) return next();
    
    // Get or initialize user message tracking
    let userData = userMessageCounts.get(key) || { count: 0, firstTime: now, messages: [] };
    
    // Reset if interval passed
    if (now - userData.firstTime > threshold.interval) {
      userData = { count: 0, firstTime: now, messages: [] };
    }
    
    userData.count++;
    userData.messages.push(ctx.message.text || '');
    
    // Check for rapid messages
    if (userData.count > threshold.messages) {
      try {
        await ctx.deleteMessage();
        await ctx.restrictChatMember(userId, {
          until_date: Math.floor(Date.now() / 1000) + 300, // 5 min mute
          permissions: { can_send_messages: false }
        });
        
        await ctx.reply(`🚫 @${ctx.from.username || ctx.from.first_name} muted for 5 min (spam detected)`);
        userMessageCounts.delete(key);
        return;
      } catch (err) {
        console.error('Anti-spam action failed:', err.message);
      }
    }
    
    // Check for duplicate messages
    const duplicates = userData.messages.filter(m => m === ctx.message.text).length;
    if (duplicates >= threshold.duplicateCount) {
      try {
        await ctx.deleteMessage();
        await ctx.reply(`⚠️ @${ctx.from.username || ctx.from.first_name}, please don't spam the same message.`);
      } catch (err) {
        console.error('Duplicate removal failed:', err.message);
      }
    }
    
    userMessageCounts.set(key, userData);
    return next();
  });

  // Clean up old tracking data periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of userMessageCounts) {
      if (now - data.firstTime > 60000) { // 1 minute
        userMessageCounts.delete(key);
      }
    }
  }, 30000);
}
