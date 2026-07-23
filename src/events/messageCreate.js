const { MAINTAINER_ID, COUNTING_CHANNEL_ID } = require('../config');
const countdown = require('../services/countdown');
const counting = require('../services/counting');
const { logCommand } = require('../services/commandLogger');
const { buildAnalyticsEmbed } = require('../services/analytics');

module.exports = async function messageCreate(message) {
    if (message.author.bot) return;

    if (message.channel.id === COUNTING_CHANNEL_ID) {
        return counting.handleMessage(message);
    }

    const content = message.content.toLowerCase();

    if (content === '!gta 6') {
        if (message.author.id !== MAINTAINER_ID) {
            await logCommand(message.client, message, '!gta 6', { allowed: false });
            return message.reply('❌ **Access Denied.** Only the bot owner can use this command.');
        }
        if (countdown.isActive()) {
            return message.reply('⏳ A countdown is already running in this bot.');
        }
        await logCommand(message.client, message, '!gta 6', { allowed: true });
        return countdown.start(message.channel);
    }

    if (content === '!analytics') {
        if (message.author.id !== MAINTAINER_ID) {
            await logCommand(message.client, message, '!analytics', { allowed: false });
            return message.reply('❌ **Access Denied.** Only the bot owner can use this command.');
        }
        await logCommand(message.client, message, '!analytics', { allowed: true });
        return message.channel.send({ embeds: [buildAnalyticsEmbed(message.client)] });
    }
};