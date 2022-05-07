const sleep = require("./sleep")

module.exports = async function sendTimed(channel,content,ms) {
    const message = await channel.send(content);
    await sleep(ms);
    message.delete();
}