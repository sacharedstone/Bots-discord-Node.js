const Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {

    message.channel.send("pong");
    console.log('pong')

}
module.exports.config = {
    name: "ping"
}
