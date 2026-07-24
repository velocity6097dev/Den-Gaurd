const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user via their ID.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Discord ID of the user to unban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the unban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const bannedUser = await interaction.guild.members.unban(userId, reason);
            await interaction.reply(`✅ Successfully unbanned **${bannedUser.tag || userId}**.`);

            await sendModLog(interaction.guild, {
                action: 'UNBAN',
                target: bannedUser,
                executor: interaction.user,
                reason
            });
        } catch (err) {
            await interaction.reply({ content: '❌ Could not unban user. Make sure the ID is correct and they are actually banned.', ephemeral: true });
        }
    },
};