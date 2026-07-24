const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { sendModLog } = require('../services/moderationLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends an embedded announcement to a specified channel.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send the announcement to')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The main body text of the announcement (use \\n for new lines)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('title')
                .setDescription('The title of the announcement embed')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('Custom hex color code (e.g., #3498DB). Defaults to a modern dark theme.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('channel');
        const messageText = interaction.options.getString('message');
        const titleText = interaction.options.getString('title') || '📢 Announcement';
        const customColor = interaction.options.getString('color') || '#2B2D31'; // Default Discord dark theme color

        // Validate the color format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (customColor !== '#2B2D31' && !hexColorRegex.test(customColor)) {
            return interaction.reply({ 
                content: '❌ Invalid hex color code. Please use formats like `#FF0000` or `#3498DB`.', 
                ephemeral: true 
            });
        }

        // Format newlines correctly if the user typed "\n" manually in the slash command box
        const formattedMessage = messageText.replace(/\\n/g, '\n');

        const announceEmbed = new EmbedBuilder()
            .setTitle(titleText)
            .setDescription(formattedMessage)
            .setColor(customColor)
            .setTimestamp()
            .setFooter({ text: `Announced by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            await targetChannel.send({ embeds: [announceEmbed] });
            
            // Reply ephemerally to the admin so it doesn't clog the channel they ran it in
            await interaction.reply({ 
                content: `✅ Successfully sent the announcement to ${targetChannel}.`, 
                ephemeral: true 
            });

            // Log the announcement in the mod log for security/audit purposes
            await sendModLog(interaction.guild, {
                action: 'ANNOUNCE',
                target: `Channel: #${targetChannel.name}`,
                executor: interaction.user,
                reason: 'Sent a server announcement',
                extra: `**Title:** ${titleText}\n**Message Snippet:** ${formattedMessage.substring(0, 100)}...`
            });

        } catch (error) {
            console.error('Error sending announcement:', error);
            await interaction.reply({ 
                content: '❌ Failed to send the announcement. Please check if I have permissions to send messages and embeds in that channel.', 
                ephemeral: true 
            });
        }
    },
};