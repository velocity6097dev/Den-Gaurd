module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Only handle slash commands
        if (!interaction.isChatInputCommand()) return;

        // Retrieve the command from the collection we will set up in index.js
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
            }
        }
    },
};