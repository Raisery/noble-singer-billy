const { Player } = require('discord-player');
const { Client, Intents, Collection } = require('discord.js');
const MessageUI = require('./utils/UI/MessageUI');
require("dotenv").config();
const token = process.env.BOT_TOKEN;
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});
client.commands = new Collection();
client.messagesList = new Collection();
client.player = new Player(client);
client.player.on('trackStart',async (queue,track) => await MessageUI.updateMessageUI(queue.metadata.msg, queue));
client.player.on('queueEnd',async (queue,track) => await MessageUI.resetMessageUI(queue.metadata.msg));

['CommandUtil', 'EventUtil'].forEach(async handler => {require(`./utils/handlers/${handler}`)(client) });

process.on('exit', code => {console.log(`Le processus s'est arrêté avec le code: ${code}`) });
process.on('uncaughtException', (err, origin) => {console.log(`UNCAUGHT_EXCEPTION: ${err}`, `Origine: ${origin}`) });
process.on('unhandledRejection', (reason, promise) => { console.log(`UNHANDLED_REJECTION: ${reason}\n----------\n`, promise) });
process.on('warning', (...args) => console.log(...args));

client.login(token);
