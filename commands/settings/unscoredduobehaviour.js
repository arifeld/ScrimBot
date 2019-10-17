const { Command } = require("discord.js-commando");

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class UnscoredDuoBehaviour extends Command {
	constructor(client) {
		super(client, {
			name: "unscoredduobehaviour",
			group: "settings",
			memberName: "unscoredbehaviour",
			description: "Sets whether unscored duos should require players to be in a duo team.",
			examples: [],
			args: [
				{
                    key: "behaviour",
					prompt: "Do you want unscored duo games to require players to be in a duo team?\n" +
                            "If you want created duo teams as a requirement, respond with `yes`.\n" +
                            "Otherwise, if you do not want this requirement (so players do not need to be in a duo team and their usernames will just be used instead), respond with `no`.",
					type: "boolean",
				}
			],
			guildOnly: true,

		})
	}


	run(msg, args){
		const { behaviour } = args

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		serverInfo.unscoredDuoBehaviour = behaviour
        msg.guild.unscoredDuoBehaviour = behaviour

		base.saveServerInfo(msg, serverInfo, () => {
			return msg.reply("succesfully changed.")
		})
	}
}
