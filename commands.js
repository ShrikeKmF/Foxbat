/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// commands.js
// Slash Command Definitions for Foxbat
// Registered via deploy-commands.js (not on every bot start)
//
// Discord: https://discord.gg/D55THJWxn4
/////////////////////////////////////////////////////////////////

const {
    HITMAN, ARES, FENRIR, SABRE, FIREBRAND, FREELANCER,
} = require('./roles');

const commands = [
    {
        name: 'refresh',
        description: 'Manually refresh the contractors count in the voice channel',
    },
    {
        name: 'test',
        description: 'Responds with "testing 123"',
    },
    {
        name: 'recruit',
        description: 'Recruit a user — assigns roles and adds them to the ORBAT',
        options: [
            { name: 'user', type: 6, description: 'User to recruit', required: true },
        ],
    },
    {
        name: 'remove',
        description: 'Remove a user — strips roles and sets them to Guest',
        options: [
            { name: 'user', type: 6, description: 'User to remove', required: true },
        ],
    },
    {
        name: 'probation-op',
        description: 'Record that a user has completed a probation op',
        options: [
            { name: 'user', type: 6, description: 'User to record op for', required: true },
        ],
    },
    {
        name: 'probation-end',
        description: 'Force-end a user\'s probation',
        options: [
            { name: 'user', type: 6, description: 'User to end probation for', required: true },
        ],
    },
    {
        name: 'stats',
        description: 'Show the bot\'s version and uptime',
    },
];

module.exports = { commands };
