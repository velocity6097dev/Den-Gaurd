const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Assigns a role to a member.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to receive the role')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to assign')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return interaction.reply({ content: '❌ I cannot assign a role higher than or equal to my own.', ephemeral: true });
        }

        await target.roles.add(role);
        await interaction.reply(`✅ Added role **${role.name}** to **${target.user.tag}**.`);

        await sendModLog(interaction.guild, {
            action: 'GIVE_ROLE',
            target: target.user,
            executor: interaction.user,
            reason: 'Manual role assignment via slash command',
            extra: `Assigned Role: **${role.name}** (\`${role.id}\`)`
        });
    },
};