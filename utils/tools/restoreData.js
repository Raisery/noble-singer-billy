const { readFileSync } = require("fs");
const { MessageEmbed, Message } = require('discord.js');
const saveToJson = require("./saveToJson");
const MessageConstants = require("../constants/MessageConstants");
const MessageUI = require("../UI/MessageUI");

module.exports = async function restoreData(client) {
    const data = JSON.parse(readFileSync("./data/data.json"));
    if (!data) return console.log("Fichier data.json introuvable");
    if (!data.length) return console.log("Pas de chargement de données: Fichier data.json vide!");

    data.forEach(async msgData => {
        const guild = await client.guilds.cache.get(msgData.guildId);
        const channel = await guild.channels.cache.get(msgData.channelId);

        //Suppresion des anciens messages du channel
        await channel.messages.fetch({ limit: 100 })
            .then(async messages => {
                messages.forEach(async message => {
                        await message.delete();
                });
            });

        const msg = await MessageUI.createMessageUI(channel);

        client.messagesList.set(msg.guildId, msg);
        saveToJson(client.messagesList, './data/data.json');
    });
    
    console.log(`Guilds restaurées: ${data.length}`);
}