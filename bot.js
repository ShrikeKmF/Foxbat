/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
// Bot.js
// Main File for Foxbat
//
// Discord: https://discord.gg/raidertacticalgroup
/////////////////////////////////////////////////////////////////

// Import Roles
const {
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
    ALLOWEDROLES,
    ALL_ROLES,
    HR
  } = require('./roles.js'); // Import from roles.js

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
const VERSION_ID = '1.1.1'; // Main.Feature.Hotfix


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
const HR_CHANNEL_ID = '952905680338165821';

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

// Log command usage and conditions
async function logCommandUsage(commandName, user, conditions) {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID); 
    console.log(`Command: /${commandName} used by ${user.displayName} with conditions: ${conditions}`);
    await logChannel.send(`Command: /${commandName} used by ${user} with conditions: ${conditions}`);
}

// Check if user has any of the allowed roles to use the command
async function hasPermission(member) {
    const DoesUserHavePermission = ALLOWEDROLES.some(role => member.roles.cache.has(role));
    
    if (DoesUserHavePermission)
    {
        console.log('Passed Permissions Check:', member.user.username);
    }
    else
    {
        logCommandUsage("Permission Check Failed by:", member, 'Attempted to use restricted Command');
    };
    
    return DoesUserHavePermission;
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

// Function to check if a cell in a specific column contains data based on a search in column A
async function checkCellData(spreadsheetId, sheetName, searchName, targetColumn) {
    try {
        // Fetch the sheet data using Google Sheets API (make sure to set up Google Sheets API and authentication)
        const getSheetData = async (spreadsheetId, sheetName) => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
            });
            return response.data.values;
        };

        const columnToIndex = (column) => {
            return column.toUpperCase().charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
        };

        const sheetData = await getSheetData(spreadsheetId, sheetName);

        // Find the row where the name matches in Column A
        const row = sheetData.find(row => row[0] === searchName); // Column A is index 0

        // If a matching row is found, check the value in the target column
        if (row) {
            // Convert column letter to index
            const targetCell = columnToIndex(targetColumn);

            // Get the value of the target cell
            const cellValue = row[targetCell] || "";
            console.log(cellValue);
            
            if (typeof cellValue === 'undefined' || cellValue === '')
            {
                console.log("true");
                return true;
            }
            
            console.log("false");
            return false;
        } else {
            console.log('Name not found in column A.');
            return false; // Return false if the name is not found
        }
    } catch (error) {
        console.error('Error checking cell data:', error);
        return false; // Return false in case of error
    }
}

// Interaction Functionality Setup
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Get the member object for the user who invoked the command
    const member = await interaction.guild.members.fetch(interaction.member);
    

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
            logCommandUsage(commandName, member, 'Manual refresh of voice channel name');
        } catch (error) {
            console.error('Command Refresh Failed:', error);
        }
    }

    // Handle each command
    if (commandName === 'test') {
        try {
            await interaction.reply('testing 123');
            logCommandUsage(commandName, member, 'No specific conditions');
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

            // Time Today
            const referenceDate = new Date(1899, 11, 30); // December 30, 1899 (note: months are 0-indexed)
            const todayDate = Math.floor(((new Date()) - referenceDate) / (1000 * 60 * 60 * 24));
            console.log(todayDate);
    
            // Updating Order of Battle
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, 'Vacant', 'A', user.tag);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Probation");
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Probation");
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'J', todayDate);
    
            // Updating Discord
            await targetMember.roles.add([
                CONTRACTOR,
                PROBATION,
                FREELANCER
            ]);
            await targetMember.roles.remove(GUEST);

            // @HR In #human-resources channel
            const hr_group = await interaction.guild.roles.fetch(HR);
            const hrchannel = await client.channels.fetch(LOG_CHANNEL_ID); 
            await hrchannel.send(`${hr_group} ${user} Has Completed Their Interview`);
    
            // Logging
            logCommandUsage(commandName, member, `Recruiting user ${user}`);
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
            logCommandUsage(commandName, member, `Removing user ${user}`);
        } catch (error) {
            console.error('Command Remove Failed:', error);
        }
    }

    // Probation op command
    if (commandName === 'probation-op') {
        try {
            const user = options.getUser('user');
            const targetMember = await interaction.guild.members.fetch(user.id);
            await interaction.reply(`${user.tag} has completed an op of their probation.`);
            
            // Time Today
            const referenceDate = new Date(1899, 11, 30); // December 30, 1899 (note: months are 0-indexed)
            const todayDate = Math.floor(((new Date()) - referenceDate) / (1000 * 60 * 60 * 24));
            console.log(todayDate);


            // Setting Probation Date on Order Of Battle
            // Probably can be optimized 
            if (await checkCellData(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, "K") === true)
            {
                updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'K', todayDate);
            } else if (await checkCellData(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, "L") === true)
            {
                updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'L', todayDate);
            } else if (await checkCellData(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, "M") === true)
            {
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'M', todayDate);
            } else if (await checkCellData(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, "N") === true)
            {
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'N', todayDate);
                await targetMember.roles.remove(PROBATION); // Remove probation role
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Active");
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Freelancer");
                
                logCommandUsage(commandName, member, `Ending probation for ${user}`);
            } else
            {
                console.log("5");
                await targetMember.roles.remove(PROBATION); // Remove probation role
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Active");
                await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Freelancer");
                
                logCommandUsage(commandName, member, `Ending probation for ${user}`);
            }
            console.log(todayDate);
            
            // Logging
            logCommandUsage(commandName, member, `Probabtion Operation ${user}`);
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
            
            logCommandUsage(commandName, member, `Ending probation for ${user}`);
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
    
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', sectionRole.name);
    
            // Remove all section roles and general role
            await targetMember.roles.remove(sectionRolesToRemove);
            await targetMember.roles.remove(MERCANARY);
    
            // Add the new section role
            await targetMember.roles.add(sectionRole);
            if (sectionRole != FREELANCER)
            {
                await targetMember.roles.add(MERCANARY);
            }

            // @HR In #human-resources channel
            const hr_group = await interaction.guild.roles.fetch(HR);
            const hrchannel = await client.channels.fetch(LOG_CHANNEL_ID); 
            await hrchannel.send(`${hr_group} Switching ${user} to section ${sectionRole.name}`);
            
            logCommandUsage(commandName, member, `Switching ${user} to section ${sectionRole.name}`);
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
    
            
            logCommandUsage(commandName, member, `Switching ${user} to role ${roleName}`);
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
            logCommandUsage(commandName, member, `Bot uptime requested`);
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