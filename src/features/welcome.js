// Welcome message feature
const welcomeMessages = new Map(); // In production, use database

const DEFAULT_WELCOME = `👋 Welcome to the group, {user}!\n\nPlease read the rules and enjoy your stay.`;

export function setupWelcome(bot) {
  // Set welcome message
  bot.command('setwelcome', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply('❌ This command only works in groups.');
    }

    if (!await ctx.isAdmin()) {
      return ctx.reply('❌ Only admins can set the welcome message.');
    }

    const message = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!message) {
      return ctx.reply(
        `📝 *Set Welcome Message*\n\n` +
        `Usage: /setwelcome <message>\n\n` +
        `*Variables:*\n` +
        `{user} - User's name/mention\n` +
        `{group} - Group name\n` +
        `{count} - Member count\n\n` +
        `Example:\n` +
        `/setwelcome Welcome {user}! You are member #{count}`,
        { parse_mode: 'Markdown' }
      );
    }

    welcomeMessages.set(ctx.chat.id, message);
    return ctx.reply(`✅ Welcome message updated!\n\nPreview:\n${formatWelcome(message, ctx.from, ctx.chat, 100)}`);
  });

  // Handle new members
  bot.on('new_chat_members', async (ctx) => {
    const newMembers = ctx.message.new_chat_members;
    
    for (const member of newMembers) {
      // Skip bots
      if (member.is_bot) continue;
      
      const template = welcomeMessages.get(ctx.chat.id) || DEFAULT_WELCOME;
      const count = await ctx.getChatMembersCount().catch(() => '?');
      const message = formatWelcome(template, member, ctx.chat, count);
      
      await ctx.reply(message, { parse_mode: 'Markdown' });
    }
  });
}

function formatWelcome(template, user, chat, count) {
  const userName = user.username 
    ? `@${user.username}` 
    : `[${user.first_name}](tg://user?id=${user.id})`;
  
  return template
    .replace(/{user}/g, userName)
    .replace(/{group}/g, chat.title || 'the group')
    .replace(/{count}/g, count.toString());
}
