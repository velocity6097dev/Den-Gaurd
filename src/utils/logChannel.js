/**
 * Sends a payload (content/embeds/files) to a specific channel by ID.
 * One shared place to handle "channel missing / no perms" failures
 * so the command logger and crash logger don't duplicate that logic.
 */
async function sendToChannel(client, channelId, payload) {
    if (!channelId) {
        console.warn('[logChannel] No channel ID configured, skipping send.');
        return;
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            console.warn(`[logChannel] Channel ${channelId} not found or not text-based.`);
            return;
        }
        await channel.send(payload);
    } catch (err) {
        // Never let a logging failure crash the bot or the command that triggered it.
        console.error(`[logChannel] Failed to send to channel ${channelId}:`, err.message);
    }
}

module.exports = { sendToChannel };