import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupCommands } from './commands/index.js';
import { setupMiddleware } from './middleware/index.js';
import { setupCrypto } from './features/crypto.js';
import { setupGroupManagement } from './features/groupManagement.js';
import { setupWelcome } from './features/welcome.js';
import { setupAntiSpam } from './features/antiSpam.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Setup all features
setupMiddleware(bot);
setupCommands(bot);
setupCrypto(bot);
setupGroupManagement(bot);
setupWelcome(bot);
setupAntiSpam(bot);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Launch
bot.launch()
  .then(() => console.log('🚀 PowerBot is running!'))
  .catch(err => console.error('Failed to start:', err));

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
