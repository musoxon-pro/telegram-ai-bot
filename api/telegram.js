const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  return ctx.reply('Bot ishlamoqda! 🚀');
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } else if (req.method === 'GET') {
      const baseUrl = `https://${process.env.VERCEL_URL || 'sizning-domen.vercel.app'}`;
      const webhookUrl = `${baseUrl}/api/telegram`;
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
      const d = await r.json();
      res.status(200).json({ success: true, webhook: webhookUrl, details: d });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ ok: true }); // Telegramga 200 qaytarish muhim
  }
};
