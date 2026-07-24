const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: '⚠️ Could not find that user in this server.', ephemeral: true });
        }

        if (!target.kickable) {
            return interaction.reply({ content: '❌ Cannot kick this user due to role hierarchy.', ephemeral: true });
        }

        await target.kick(reason);
        await interaction.reply(`👢 Kicked **${target.user.tag}** from the server.`);

        await sendModLog(interaction.guild, {
            action: 'KICK',
            target: target.user,
            executor: interaction.user,
            reason: reason
        });
    },
};