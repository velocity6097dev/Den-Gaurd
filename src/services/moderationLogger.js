const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Sends a structured moderation log entry to the designated mod log channel.
 * @param {import('discord.js').Guild} guild 
 * @param {Object} details 
 */
async function sendModLog(guild, { action, target, executor, reason, extra }) {
    // Read directly from MOD_LOG_CHANNEL_ID in your config.js
    const channelId = config.MOD_LOG_CHANNEL_ID || config.modLogChannelId;

    if (!channelId) {
        console.warn('⚠️ [ModLog Warning] MOD_LOG_CHANNEL_ID is not defined in config.js.');
        return;
    }

    try {
        // Fetch channel directly from API if it is not cached in memory
        const logChannel = await guild.channels.fetch(channelId).catch(() => null);

        if (!logChannel || !logChannel.isTextBased()) {
            console.warn(`⚠️ [ModLog Warning] Could not find text channel with ID: ${channelId}`);
            return;
        }

        const colors = {
            'BAN': 0xFF0000,           // Red
            'UNBAN': 0x00FF00,         // Green
            'KICK': 0xE67E22,          // Orange
            'MUTE': 0xF1C40F,          // Yellow
            'UNMUTE': 0x2ECC71,        // Light Green
            'PURGE': 0x34495E,         // Dark Blue
            'GIVE_ROLE': 0x3498DB,     // Blue
            'REMOVE_ROLE': 0xE74C3C,   // Soft Red
            'TEMP_ROLE_ADD': 0x9B59B6, // Purple
            'TEMP_ROLE_EXPIRE': 0x95A5A6 // Grey
        };

        const embed = new EmbedBuilder()
            .setTitle(`🛡️ Moderation Action: ${action}`)
            .setColor(colors[action] || 0x7289DA)
            .addFields(
                { name: 'Target User', value: target ? `${target.tag || target} (\`${target.id || target}\`)` : 'N/A', inline: true },
                { name: 'Moderator', value: executor ? `${executor.tag} (\`${executor.id}\`)` : 'System', inline: true },
                { name: 'Reason', value: reason || 'No reason provided', inline: false }
            )
            .setTimestamp();

        if (extra) {
            embed.addFields({ name: 'Details', value: extra, inline: false });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ [ModLog Error] Failed to send embed to log channel:', err);
    }
}

module.exports = { sendModLog };