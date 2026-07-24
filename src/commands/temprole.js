const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');
const { parseDuration, scheduleTempRole } = require('../services/tempRoleScheduler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temprole')
        .setDescription('Assigns a temporary role to a member.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to receive the role')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to assign')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 2h, 1d)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');
        const durationStr = interaction.options.getString('duration');

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply({ content: '❌ Invalid time format. Use values like `10m`, `1h`, or `1d`.', ephemeral: true });
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return interaction.reply({ content: '❌ I cannot assign a role higher than or equal to my own.', ephemeral: true });
        }

        await target.roles.add(role);
        scheduleTempRole(interaction.guild, target, role, durationMs, interaction.user);

        await interaction.reply(`⏰ Granted **${role.name}** to **${target.user.tag}** for \`${durationStr}\`.`);

        await sendModLog(interaction.guild, {
            action: 'TEMP_ROLE_ADD',
            target: target.user,
            executor: interaction.user,
            reason: `Temporary role granted for ${durationStr}`,
            extra: `Role: **${role.name}** | Duration: \`${durationStr}\``
        });
    },
};