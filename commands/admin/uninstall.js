const { MessageEmbed, Message } = require('discord.js');
const sleep = require("../../utils/tools/sleep");
const MessageConstants = require("../../utils/constants/MessageConstants");
const saveToJson = require('../../utils/tools/saveToJson');

module.exports = {
    name: "uninstall",
    description: 'Désinstalle le lecteur du serveur.',
    run: async (client, interaction) => {

        const deferedReply = await interaction.deferReply({ fetchReply: true });
        if (!client.messagesList.has(interaction.guildId)) {
            console.log("Il n'y a pas de lecteur installé dans ce serveur. Commande stoppée");
            interaction.followUp("Le bot n'est pas installé sur ce serveur! utilise /setup pour installer le bot");
            await sleep(3000);
            interaction.deleteReply();
            return
        }
        //Suppresion des anciens messages du channel
        interaction.channel.messages.fetch({ limit: 100 })
            .then(async messages => {
                messages.forEach(async message => {
                    if (message.id != deferedReply.id) {
                        await message.delete();
                    }
                });
            });        

        client.messagesList.delete(interaction.guildId);
        saveToJson(client.messagesList, './data/data.json');
        interaction.followUp("Désinstallation terminée");
        await sleep(3000);
        interaction.deleteReply();
        console.log("Lecteur désinstallé");

    }
}