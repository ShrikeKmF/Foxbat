const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables from auth.env
dotenv.config({ path: 'auth.env' });

// Get environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error('Error: Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in auth.env.');
    process.exit(1);
}

// Define the slash commands
const commands = [
    {
        name: 'test',
        description: 'Testing',
    },
];

// Create a REST client
const rest = new REST({ version: '10' }).setToken(token);

// Deploy the commands
(async () => {
    try {
        console.log('Started refreshing slash commands.');

        // Register commands for a specific guild
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Successfully reloaded slash commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
