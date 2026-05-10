const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// To'g'ridan-to'g'ri javob funksiyasi
function getReply(text) {
    const msg = text.toLowerCase();
    
    if (/(salom|assalom|hello|hi)/.test(msg)) {
        return ["Assalomu alaykum! 👋 Sizni ko'rganimdan xursandman!", "Salom! Nima gaplar?"][Math.floor(Math.random() * 2)];
    }
    if (/(qalay|qanday|ahvol|yaxshimisan)/.test(msg)) {
        return ["Yaxshi, rahmat! 😊 O'zingiz-chi?", "A'lo darajada! Siz bilan suhbatdan xursandman!"][Math.floor(Math.random() * 2)];
    }
    if (/(hazil|kulgi|kulguli|joke)/.test(msg)) {
        return ["😂 Nega dasturchi ishga kech qoldi? Yo'lda 0 va 1 larni sanab o'tirgan ekan!", "O'qituvchi: Nega kech qolding? - «Asta kiring» deb yozilgan edi!"][Math.floor(Math.random() * 2)];
    }
    if (/(rahmat|tashakkur|thanks)/.test(msg)) {
        return "Arzimaydi! 😊 Doim yordam berishdan xursandman!";
    }
    if (/(xayr|hayr|bye|ko'rishguncha)/.test(msg)) {
        return "Xayr! Yana keling! 👋";
    }
    if (/(dastur|program|python|javascript|code)/.test(msg)) {
        return "Dasturlash – bu san'at! 💻 JavaScript va Python eng zo'r tillar!";
    }
    if (/(ovqat|osh|palov|somsa|taom)/.test(msg)) {
        return "Palov – shohona taom! 🍚 Somsa-chi? 😋";
    }
    
    return ["Tushunmadim, iltimos boshqacha yozing 😊", "Bu haqida ko'proq o'ylab ko'raman!"][Math.floor(Math.random() * 2)];
}

bot.start((ctx) => {
    ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nMen suhbatdosh botman!\n/help uchun bosing.`);
});

bot.help((ctx) => {
    ctx.reply("Men bilan gaplashing: salom, qalaysan, hazil ayt, rahmat, xayr... 💬");
});

bot.on('text', async (ctx) => {
    try {
        await ctx.sendChatAction('typing');
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        const reply = getReply(ctx.message.text);
        await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
        console.error(e);
        await ctx.reply('Xatolik! Iltimos qayta urinib ko\'ring.');
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (e) {
            res.status(200).json({ ok: true });
        }
    } else if (req.method === 'GET') {
        const url = `https://${process.env.VERCEL_URL || 'localhost'}/api/telegram`;
        try {
            const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${url}`);
            const d = await r.json();
            res.status(200).json({ success: true, webhook: url, details: d });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
};
