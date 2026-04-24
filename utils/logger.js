/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// utils/logger.js
// Logging and permission utilities
/////////////////////////////////////////////////////////////////

const { LOG_CHANNEL_ID } = require('../config');
const { ALLOWED_ROLES } = require('../roles');

// Commands that don't require elevated roles
const PUBLIC_COMMANDS = ['test', 'stats'];

/**
 * Log a command usage to console and the Discord log channel.
 * @param {Client} client      - Discord.js client
 * @param {string} commandName - The slash command name
 * @param {GuildMember} member - The member who ran the command
 * @param {string} conditions  - Human-readable description of what happened
 */
async function logCommandUsage(client, commandName, member, conditions) {
    const message = `Command: /${commandName} used by ${member} — ${conditions}`;
    console.log(`[Log] /${commandName} by ${member.user.username}: ${conditions}`);

    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        await logChannel.send(message);
    } catch (error) {
        console.error('[Log] Failed to send to log channel:', error);
    }
}

/**
 * Returns true if the member has at least one role in ALLOWED_ROLES,
 * OR if the command is public (test, stats).
 */
async function hasPermission(client, member, commandName) {
    if (PUBLIC_COMMANDS.includes(commandName)) return true;

    const permitted = ALLOWED_ROLES.some(role => member.roles.cache.has(role));

    if (!permitted) {
        await logCommandUsage(
            client,
            commandName,
            member,
            'Permission check failed — attempted restricted command'
        );
    }

    return permitted;
}

module.exports = { logCommandUsage, hasPermission };
