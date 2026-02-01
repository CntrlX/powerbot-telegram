# PowerBot - Telegram Group Management & Crypto Bot

🚀 **Professional Telegram bot for group management and crypto tracking**

## Features

### 📊 Crypto
- Real-time price checking (BTC, ETH, SOL, etc.)
- Top 10 cryptocurrencies by market cap
- Custom price alerts

### 🛡️ Group Management
- Ban / Kick / Mute users
- Warning system (3 strikes = ban)
- Group statistics

### 👋 Welcome Messages
- Customizable welcome messages for new members
- Variables: {user}, {group}, {count}

### 🚫 Anti-Spam
- Configurable spam protection (off/low/medium/high)
- Duplicate message detection
- Auto-mute for spammers

## Commands

### Crypto
| Command | Description |
|---------|-------------|
| `/price <coin>` | Get current price |
| `/top` | Top 10 coins |
| `/alert <coin> <price>` | Set price alert |
| `/alerts` | View your alerts |

### Group Management (Admin only)
| Command | Description |
|---------|-------------|
| `/ban` | Reply to ban user |
| `/kick` | Reply to kick user |
| `/mute <duration>` | Mute user (1h, 1d, etc) |
| `/warn` | Warn user (3 = ban) |
| `/setwelcome <msg>` | Set welcome message |
| `/setspam <level>` | Configure anti-spam |
| `/stats` | Group statistics |

### Utility
| Command | Description |
|---------|-------------|
| `/start` | Start bot |
| `/help` | Show all commands |
| `/id` | Get user/chat ID |

## Installation

1. Create a bot with [@BotFather](https://t.me/BotFather) and get your token
2. Clone this repository
3. Copy `.env.example` to `.env` and add your bot token
4. Install dependencies: `npm install`
5. Run the bot: `npm start`

## Environment Variables

```env
BOT_TOKEN=your_bot_token_here
ADMIN_IDS=123456789,987654321
```

## License

MIT - Use it, sell it, modify it!
