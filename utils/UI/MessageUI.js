const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const MessageConstants = require("../constants/MessageConstants");

module.exports = class MessageUI {
    static async createMessageUI(channel) {
        const randomIndex = Math.floor(Math.random() * MessageConstants.IMAGES.length);
        const embed = new MessageEmbed()
            .setTitle('🎧 Lecteur de musique 🎧')
            .setThumbnail(channel.client.user.displayAvatarURL())
            .setImage(MessageConstants.IMAGES[randomIndex])
            .addFields(
                { name: 'Eh oh !!! Il y a quelqu\'un ?', value: `Comment je me fais chier...`, inline: false }
            );

        const msg = await channel.send({ embeds: [embed], fetchReply: true });
        return msg;
    }

    static async resetMessageUI(msg) {
        const randomIndex = Math.floor(Math.random() * MessageConstants.IMAGES.length);
        const embed = new MessageEmbed()
            .setTitle('🎧 Lecteur de musique 🎧')
            .setThumbnail(msg.member.displayAvatarURL())
            .setImage(MessageConstants.IMAGES[randomIndex])
            .addFields(
                { name: 'Eh oh !!! Il y a quelqu\'un ?', value: `Comment je me fais chier...`, inline: false }
            );

        msg.edit({ embeds: [embed] });
        return msg;
    }

    static async updateMessageUI(msg, queue) {
        const actualSong = queue.nowPlaying();
        const trackList = queue.tracks;
        var thumbnail = actualSong.thumbnail;
        if (!thumbnail) {
            const randomIndex = Math.floor(Math.random() * MessageConstants.NO_THUMBNAIL.length);
            thumbnail = MessageConstants.NO_THUMBNAIL[randomIndex];
        }
        const embed = new MessageEmbed()
            .setTitle('🎧 Lecteur de musique 🎧')
            .setThumbnail(msg.member.displayAvatarURL())
            .setImage(actualSong.thumbnail)
            .addField(actualSong.title, `Par *${actualSong.author}*`);

        if (trackList.length) {
            var i = 2;
            var suivant = "";
            trackList.forEach(track => {
                suivant += `*${i}.* ${track.title}\n`
                i++;
            });
            embed.addField(`Suivants :`, suivant);
        }

        const pauseButton = new MessageButton()
            .setLabel("⏸")
            .setStyle('SECONDARY')
            .setCustomId("pause");

        const stopButton = new MessageButton()
            .setLabel("⏹")
            .setStyle("DANGER")
            .setCustomId("stop");

        const skipButton = new MessageButton()
            .setLabel("⏭")
            .setStyle('PRIMARY')
            .setCustomId("skip");

        const playButton = new MessageButton()
            .setLabel("▶")
            .setStyle('SUCCESS')
            .setCustomId("play");

        const actionRow = new MessageActionRow()
            .addComponents([playButton, pauseButton, skipButton, stopButton]);
        msg.edit({ embeds: [embed], components: [actionRow]});
    }
}