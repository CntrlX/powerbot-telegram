// Group management features - ban, kick, mute, warn
const warnings = new Map(); // In production, use database

export function setupGroupManagement(bot) {
  // Ban command
  bot.command('ban', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can use this command.');
    }

    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) {
      return ctx.reply('❌ Reply to a message to ban that user.');
    }

    const userId = replyTo.from.id;
    const username = replyTo.from.username || replyTo.from.first_name;

    try {
      await ctx.banChatMember(userId);
      return ctx.reply(`🔨 *Banned* @${username}`, { parse_mode: 'Markdown' });
    } catch (error) {
      return ctx.reply(`❌ Failed to ban: ${error.message}`);
    }
  });

  // Kick command
  bot.command('kick', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can use this command.');
    }

    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) {
      return ctx.reply('❌ Reply to a message to kick that user.');
    }

    const userId = replyTo.from.id;
    const username = replyTo.from.username || replyTo.from.first_name;

    try {
      await ctx.banChatMember(userId);
      await ctx.unbanChatMember(userId); // Unban so they can rejoin
      return ctx.reply(`👢 *Kicked* @${username}`, { parse_mode: 'Markdown' });
    } catch (error) {
      return ctx.reply(`❌ Failed to kick: ${error.message}`);
    }
  });

  // Mute command
  bot.command('mute', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can use this command.');
    }

    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) {
      return ctx.reply('❌ Reply to a message to mute that user.');
    }

    const args = ctx.message.text.split(' ').slice(1);
    const duration = parseDuration(args[0] || '1h');
    const userId = replyTo.from.id;
    const username = replyTo.from.username || replyTo.from.first_name;

    try {
      await ctx.restrictChatMember(userId, {
        until_date: Math.floor(Date.now() / 1000) + duration,
        permissions: {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_other_messages: false,
        }
      });
      
      const durationStr = formatDuration(duration);
      return ctx.reply(`🔇 *Muted* @${username} for ${durationStr}`, { parse_mode: 'Markdown' });
    } catch (error) {
      return ctx.reply(`❌ Failed to mute: ${error.message}`);
    }
  });

  // Warn command
  bot.command('warn', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can use this command.');
    }

    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) {
      return ctx.reply('❌ Reply to a message to warn that user.');
    }

    const userId = replyTo.from.id;
    const username = replyTo.from.username || replyTo.from.first_name;
    const chatId = ctx.chat.id;
    const key = `${chatId}_${userId}`;

    const current = warnings.get(key) || 0;
    const newCount = current + 1;
    warnings.set(key, newCount);

    if (newCount >= 3) {
      try {
        await ctx.banChatMember(userId);
        warnings.delete(key);
        return ctx.reply(`🔨 @${username} has been *banned* after 3 warnings!`, { parse_mode: 'Markdown' });
      } catch (error) {
        return ctx.reply(`⚠️ @${username} has 3 warnings but I couldn't ban them.`);
      }
    }

    return ctx.reply(`⚠️ *Warning ${newCount}/3* for @${username}`, { parse_mode: 'Markdown' });
  });

  // Stats command
  bot.command('stats', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    try {
      const count = await ctx.getChatMembersCount();
      const chat = await ctx.getChat();
      
      return ctx.reply(
        `📊 *Group Stats*\n\n` +
        `👥 Members: ${count}\n` +
        `📝 Title: ${chat.title}\n` +
        `🆔 ID: \`${chat.id}\``,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      return ctx.reply('❌ Failed to get stats.');
    }
  });
}

function parseDuration(str) {
  const match = str.match(/^(\d+)(m|h|d)?$/i);
  if (!match) return 3600; // default 1 hour
  
  const num = parseInt(match[1]);
  const unit = (match[2] || 'h').toLowerCase();
  
  switch (unit) {
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return num * 3600;
  }
}

function formatDuration(seconds) {
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`;
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 60)}m`;
}
