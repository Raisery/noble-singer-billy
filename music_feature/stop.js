const { Command } = require('discord.js-commando');
const Player = require('./player');
const sendTimed = require('../utils/sendTimed');

module.exports = class StopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stop',
			memberName: 'stop',
			group: 'music',
			description: 'Arrete la diffusion de la musique',
	        guildOnly: false,
	        throttling: {
	            usages: 2,
	            duration: 10,
	        },
		});
	}

	async run(msg) {
        let player = Player.getPlayerFromChannel(msg.channel);
        if(!player) {
            return sendTimed(msg.channel,"Le bot n'est pas installé ici",3000);
        }
        if(player.playing) {
            await player.stop();
        }
	}
};