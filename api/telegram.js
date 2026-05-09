const { Telegraf } = require('telegraf');
const chatEngine = require('../utils/chatEngine');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Start komandasi
bot.start((ctx) => {
    const firstName = ctx.from.first_name || 'Do\'stim';
    ctx.reply(
        `Assalomu alaykum, ${firstName}! 👋\n\n` +
        `Men sun'iy intellekt asosidagi suhbatdosh botman. 🤖\n` +
        `O'zbek tilida erkin suhbatlasha olaman.\n\n` +
        `Nima haqida gaplashamiz? 😊\n\n` +
        `Yordam uchun: /help`
    );
});

// Help komandasi
bot.help((ctx) => {
    ctx.reply(
        `🌟 **Yordam**\n\n` +
        `Men bilan quyidagi mavzularda suhbatlashishingiz mumkin:\n\n` +
        `👋 Salomlashish\n` +
        `😊 Kayfiyat so'rash\n` +
        `😂 Hazil va kulgili gaplar\n` +
        `💕 Sevgi va muhabbat\n` +
        `🍲 Ovqat va taomlar\n` +
        `💻 Dasturlash (JavaScript, Python)\n` +
        `💪 Motivatsiya\n` +
        `🌈 Ko'tarinki kayfiyat\n` +
        `📚 Maslahatlar\n` +
        `❓ Savol-javob\n\n` +
        `Oddiy gaplarni yozing, men tushunaman! 😊`
    );
});

// Asosiy xabar handler
bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'Foydalanuvchi';
    
    try {
        // "Typing..." indikatorini ko'rsatish
        await ctx.sendChatAction('typing');
        
        // Kichik kechikish (real suhbatdek)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Chat engine orqali javob topish
        const response = chatEngine.getResponse(userMessage);
        
        // Javobni yuborish
        await ctx.reply(response.text, {
            reply_to_message_id: ctx.message.message_id
        });
        
        // Konsolga log (xatoliklarni kuzatish uchun)
        console.log(`[${new Date().toISOString()}] ${userName} (${userId}): "${userMessage}" -> [${response.category}] (${(response.confidence * 100).toFixed(0)}%)`);
        
        // Tasodifiy qo'shimcha reaksiyalar
        if (response.category === 'jokes' && Math.random() > 0.7) {
            setTimeout(async () => {
                await ctx.reply('😄 Yana bir hazil kerakmi?');
            }, 1500);
        }
        
    } catch (error) {
        console.error('Xatolik:', error);
        
        // Oddiy foydalanuvchiga ko'rsatilmaydigan xato
        await ctx.reply(
            'Kechirasiz, tushunmadim. Qaytadan urinib ko\'ring yoki /help yozing. 😊',
            { reply_to_message_id: ctx.message.message_id }
        );
    }
});

// Sticker yoki boshqa media
bot.on('sticker', (ctx) => {
    ctx.reply('Chiroyli stiker! 😊 Men matnli xabarlarni yaxshiroq tushunaman.');
});

// Voice message
bot.on('voice', (ctx) => {
    ctx.reply('Kechirasiz, hozircha ovozli xabarlarni tushuna olmayman. Iltimos, matn yozing. ✍️');
});

// Webhook handler
module.exports = async (req, res) => {
    // CORS headers (ixtiyoriy, monitoring uchun)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ 
                ok: true,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Bot xatosi:', error);
            // Telegramga 200 qaytarish kerak, aks holda takroriy so'rovlar bo'ladi
            res.status(200).json({ 
                ok: false, 
                error: error.message 
            });
        }
    } else if (req.method === 'GET') {
        // Webhook o'rnatish va status
        const webhookUrl = `https://${process.env.VERCEL_URL || 'your-app.vercel.app'}/api/telegram`;
        
        try {
            // Status ma'lumot
            const categories = Object.keys(require('../data/conversations.json')).length;
            
            res.status(200).json({
                name: 'Uzbek AI Chatbot',
                version: '1.0.0',
                status: 'active',
                webhook: webhookUrl,
                categories: categories,
                language: 'Uzbek 🇺🇿',
                deployment: 'Vercel Serverless',
                setup_webhook: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
