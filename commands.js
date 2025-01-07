/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
// commands.js
// Commands Def File for Foxbat
//
// Discord: https://discord.gg/raidertacticalgroup
/////////////////////////////////////////////////////////////////

const {
    UNIT_COMMANDER,
    MERC_COUNCIL,
    HR_LEAD,
    HR,
    INOPS,
    INOPS_IN_TRAINING,
    ROLEPLAYER,
    RD,
    TEAM_LEAD,
    HITMAN,
    ARES,
    FENRIR,
    SABRE,
    FIREBRAND,
    FREELANCER,
    MERCANARY,
    CONTRACTOR,
    PROBATION,
    GUEST,
    allowedRoles,
    ALL_ROLES
  } = require('./roles.js');

// Define the slash commands
const commands = [
    { name: 'refresh', description: 'Manually refresh the contractors count in the voice channel' },
    { name: 'test', description: 'Responds with "testing 123"' },
    { name: 'recruit', description: 'Add roles for a user', options: [{ name: 'user', type: 6, description: 'User to recruit', required: true }] },
    { name: 'remove', description: 'Remove roles for a user', options: [{ name: 'user', type: 6, description: 'User to remove', required: true }] },
    { name: 'probation-op', description: 'Announce that a user has completed an op of their probation', options: [{ name: 'user', type: 6, description: 'User to announce', required: true }] },
    { name: 'probation-end', description: 'Announce and remove probation role from a user', options: [{ name: 'user', type: 6, description: 'User to end probation for', required: true }] },
    { name: 'section-switch', description: 'Switch a user’s section role', options: [
        { name: 'user', type: 6, description: 'User to switch section for', required: true },
        { name: 'section', type: 3, description: 'Section to assign user', required: true, choices: [
            { name: 'Hitman', value: HITMAN }, { name: 'Ares', value: ARES }, { name: 'Fenrir', value: FENRIR },
            { name: 'Sabre', value: SABRE }, { name: 'Firebrand', value: FIREBRAND }, { name: 'Freelancer', value: FREELANCER }
        ]}
    ]},
    { name: 'role-switch', description: 'Switch the role of a user', options: [
        { name: 'user', type: 6, description: 'User to switch role for', required: true },
        { name: 'role', type: 3, description: 'Role to assign to the user', required: true, choices: [
            { name: 'Team Lead', value: 'Team Lead' }, { name: '2ic', value: '2ic' }, { name: 'Pilot', value: 'Pilot' },
            { name: 'Crew Chief', value: 'Crew Chief' }, { name: 'JTAC', value: 'JTAC' }, { name: 'Member', value: 'Member' }
        ]}
    ]},
    { name: 'stats', description: 'Show the bot’s stats' }
];

module.exports = {commands};