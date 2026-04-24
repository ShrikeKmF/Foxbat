/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
// bot.js — Entry point.
//
// Discord: https://discord.gg/D55THJWxn4
/////////////////////////////////////////////////////////////////

const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN } = require('./config');
const { hasPermission } = require('./utils/logger');
const { registerInteractionHandler, updateVoiceChannel } = require('./handlers/interactionHandler');

// ── Discord client ───────────────────────────────────────────────────────────
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// ── Ready ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
    console.log(`[Foxbat] Online as ${client.user.tag}`);

    // Refresh contractor count immediately on startup, then every 5 minutes
    updateVoiceChannel(client);
    setInterval(() => updateVoiceChannel(client), 5 * 60 * 1000);
});

// ── Register command handlers ────────────────────────────────────────────────
registerInteractionHandler(client, hasPermission);

// ── Login ────────────────────────────────────────────────────────────────────
client.login(DISCORD_TOKEN).catch(error => {
    console.error('[Foxbat] Failed to log in to Discord:', error);
    process.exit(1);
});
