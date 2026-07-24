const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes timeout from a member.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to unmute')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unmuting'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: '⚠️ Could not find that user in this server.', ephemeral: true });
        }

        if (!target.isCommunicationDisabled()) {
            return interaction.reply({ content: '⚠️ This member is not currently muted.', ephemeral: true });
        }

        await target.timeout(null, reason);
        await interaction.reply(`🔊 Unmuted **${target.user.tag}**.`);

        await sendModLog(interaction.guild, {
            action: 'UNMUTE',
            target: target.user,
            executor: interaction.user,
            reason: reason
        });
    },
};