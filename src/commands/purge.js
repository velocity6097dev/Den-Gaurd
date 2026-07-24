const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes a specified number of messages in this channel.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        await interaction.deferReply({ ephemeral: true });

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.editReply({ content: `🧹 Deleted ${deleted.size} messages.` });

            await sendModLog(interaction.guild, {
                action: 'PURGE',
                target: `Channel: #${interaction.channel.name}`,
                executor: interaction.user,
                reason: `Purged ${deleted.size} messages in #${interaction.channel.name}`
            });
        } catch (err) {
            await interaction.editReply({ content: '❌ Could not purge messages. Note: Discord does not allow bulk deleting messages older than 14 days.' });
        }
    },
};