const { EmbedBuilder } = require('discord.js');
const { TARGET_DATE } = require('../config');
const countdownState = require('../state/countdownState');
const { splitTime, buildClockBlock } = require('../utils/format');

const HERO_IMAGE = 'https://media.rockstargames.com/rockstargames-newsite/uploads/c1ee91a3cf134c4f346b976f62b477b752ecdf0e.jpg';

let countdownActive = false; // guards against double-starting the loop

function isActive() {
    return countdownActive;
}

function buildEmbed(msRemaining) {
    const releaseUnix = Math.floor(TARGET_DATE / 1000);

    if (msRemaining <= 0) {
        return new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🌴 GTA VI IS OUT NOW 🎉')
            .setDescription(`Welcome to Vice City. Go play.\n\n📅 Released <t:${releaseUnix}:D>`)
            .setImage(HERO_IMAGE)
            .setFooter({ text: 'Countdown complete' })
            .setTimestamp();
    }

    const { days, hours, minutes, seconds } = splitTime(msRemaining);
    const clockBlock = buildClockBlock(days, hours, minutes, seconds);

    return new EmbedBuilder()
        .setColor('#FF0090')
        .setAuthor({ name: 'ROCKSTAR GAMES', iconURL: 'https://media.rockstargames.com/is/image/rockstargames/rockstar-favicon' })
        .setTitle('🌴 Grand Theft Auto VI')
        .setDescription(`Vice City awaits.\n\n\`\`\`\n${clockBlock}\n\`\`\`\n📅 <t:${releaseUnix}:F>  •  <t:${releaseUnix}:R>`)
        .setImage(HERO_IMAGE)
        .setFooter({ text: 'Last updated' })
        .setTimestamp();
}

// Update less often when far away, more often as the date approaches.
function getNextInterval(msRemaining) {
    if (msRemaining <= 0) return null;
    if (msRemaining < 60 * 1000) return 1000;               // < 1 min: every second
    if (msRemaining < 60 * 60 * 1000) return 15 * 1000;      // < 1 hr: every 15s
    if (msRemaining < 24 * 60 * 60 * 1000) return 5 * 60000; // < 1 day: every 5 min
    return 30 * 60000;                                       // otherwise: every 30 min
}

async function tick(client, state) {
    const msRemaining = TARGET_DATE - Date.now();

    try {
        const channel = await client.channels.fetch(state.channelId);
        const message = await channel.messages.fetch(state.messageId);
        await message.edit({ embeds: [buildEmbed(msRemaining)] });
    } catch (err) {
        if (err.code === 429 || err.httpStatus === 429) {
            const retryAfter = (err.retry_after || 5) * 1000;
            console.warn(`Rate limited, retrying in ${retryAfter}ms`);
            setTimeout(() => tick(client, state), retryAfter);
            return;
        }
        console.error('Countdown edit failed (message likely deleted). Stopping loop.', err.message);
        countdownActive = false;
        countdownState.clear();
        return;
    }

    if (msRemaining <= 0) {
        countdownActive = false;
        countdownState.clear();
        return; // final "out now" state already posted, nothing left to schedule
    }

    setTimeout(() => tick(client, state), getNextInterval(msRemaining));
}

async function start(channel) {
    if (countdownActive) return; // already running, don't spawn a second loop
    const msRemaining = TARGET_DATE - Date.now();
    const sent = await channel.send({ embeds: [buildEmbed(msRemaining)] });
    const state = { channelId: channel.id, messageId: sent.id };
    countdownState.save(state);
    countdownActive = true;
    tick(channel.client, state);
}

async function resumeIfExists(client) {
    const state = countdownState.load();
    if (!state) return;
    countdownActive = true;
    tick(client, state);
}

module.exports = { start, resumeIfExists, isActive };
