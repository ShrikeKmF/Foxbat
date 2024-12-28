/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
//
// Discord: https://discord.gg/raidertacticalgroup
/////////////////////////////////////////////////////////////////

// Role IDs as variables
const UNIT_COMMANDER    = '1033575125821440010'; // Unit Commander
const MERC_COUNCIL      = '669012442679869459'; // Merc Council
const HR_LEAD           = '952904175207981066'; // HR Lead
const HR                = '1258905966842220676'; // HR
const INOPS             = '952904108501794816'; // Inops
const INOPS_IN_TRAINING = '1015799954750570566'; // Inops in Training
const ROLEPLAYER        = '1207151097727291443'; // Rolepalyer
const RD                = '952904217557876887'; // R&D
const TEAM_LEAD         = '1138339232482611270'; // Team Lead
const HITMAN            = '1138339155110269050'; // Hitman
const ARES              = '1169170782539235399'; // Ares
const FENRIR            = '1310054368527253595'; // Fenrir
const SABRE             = '1138339180854902795'; // Sabre
const FIREBRAND         = '1138339212446400573'; // Firebrand
const FREELANCER        = '669012337877057581'; // Freelancer
const MERCANARY         = '669012403211599912'; // Freelancer
const CONTRACTOR        = '987956876895457332'; // Contractor
const PROBATION         = '1052884968516362311'; // Probation
const GUEST             = '669029865399517206'; // Guest
const ALL_ROLES = [MERC_COUNCIL, HR_LEAD, HR, INOPS, INOPS_IN_TRAINING, ROLEPLAYER, RD, TEAM_LEAD, HITMAN, ARES, FENRIR, SABRE, FIREBRAND, FREELANCER, MERCANARY, CONTRACTOR, PROBATION];

// Add required libraries
const { google } = require('googleapis');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Google Sheets credentials from JSON file
const credentialsPath = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const GOOGLE_APIKEY =  process.env.GOOGLE_APIKEY;

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

// Define the roles that are allowed to run certain commands
const allowedRoles = [
    UNIT_COMMANDER,
    MERC_COUNCIL,
    HR_LEAD,
    HR,
    RD,
    TEAM_LEAD
];

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
            logCommandUsage(commandName, interaction.user.username, 'Manual refresh of voice channel name');
        } catch (error) {
            console.error('Command Refresh Failed:', error);
            await interaction.reply('An error occurred while refreshing the voice channel.');
        }
    }

    // Handle each command
    if (commandName === 'test') {
        try {
            await interaction.reply('testing 123');
            console.log(commandName, interaction.user.username, 'No specific conditions');
            logCommandUsage(commandName, interaction.user.username, 'No specific conditions');
        } catch (error) {
            console.error('Command Test Failed:', error);
            await interaction.reply('An error occurred while processing the test command.');
        }
    }

    // Recruit command
    if (commandName === 'recruit') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            await interaction.reply(`${user.tag} has been recruited.`);
    
            // Updating Orbat
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, 'Vacant', 'A', user.tag);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Probation");
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'C', "Probation");
            const todayDate = formatDate(new Date());
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'J', todayDate);
    
            // Updating Discord
            await member.roles.set([
                CONTRACTOR,
                PROBATION,
                FREELANCER
            ]);
            //await member.roles.remove(GUEST);
    
            // Logging
            console.log(commandName, interaction.user.username, `Recruiting user ${user.tag}`);
            logCommandUsage(commandName, interaction.user.username, `Recruiting user ${user.tag}`);
        } catch (error) {
            console.error('Command Recruit Failed:', error);
            await interaction.reply('An error occurred while recruiting the user.');
        }
    }

    // Remove command
    if (commandName === 'remove') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            await interaction.reply(`${user.tag} has been removed.`);

            // Google Sheets
            await RemoveUser(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag);
    
            // Discord
            await member.roles.add(GUEST);
            await member.roles.remove(ALL_ROLES);

            // Logging
            console.log(commandName, interaction.user.username, `Removing user ${user.tag}`);
            logCommandUsage(commandName, interaction.user.username, `Removing user ${user.tag}`);
        } catch (error) {
            console.error('Command Remove Failed:', error);
            await interaction.reply('An error occurred while removing the user.');
        }
    }

    // Probation op command
    if (commandName === 'probation-op') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            await interaction.reply(`${user.tag} has completed an op of their probation.`);

            console.log(commandName, interaction.user.username, `Announcing probation completion for ${user.tag}`);
            logCommandUsage(commandName, interaction.user.username, `Announcing probation completion for ${user.tag}`);
    
            const todayDate = formatDate(new Date());
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'K', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'L', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'M', todayDate);
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'N', todayDate);
        } catch (error) {
            console.error('Command Probation Op Failed:', error);
            await interaction.reply('An error occurred while processing probation completion.');
        }
    }

    // Probation end command
    if (commandName === 'probation-end') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            await interaction.reply(`${user.tag} has completed their probation.`);
            
            await member.roles.remove(PROBATION); // Remove probation role
            
            console.log(commandName, interaction.user.username, `Ending probation for ${user.tag}`);
            logCommandUsage(commandName, interaction.user.username, `Ending probation for ${user.tag}`);
            await updateCellInRow(sheets, RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'B', "Active");
        } catch (error) {
            console.error('Command Probation End Failed:', error);
            await interaction.reply('An error occurred while ending probation.');
        }
    }

    // Section switch command
    if (commandName === 'section-switch') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            const section = options.getString('section');
            await interaction.reply(`${user.tag} has switched to section ${sectionRole.name}.`);            
            const sectionRole = await interaction.guild.roles.fetch(section);
    
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
            await member.roles.remove(sectionRolesToRemove);
            await member.roles.remove(MERCANARY);
    
            // Add the new section role
            await member.roles.add(sectionRole);
            if (sectionRole != FREELANCER)
            {
                await member.roles.add(MERCANARY);
            }
            
            
            console.log(commandName, interaction.user.username, `Switching ${user.tag} to section ${sectionRole.name}`);
            logCommandUsage(commandName, interaction.user.username, `Switching ${user.tag} to section ${sectionRole.name}`);
        } catch (error) {
            console.error('Command Section Switch Failed:', error);
            await interaction.reply('An error occurred while switching sections.');
        }
    }

    // Role Switch command
    if (commandName === 'role-switch') {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const user = options.getUser('user');
            const roleName = options.getString('role');
            await interaction.reply(`${user.tag} has switched to role ${roleName}.`);
            
            const roles = {
                'Team Lead': TEAM_LEAD,
                '2ic': TEAM_LEAD,
                'JTAC': TEAM_LEAD,
            };
            const noRole = ['Pilot', 'Crew Chief', 'Member'];
    
            // Remove the Team Lead role if any
            if (member.roles.cache.has(TEAM_LEAD)) {
                await member.roles.remove(TEAM_LEAD);
            }
    
            await updateCellInRow(RTG_ORBAT_ID, MEMBER_ROSTER, user.tag, 'D', roleName);
    
            // Add the new role if applicable
            if (roles[roleName]) {
                await member.roles.add(roles[roleName]);
            } else {
                await member.roles.remove(TEAM_LEAD); // Remove the Team Lead role if no role
            }
    
            
            console.log(commandName, interaction.user.username, `Switching ${user.tag} to role ${roleName}`);
            logCommandUsage(commandName, interaction.user.username, `Switching ${user.tag} to role ${roleName}`);
        } catch (error) {
            console.error('Command Role Switch Failed:', error);
            await interaction.reply('An error occurred while switching roles.');
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
            console.log(commandName, interaction.user.username, `Bot uptime requested`);
            logCommandUsage(commandName, interaction.user.username, `Bot uptime requested`);
        } catch (error) {
            console.error('Command Stats Failed:', error);
            await interaction.reply('An error occurred while fetching stats.');
        }
    }
});

// Log in to Discord
try {
    client.login(TOKEN);
} catch (error) {
    console.log('Failed to Login to discord');
}