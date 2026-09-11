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
const CHANNEL_ID = '@spam_bot_dev_channel'; // optionnel: peut rester vide si non résolvable
const BOT_IMAGE = 'https://i.ibb.co/b5Sr9F9Q/097-DFA98-6-D39-4080-9580-F9-DAD9-FF1-B6-F.jpg';
const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029Vb7WJzp84OmBD0fEEJ2X';

// Stockages
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const USERS_FILE = path.join(__dirname, 'users.json');
fs.ensureDirSync(SESSIONS_DIR);

// ================= EXPRESS (Render keepalive) =================
const app = express();
app.get('/', (req, res) => res.send(`${BOT_NAME} is running ✅`));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: BOT_NAME }));
app.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));

// ================= TELEGRAM BOT =================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log(`[TELEGRAM] ${BOT_NAME} démarré...`);

// ================= USER MANAGEMENT =================
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  try { return fs.readJsonSync(USERS_FILE); } catch { return {}; }
}
function saveUsers(data) {
  try { fs.writeJsonSync(USERS_FILE, data, { spaces: 2 }); } catch (e) {
    console.error('[USERS] save error', e.message);
  }
}
let users = loadUsers();

// ================= JOIN CHECK =================
async function isUserJoined(userId) {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    return ['creator', 'administrator', 'member', 'restricted'].includes(member.status);
  } catch (err) {
    // Si le bot n'est pas admin de la chaîne, on ne peut pas vérifier → on autorise
    console.warn(`[JOIN-CHECK] Impossible de vérifier ${userId}: ${err.message}`);
    return true;
  }
}

async function requireJoin(msg) {
  const userId = msg.from.id;
  const joined = await isUserJoined(userId);
  if (!joined) {
    await bot.sendPhoto(msg.chat.id, BOT_IMAGE, {
      caption:
        `🚫 *Accès refusé*\n\n` +
        `Pour utiliser *${BOT_NAME}*, vous devez d'abord rejoindre notre chaîne.\n\n` +
        `🔗 ${CHANNEL_LINK}\n\n` +
        `_Après avoir rejoint, retapez /start._`,
      parse_mode: 'Markdown'
    });
    return false;
  }
  return true;
}

// ================= START =================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'Utilisateur';

  const joined = await isUserJoined(msg.from.id);
  if (!joined) {
    return bot.sendPhoto(chatId, BOT_IMAGE, {
      caption:
        `👋 Salut *${name}*\n\n` +
        `⚠️ Vous devez rejoindre notre chaîne Telegram pour utiliser ce bot.\n\n` +
        `🔗 *Cliquez ici :* ${CHANNEL_LINK}\n\n` +
        `_Puis retapez /start_`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '📢 Rejoindre la chaîne', url: CHANNEL_LINK }]]
      }
    });
  }

  await bot.sendPhoto(chatId, BOT_IMAGE, {
    caption:
      `╔══════════════════════════════╗\n` +
      `   ✦  *WELCOME IN ${BOT_NAME.toUpperCase()}* ✦\n` +
      `╚══════════════════════════════╝\n\n` +
      `👑 *Creator* : ${AUTHOR} ✨\n` +
      `🤖 *Bot* : ${BOT_NAME}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *COMMANDES DISPONIBLES*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ /pair <numéro>  →  Jumeler WhatsApp\n` +
      `⚡ /menu           →  Menu principal\n` +
      `⚡ /help           →  Aide complète\n` +
      `⚡ /link           →  Chaîne officielle\n\n` +
      `🔗 *Chaîne* : ${CHANNEL_LINK}\n\n` +
      `_Merci à ${AUTHOR} & Ego Tech 🌹_`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '📢 Rejoindre la chaîne', url: CHANNEL_LINK }]]
    }
  });
});

// ================= MENU =================
bot.onText(/\/menu/, async (msg) => {
  if (!(await requireJoin(msg))) return;
  await bot.sendPhoto(msg.chat.id, BOT_IMAGE, {
    caption:
      `═══════════════════════════════════════════\n` +
      `   ✦  WELCOME IN BOT TELEGRAM ✦\n` +
      `═══════════════════════════════════════════\n\n` +
      `📵  NAME       : Spam_Bot_Kira\n\n` +
      `👑  CREATOR   : MR KIRA TECH ✨\n\n` +
      `───────────────────────────────────────────\n` +
      `  DESCRIPTION\n` +
      `───────────────────────────────────────────\n` +
      `THE BEST FOR CONNECT A ACCOUNT\n` +
      `───────────────────────────────────────────\n` +
      `  JOIN MY CHANNEL\n` +
      `───────────────────────────────────────────\n` +
      `🔗 ${CHANNEL_LINK}\n\n` +
      `───────────────────────────────────────────\n` +
      `  EXAMPLE COMMAND\n` +
      `───────────────────────────────────────────\n` +
      `⚡ Type : /pair 242...\n\n` +
      `═══════════════════════════════════════════`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '📢 Rejoindre la chaîne', url: CHANNEL_LINK }]]
    }
  });
});

// ================= HELP =================
bot.onText(/\/help/, async (msg) => {
  if (!(await requireJoin(msg))) return;
  await bot.sendMessage(msg.chat.id,
    `📖 *AIDE — ${BOT_NAME}*\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔹 */start*  →  Démarrer le bot\n` +
    `🔹 */pair <numéro>*  →  Lier WhatsApp\n` +
    `   _Ex : /pair 242061234567_\n` +
    `🔹 */menu*  →  Afficher le menu\n` +
    `🔹 */link*  →  Rejoindre la chaîne\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📲 *Comment jumeler WhatsApp ?*\n` +
    `1. Envoyez /pair suivi de votre numéro (sans le +)\n` +
    `   Ex : /pair 242061234567\n` +
    `2. Attendez le code de jumelage (5 min)\n` +
    `3. WhatsApp → Appareils liés → Lier un appareil\n` +
    `4. Entrez le code reçu\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 *Commandes après connexion :*\n` +
    `• /tagall → Mentionner tous les membres\n` +
    `• /purge  → Retirer les membres (admin requis)\n` +
    `• /ban    → Bloquer/signaler en boucle\n\n` +
    `_Merci à MR KiRA TECH & Ego Tech 🌹_`,
    { parse_mode: 'Markdown' }
  );
});

// ================= LINK =================
bot.onText(/\/link/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `🔗 *Rejoins ma chaîne Telegram*\n\n${CHANNEL_LINK}\n\n_${BOT_NAME} by ${AUTHOR}_`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📢 Rejoindre', url: CHANNEL_LINK }]] }
    }
  );
});

// ================= PAIR =================
const pendingPairs = new Map(); // userId -> { phoneNumber, sock }

bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  if (!(await requireJoin(msg))) return;
  const chatId = msg.chat.id;

  let raw = (match[1] || '').trim();
  if (!raw) {
    return bot.sendMessage(chatId,
      `⚠️ *Usage :* /pair <numéro sans le +>\n_Ex : /pair 242061234567_`,
      { parse_mode: 'Markdown' }
    );
  }

  const phoneNumber = raw.replace(/[^\d]/g, '');
  if (phoneNumber.length < 8 || phoneNumber.length > 15) {
    return bot.sendMessage(chatId, `❌ Numéro invalide : *${raw}*`, { parse_mode: 'Markdown' });
  }

  await bot.sendMessage(chatId, `📡 Demande en cours pour *${phoneNumber}* 🔁`, { parse_mode: 'Markdown' });

  try {
    // Nettoyer toute session précédente pour ce numéro
    const sessionPath = path.join(SESSIONS_DIR, `session_${chatId}`);
    if (fs.existsSync(sessionPath)) fs.removeSync(sessionPath);
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
      syncFullHistory: false
    });

    pendingPairs.set(chatId, { phoneNumber, sock, saveCreds });

    // Sauvegarde des creds
    sock.ev.on('creds.update', saveCreds);

    // Gestion connexion
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, isNewLogin } = update;

      if (isNewLogin) {
        console.log(`[WA ${phoneNumber}] Nouveau login détecté`);
      }

      if (connection === 'open') {
        console.log(`[WA ${phoneNumber}] Connecté ✅`);
        pendingPairs.delete(chatId);

        // Message dans le chat Telegram
        await bot.sendPhoto(chatId, BOT_IMAGE, {
          caption:
            `Félicitations 🎉\n` +
            `Le bot a été connecté avec succès ✅\n\n` +
            `Taper /help sur votre compte WhatsApp pour utiliser le bot\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `📢 *Rejoins la chaîne WhatsApp :*\n${WHATSAPP_CHANNEL}\n\n` +
            `_Merci à ${AUTHOR} & Ego Tech 🌹🌹_`,
          parse_mode: 'Markdown'
        }).catch(() => {});

        // Message envoyé à son propre compte WhatsApp (Note à soi-même)
        try {
          const selfJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
          await sock.sendMessage(selfJid, {
            image: { url: BOT_IMAGE },
            caption:
              `Bot is connect ✅ tape /help for use the bot\n\n` +
              `Join my channel WhatsApp\n\n` +
              `Link : ${WHATSAPP_CHANNEL}\n\n` +
              `Merci à Kira Tech & Ego Tech 🌹🌹`
          });
        } catch (e) {
          console.error('[WA] Envoi message post-connexion échoué:', e.message);
        }
      }

      if (connection === 'close') {
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(`[WA ${phoneNumber}] Fermé (code ${statusCode})`);

        if (statusCode === DisconnectReason.loggedOut) {
          pendingPairs.delete(chatId);
          await bot.sendMessage(chatId, `❌ Failed : le bot n'a pas pu être connecté, veuillez réessayer.`).catch(() => {});
        } else if (pendingPairs.has(chatId)) {
          // Tentative de reconnexion uniquement si le code n'a pas encore été utilisé
          try {
            await delay(2000);
            const { state: st2, saveCreds: sc2 } = await useMultiFileAuthState(sessionPath);
            const s2 = makeWASocket({
              version,
              logger: pino({ level: 'silent' }),
              browser: Browsers.macOS('Desktop'),
              auth: { creds: st2.creds, keys: makeCacheableSignalKeyStore(st2.keys, pino({ level: 'silent' })) }
            });
            s2.ev.on('creds.update', sc2);
            pendingPairs.set(chatId, { phoneNumber, sock: s2, saveCreds: sc2 });
          } catch (e) {
            console.error('[WA] reconnexion échouée', e.message);
          }
        }
      }
    });

    // Attendre un peu avant de demander le code
    await delay(2500);

    if (!sock.authState.creds.registered) {
      await bot.sendMessage(chatId,
        `📲 Demande de pairing code pour *${phoneNumber}*... 🔄`,
        { parse_mode: 'Markdown' }
      );

      let code;
      try {
        code = await sock.requestPairingCode(phoneNumber);
      } catch (e) {
        console.error('[PAIR] requestPairingCode error:', e.message);
        pendingPairs.delete(chatId);
        return bot.sendMessage(chatId, `❌ Échec de génération du code. Réessayez plus tard.`);
      }

      const pretty = code?.match(/.{1,4}/g)?.join('-') || code;

      await bot.sendMessage(chatId,
        `════════════════════════════════════════\n` +
        `🔑 *Code de jumelage* :\n` +
        `        \`${pretty}\`\n` +
        `════════════════════════════════════════\n\n` +
        `👉 *Instructions :*\n` +
        `- Ouvrez WhatsApp sur votre téléphone.\n` +
        `- Allez dans "Appareils liés" → "Lier un appareil".\n` +
        `- Entrez ce code pour associer ce bot.\n\n` +
        `_Merci à MR KiRA TECH & Mr Ego Tech 🌹_`,
        { parse_mode: 'Markdown' }
      );

      // Expiration après 5 min
      setTimeout(async () => {
        if (pendingPairs.has(chatId)) {
          const entry = pendingPairs.get(chatId);
          try { entry.sock?.ws?.close(); } catch {}
          pendingPairs.delete(chatId);
          await bot.sendMessage(chatId,
            `⌛ *Code expiré (5 min).*\nLe bot n'a pas été connecté. Veuillez refaire /pair.`,
            { parse_mode: 'Markdown' }
          ).catch(() => {});
        }
      }, 5 * 60 * 1000);
    }
  } catch (err) {
    console.error('[PAIR] Erreur:', err);
    await bot.sendMessage(chatId, `❌ Erreur : ${err.message}`);
  }
});

// ================= KEEPALIVE (anti sleep Render) =================
setInterval(() => {
  console.log(`[KEEPALIVE] ${new Date().toISOString()} - ${BOT_NAME} alive`);
}, 4 * 60 * 1000);

process.on('uncaughtException', (err) => console.error('[UNCAUGHT]', err));
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err));
