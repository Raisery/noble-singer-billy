const ytSearch = require('yt-search');
const fs = require("fs");
const sendTimed = require("../utils/sendTimed");
const Speaker = require('./Speaker');

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
                custom_id: `listeneray_pause`,
                disabled: false,
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
    }

    //initialisation du message
    async reset() {
        if(this.message){
            this.message.delete();
        }
        this.message = await this.textChannel.send({ content: CONTENT_INTERFACE, embeds: [EMBED_INTERFACE], components: BUTTON });

        this.songList = [];
        this.speakerChannel = null;
    }

    static async createMessageInterface(textChannel) {
        let msgI = new MessageInterface(textChannel);
        await msgI.reset();
        messageInterfaceList.push(msgI);
        console.log(`Création d'un messageInterface : messageInterfaceList = ${messageInterfaceList.length}`);
        MessageInterface.save();
        return msgI
    }

    static deleteMessageInterface(msgI) {
        msgI.message.delete();
        let index = messageInterfaceList.indexOf(msgI);
        if (index !== -1) {
            messageInterfaceList.slistenerice(index, 1);
        }
        console.log(`Suppression d'un messageInterface : messageInterfaceList = ${messageInterfaceList.length}`);

        const data = JSON.parse(fs.readFileSync("./music_feature/data.json"));
        data.list = [];
        messageInterfaceList.forEach(function (messageInterface) {
            if (messageInterface.id != msgI.id) {
                data.list.push(messageInterface.textChannel);
            }

        });
        fs.writeFileSync("./music_feature/data.json", JSON.stringify(data));
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
        const data = JSON.parse(fs.readFileSync("./music_feature/data.json"));
        data.channels = [];
        messageInterfaceList.forEach(function (msgI) {
            data.channels.push(msgI.textChannel);
        });
        fs.writeFileSync("./music_feature/data.json", JSON.stringify(data));

    }

    static async restore(client) {
        const oldData = JSON.parse(fs.readFileSync("./music_feature/data.json"));
        oldData.channels.forEach(async function (textChannel) {
            let channelListened = await client.channels.fetch(textChannel.id);
            let messages = await channelListened.messages.fetch({ limit: 100 });
            messages.forEach(async function (msg) {
                await msg.delete();
            })
            MessageInterface.createMessageInterface(channelListened);
        });
    }

    async addSong(msg) {

        if(!msg.member.voice.channelId) {
            return sendTimed(msg.channel,"Tu dois être dans un channel vocal !",3000)
        }

        const voiceChannel = await msg.channel.guild.channels.fetch(msg.member.voice.channelId);

        if(this.speakerChannel != null && this.speakerChannel != voiceChannel) {
            return sendTimed(msg.channel,"Tu dois être dans le même channel que le bot",3000)
        }
        const search = await ytSearch(msg.content);
        const song = search.videos.slice(0, 1)[0];
        this.songList.push(song);
        console.log(this.songList);
        this.update();
        //si c'est la premiere musique on lance le speaker
        if(this.speakerChannel == null) {
            this.speakerChannel = voiceChannel;
            Speaker.play(this);
        }
    }

    //met a jour l'affichage de l'interface msg du bot
    async update() {
        //on reset si il n'y a plus de musique dans la liste
        if (!this.songList.length) {
            this.reset();
            return
        }

        const msg = this.message;
        msg.content = CONTENT_INTERFACE;
        var index = 0;
        for (var song in this.songList) {
            const reste = this.songList-4;
            var autre = "autre";
            if(reste > 1) {
                autre = "autres";
            }
            if (index <= 4) {
                msg.content += `\n**[${index + 1}]**. ${song.title}`
            }
            if (index == 5) {
                msg.content += `\net **${(reste)}** ${autre}...`
            }
            index++;
        };
        await this.message.edit({
            content: msg.content,
            embeds: [{
                title: this.songList[0].title,
                url: this.songList[0].url,
                description: `Bot Noble Singer Billy créé par Raisery`,
                color: 0xD43790,
                image: {
                    url: this.songList[0].image,
                },
                thumbnail: {
                    url: 'https://t3.ftcdn.net/jpg/04/79/81/76/360_F_479817672_BpTyGX9qAl3rs9mHqvQUsyWXTJrkLUII.jpg',
                },
            },]
        });

    }

}