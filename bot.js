const { Client, Intents } = require('discord.js');
const MessageInterface = require('./music_feature/MessageInterface');
const sendTimed = require('./utils/sendTimed');
require("dotenv").config();
const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const speakers = new Map();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('Un bon son sa mére', { type: "LISTENING" });
    await MessageInterface.restore(client);
});


//Ecoute les TextChannel
client.on('messageCreate', async function (msg) {
    if (msg.author.bot) {
        return
    }

    //si le msg est une commande
    if (msg.content[0] == prefix) {
        if (msg.content.slice(0, prefix.length) == prefix) {
            msg.delete();
            let command = msg.content.slice(prefix.length, msg.content.length);
            switch (command) {
                case 'setup':
                    let msgI = MessageInterface.getMessageInterfaceFromChannel(msg.channel);
                    if (msgI) {
                        return sendTimed(msg.channel, "Ce channel est déja setup", 3000);
                    }
                    sendTimed(msg.channel, "Installation...", 3000);
                    //Initialisation du nouveau msgI
                    await MessageInterface.createMessageInterface(msg.channel);
                    break;
            }
        }
        //c'est une mauvaise commande
        return
    }

    //Test si le channel est un channel music
    let msgI = MessageInterface.getMessageInterfaceFromChannel(msg.channel);
    if (msgI) {
        console.log("On joute le son a la playlist");
        await msg.delete();
        await msgI.addSong(msg);
    }

});

client.on("interactionCreate", async function (interaction) {
    const msgI = await MessageInterface.getMessageInterfaceFromChannel(interaction.channel);
    if (!msgI) {
        return
    }
    switch (interaction.customId) {
        case 'play_pause':
            console.log("PLAY/PAUSE");
            break;
        case 'stop':
            msgI.stop();
            break;
        case 'skip':
            msgI.next();
            break;
    }
});


client.on('error', console.error);

client.login(token);
