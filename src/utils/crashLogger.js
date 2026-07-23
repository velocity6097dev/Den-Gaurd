const { AttachmentBuilder } = require('discord.js');
const { sendToChannel } = require('./logChannel');
const { ERROR_CHANNEL_ID } = require('../config');

/**
 * Posts an error to the crash-log channel. Short stacks go in a code
 * block; long stacks go as a .txt attachment since Discord truncates
 * long messages/embeds.
 */
async function reportError(client, label, error) {
    const stack = (error && error.stack) || String(error);
    const header = `🚨 **${label}** — ${new Date().toISOString()}`;

    // Always log locally too, in case Discord itself is unreachable.
    console.error(header);
    console.error(stack);

    if (!client || !client.isReady || !client.isReady()) {
        // Not logged in yet - nothing we can post to Discord.
        return;
    }

    if (stack.length < 1800) {
        await sendToChannel(client, ERROR_CHANNEL_ID, {
            content: `${header}\n\`\`\`js\n${stack}\n\`\`\``,
        });
    } else {
        const file = new AttachmentBuilder(Buffer.from(stack, 'utf8'), { name: 'error.txt' });
        await sendToChannel(client, ERROR_CHANNEL_ID, {
            content: header,
            files: [file],
        });
    }
}

/**
 * Wires up process-level and client-level error handlers.
 * Called once from index.js, right after the client is created.
 */
function setupCrashLogger(client) {
    process.on('uncaughtException', async (error) => {
        await reportError(client, 'Uncaught Exception (bot is crashing)', error);
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        await reportError(client, 'Unhandled Promise Rejection', error);
    });

    client.on('error', async (error) => {
        await reportError(client, 'Discord Client Error', error);
    });

    client.on('shardError', async (error) => {
        await reportError(client, 'Discord Shard Error', error);
    });
}

module.exports = { setupCrashLogger, reportError };