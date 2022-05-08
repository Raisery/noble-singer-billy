const ytSearch = require('yt-search');
const fs = require("fs");
const sendTimed = require("../utils/sendTimed");
const Speaker = require('./Speaker');
const { PlayerSubscription, getVoiceConnection } = require('@discordjs/voice');
require("dotenv").config();

const CONTENT_INTERFACE = `**[ Playlist ]** Rejoins un voice chat et écrit la musique de ton choix.`;
const EMBED_INTERFACE = {
    title: ` "Le silence" 😎`,
    url: `https://as1.ftcdn.net/v2/jpg/04/79/81/76/1000_F_479817672_BpTyGX9qAl3rs9mHqvQUsyWXTJrkLUII.jpg`,
    description: `Bot Noble Singer Billy créé par Raisery`,
    color: 0xD43790,
    image: {
        url: 'https://media.giphy.com/media/tqfS3mgQU28ko/giphy.gif',
    },
    thumbnail: {
        url: 'https://t3.ftcdn.net/jpg/04/79/81/76/360_F_479817672_BpTyGX9qAl3rs9mHqvQUsyWXTJrkLUII.jpg',
    },
}
const BUTTON = [
    {
        type: 1,
        components: [
            {
                style: 2,
                custom_id: `play_pause`,
                disabled: true,
                label: 'PAUSE',
                type: 2,
            },
            {
                style: 2,
                label: 'STOP',
                custom_id: `stop`,
                disabled: false,
                type: 2,
            },
            {
                style: 2,
                label: 'SUIVANT',
                custom_id: `skip`,
                disabled: false,
                type: 2,
            },
        ],
    },
];
const messageInterfaceList = [];

module.exports = class MessageInterface {
    constructor(textChannel) {
        this.textChannel = textChannel;
        this.message;
        this.songList = [];
        this.speakerChannel = null;
        this.connection = null;
    }

    static async createMessageInterface(textChannel) {
        let msgI = new MessageInterface(textChannel);
        await msgI.init();
        messageInterfaceList.push(msgI);
        MessageInterface.save();
        return msgI
    }

    static async deleteMessageInterface(msgI) {
        await msgI.message.delete();
        let index = messageInterfaceList.indexOf(msgI);
        if (index != -1) {
            messageInterfaceList.splice(index, 1);
        }
        fs.writeFileSync(process.env.DATA, JSON.stringify({channel : messageInterfaceList}));
    }

    static getMessageInterfaceFromChannel(textChannel) {
        const msgI = messageInterfaceList.find(msg => msg.textChannel.id == textChannel.id);
        if (!msgI) {
            return null;
        }

        return msgI;
    }

    //sauvegarde les channels 
    static save() {
        const data = JSON.parse(fs.readFileSync(process.env.DATA));
        data.channels = [];
        for(var msgI of messageInterfaceList) {
            data.channels.push(msgI.textChannel);
        };
        fs.writeFileSync(process.env.DATA, JSON.stringify(data));

    }

    static async restore(client) {
        const oldDataInterface = JSON.parse(fs.readFileSync(process.env.DATA));
        for(var oldInterfaceChannel of oldDataInterface.channels) {            
            const guild = await client.guilds.fetch(oldInterfaceChannel.guildId);
            const channel = await guild.channels.fetch(oldInterfaceChannel.id);
            let messages = await channel.messages.fetch({ limit: 100 });
            messages.forEach(async function(msg) {
                await msg.delete();
            });
            MessageInterface.createMessageInterface(channel);
        }
    }

    async addSong(msg) {

        if (!msg.member.voice.channelId) {
            return sendTimed(msg.channel, "Tu dois être dans un channel vocal !", 3000)
        }

        const voiceChannel = await msg.channel.guild.channels.fetch(msg.member.voice.channelId);

        if (this.speakerChannel != null && this.speakerChannel != voiceChannel) {
            return sendTimed(msg.channel, "Tu dois être dans le même channel que le bot", 3000)
        }
        const search = await ytSearch(msg.content);
        const song = search.videos.slice(0, 1)[0];
        this.songList.push(song);
        
        //si c'est la premiere musique on lance le speaker
        if (this.speakerChannel == null) {
            this.speakerChannel = voiceChannel;
            await Speaker.play(this);
        }
        await this.update();
    }

    async skip() {
        
        this.songList.shift();
        if (this.songList.length) {
            await this.update();
            this.connection._state.subscription.player.stop();
            this.connection._state.subscription.player.unsubscribe(this.connection);
            await Speaker.play(this);
        }
        else (
            await this.stop()
        )
        return
    }

    async stop() {
        if (!this.speakerChannel) {
            return
        }
        this.connection._state.subscription.player.stop();
        this.connection._state.subscription.player.unsubscribe(this.connection);
        this.connection.destroy();
        this.songList = [];
        this.speakerChannel = null;
        await this.update();
    }

     //initialisation du message
     async init() {
        this.message = await this.textChannel.send({ content: CONTENT_INTERFACE, embeds: [EMBED_INTERFACE], components: BUTTON });
    }


    async reset() {
        await this.message.edit({ content: CONTENT_INTERFACE, embeds: [EMBED_INTERFACE], components: BUTTON });

        this.songList = [];
        this.speakerChannel = null;
    }


    //met a jour l'affichage de l'interface msg du bot
    async update() {
        //on reset si il n'y a plus de musique dans la liste
        if (!this.songList.length) {
            await this.reset();
            return
        }

        const msg = this.message;
        msg.content = CONTENT_INTERFACE + "\n";
        var index = 0;
        for (var song in this.songList) {
            const reste = this.songList.length - 5;
            var autre = "autre";
            if (reste > 1) {
                autre = "autres";
            }
            if (index <= 4) {
                msg.content += `\n**[${index + 1}]**. ${this.songList[index].title}`
            }
            if (index == 5) {
                msg.content += `\net **${(reste)}** ${autre}...`
            }
            index++;
        };
        song = this.songList[0];
        await this.message.edit({
            content: msg.content,
            embeds: [{
                title: song.title,
                url: song.url,
                description: `Je suis actuellement dans **${this.speakerChannel.name}**`,
                color: 0xD43790,
                image: {
                    url: song.image,
                },
                thumbnail: {
                    url: 'https://t3.ftcdn.net/jpg/04/79/81/76/360_F_479817672_BpTyGX9qAl3rs9mHqvQUsyWXTJrkLUII.jpg',
                },
            },],
            components: BUTTON
        });

    }

}