const { SlashCommandBuilder } = require('@discordjs/builders');
const Player = require('../music_feature/Speaker');
const sendTimed = require('../utils/sendTimed');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Install le bot music dans ce channel'),
    async execute(interaction) {
        let player = Player.getPlayerFromChannel(interaction.channel);
        if (player) {
            return sendTimed(interaction.channel, "Ce channel est déja setup", 3000);
        }
        sendTimed(interaction.channel, "Installation...", 3000);
        //Initialisation du nouveau player
        Player.createListener(interaction.channel);


    },
};


