const { EmbedBuilder } = require('discord.js');
const { getState } = require('../state/analyticsState');

function formatDuration(ms) {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    return `${d}d ${h}h ${m}m ${s}s`;
}

/**
 * Builds the embed for the admin-only "!analytics" command.
 */
function buildAnalyticsEmbed(client) {
    const state = getState();

    const topCommands =
        Object.entries(state.commandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count], i) => `${i + 1}. \`${name}\` — ${count} uses`)
            .join('\n') || '*No commands used yet*';

    const topUsers =
        Object.entries(state.userCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count], i) => `${i + 1}. <@${id}> — ${count} commands`)
            .join('\n') || '*No usage yet*';

    const deniedTotal = Object.values(state.deniedCounts).reduce((a, b) => a + b, 0);
    const trackingSinceUnix = Math.floor(new Date(state.startedAt).getTime() / 1000);

    return new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('📊 Bot Command Analytics')
        .addFields(
            { name: '✅ Total Commands Run', value: `${state.totalCommands}`, inline: true },
            { name: '⛔ Denied Attempts', value: `${deniedTotal}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '🕰️ Tracking Since', value: `<t:${trackingSinceUnix}:R>`, inline: true },
            { name: '⚡ Latency', value: `${client.ws.ping}ms`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '🏆 Top Commands', value: topCommands, inline: true },
            { name: '👥 Most Active Users', value: topUsers, inline: true }
        )
        .setFooter({ text: `Bot uptime: ${formatDuration(client.uptime)}` })
        .setTimestamp();
}

module.exports = { buildAnalyticsEmbed };