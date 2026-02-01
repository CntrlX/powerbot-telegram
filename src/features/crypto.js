import axios from 'axios';

const COINGECKO_API = process.env.COINGECKO_API || 'https://api.coingecko.com/api/v3';

// Price alerts storage (in production, use a database)
const priceAlerts = new Map();

// Coin aliases
const COIN_ALIASES = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'sol': 'solana',
  'xrp': 'ripple',
  'doge': 'dogecoin',
  'ada': 'cardano',
  'dot': 'polkadot',
  'matic': 'polygon',
  'shib': 'shiba-inu',
  'avax': 'avalanche-2',
  'link': 'chainlink',
  'uni': 'uniswap',
  'bnb': 'binancecoin',
  'ltc': 'litecoin',
  'atom': 'cosmos',
};

function resolveCoinId(input) {
  const lower = input.toLowerCase();
  return COIN_ALIASES[lower] || lower;
}

async function getPrice(coinId) {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      }
    });
    return response.data[coinId];
  } catch (error) {
    console.error('Price fetch error:', error.message);
    return null;
  }
}

async function getTopCoins() {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Top coins error:', error.message);
    return null;
  }
}

function formatPrice(price) {
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

function formatMarketCap(cap) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

export function setupCrypto(bot) {
  // Price command
  bot.command('price', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length === 0) {
      return ctx.reply('Usage: /price <coin>\nExample: /price btc');
    }

    const coinId = resolveCoinId(args[0]);
    const data = await getPrice(coinId);

    if (!data) {
      return ctx.reply(`❌ Couldn't find price for "${args[0]}". Try the full name or check the spelling.`);
    }

    const change = data.usd_24h_change;
    const emoji = change >= 0 ? '📈' : '📉';
    const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;

    return ctx.reply(
      `${emoji} *${coinId.toUpperCase()}*\n\n` +
      `💰 Price: *$${formatPrice(data.usd)}*\n` +
      `📊 24h: ${changeStr}\n` +
      `💎 MCap: ${formatMarketCap(data.usd_market_cap)}`,
      { parse_mode: 'Markdown' }
    );
  });

  // Top coins command
  bot.command('top', async (ctx) => {
    const coins = await getTopCoins();

    if (!coins) {
      return ctx.reply('❌ Failed to fetch top coins. Try again later.');
    }

    let message = '🏆 *Top 10 Cryptocurrencies*\n\n';
    
    coins.forEach((coin, index) => {
      const change = coin.price_change_percentage_24h;
      const emoji = change >= 0 ? '🟢' : '🔴';
      const changeStr = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
      
      message += `${index + 1}. *${coin.symbol.toUpperCase()}* — $${formatPrice(coin.current_price)} ${emoji} ${changeStr}\n`;
    });

    return ctx.reply(message, { parse_mode: 'Markdown' });
  });

  // Set alert command
  bot.command('alert', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length < 2) {
      return ctx.reply('Usage: /alert <coin> <target_price>\nExample: /alert btc 50000');
    }

    const coinId = resolveCoinId(args[0]);
    const targetPrice = parseFloat(args[1]);

    if (isNaN(targetPrice)) {
      return ctx.reply('❌ Invalid price. Please enter a number.');
    }

    const currentData = await getPrice(coinId);
    if (!currentData) {
      return ctx.reply(`❌ Couldn't find "${args[0]}". Check the coin name.`);
    }

    const alertKey = `${ctx.from.id}_${coinId}`;
    priceAlerts.set(alertKey, {
      userId: ctx.from.id,
      chatId: ctx.chat.id,
      coin: coinId,
      targetPrice,
      currentPrice: currentData.usd,
      direction: targetPrice > currentData.usd ? 'above' : 'below',
      createdAt: Date.now(),
    });

    const direction = targetPrice > currentData.usd ? 'rises above' : 'falls below';
    
    return ctx.reply(
      `✅ *Alert Set!*\n\n` +
      `Coin: ${coinId.toUpperCase()}\n` +
      `Current: $${formatPrice(currentData.usd)}\n` +
      `Alert when: ${direction} $${formatPrice(targetPrice)}`,
      { parse_mode: 'Markdown' }
    );
  });

  // View alerts
  bot.command('alerts', (ctx) => {
    const userAlerts = [];
    
    priceAlerts.forEach((alert, key) => {
      if (alert.userId === ctx.from.id) {
        userAlerts.push(alert);
      }
    });

    if (userAlerts.length === 0) {
      return ctx.reply('📭 You have no active price alerts.\n\nUse /alert <coin> <price> to set one.');
    }

    let message = '🔔 *Your Price Alerts*\n\n';
    
    userAlerts.forEach((alert, index) => {
      message += `${index + 1}. ${alert.coin.toUpperCase()} → $${formatPrice(alert.targetPrice)} (${alert.direction})\n`;
    });

    return ctx.reply(message, { parse_mode: 'Markdown' });
  });
}
