const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class SetLinearKills extends Command {
	constructor(client) {
		super(client, {
			name: "setlinearkills",
			group: "leaderboards",
			memberName: "setlinearkills",
			description: "Enables (or disables) kills being part of the linear scoring system.",
			examples: ["setlinearkills yes", "setlinearkills no"],
            userPermissions: ["MANAGE_GUILD"],
            guildOnly: true,
			args: [
				{
					key: "choice",
                    prompt: "would you like to enable or disable kills being included in the linear scoring system for solos and duos?\n"+
							"Type `yes` to enable it, or type `no` to disable it.\n",
					type: "boolean"
				},
			],
		})
	}


	run(msg, args) {
		const { choice } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        var usingLinear = false
        if ("useLinear" in serverInfo){
            if (serverInfo.useLinear){
                usingLinear = true
            }
        }

        if (!usingLinear){
            return msg.reply("the linear scoring system is not activated! Activate it first with `-setlinear`.")
        }
        serverInfo.useLinearKills = choice

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x000FF)
                .setTitle("Linear Scoring System")
                if (choice){
                    embed.addField("Success!", "Kills are now included in the linear scoring system.\nYou will still need to use `-setupLeaderboard` for squad scrims.")
                }
                else{
                    embed.addField("Success!", "Kills are no longer included in the linear scoring system.")
                }


			return msg.embed(embed)
		})
	}
}
