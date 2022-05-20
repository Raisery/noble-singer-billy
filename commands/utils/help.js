const {MessageEmbed, Message} = require('discord.js');

module.exports = {
    name: "help",
    description: 'Renvoi la liste des commandes disponibles',
    run: async (client, interaction) => {
        const embed = new MessageEmbed()
            .setTitle('❓ Help ❓')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {name: 'Latence', value: `\`${client.ws.ping}ms\``, inline: true },
                {name: 'Uptime', value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({embeds: [embed], fetchReply: true});
    }
}