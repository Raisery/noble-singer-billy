const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytDownload = require('ytdl-core');
const sendTimed = require("../utils/sendTimed");

module.exports = class Speaker {

    static async play(msgI) {

        if(!msgI.connection) {
            msgI.connection = joinVoiceChannel({
                channelId: msgI.speakerChannel.id,
                guildId: msgI.speakerChannel.guild.id,
                adapterCreator: msgI.speakerChannel.guild.voiceAdapterCreator,
            });
            msgI.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('The connection has entered the Ready state - ready to play audio!');
            });
    
            msgI.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    console.log("Tentative de reconnexion")
                    await Promise.race([
                        entersState(msgI.connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(msgI.connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    console.error(error);
                    msgI.connection.destroy();
                }
            });
        }
        

        
        const speaker = createAudioPlayer();
        const song = msgI.songList[0];

        
        if (!ytDownload.validateID(song.videoId)) {
            sendTimed(msgI.textChannel, `${song.title} est illisible sur Youtube`, 3000)

        }
        else {
            const stream = ytDownload(song.url, { filter: 'audioonly' });
            const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
            speaker.play(resource);
            msgI.connection.subscribe(speaker);
        }

        
        speaker.on(AudioPlayerStatus.Idle, async () => {
            msgI.songList.shift();
            if(msgI.songList.length) {
                speaker.stop();
                Speaker.play(msgI);
            }
            else {
                msgI.connection.destroy();
            }
            await msgI.update();
        });

        return true
    }

}