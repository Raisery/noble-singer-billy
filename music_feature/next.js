const { Command } = require('discord.js-commando');
const Player = require('./player');
const sendTimed = require('../utils/sendTimed');

module.exports = class NextCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'next',
			memberName: 'next',
			group: 'music',
			description: 'Switch to the next song in the queue',
	        guildOnly: false,
	        throttling: {
	            usages: 2,
	            duration: 10,
	        },
		});
	}

	run(msg) {
        let player = Player.getPlayerFromChannel(msg.channel);
        if(!player) {
            return sendTimed(msg.channel,"Le bot n'est pas installé ici",3000);
        }
        player.next();

	}
};