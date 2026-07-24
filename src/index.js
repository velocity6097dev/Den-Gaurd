const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const ready = require('./events/ready');
const messageCreate = require('./events/messageCreate');
const interactionCreate = require('./events/interactionCreate'); // NEW: Import slash command handler
const { setupCrashLogger } = require('./utils/crashLogger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // NEW: Required to fetch members/roles for moderation commands
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // required to read plain-text commands and counts
    ],
});

// --- NEW: Initialize Command Collection for Slash Commands ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Read the commands directory and load the files
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// -----------------------------------------------------------

// Wired up before login so it catches errors during startup too.
setupCrashLogger(client);

// Event Handlers
client.once('clientReady', () => ready(client));
client.on('messageCreate', messageCreate);

// NEW: Wire up the interactionCreate event to handle Slash Commands
client.on('interactionCreate', async (interaction) => {
    // Check if the exported module has an execute function (based on standard discord.js setup)
    if (typeof interactionCreate.execute === 'function') {
        await interactionCreate.execute(interaction, client);
    } else if (typeof interactionCreate === 'function') {
        // Fallback in case you exported it as a direct function like messageCreate
        await interactionCreate(interaction, client);
    }
});

client.login(TOKEN);