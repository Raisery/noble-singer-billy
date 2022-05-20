module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Connecté comme ${client.user.tag}! avec l'id : (${client.user.id})`);
        client.user.setActivity('Un bon son sa mére', { type: "LISTENING" });
    }
}