const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');
const { parseDuration } = require('../services/tempRoleScheduler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes (timeouts) a member for a specified duration.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to mute')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the mute'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: '⚠️ Could not find that user in this server.', ephemeral: true });
        }

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply({ content: '❌ Invalid duration format. Use formats like `10m`, `1h`, or `1d`.', ephemeral: true });
        }

        if (!target.moderatable) {
            return interaction.reply({ content: '❌ Cannot mute this user due to role hierarchy.', ephemeral: true });
        }

        await target.timeout(durationMs, reason);
        await interaction.reply(`🔇 Muted **${target.user.tag}** for \`${durationStr}\`.`);

        await sendModLog(interaction.guild, {
            action: 'MUTE',
            target: target.user,
            executor: interaction.user,
            reason: reason,
            extra: `Duration: \`${durationStr}\``
        });
    },
};