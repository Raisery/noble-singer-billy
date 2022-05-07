const { SlashCommandBuilder } = require('@discordjs/builders');
const Player = require('../music_feature/Speaker');
const sendTimed = require('../utils/sendTimed');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('uninstall')
        .setDescription('Désinstalle le bot music dans ce channel'),
    async execute(interaction) {
        sendTimed(interaction.channel,`Désinstallation ...`,1000);        
        
        const player = Player.getPlayerFromChannel(interaction.channel);
        if(!player) {
            sendTimed(interaction.channel,"Il y a rien a désinstaller",3000);
            return
        }
        
        //on supprime le player
        Player.deleteListener(player);


    },
};


