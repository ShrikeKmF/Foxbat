/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// handlers/interactionHandler.js
// Handles all slash command interactions
/////////////////////////////////////////////////////////////////

const { RTG_ORBAT_ID, MEMBER_ROSTER, VERSION_ID, LOG_CHANNEL_ID } = require('../config');
const {
    CONTRACTOR, PROBATION, FREELANCER, MERCENARY,
    GUEST, ALL_ROLES, SECTION_ROLES, HR, TEAM_LEAD,
} = require('../roles');
const { updateCellInRow, removeUserFromSheet, isCellEmpty, todayAsSerial } = require('../utils/sheets');
const { logCommandUsage } = require('../utils/logger');

/**
 * Register the interactionCreate event on the Discord client.
 * @param {Client} client - Discord.js client
 * @param {Function} hasPermission - Permission check function from logger.js
 */
function registerInteractionHandler(client, hasPermission) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const { commandName, options } = interaction;
        const member = await interaction.guild.members.fetch(interaction.member);

        if (!await hasPermission(client, member, commandName)) {
            return interaction.reply({
                content: 'You do not have the required role to use this command.',
                ephemeral: true,
            });
        }

        // ── /refresh ────────────────────────────────────────────────────────
        if (commandName === 'refresh') {
            try {
                await updateVoiceChannel(client);
                await interaction.reply('Voice channel name refreshed.');
                logCommandUsage(client, commandName, member, 'Manual refresh');
            } catch (error) {
                console.error('[refresh] Failed:', error);
            }
        }

        // ── /test ────────────────────────────────────────────────────────────
        if (commandName === 'test') {
            try {
                await interaction.reply('testing 123');
                logCommandUsage(client, commandName, member, 'Test command run');
            } catch (error) {
                console.error('[test] Failed:', error);
            }
        }

        // ── /recruit ─────────────────────────────────────────────────────────
        if (commandName === 'recruit') {
            try {
                const user = options.getUser('user');
                const targetMember = await interaction.guild.members.fetch(user.id);
                const todayDate = todayAsSerial();

                await interaction.reply(`${user.username} has been recruited.`);

                // ORBAT
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, 'Vacant', 'A', user.tag);
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', 'Probation');
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', 'Probation');
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'J', todayDate);

                // Discord roles
                await targetMember.roles.add([CONTRACTOR, PROBATION, FREELANCER]);
                await targetMember.roles.remove(GUEST);

                // Notify HR
                const hrRole = await interaction.guild.roles.fetch(HR);
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                await logChannel.send(`${hrRole} — ${user} has completed their interview.`);

                logCommandUsage(client, commandName, member, `Recruited ${user.username}`);
            } catch (error) {
                console.error('[recruit] Failed:', error);
            }
        }

        // ── /remove ──────────────────────────────────────────────────────────
        if (commandName === 'remove') {
            try {
                const user = options.getUser('user');
                const targetMember = await interaction.guild.members.fetch(user.id);

                await interaction.reply(`${user.username} has been removed.`);

                // ORBAT
                await removeUserFromSheet(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag);

                // Discord roles
                await targetMember.roles.remove(ALL_ROLES);
                await targetMember.roles.add(GUEST);

                logCommandUsage(client, commandName, member, `Removed ${user.username}`);
            } catch (error) {
                console.error('[remove] Failed:', error);
            }
        }

        // ── /probation-op ────────────────────────────────────────────────────
        if (commandName === 'probation-op') {
            try {
                const user = options.getUser('user');
                const targetMember = await interaction.guild.members.fetch(user.id);
                const todayDate = todayAsSerial();

                await interaction.reply(`${user.username} has completed a probation op.`);

                // Fill the next empty op slot (K → L → M → N)
                // If N is also filled, probation ends automatically.
                const opColumns = ['K', 'L', 'M', 'N'];
                let probationEnded = false;

                for (const col of opColumns) {
                    if (await isCellEmpty(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, col)) {
                        await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, col, todayDate);

                        // Completing the N slot means probation is done
                        if (col === 'N') {
                            probationEnded = true;
                        }
                        break;
                    }
                }

                // If all 4 op slots were already filled, probation is also done
                const allFilled = !(await opColumns.reduce(async (anyEmpty, col) => {
                    return (await anyEmpty) || (await isCellEmpty(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, col));
                }, Promise.resolve(false)));

                if (probationEnded || allFilled) {
                    await targetMember.roles.remove(PROBATION);
                    await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', 'Active');
                    await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', 'Freelancer');
                    logCommandUsage(client, commandName, member, `Probation auto-ended for ${user.username}`);
                }

                logCommandUsage(client, commandName, member, `Probation op recorded for ${user.username}`);
            } catch (error) {
                console.error('[probation-op] Failed:', error);
            }
        }

        // ── /probation-end ───────────────────────────────────────────────────
        if (commandName === 'probation-end') {
            try {
                const user = options.getUser('user');
                const targetMember = await interaction.guild.members.fetch(user.id);

                await interaction.reply(`${user.username}'s probation has been ended.`);

                await targetMember.roles.remove(PROBATION);
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', 'Active');
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', 'Freelancer');

                logCommandUsage(client, commandName, member, `Force-ended probation for ${user.username}`);
            } catch (error) {
                console.error('[probation-end] Failed:', error);
            }
        }

        // ── /stats ───────────────────────────────────────────────────────────
        if (commandName === 'stats') {
            try {
                const uptime = process.uptime();
                const d = Math.floor(uptime / 86400);
                const h = Math.floor((uptime % 86400) / 3600);
                const m = Math.floor((uptime % 3600) / 60);
                const s = Math.floor(uptime % 60);

                await interaction.reply(`**Foxbat** v${VERSION_ID} — Uptime: ${d}d ${h}h ${m}m ${s}s`);
                logCommandUsage(client, commandName, member, 'Stats requested');
            } catch (error) {
                console.error('[stats] Failed:', error);
            }
        }
    });
}

// Exported separately so bot.js can also call it on a timer
async function updateVoiceChannel(client) {
    const { GUILD_ID, VOICE_CHANNEL_ID } = require('../config');
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const voiceChannel = await guild.channels.fetch(VOICE_CHANNEL_ID);
        const members = await guild.members.fetch();
        const count = members.filter(m => m.roles.cache.has(CONTRACTOR)).size;
        await voiceChannel.setName(`Contractors: ${count}`);
        console.log(`[VoiceChannel] Updated to "Contractors: ${count}"`);
    } catch (error) {
        console.error('[VoiceChannel] Update failed:', error);
    }
}

module.exports = { registerInteractionHandler, updateVoiceChannel };
