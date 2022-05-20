const sleep = require('../../utils/tools/sleep');

module.exports = {
    name: "ping",
    description: 'Renvoi pong',
    run: async (client, interaction) => {
        const msg = await interaction.reply({content: 'Pong!', fetchReply: true});
        await sleep(3000);
        await msg.delete();
    }
}