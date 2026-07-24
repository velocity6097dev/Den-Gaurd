const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '⚠️ Could not find that user.', ephemeral: true });
        if (!target.bannable) return interaction.reply({ content: '❌ I cannot ban this user due to role hierarchy.', ephemeral: true });

        await target.ban({ reason });
        await interaction.reply(`✅ Successfully banned **${target.user.tag}**.`);

        await sendModLog(interaction.guild, {
            action: 'BAN',
            target: target.user,
            executor: interaction.user,
            reason
        });
    },
};