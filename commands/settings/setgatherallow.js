const { Command } = require("discord.js-commando");

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class SetCaptainID extends Command {
	constructor(client) {
		super(client, {
			name: "setgatherallow",
			group: "settings",
			memberName: "setgatherallow",
			description: "OWNER: Toggle the ability for a guild to use the -gather command.",
			examples: [],
			args: [
				{
					key: "allow",
					prompt: "",
					type: "boolean",

				}
			],
			ownerOnly: true,
			guildOnly: true,

		})
	}


	run(msg, args){
		const { allow } = args

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		serverInfo.gatherAllowed = allow

		base.saveServerInfo(msg, serverInfo, () => {
			return msg.reply("succesfully changed.")
		})

	}
}
