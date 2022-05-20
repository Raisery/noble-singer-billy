const { MessageEmbed, Message } = require('discord.js');
const sleep = require("../../utils/tools/sleep");
const MessageConstants = require("../../utils/constants/MessageConstants");
const saveToJson = require('../../utils/tools/saveToJson');
const MessageUI = require('../../utils/UI/MessageUI');

module.exports = {
    name: "setup",
    description: 'Installe le lecteur dans le channel actuel. Attention elle supprime tout les messages du channel!!',
    run: async (client, interaction) => {

        const deferedReply = await interaction.deferReply({ fetchReply: true });
        if (client.messagesList.has(interaction.guildId)) {
            console.log("Il y à déja un lecteur installé dans ce serveur. Commande stoppée");
            interaction.followUp("Le bot est déja installé sur ce serveur! utilise /uninstall pour désinstaller le bot");
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

        

        const msg = await MessageUI.createMessageUI(interaction.channel);

        client.messagesList.set(msg.guildId, msg);
        saveToJson(client.messagesList, './data/data.json');
        interaction.followUp("Installation terminée");
        await sleep(3000);
        interaction.deleteReply();
        console.log("Lecteur installé");

    }
}