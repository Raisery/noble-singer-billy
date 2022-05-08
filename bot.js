const { Client, Intents, GuildManager } = require('discord.js');
const MessageInterface = require('./music/MessageInterface');
const sendTimed = require('./utils/sendTimed');
const sleep = require('./utils/sleep');
require("dotenv").config();
const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN;


const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ]
});


client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('Un bon son sa mére', { type: "LISTENING" });
    await MessageInterface.restore(client.guilds.cache);
});


//Ecoute les TextChannel
client.on('messageCreate', async function (msg) {
    if (msg.author.bot) {
        return
    }

    //si le msg est une commande
    if (msg.content[0] == prefix) {
        if (msg.content.slice(0, prefix.length) == prefix) {
            await msg.delete();
            let command = msg.content.slice(prefix.length, msg.content.length);
            let msgI = MessageInterface.getMessageInterfaceFromChannel(msg.channel);
            switch (command) {
                case 'setup':
                    if (msgI) {
                        return sendTimed(msg.channel, "Ce channel est déja setup", 3000);
                    }
                    let messages = await msg.channel.messages.fetch({ limit: 100 });
                    messages.forEach(async function(message) {
                        await message.delete();
                    });
                    sendTimed(msg.channel, "Installation...", 3000);
                    //Initialisation du nouveau msgI
                    await MessageInterface.createMessageInterface(msg.channel);
                    break;
                case 'uninstall':
                    if (!msgI) {
                        return sendTimed(msg.channel, "Ce channel n'est pas setup", 3000);
                    }
                    await MessageInterface.deleteMessageInterface(msgI);
                    break;

            }
        }
        return
    }

    //Test si le channel est un channel music
    let msgI = MessageInterface.getMessageInterfaceFromChannel(msg.channel);
    if (msgI) {
        await msg.delete();
        await msgI.addSong(msg);
    }

});

client.on("interactionCreate", async function (interaction) {
    await interaction.deferReply();
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
            await interaction.deleteReply();
            break;
        case 'skip':
            await msgI.skip();
            await interaction.deleteReply();
            break;
    }
});


client.on('error', console.error);

client.login(token);
