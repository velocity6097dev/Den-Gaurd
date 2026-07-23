const { ActivityType } = require('discord.js');
const { CHANNEL_ID } = require('../config');
const vitals = require('../services/vitals');
const countdown = require('../services/countdown');
const counting = require('../services/counting');

module.exports = async function ready(client) {
    console.log(`✅ Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: 'Server Vitals', type: ActivityType.Watching }],
        status: 'online',
    });

    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) {
        console.error('❌ Channel not found! Please check CHANNEL_ID in src/config.js.');
    } else {
        await vitals.start(client, channel);
    }

    // Resume an in-progress countdown after a restart, instead of losing it
    await countdown.resumeIfExists(client);

    // Pre-create the counting webhook so the first count feels instant
    await counting.warmUpWebhook(client);
};
