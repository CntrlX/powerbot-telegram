// Middleware for logging and admin checks
const adminIds = process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];

export function setupMiddleware(bot) {
  // Logging middleware
  bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    
    if (ctx.updateType === 'message') {
      console.log(`[${new Date().toISOString()}] ${ctx.from?.username || ctx.from?.id}: ${ctx.message?.text?.slice(0, 50) || 'non-text'} (${ms}ms)`);
    }
  });

  // Add helper to check if user is admin
  bot.use(async (ctx, next) => {
    ctx.isAdmin = async () => {
      if (ctx.chat?.type === 'private') return true;
      if (adminIds.includes(ctx.from?.id)) return true;
      
      try {
        const member = await ctx.getChatMember(ctx.from.id);
        return ['creator', 'administrator'].includes(member.status);
      } catch {
        return false;
      }
    };
    await next();
  });
}
