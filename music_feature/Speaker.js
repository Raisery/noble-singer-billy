const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytDownload = require('ytdl-core');
const sendTimed = require("../utils/sendTimed");

module.exports = class Speaker {

    static async play(msgI) {

        const connexion = joinVoiceChannel({
            channelId: msgI.speakerChannel.id,
            guildId: msgI.speakerChannel.guild.id,
            adapterCreator: msgI.speakerChannel.guild.voiceAdapterCreator,
        });

        connexion.on(VoiceConnectionStatus.Ready, () => {
            console.log('The connection has entered the Ready state - ready to play audio!');
        });

        connexion.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                console.log("Tentative de reconnexion")
                await Promise.race([
                    entersState(connexion, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connexion, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                console.error(error);
                connexion.destroy();
            }
        });
        const speaker = createAudioPlayer();
        const song = msgI.songList[0];

        
        if (!ytDownload.validateID(song.videoId)) {
            sendTimed(msgI.textChannel, `${song.title} est illisible sur Youtube`, 3000)

        }
        else {
            const stream = ytDownload(song.url, { filter: 'audioonly' });
            const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
            console.log("on lance la musique");
            speaker.play(resource);
            connexion.subscribe(speaker);
            connexion.setSpeaking(true);

        }
        
        console.log("Aprés le play()");
        speaker.on(AudioPlayerStatus.Idle, async () => {
            msgI.songList.shift();
            if(msgI.songList.length) {
                speaker.stop();
                Speaker.play(msgI);
            }
            else {
                connexion.destroy();
            }
            await msgI.update();
        });

        return true
    }

}