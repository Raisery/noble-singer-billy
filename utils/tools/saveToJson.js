const { Collection } = require("discord.js");
const fs = require("fs");

module.exports = function saveToJson(dataCollection, file) {
    const data = [];
    dataCollection.forEach((value) => {
        data.push({channelId: value.channelId, guildId: value.guildId});
    })
    return fs.writeFileSync(file, JSON.stringify(data));
};