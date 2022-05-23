const MessageUI = require("../../utils/UI/MessageUI");
const { Message } = require('discord.js');
const sleep = require("../../utils/tools/sleep");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        if(message.author.bot) return
        if(!client.messagesList.has(message.guildId)) return
        if(message.channelId != client.messagesList.get(message.guildId).channelId) return
        await message.delete();

        if(!message.member.voice.channelId) {
            const msg = await message.channel.send("Tu dois être dans un channel vocal pour pouvoir mettre de la musique");
            await sleep(3000);
            await msg.delete();
            return
        }

        if(message.guild.me.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) {
            const msg = await message.channel.send("Tu dois être dans le même channel vocal que moi pour pouvoir mettre de la musique");
            await sleep(3000);
            await msg.delete();
            return
        }

        const query = message.content;
        const queue = client.player.createQueue(message.guild, {
            metadata: {
                channel: message.channel,
                msg: client.messagesList.get(message.guildId)
            }
        });

        try {
            if (!queue.connection) await queue.connect(message.member.voice.channel);
        } catch {
            queue.destroy();
            const reply = await message.reply({ content: "Impossible de rejoindre ton channel vocal", fetchReply: true });
            await sleep(3000);
            await reply.delete();
            return
        }

        const track = await client.player.search(query, {
            requestedBy: message.user
        }).then(x => x.tracks[0]);
        if (!track) {
            const error = await message.channel.send({ content: `❌ | Musique introuvable` });
            await sleep(3000);
            error.delete();
            return
        } 

        await queue.play(track);
        const msg = client.messagesList.get(message.guildId);
        await MessageUI.updateMessageUI(msg, queue);
    }
}