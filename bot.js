// Role IDs as variables
const UNIT_COMMANDER = '1033575125821440010'; // Unit Commander
const MERC_COUNCIL = '669012442679869459'; // Merc Council
const HR_LEAD = '952904175207981066'; // HR Lead
const HR = '1258905966842220676'; // HR
const RD = '952904217557876887'; // R&D
const TEAM_LEAD = '1138339232482611270'; // Team Lead
const HITMAN = '1138339155110269050'; // Hitman
const ARES = '1169170782539235399'; // Ares
const FENRIR = '1310054368527253595'; // Fenrir
const SABRE = '1138339180854902795'; // Sabre
const FIREBRAND = '1138339212446400573'; // Firebrand
const FREELANCER = '669012337877057581'; // Freelancer
const MERCANARY = '669012403211599912'; // Freelancer
const CONTRACTOR = '987956876895457332'; // Contractor
const PROBATION = '1052884968516362311'; // Probation
const GUEST = '669029865399517206'; // Guest

const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Retrieve the bot token and client ID from the .env file
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Your server's ID (make sure this is in your .env file)

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
    {
        name: 'test',
        description: 'Responds with "testing 123"',
    },
    {
        name: 'recruit',
        description: 'Add roles for a user',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to recruit',
                required: true,
            },
        ],
    },
    {
        name: 'remove',
        description: 'Remove roles for a user',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to remove',
                required: true,
            },
        ],
    },
    {
        name: 'probation-op',
        description: 'Announce that a user has completed an op of their probation',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to announce',
                required: true,
            },
        ],
    },
    {
        name: 'probation-end',
        description: 'Announce and remove probation role from a user',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to end probation for',
                required: true,
            },
        ],
    },
    {
        name: 'section-switch',
        description: 'Switch a user’s section role',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to switch section for',
                required: true,
            },
            {
                name: 'section',
                type: 3, // STRING type for section choice
                description: 'Section to assign user',
                required: true,
                choices: [
                    { name: 'Hitman', value: HITMAN },
                    { name: 'Ares', value: ARES },
                    { name: 'Fenrir', value: FENRIR },
                    { name: 'Sabre', value: SABRE },
                    { name: 'Firebrand', value: FIREBRAND },
                    { name: 'Freelancer', value: FREELANCER },
                ],
            },
        ],
    },
    {
        name: 'join-server',
        description: 'Respond with a server invite link',
    },
    {
        name: 'stats',
        description: 'Show the bot’s uptime',
    },
    {
        name: 'role-switch',
        description: 'Switch the role of a user',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'User to switch role for',
                required: true,
            },
            {
                name: 'role',
                type: 3, // STRING type
                description: 'Role to assign to the user',
                required: true,
                choices: [
                    { name: 'Team Lead', value: 'Team Lead' },
                    { name: '2ic', value: '2ic' },
                    { name: 'Pilot', value: 'Pilot' },
                    { name: 'Crew Chief', value: 'Crew Chief' },
                    { name: 'JTAC', value: 'JTAC' },
                    { name: 'Member', value: 'Member' },
                ],
            },
        ],
    },
];

// Register slash commands with Discord
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Foxbot is online! Logged in as ${client.user.tag}`);
});

// Check if user has any of the allowed roles
async function hasPermission(member) {
    return allowedRoles.some(role => member.roles.cache.has(role));
}

// Log command usage and conditions
async function logCommandUsage(commandName, user, conditions) {
    const logChannel = await client.channels.fetch('1322143539563466854'); // Channel ID to log to
    await logChannel.send(`Command: /${commandName} used by ${user.tag} with conditions: ${conditions}`);
}

// Event: Interaction Create
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

    // Handle each command
    if (commandName === 'test') {
        await interaction.reply('testing 123');
        logCommandUsage(commandName, interaction.user, 'No specific conditions');
    }

    // Recruit command
    if (commandName === 'recruit') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.set([
            CONTRACTOR, // Add the roles here as per your requirement
            PROBATION,
            FREELANCER,
        ]);
        await interaction.reply(`${user.tag} has been recruited.`);
        logCommandUsage(commandName, interaction.user, `Recruiting user ${user.tag}`);
    }

    // Remove command
    if (commandName === 'remove') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.set([GUEST]); // Remove all roles and add this one
        await interaction.reply(`${user.tag} has been removed.`);
        logCommandUsage(commandName, interaction.user, `Removing user ${user.tag}`);
    }

    // Probation op command
    if (commandName === 'probation-op') {
        const user = options.getUser('user');
        await interaction.reply(`${user.tag} has completed an op of their probation.`);
        logCommandUsage(commandName, interaction.user, `Announcing probation completion for ${user.tag}`);
    }

    // Probation end command
    if (commandName === 'probation-end') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.remove(PROBATION); // Remove probation role
        await interaction.reply(`${user.tag} has completed their probation.`);
        logCommandUsage(commandName, interaction.user, `Ending probation for ${user.tag}`);
    }

    // Section switch command
    if (commandName === 'section-switch') {
        const user = options.getUser('user');
        const section = options.getString('section');
        const member = await interaction.guild.members.fetch(user.id);
        const sectionRole = await interaction.guild.roles.fetch(section);
        const currentRoles = member.roles.cache;

        // Remove old section roles
        const sectionRolesToRemove = [
            HITMAN,
            ARES,
            FENRIR,
            SABRE, 
            FIREBRAND,
            FREELANCER
        ];

        // Remove all section roles and general role
        await member.roles.remove(sectionRolesToRemove);
        await member.roles.remove(MERCANARY);

        // Add the new section role
        await member.roles.add(sectionRole);
        if (sectionRole != FREELANCER)
        {
            await member.roles.add(MERCANARY);
        }
        
        await interaction.reply(`${user.tag} has switched to section ${sectionRole.name}.`);
        logCommandUsage(commandName, interaction.user, `Switching ${user.tag} to section ${sectionRole.name}`);
    }

    // Role Switch command
    if (commandName === 'role-switch') {
        const user = options.getUser('user');
        const roleName = options.getString('role');
        const member = await interaction.guild.members.fetch(user.id);
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

        // Add the new role if applicable
        if (roles[roleName]) {
            await member.roles.add(roles[roleName]);
        } else {
            await member.roles.remove(TEAM_LEAD); // Remove the Team Lead role if no role
        }

        await interaction.reply(`${user.tag} has switched to role ${roleName}.`);
        logCommandUsage(commandName, interaction.user, `Switching ${user.tag} to role ${roleName}`);
    }

    // Stats command
    if (commandName === 'stats') {
        const uptime = process.uptime(); // Get the bot uptime in seconds
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        await interaction.reply(`Bot Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        logCommandUsage(commandName, interaction.user, `Bot uptime requested`);
    }
});

// Log in to Discord
client.login(TOKEN);