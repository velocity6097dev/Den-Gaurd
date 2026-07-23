const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const ready = require('./events/ready');
const messageCreate = require('./events/messageCreate');
const { setupCrashLogger } = require('./utils/crashLogger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // required to read plain-text commands and counts
    ],
});

// Wired up before login so it catches errors during startup too.
setupCrashLogger(client);

client.once('ready', () => ready(client));
client.on('messageCreate', messageCreate);

client.login(TOKEN);