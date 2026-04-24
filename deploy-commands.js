/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// deploy-commands.js
// Run this ONCE to register slash commands with Discord.
// Do NOT run this on every bot start — it's rate-limited.
//
// Usage: node deploy-commands.js
/////////////////////////////////////////////////////////////////

const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = require('./config');
const { commands } = require('./commands');

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Registering ${commands.length} slash commands...`);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('Slash commands registered successfully.');
    } catch (error) {
        console.error('Failed to register commands:', error);
        process.exit(1);
    }
})();
