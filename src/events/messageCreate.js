const { MAINTAINER_ID, COUNTING_CHANNEL_ID } = require('../config');
const countdown = require('../services/countdown');
const counting = require('../services/counting');

module.exports = async function messageCreate(message) {
    if (message.author.bot) return;

    if (message.channel.id === COUNTING_CHANNEL_ID) {
        return counting.handleMessage(message);
    }

    if (message.content.toLowerCase() === '!gta 6') {
        if (message.author.id !== MAINTAINER_ID) {
            return message.reply('❌ **Access Denied.** Only the bot owner can use this command.');
        }
        if (countdown.isActive()) {
            return message.reply('⏳ A countdown is already running in this bot.');
        }
        await countdown.start(message.channel);
    }
};
