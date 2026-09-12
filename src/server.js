/**
 * Spam_Bot_Kira - Telegram WhatsApp Pairing Bot
 * Author: Mr Kira Tech
 * Deploy: Render
 */

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  delay
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN || '8804921068:AAFeKX3NoHH6wNWuOUEcWlnAHlhrZ7TWlPg';
const PORT = process.env.PORT || 3000;
const BOT_NAME = 'Spam_Bot_Kira';
const AUTHOR = 'Mr Kira Tech';
const CHANNEL_LINK = 'https://t.me/+mQ3aQpCsEqI0YmY0';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const BOT_IMAGE = 'https://i.ibb.co/b5Sr9F9Q/097-DFA98-6-D39-4080-9580-F9-DAD9-FF1-B6-F.jpg';
const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029Vb7WJzp84OmBD0fEEJ2X';

// Sessions stockées à côté du fichier server.js (dans src/sessions)
const SESSIONS_DIR = path.join(__dirname, 'sessions');
try { fs.ensureDirSync(SESSIONS_DIR); } catch (e) { console.error('[FS]', e.message); }

// ================= EXPRESS =================
const app = express();
app.get('/', (req, res) => res.send(`${BOT_NAME} is running ✅`));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: BOT_NAME }));
app.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));

// ================= TELEGRAM =================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log(`[TELEGRAM] ${BOT_NAME} démarré...`);

// ================= JOIN CHECK =================
async function isUserJoined(userId) {
  if (!CHANNEL_ID) return true;
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    return ['creator', 'administrator', 'member', 'restricted'].includes(member.status);
  } catch (err) {
    console.warn(`[JOIN-CHECK] ${err.message}`);
    return true;
  }
}

async function requireJoin(msg) {
  const joined = await isUserJoined(msg.from.id);
  if (!joined) {
    await bot.sendPhoto(msg.chat.id, BOT_IMAGE, {
      caption:
        `🚫 *Accès refusé*\n\n` +
        `Rejoins d'abord la chaîne pour utiliser *${BOT_NAME}*.\n\n` +
        `🔗 ${CHANNEL_LINK}\n\n_Puis retape /start._`,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] }
    });
    return false;
  }
  return true;
}

// ================= /start =================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'Utilisateur';
  if (!(await isUserJoined(msg.from.id))) {
    return bot.sendPhoto(chatId, BOT_IMAGE, {
      caption:
        `👋 Salut *${name}*\n\n⚠️ Rejoins la chaîne pour utiliser ce bot.\n\n🔗 ${CHANNEL_LINK}`,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] }
    });
  }
  await bot.sendPhoto(chatId, BOT_IMAGE, {
    caption:
      `╔══════════════════════════════╗\n` +
      `   ✦  *WELCOME IN ${BOT_NAME.toUpperCase()}* ✦\n` +
      `╚══════════════════════════════╝\n\n` +
      `👑 *Creator* : ${AUTHOR} ✨\n🤖 *Bot* : ${BOT_NAME}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 *COMMANDES*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ /pair <numéro>  →  Jumeler WhatsApp\n` +
      `⚡ /menu           →  Menu principal\n` +
      `⚡ /help           →  Aide complète\n` +
      `⚡ /link           →  Chaîne officielle\n\n` +
      `🔗 *Chaîne* : ${CHANNEL_LINK}\n\n_Merci à ${AUTHOR} & Ego Tech 🌹_`,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] }
  });
});

// ================= /menu =================
bot.onText(/\/menu/, async (msg) => {
  if (!(await requireJoin(msg))) return;
  await bot.sendPhoto(msg.chat.id, BOT_IMAGE, {
    caption:
      `═══════════════════════════════════════════\n` +
      `   ✦  WELCOME IN BOT TELEGRAM ✦\n` +
      `═══════════════════════════════════════════\n\n` +
      `📵  NAME       : Spam_Bot_Kira\n\n` +
      `👑  CREATOR   : MR KIRA TECH ✨\n\n` +
      `───────────────────────────────────────────\n  DESCRIPTION\n───────────────────────────────────────────\n` +
      `THE BEST FOR CONNECT A ACCOUNT\n` +
      `───────────────────────────────────────────\n  JOIN MY CHANNEL\n───────────────────────────────────────────\n` +
      `🔗 ${CHANNEL_LINK}\n\n` +
      `───────────────────────────────────────────\n  EXAMPLE COMMAND\n───────────────────────────────────────────\n` +
      `⚡ Type : /pair 242...\n\n` +
      `═══════════════════════════════════════════`,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] }
  });
});

// ================= /help =================
bot.onText(/\/help/, async (msg) => {
  if (!(await requireJoin(msg))) return;
  await bot.sendMessage(msg.chat.id,
    `📖 *AIDE — ${BOT_NAME}*\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔹 */start*  →  Démarrer le bot\n` +
    `🔹 */pair <numéro>*  →  Lier WhatsApp\n   _Ex : /pair 242061234567_\n` +
    `🔹 */menu*  →  Menu principal\n` +
    `🔹 */link*  →  Chaîne officielle\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📲 *Jumeler WhatsApp :*\n` +
    `1. /pair <numéro sans +>\n2. Attends le code (valide 5 min)\n` +
    `3. WhatsApp → Appareils liés → Lier\n4. Entre le code\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💬 *Commandes WhatsApp :*\n` +
    `• /tagall  →  Mentionner tout le groupe\n` +
    `• /purge confirm  →  Retirer membres (admin)\n` +
    `• /block <numéro> →  Bloquer un contact\n\n` +
    `_Merci à MR KiRA TECH & Ego Tech 🌹_`,
    { parse_mode: 'Markdown' }
  );
});

// ================= /link =================
bot.onText(/\/link/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `🔗 *Rejoins ma chaîne Telegram*\n\n${CHANNEL_LINK}\n\n_${BOT_NAME} by ${AUTHOR}_`,
    { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] } }
  );
});

// ================= /pair =================
const activeSessions = new Map(); // telegramChatId -> { sock, saveCreds, phone }

bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  if (!(await requireJoin(msg))) return;
  const chatId = msg.chat.id;
  const raw = (match[1] || '').trim();

  if (!raw) {
    return bot.sendMessage(chatId,
      `⚠️ *Usage :* /pair <numéro sans +>\n_Ex : /pair 242061234567_`,
      { parse_mode: 'Markdown' }
    );
  }

  const phoneNumber = raw.replace(/[^\d]/g, '');
  if (phoneNumber.length < 8 || phoneNumber.length > 15) {
    return bot.sendMessage(chatId, `❌ Numéro invalide : *${raw}*`, { parse_mode: 'Markdown' });
  }

  // Si une session existe déjà pour ce chat, on la ferme proprement
  if (activeSessions.has(chatId)) {
    try {
      const old = activeSessions.get(chatId);
      old.sock?.ws?.close();
    } catch (e) {}
    activeSessions.delete(chatId);
  }

  await bot.sendMessage(chatId, `📡 Demande en cours pour *${phoneNumber}* 🔁`, { parse_mode: 'Markdown' });

  try {
    const sessionPath = path.join(SESSIONS_DIR, `session_${chatId}`);

    // Nettoyage défensif avant de créer la nouvelle session
    try {
      if (fs.existsSync(sessionPath)) fs.removeSync(sessionPath);
    } catch (e) {
      console.error('[CLEAN]', e.message);
    }
    fs.ensureDirSync(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Desktop'),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    activeSessions.set(chatId, { sock, saveCreds, phone: phoneNumber });
    sock.ev.on('creds.update', saveCreds);
    attachWhatsAppHandlers(sock);

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, isNewLogin } = update;

      if (isNewLogin) console.log(`[WA ${phoneNumber}] Nouveau login`);

      // ⭐ C'est ICI qu'on demande le code : quand la connexion passe à "connecting"
      if (connection === 'connecting' && !sock.authState.creds.registered && !pairingRequested) {
        pairingRequested = true;
        try {
          await bot.sendMessage(chatId,
            `📲 Demande de pairing code pour *${phoneNumber}*... 🔄`,
            { parse_mode: 'Markdown' }
          );

          const code = await sock.requestPairingCode(phoneNumber);
          const pretty = code?.match(/.{1,4}/g)?.join('-') || code;

          await bot.sendMessage(chatId,
            `════════════════════════════════════════\n` +
            `🔑 *Code de jumelage* :\n        \`${pretty}\`\n` +
            `════════════════════════════════════════\n\n` +
            `👉 *Instructions :*\n` +
            `- Ouvre WhatsApp sur ton téléphone.\n` +
            `- Appareils liés → Lier un appareil.\n` +
            `- Entre ce code.\n\n` +
            `_Merci à MR KiRA TECH & Mr Ego Tech 🌹_`,
            { parse_mode: 'Markdown' }
          );

          // Expiration après 5 min
          setTimeout(async () => {
            const entry = activeSessions.get(chatId);
            if (entry && !entry.sock?.authState?.creds?.registered) {
              try { entry.sock?.ws?.close(); } catch (e) {}
              activeSessions.delete(chatId);
              await bot.sendMessage(chatId,
                `⌛ *Code expiré (5 min).*\nLe bot n'a pas été connecté. Refais /pair.`,
                { parse_mode: 'Markdown' }
              ).catch(() => {});
            }
          }, 5 * 60 * 1000);

        } catch (e) {
          console.error('[PAIR-CODE]', e.message);
          pairingRequested = false;
          await bot.sendMessage(chatId, `❌ Échec génération code : ${e.message}`).catch(() => {});
        }
      }

      if (connection === 'open') {
        console.log(`[WA ${phoneNumber}] Connecté ✅`);

        await bot.sendPhoto(chatId, BOT_IMAGE, {
          caption:
            `Félicitations 🎉\nLe bot a été connecté avec succès ✅\n\n` +
            `Tape /help sur ton compte WhatsApp pour utiliser le bot.\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n📢 *Chaîne WhatsApp :*\n${WHATSAPP_CHANNEL}\n\n` +
            `_Merci à ${AUTHOR} & Ego Tech 🌹🌹_`,
          parse_mode: 'Markdown'
        }).catch(() => {});

        // Message envoyé à son propre WhatsApp (Note à soi-même)
        try {
          const selfJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
          await sock.sendMessage(selfJid, {
            image: { url: BOT_IMAGE },
            caption:
              `Bot is connect ✅ tape /help for use the bot\n\n` +
              `Join my channel WhatsApp\n\nLink : ${WHATSAPP_CHANNEL}\n\n` +
              `Merci à Kira Tech & Ego Tech 🌹🌹`
          });
        } catch (e) {
          console.error('[WA] msg self échoué:', e.message);
        }
      }

      if (connection === 'close') {
        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(`[WA ${phoneNumber}] Fermé (code ${code})`);

        if (code === DisconnectReason.loggedOut) {
          activeSessions.delete(chatId);
          await bot.sendMessage(chatId, `❌ Failed : le bot n'a pas pu être connecté, réessaie.`)
            .catch(() => {});
        } else if (code === DisconnectReason.timedOut || code === 408) {
          await bot.sendMessage(chatId, `⏱️ Timeout de connexion. Refais /pair.`).catch(() => {});
        }
      }
    });

  } catch (err) {
    console.error('[PAIR]', err);
    await bot.sendMessage(chatId, `❌ Erreur : ${err.message}`).catch(() => {});
    activeSessions.delete(chatId);
  }
});

// ================= HANDLERS WHATSAPP =================
function attachWhatsAppHandlers(sock) {
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      try {
        if (!m.message) continue;
        if (m.key.fromMe) continue;
        const from = m.key.remoteJid;
        if (!from || from === 'status@broadcast') continue;

        const text =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          m.message.imageMessage?.caption ||
          '';
        if (!text.startsWith('/')) continue;

        const [cmdRaw, ...args] = text.trim().split(/\s+/);
        const cmd = cmdRaw.toLowerCase();
        const isGroup = from.endsWith('@g.us');

        // ---- /help ----
        if (cmd === '/help') {
          await sock.sendMessage(from, {
            text:
              `📖 *${BOT_NAME} — Help*\n\n` +
              `• /help\n• /tagall (groupes)\n• /purge confirm (admin)\n• /block <numéro>\n\n` +
              `_by ${AUTHOR}_`
          }, { quoted: m });
          continue;
        }

        // ---- /tagall ----
        if (cmd === '/tagall' && isGroup) {
          const meta = await sock.groupMetadata(from);
          const participants = meta.participants.map(p => p.id);
          const mentionText = participants.map(p => `@${p.split('@')[0]}`).join(' ');
          await sock.sendMessage(from, {
            text: `📢 *TAG ALL*\n\n${mentionText}\n\n_Message de ${AUTHOR} 🌹_`,
            mentions: participants
          }, { quoted: m });
          continue;
        }

        // ---- /purge confirm ----
        if (cmd === '/purge') {
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ /purge uniquement dans un groupe.' }, { quoted: m });
            continue;
          }
          if (args[0] !== 'confirm') {
            await sock.sendMessage(from, {
              text:
                `⚠️ *Commande destructive*\n\n` +
                `Cette commande va retirer tous les membres du groupe (sauf admins).\n\n` +
                `Pour confirmer, tape : */purge confirm*`
            }, { quoted: m });
            continue;
          }
          const meta = await sock.groupMetadata(from);
          const senderId = m.key.participant || m.participant;
          const senderInfo = meta.participants.find(p => p.id === senderId);
          if (!senderInfo || !['admin', 'superadmin'].includes(senderInfo.admin)) {
            await sock.sendMessage(from, { text: '❌ Tu dois être admin du groupe pour purge.' }, { quoted: m });
            continue;
          }
          const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
          const botInfo = meta.participants.find(p => p.id === botId);
          if (!botInfo || !['admin', 'superadmin'].includes(botInfo.admin)) {
            await sock.sendMessage(from, { text: '❌ Le bot doit être admin du groupe.' }, { quoted: m });
            continue;
          }

          await sock.sendMessage(from, {
            image: { url: BOT_IMAGE },
            caption: `hoo la la encore des créatures inférieure 🌹`
          });

          const targets = meta.participants
            .filter(p => !['admin', 'superadmin'].includes(p.admin))
            .map(p => p.id);

          const chunkSize = 5;
          for (let i = 0; i < targets.length; i += chunkSize) {
            const chunk = targets.slice(i, i + chunkSize);
            try { await sock.groupParticipantsUpdate(from, chunk, 'remove'); }
            catch (e) { console.error('[PURGE]', e.message); }
            await delay(1500);
          }
          continue;
        }

        // ---- /block ----
        if (cmd === '/block') {
          const num = (args.join('') || '').replace(/[^\d]/g, '');
          if (!num) {
            await sock.sendMessage(from, { text: '⚠️ Usage : /block 242061234567' }, { quoted: m });
            continue;
          }
          const jid = num + '@s.whatsapp.net';
          try {
            await sock.updateBlockStatus(jid, 'block');
            await sock.sendMessage(from, { text: `✅ Numéro bloqué : ${num}` }, { quoted: m });
          } catch (e) {
            await sock.sendMessage(from, { text: `❌ Échec : ${e.message}` }, { quoted: m });
          }
          continue;
        }
      } catch (e) {
        console.error('[WA HANDLER]', e.message);
      }
    }
  });
}

// ================= KEEPALIVE =================
setInterval(() => console.log(`[KEEPALIVE] ${new Date().toISOString()}`), 4 * 60 * 1000);

process.on('uncaughtException', (e) => console.error('[UNCAUGHT]', e));
process.on('unhandledRejection', (e) => console.error('[UNHANDLED]', e));
