const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class LockDuoInfo extends Command {
	constructor(client) {
		super(client, {
			name: "lockduoinfo",
			group: "duo_team_management",
			memberName: "lockduoinfo",
			description: "OWNER: Locks duo channel commands.",
            guildOnly: true,
            ownerOnly: true,
			args: [
				{
					key: "channel",
					prompt: "**enter channel.**",
					type: "channel",

				},
			],
		})
	}


	run(msg, args){
		const { channel } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        serverInfo.lockedDuo = channel.id

		base.saveServerInfo(msg, serverInfo, () => {
			return msg.reply("successfully set!")
		})
	}
}
