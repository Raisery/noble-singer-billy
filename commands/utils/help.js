const {MessageEmbed, Message} = require('discord.js');

module.exports = {
    name: "help",
    description: 'Renvoi la liste des commandes disponibles',
    run: async (client, interaction) => {
        const embed = new MessageEmbed()
            .setTitle('❓ Help ❓')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {name: 'Utils', value: `\n\`/ping\` : Affiche les infos de latence du bot\n`, inline: false },
                {name: 'Music', value: `\n\`/play\` : Joue la musique entrée en paramétre\n`, inline: false}
            )
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({embeds: [embed], fetchReply: true});
    }
}