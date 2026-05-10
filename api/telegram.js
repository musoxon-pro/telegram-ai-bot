const { Telegraf } = require('telegraf');

const BOT_TOKEN = "7987077916:AAFLpL3S4zXFj5qv8cY7XRu5hatfBxf2ZwU";
const bot = new Telegraf(BOT_TOKEN);

// Oddiy javoblar bazasi
const responses = {
    greetings: ["Assalomu alaykum! 👋", "Salom! 😊", "Va alaykum assalom!", "Salom, aziz do'stim!"],
    how_are_you: ["Rahmat, yaxshi! 😊 O'zingiz-chi?", "Zo'r! 💪 Sizni ko'rganimdan xursandman!", "A'lo darajada! 🚀"],
    jokes: [
        "O'qituvchi: Nega kech qolding? O'quvchi: Tabelda 'Asta kiring' deb yozilgan edi! 😄",
        "Dasturchi do'konga kirdi: 1 kg non bering. Sotuvchi: 1000 so'm. Dasturchi: 1 kg = 1024 gramm-ku! 🤓"
    ],
    love: ["Sevgi - bu hayotning eng go'zal tuyg'usi! 💕", "Muhabbat sabr qiladi, mehrli bo'ladi... 🌹"],
    food: ["Palov - o'zbekning dunyoga mashhur taomi! 🍚", "Somsa, manti - eng zo'r taomlar! 😋"],
    programming: ["JavaScript eng zo'r! 🚀", "Python ham ajoyib! 🐍", "Dasturlash - bu san'at!"],
    thanks: ["Arzimaydi! 😊", "Iltimos! 🌟", "Har doim yordam berishdan xursandman!"],
    goodbye: ["Xayr! Ko'rishguncha! 👋", "Yana keling! 😊", "Hayrli kun! 🌟"],
    fallback: ["Kechirasiz, tushunmadim 😊 /help yozing", "Boshqa nima deysiz? 🤔", "Qaytadan yozing, iltimos"]
};

function getResponse(text) {
    const msg = text.toLowerCase();

    if (msg.includes("salom") || msg.includes("assalom") || msg.includes("hello") || msg.includes("hi")) {
        return randomFrom(responses.greetings);
    }
    if (msg.includes("qalay") || msg.includes("qanday") || msg.includes("ahvol") || msg.includes("yaxshimisan")) {
        return randomFrom(responses.how_are_you);
    }
    if (msg.includes("hazil") || msg.includes("kulgi") || msg.includes("joke") || msg.includes("kulguli")) {
        return randomFrom(responses.jokes);
    }
    if (msg.includes("sevgi") || msg.includes("muhabbat") || msg.includes("love")) {
        return randomFrom(responses.love);
    }
    if (msg.includes("ovqat") || msg.includes("osh") || msg.includes("palov") || msg.includes("taom") || msg.includes("somsa")) {
        return randomFrom(responses.food);
    }
    if (msg.includes("dastur") || msg.includes("program") || msg.includes("code") || msg.includes("python") || msg.includes("javascript")) {
        return randomFrom(responses.programming);
    }
    if (msg.includes("rahmat") || msg.includes("tashakkur") || msg.includes("spasiba") || msg.includes("thanks")) {
        return randomFrom(responses.thanks);
    }
    if (msg.includes("xayr") || msg.includes("hayr") || msg.includes("bye") || msg.includes("ko'rishguncha")) {
        return randomFrom(responses.goodbye);
    }

    return randomFrom(responses.fallback);
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

bot.start((ctx) => {
    ctx.reply(
        `Assalomu alaykum, ${ctx.from.first_name}! 👋\n\n` +
        `Men suhbatdosh botman!\n` +
        `Men bilan bemalol gaplashing.\n\n` +
        `Yordam: /help`
    );
});

bot.help((ctx) => {
    ctx.reply(
        `🌟 Nimalar haqida gaplasha olamiz:\n\n` +
        `👋 Salomlashish\n` +
        `😊 Kayfiyat\n` +
        `😂 Hazillar\n` +
        `💕 Sevgi\n` +
        `🍲 Taomlar\n` +
        `💻 Dasturlash\n\n` +
        `Oddiy yozing - men tushunaman!`
    );
});

bot.on('text', async (ctx) => {
    try {
        const reply = getResponse(ctx.message.text);
        await ctx.sendChatAction('typing');
        await new Promise(r => setTimeout(r, 500 + Math.random() * 800));
        await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
        console.error('Xatolik:', e);
        await ctx.reply('Xatolik yuz berdi 😔');
    }
});

bot.on('sticker', (ctx) => ctx.reply('Chiroyli stiker! 😊'));
bot.on('voice', (ctx) => ctx.reply('Matn yozing, ovozni tushunolmayman ✍️'));

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error('Handler xatosi:', e);
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
