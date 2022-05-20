const sleep = require("../../utils/tools/sleep");

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (client.messagesList.has(interaction.guildId) && cmd.name !== "uninstall") {
                await interaction.reply('Les commandes sont désactivée dans ce channel');
                await sleep(3000);
                await interaction.deleteReply();
                return
            }
            if (!cmd) {
                await interaction.reply('Cette commande n\'existe pas!');
                await sleep(3000);
                await interaction.deleteReply();
                return
            }
            console.log(`${interaction.user.username} (${interaction.user.id}) a utilisé la commande ${cmd.name} dans le channel ${interaction.channel.name} (${interaction.channelId}) du serveur ${interaction.guild.name} (${interaction.guildId})`)
            cmd.run(client, interaction);
        }

        if (interaction.isButton()) {
            const queue = client.player.getQueue(interaction.guild);
            switch (interaction.customId) {
                case "play":
                    queue.setPaused(false);
                    break;
                case "stop":
                    queue.stop();
                    break;
                case "skip":
                    queue.skip();
                    break;
                case "pause":
                    queue.setPaused(true);
                    break;
            }

            interaction.deferReply();
            await sleep(1500);
            interaction.deleteReply();
        }
    }
}