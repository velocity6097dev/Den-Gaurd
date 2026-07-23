const { EmbedBuilder } = require('discord.js');
const { sendToChannel } = require('../utils/logChannel');
const { recordCommand } = require('../state/analyticsState');
const { LOG_CHANNEL_ID } = require('../config');

/**
 * Call this whenever a command is invoked - whether it ran or was denied.
 * Logs it to LOG_CHANNEL_ID and records it for the !analytics command.
 *
 * @param {Client} client
 * @param {Message} message
 * @param {string} commandName  e.g. "!gta 6"
 * @param {{allowed?: boolean, args?: string[]}} options
 */
async function logCommand(client, message, commandName, { allowed = true, args = [] } = {}) {
    recordCommand(commandName, message.author.id, allowed);

    const embed = new EmbedBuilder()
        .setColor(allowed ? '#5865F2' : '#ed4245')
        .setAuthor({
            name: `${message.author.tag} (${message.author.id})`,
            iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(
            `**Command:** \`${commandName}\`\n` +
            `**Status:** ${allowed ? '✅ Executed' : '⛔ Denied (no permission)'}\n` +
            `**Args:** ${args.length ? `\`${args.join(' ')}\`` : '*none*'}\n` +
            `**Channel:** <#${message.channel.id}>`
        )
        .setTimestamp();

    await sendToChannel(client, LOG_CHANNEL_ID, { embeds: [embed] });
}

module.exports = { logCommand };