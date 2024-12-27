const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Retrieve the bot token and client ID from the .env file
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const GUILD_ID = process.env.GUILD_ID; // Your server's ID (make sure this is in your .env file)

// Define the roles that are allowed to run certain commands
const allowedRoles = [
    '1033575125821440010', // Role 1
    '669012442679869459', // Role 2
    '952904175207981066', // Role 3
    '1258905966842220676', // Role 4
    '952904217557876887', // Role 5
    '1138339232482611270' // Role 6
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
                    { name: 'Hitman', value: '1138339155110269050' },
                    { name: 'Ares', value: '1169170782539235399' },
                    { name: 'Fenrir', value: '1310054368527253595' },
                    { name: 'Sabre', value: '1138339180854902795' },
                    { name: 'Firebrand', value: '1138339212446400573' },
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
    }

    // Recruit command
    if (commandName === 'recruit') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.set([
            '987956876895457332', // Add the roles here as per your requirement
            '1052884968516362311',
            '669012337877057581',
        ]);
        await interaction.reply(`${user.tag} has been recruited.`);
    }

    // Remove command
    if (commandName === 'remove') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.set(['669029865399517206']); // Remove all roles and add this one
        await interaction.reply(`${user.tag} has been removed.`);
    }

    // Probation op command
    if (commandName === 'probation-op') {
        const user = options.getUser('user');
        await interaction.reply(`${user.tag} has completed an op of their probation.`);
    }

    // Probation end command
    if (commandName === 'probation-end') {
        const user = options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.remove('1052884968516362311'); // Remove probation role
        await interaction.reply(`${user.tag} has completed their probation.`);
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
            '1138339155110269050', // Hitman
            '1169170782539235399', // Ares
            '1310054368527253595', // Fenrir
            '1138339180854902795', // Sabre
            '1138339212446400573', // Firebrand
        ];

        // Remove all section roles and general role
        await member.roles.remove(sectionRolesToRemove);
        await member.roles.remove('669012337877057581'); // Remove the general role

        // Add the new section role
        await member.roles.add(sectionRole);
        if (sectionRole != 1138339212446400573)
        {
            await member.roles.add('669012337877057581'); // Add the general role
        }

        await interaction.reply(`${user.tag} has switched to section ${sectionRole.name}.`);
    }

    // Role Switch command
    if (commandName === 'role-switch') {
        const user = options.getUser('user');
        const roleName = options.getString('role');
        const member = await interaction.guild.members.fetch(user.id);
        const roles = {
            'Team Lead': '1138339232482611270',
            '2ic': '1138339232482611270',
            'JTAC': '1138339232482611270',
        };
        const noRole = ['Pilot', 'Crew Chief', 'Member'];

        // Remove the Team Lead role if any
        if (member.roles.cache.has('1138339232482611270')) {
            await member.roles.remove('1138339232482611270');
        }

        // Add the new role if applicable
        if (roles[roleName]) {
            await member.roles.add(roles[roleName]);
        } else {
            await member.roles.remove('1138339232482611270'); // Remove the Team Lead role if no role
        }

        await interaction.reply(`${user.tag} has switched to role ${roleName}.`);
    }

    // Stats command
    if (commandName === 'stats') {
        const uptime = process.uptime(); // Get the bot uptime in seconds
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        await interaction.reply(`Bot Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
});

// Log in to Discord
client.login(TOKEN);
