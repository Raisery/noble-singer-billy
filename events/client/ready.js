module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Connecté en tant que ${client.user.tag}! avec l'id : ${client.user.id}`);
        client.user.setActivity('Un bon son sa mére', { type: "LISTENING" });

        const devGuild = await client.guilds.cache.get('971152670209486931');
        devGuild.commands.set(client.commands.map(cmd => cmd));
    }
}