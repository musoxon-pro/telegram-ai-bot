const { Telegraf } = require('telegraf');

const BOT_TOKEN = "7987077916:AAFLpL3S4zXFj5qv8cY7XRu5hatfBxf2ZwU";
const bot = new Telegraf(BOT_TOKEN);

// Oddiy javoblar bazasi
const responses = {
    greetings: ["Assalomu alaykum! 👋", "Salom! 😊", "Va alaykum assalom!"],
    how_are_you: ["Rahmat, yaxshi! 😊", "Zo'r! 💪", "A'lo darajada! 🚀"],
    jokes: ["O'qituvchi: Nega kech qolding? O'quvchi: Maktab oldidagi tabelda 'Asta kiring' deb yozilgan edi! 😄"],
    love: ["Sevgi - bu hayotning eng go'zal tuyg'usi! 💕", "Muhabbat sabr qiladi..."],
    food: ["Palov - o'zbekning dunyoga mashhur taomi! 🍚", "Somsa, manti - eng zo'r taomlar! 😋"],
    thanks: ["Arzimaydi! 😊", "Iltimos! 🌟"],
    goodbye: ["Xayr! 👋", "Ko'rishguncha! 😊"],
    fallback: ["Tushunmadim, qaytadan yozing 😊", "/help yozing"]
};

// Kalit so'zlar
const keywords = {
    greetings: ["salom", "assalom", "hello", "hi"],
    how_are_you: ["qalay", "qanday", "ahvol", "yaxshimisan"],
    jokes: ["hazil", "kulgi", "joke", "kulguli"],
    love: ["sevgi", "muhabbat", "love"],
    food: ["ovqat", "osh", "palov", "taom"],
    thanks: ["rahmat", "tashakkur", "spasiba"],
    goodbye: ["xayr", "hayr", "bye"]
};

function getResponse(text) {
    const msg = text.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => msg.includes(word))) {
            const list = responses[category];
            return list[Math.floor(Math.random() * list.length)];
        }
    }
    
    const list = responses.fallback;
    return list[Math.floor(Math.random() * list.length)];
}

bot.start((ctx) => {
    ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nMen suhbatdosh botman!\n/help - yordam`);
});

bot.help((ctx) => {
    ctx.reply("Men bilan gaplashing: salom, qalaysan, hazil ayt, rahmat, xayr...");
});

bot.on('text', async (ctx) => {
    try {
        const reply = getResponse(ctx.message.text);
        await ctx.sendChatAction('typing');
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
        console.error(e);
        ctx.reply('Xatolik yuz berdi 😔');
    }
});

bot.on('sticker', (ctx) => ctx.reply('Chiroyli stiker! 😊'));
bot.on('voice', (ctx) => ctx.reply('Matn yozing, ovozni tushunolmayman ✍️'));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error(e);
            res.status(200).json({ ok: true });
        }
    } else if (req.method === 'GET') {
        const baseUrl = `https://${process.env.VERCEL_URL || 'telegram-ai-bot-sigma.vercel.app'}`;
        const webhookUrl = `${baseUrl}/api/telegram`;
        
        try {
            const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
            const d = await r.json();
            res.status(200).json({ success: true, webhook: webhookUrl, details: d });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
};
