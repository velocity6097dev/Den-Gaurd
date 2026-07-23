const { WebhookClient } = require('discord.js');
const { COUNTING_CHANNEL_ID } = require('../config');
const countState = require('../state/countState');

// Rules: numbers must go up by exactly 1, and the same person can never
// submit two counts in a row — someone else has to post the next number
// before that user can count again.

let state = countState.load();
let webhook = null; // cached WebhookClient, created lazily (or warmed up at startup)

async function getWebhook(channel) {
    if (webhook) return webhook;

    const webhooks = await channel.fetchWebhooks();
    let hook = webhooks.find((wh) => wh.name === 'Counting Relay' && wh.owner?.id === channel.client.user.id);

    if (!hook) {
        hook = await channel.createWebhook({
            name: 'Counting Relay',
            avatar: channel.client.user.displayAvatarURL(),
        });
    }

    webhook = new WebhookClient({ id: hook.id, token: hook.token });
    return webhook;
}

function formatCount(n) {
    return n % 100 === 0 ? `🎉 **${n}** 🎉` : `${n}`; // small flourish every 100
}

// Plain typed messages can't be made truly ephemeral — that API only exists
// for slash-command/component replies. This posts the warning in the same
// channel and deletes it fast so it doesn't linger, without leaving the
// channel or DMing anyone.
async function warnInChannel(message, text) {
    const warning = await message.channel.send({ content: `<@${message.author.id}> ${text}` }).catch(() => null);
    if (warning) setTimeout(() => warning.delete().catch(() => {}), 3000);
}

async function handleMessage(message) {
    const content = message.content.trim();

    if (!/^\d+$/.test(content)) {
        // This channel is counting-only — anything that isn't a plain number
        // gets removed and the poster is warned, instead of being ignored.
        await message.delete().catch(() => {});
        warnInChannel(message, '❌ This channel is for counting only — numbers only, no other messages.');
        return;
    }

    const submitted = parseInt(content, 10);
    const expected = state.count + 1;
    const sameUserAsLast = message.author.id === state.lastUserId;

    if (submitted !== expected || sameUserAsLast) {
        await message.delete().catch(() => {}); // remove the wrong number immediately
        const reason = sameUserAsLast
            ? `❌ You can't count twice in a row — someone else needs to post **${expected}** next.`
            : `❌ That's not it — the next number should be **${expected}**.`;
        warnInChannel(message, reason); // not awaited — doesn't slow down the response
        return; // does NOT advance the count
    }

    // Valid count — update state synchronously (before any await) so a
    // near-simultaneous message can't race past this check.
    state.count = submitted;
    state.lastUserId = message.author.id;
    countState.save(state);

    try {
        const hook = await getWebhook(message.channel);
        // Repost + delete the original at the same time instead of one
        // after another — cuts the visible delay roughly in half.
        await Promise.all([
            hook.send({
                username: message.member?.displayName || message.author.username,
                avatarURL: message.author.displayAvatarURL(),
                content: formatCount(submitted),
            }),
            message.delete().catch(() => {}),
        ]);
    } catch (err) {
        console.error('Counting webhook failed:', err.message);
    }
}

// Pre-create/fetch the webhook at startup so the first count isn't slowed
// down by a cold-start fetchWebhooks/createWebhook call.
async function warmUpWebhook(client) {
    const channel = client.channels.cache.get(COUNTING_CHANNEL_ID);
    if (!channel) return;
    try {
        await getWebhook(channel);
    } catch (err) {
        console.error('Could not prepare counting webhook:', err.message);
    }
}

module.exports = { handleMessage, warmUpWebhook };