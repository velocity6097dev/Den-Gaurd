const { EmbedBuilder } = require('discord.js');
const os = require('os');
const { SERVICE_FOR_ID, MAINTAINER_ID, INTERVAL_MS } = require('../config');

function getRamUsage() {
    const total = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const used = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    return `${used}GB / ${total}GB`;
}

function buildStartupEmbed(client) {
    const nextUpdateUnix = Math.floor((Date.now() + INTERVAL_MS) / 1000);
    const bootUnix = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🟢 System Online & Monitoring')
        .setDescription('The monitoring node has successfully booted up.')
        .addFields(
            { name: '👤 In Service For', value: `<@${SERVICE_FOR_ID}>`, inline: true },
            { name: '🛠️ Maintained By', value: `<@${MAINTAINER_ID}>`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '⏱️ Next Update', value: `<t:${nextUpdateUnix}:R>`, inline: true },
            { name: '⏳ Booted At', value: `<t:${bootUnix}:f>`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '📊 Host Hardware', value: `**OS:** ${os.type()} ${os.release()}\n**RAM:** ${getRamUsage()}`, inline: true },
            { name: '⚡ Network Latency', value: `${client.ws.ping}ms`, inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: `Node ${process.version} • Initializing Sequence` });

    return { embed, bootUnix };
}

function buildHourlyEmbed(client, bootUnix) {
    const upcomingUnix = Math.floor((Date.now() + INTERVAL_MS) / 1000);

    return new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🕒 Routine System Vitals')
        .setDescription(`Automated check-in. Still happily in service for <@${SERVICE_FOR_ID}>.`)
        .addFields(
            { name: '⏱️ Next Check-in', value: `<t:${upcomingUnix}:R>`, inline: true },
            { name: '⏳ Online Since', value: `<t:${bootUnix}:R>`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '⚡ Latency', value: `${client.ws.ping}ms`, inline: true },
            { name: '📊 Host RAM', value: getRamUsage(), inline: true }
        )
        .setFooter({ text: 'Automated Status Update', iconURL: client.user.displayAvatarURL() });
}

async function start(client, channel) {
    const { embed, bootUnix } = buildStartupEmbed(client);
    await channel.send({ embeds: [embed] });

    setInterval(async () => {
        await channel.send({ embeds: [buildHourlyEmbed(client, bootUnix)] });
    }, INTERVAL_MS);
}

module.exports = { start };
