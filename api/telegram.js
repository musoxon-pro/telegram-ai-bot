const { Telegraf } = require('telegraf');
const chatEngine = require('../utils/chatEngine');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
    const firstName = ctx.from.first_name || 'Do‘stim';
    ctx.reply(
        `Assalomu alaykum, ${firstName}! 👋\n\n` +
        `Men sun'iy intellekt asosidagi suhbatdosh botman. 🤖\n` +
        `O‘zbek tilida erkin suhbatlasha olaman.\n\n` +
        `Nima haqida gaplashamiz? 😊\n\n` +
        `Yordam uchun: /help`
    );
});

bot.help((ctx) => {
    ctx.reply(
        `🌟 **Yordam**\n\n` +
        `Men bilan quyidagi mavzularda suhbatlashishingiz mumkin:\n\n` +
        `👋 Salomlashish\n` +
        `😊 Kayfiyat so‘rash\n` +
        `😂 Hazil va kulgili gaplar\n` +
        `💕 Sevgi va muhabbat\n` +
        `🍲 Ovqat va taomlar\n` +
        `💻 Dasturlash (JavaScript, Python)\n` +
        `💪 Motivatsiya\n` +
        `🌈 Ko‘tarinki kayfiyat\n` +
        `📚 Maslahatlar\n` +
        `❓ Savol-javob\n\n` +
        `Oddiy gaplarni yozing, men tushunaman! 😊`
    );
});

bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    try {
        await ctx.sendChatAction('typing');
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        const response = chatEngine.getResponse(userMessage);
        await ctx.reply(response.text, {
            reply_to_message_id: ctx.message.message_id
        });
        console.log(`${ctx.from.first_name}: "${userMessage}" -> [${response.category}]`);
    } catch (error) {
        console.error('Xatolik:', error);
        await ctx.reply('Kechirasiz, tushunmadim. /help yozing. 😊');
    }
});

bot.on('sticker', (ctx) => ctx.reply('Chiroyli stiker! Men matnli xabarlarni yaxshiroq tushunaman.'));
bot.on('voice', (ctx) => ctx.reply('Hozircha ovozli xabarlarni tushuna olmayman. Matn yozing. ✍️'));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Bot xatosi:', error);
            res.status(200).json({ ok: false, error: error.message });
        }
    } else if (req.method === 'GET') {
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';
        const webhookUrl = `${baseUrl}/api/telegram`;
        try {
            const response = await fetch(
                `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`
            );
            const data = await response.json();
            res.status(200).json({
                success: true,
                message: 'Webhook o‘rnatildi',
                webhook: webhookUrl,
                details: data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                manual: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
