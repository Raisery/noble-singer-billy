const { Command } = require('discord.js-commando');

module.exports = class HelloCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hello',
			memberName: 'hello',
			group: 'divers',
			aliases: ['bonjour', 'hi'],
			description: 'Replies with a hello message.',
	        guildOnly: false,
	        throttling: {
	            usages: 2,
	            duration: 10,
	        },
		});
	}

	async run(msg) {
        return msg.say(`Bonjour, je suis ${this.client.user.tag} (\`${this.client.user.id}\`)`);
	}
};