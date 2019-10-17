const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class SetLinear extends Command {
	constructor(client) {
		super(client, {
			name: "setlinear",
			group: "leaderboards",
			memberName: "setlinear",
			description: "Enables (or disables) the linear scoring system for solos and duos.",
			examples: ["setlinear yes", "setlinear no"],
            userPermissions: ["MANAGE_GUILD"],
            guildOnly: true,
			args: [
				{
					key: "choice",
                    prompt: "would you like to enable or disable the linear scoring system for solos and duos?\n"+
							"Type `yes` to enable it, or type `no` to disable it.\n",
					type: "boolean"
				}
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

        serverInfo.useLinear = choice

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x000FF)
				.setFooter("Created by @Feldma#1776.")
                .setTitle("Linear Scoring System")
                if (choice){
                    embed.addField("Success!", "The linear scoring system has been enabled for solos and duos.\nYou will still need to use `-setupLeaderboard` for squad scrims.")
                }
                else{
                    embed.addField("Success!", "The linear scoring system has been disabled.\nYou will need to either reenable it or use `-setupLeaderboard` for the legacy system.")
                }


			return msg.embed(embed)

		})
	}
}
