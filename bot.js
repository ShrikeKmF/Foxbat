/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
// Bot.js
// Main File for Foxbat
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
    ALL_ROLES
  } = require('./roles'); // Import from roles.js

// Add required libraries
const { google } = require('googleapis');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Google Sheets credentials from JSON file
const credentialsPath = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Discord Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const VERSION_ID = '1.0';

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath, 
    scopes: SCOPES
});
const sheets = google.sheets({ version: 'v4', auth: auth });
const MEMBER_ROSTER = 'Member Roster';
const RTG_ORBAT_ID = '1AgXmqVKcYC2hk-P6pVmiChx7Ub3IhihnhgEv6W2DrQ8';

// Channels
const VOICE_CHANNEL_ID = '1322153808742318172';
const LOG_CHANNEL_ID = '1322143539563466854';

const {
    commands
  } = require('./commands'); // Import from commands.js


// Register slash commands with Discord
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started Reloading Application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('Successfully Reloaded Application (/) commands.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Foxbot is online! Logged in as ${client.user.tag}`);
});

// Check if user has any of the allowed roles
async function hasPermission(member) {
    console.log('Member:', member.user.username);
    return allowedRoles.some(role => member.roles.cache.has(role));
}

// Log command usage and conditions
async function logCommandUsage(commandName, user, conditions) {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID); 
    console.log(`Command: /${commandName} used by ${user.tag} with conditions: ${conditions}`);
    await logChannel.send(`Command: /${commandName} used by ${user.tag} with conditions: ${conditions}`);
}

// Function to update the voice channel name with the number of "Contractor" members
async function updateVoiceChannel() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const voiceChannel = await guild.channels.fetch(VOICE_CHANNEL_ID);

        // Get all members in the guild
        const members = await guild.members.fetch();

        // Count the number of members with the "Contractor" role
        const contractorCount = members.filter(member => member.roles.cache.has(CONTRACTOR)).size;

        // Update the voice channel name
        await voiceChannel.setName(`Contractors: ${contractorCount}`);
        //console.log(`Voice channel name updated to "Contractors: ${contractorCount}"`);
    } catch (error) {
        console.error('Error updating voice channel name:', error);
    }
}

// Update every 5 minutes
setInterval(updateVoiceChannel, 5 * 60 * 1000); // 5 minutes in milliseconds

async function updateCellInRow(spreadsheetId, sheetName, searchValue, column, newValue) {
    try {
        // Helper function: Convert column letter to index
        const columnToIndex = (column) => {
            return column.toUpperCase().charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
        };

        const columnIndex = columnToIndex(column);
        if (columnIndex < 0 || columnIndex > 25) {
            throw new Error('Invalid column input.');
        }

        // Helper function to check if newValue is a valid date
        const isValidDate = (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()); // Return true if it's a valid date
        };

        // If newValue is a valid date, format it as a string (Google Sheets accepts dates in YYYY-MM-DD format)
        if (isValidDate(newValue)) {
            newValue = new Date(newValue).toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        }

        // Fetch sheet data
        const getSheetData = async (spreadsheetId, sheetName) => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
            });
            return response.data.values;
        };
        const sheetData = await getSheetData(spreadsheetId, sheetName);

        // Find the row to update
        const rowIndex = sheetData.findIndex(row => row[0] === searchValue);
        if (rowIndex === -1) {
            console.warn(`Row with search value "${searchValue}" not found in sheet "${sheetName}".`);
            return; // Exit function gracefully
        }

        // Update the sheet
        const rowNumber = rowIndex + 1; // Convert to 1-based index for Google Sheets
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${column}${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[newValue]] },
        });

        console.log('Cell updated successfully.');
    } catch (error) {
        console.error('Error updating cell in row:', error);
    }
}

async function RemoveUser(spreadsheetId, sheetName, userTag) {
    try {

        // Set A to Vacant
        updateCellInRow(spreadsheetId, sheetName, userTag, "A", "Vacant")

        // Helper function: Convert column letter to index
        const columnToIndex = (column) => {
            return column.toUpperCase().charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
        };

        // Helper function: Get all columns except I
        const excludedColumns = ['I'];

        // Fetch sheet data
        const getSheetData = async (spreadsheetId, sheetName) => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
            });
            return response.data.values;
        };

        const sheetData = await getSheetData(spreadsheetId, sheetName);

        // Find the row to update
        const rowIndex = sheetData.findIndex(row => row[0] === userTag);
        if (rowIndex === -1) {
            console.warn(`Row with user tag "${userTag}" not found in sheet "${sheetName}".`);
            return; // Exit function gracefully
        }

        // Get the row number (1-based index for Google Sheets)
        const rowNumber = rowIndex + 1;

        // Loop through each column and clear values except for column 'I'
        for (let col = 0; col < sheetData[rowIndex].length; col++) {
            const columnLetter = String.fromCharCode(65 + col); // Convert index to column letter

            // Skip clearing column 'I'
            if (excludedColumns.includes(columnLetter)) {
                continue;
            }

            // Clear the cell in the specific column
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!${columnLetter}${rowNumber}`,
                valueInputOption: 'RAW',
                requestBody: { values: [['']] },
            });
        }

        console.log(`All cells for ${userTag} cleared except for column I, and column A set to "Vacant".`);
    } catch (error) {
        console.error('Error removing user:', error);
    }
}

// Function to format the date as dd/mm/yyyy
const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');  // Ensures 2-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Ensures 2-digit month
    const year = date.getFullYear();  // Full 4-digit year
    return `${day}/${month}/${year}`;  // Concatenate in dd/mm/yyyy format
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Get the member object for the user who invoked the command
    const member = await interaction.guild.members.fetch(interaction.user.id);
    

    // Check if the user has the required roles for the command
    if (!await hasPermission(member)) {
        return interaction.reply({
            content: 'You do not have the required role to use this command.',
            ephemeral: true,
        });
    }

    // Handle the refresh command
    if (commandName === 'refresh') {
        try {
            await updateVoiceChannel();
            await interaction.reply('Voice channel name refreshed.');
            logCommandUsage(commandName, user.tag, 'Manual refresh of voice channel name');
        } catch (error) {
            console.error('Command Refresh Failed:', error);
        }
    }

    // Handle each command
    if (commandName === 'test') {
        try {
            await interaction.reply('testing 123');
            console.log(commandName, user.tag, 'No specific conditions');
            logCommandUsage(commandName, user, 'No specific conditions');
        } catch (error) {
            console.error('Command Test Failed:', error);
        }
    }

    // Recruit command
    if (commandName === 'recruit') {
        try {
            const user = options.getUser('user');
            const targetMember = await interaction.guild.members.fetch(user.id);
            await interaction.reply(`${user.tag} has been recruited.`);
    
            // Updating Orbat
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, 'Vacant', 'A', user.tag);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Probation");
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Probation");
            const todayDate = formatDate(new Date());
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'J', todayDate);
    
            // Updating Discord
            await targetMember.roles.add([
                CONTRACTOR,
                PROBATION,
                FREELANCER
            ]);
            await targetMember.roles.remove(GUEST);
    
            // Logging
            console.log(commandName, user.tag, `Recruiting user ${user.tag}`);
            logCommandUsage(commandName, user, `Recruiting user ${user.tag}`);
        } catch (error) {
            console.error('Command Recruit Failed:', error);
        }
    }

    // Remove command
    if (commandName === 'remove') {
        try {
            const user = options.getUser('user');
            const targetMember = await interaction.guild.members.fetch(user.id);
            await interaction.reply(`${user.tag} has been removed.`);

            // Google Sheets
            await RemoveUser(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag);
    
            // Discord
            await targetMember.roles.add(GUEST);
            await targetMember.roles.remove(ALL_ROLES);

            // Logging
            console.log(commandName, user.tag, `Removing user ${user.tag}`);
            logCommandUsage(commandName, user, `Removing user ${user.tag}`);
        } catch (error) {
            console.error('Command Remove Failed:', error);
        }
    }

    // Probation op command
    if (commandName === 'probation-op') {
        try {
            const user = options.getUser('user');
            await interaction.reply(`${user.tag} has completed an op of their probation.`);

            console.log(commandName, user.tag, `Announcing probation completion for ${user.tag}`);
            logCommandUsage(commandName, user.tag, `Announcing probation completion for ${user.tag}`);
    
            const todayDate = formatDate(new Date());
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'K', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'L', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'M', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'N', todayDate);

            // Logging
            console.log(commandName, user.tag, `Probabtion Operation ${user.tag}`);
            logCommandUsage(commandName, user, `Probabtion Operation ${user.tag}`);
        } catch (error) {
            console.error('Command Probation Op Failed:', error);
        }
    }

    // Probation end command
    if (commandName === 'probation-end') {
        try {
            const user = options.getUser('user');
            const targetMember = await interaction.guild.members.fetch(user.id);
            await interaction.reply(`${user.tag} has completed their probation.`);
            
            await targetMember.roles.remove(PROBATION); // Remove probation role
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Active");
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Freelancer");
            
            console.log(commandName, user.tag, `Ending probation for ${user.tag}`);
            logCommandUsage(commandName, user, `Ending probation for ${user.tag}`);
        } catch (error) {
            console.error('Command Probation End Failed:', error);
        }
    }

    // Section switch command
    if (commandName === 'section-switch') {
        try {
            const user = options.getUser('user');
            const section = options.getString('section');    
            const sectionRole = await interaction.guild.roles.fetch(section);
            const targetMember = await interaction.guild.members.fetch(user.id);
            await interaction.reply(`${user.tag} has switched to section ${sectionRole.name}.`);        
    
            // Remove old section roles
            const sectionRolesToRemove = [
                HITMAN,
                ARES,
                FENRIR,
                SABRE, 
                FIREBRAND,
                FREELANCER
            ];
    
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', section);
    
            // Remove all section roles and general role
            await targetMember.roles.remove(sectionRolesToRemove);
            await targetMember.roles.remove(MERCANARY);
    
            // Add the new section role
            await targetMember.roles.add(sectionRole);
            if (sectionRole != FREELANCER)
            {
                await targetMember.roles.add(MERCANARY);
            }
            
            
            console.log(commandName, user.tag, `Switching ${user.tag} to section ${sectionRole.name}`);
            logCommandUsage(commandName, user, `Switching ${user.tag} to section ${sectionRole.name}`);
        } catch (error) {
            console.error('Command Section Switch Failed:', error);
        }
    }

    // Role Switch command
    if (commandName === 'role-switch') {
        try {
            const user = options.getUser('user');
            const targetMember = await interaction.guild.members.fetch(user.id);
            const roleName = options.getString('role');
            await interaction.reply(`${user.tag} has switched to role ${roleName}.`);
            
            const roles = {
                'Team Lead': TEAM_LEAD,
                '2ic': TEAM_LEAD,
                'JTAC': TEAM_LEAD,
            };
            const noRole = ['Pilot', 'Crew Chief', 'Member'];
    
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'D', roleName);
    
            // Add the new role if applicable
            if (roles[roleName]) {
                await targetMember.roles.add(roles[roleName]);
            } else {
                await targetMember.roles.remove(TEAM_LEAD);
            }
    
            
            console.log(commandName, user.tag, `Switching ${user.tag} to role ${roleName}`);
            logCommandUsage(commandName, user, `Switching ${user.tag} to role ${roleName}`);
        } catch (error) {
            console.error('Command Role Switch Failed:', error);
        }
    }

    // Stats command
    if (commandName === 'stats') {
        try {
            const uptime = process.uptime(); // Get the bot uptime in seconds
            const days = Math.floor(uptime / (24 * 60 * 60));
            const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((uptime % (60 * 60)) / 60);
            const seconds = Math.floor(uptime % 60);
    
            await interaction.reply(`Version ${VERSION_ID}, Bot Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
            console.log(commandName, user.tag, `Bot uptime requested`);
            logCommandUsage(commandName, user, `Bot uptime requested`);
        } catch (error) {
            console.error('Command Stats Failed:', error);
        }
    }
});

// Log in to Discord
try {
    client.login(TOKEN);
} catch (error) {
    console.log('Failed to Login to discord');
}