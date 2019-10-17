const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class SetCaptain extends Command {
	constructor(client) {
		super(client, {
			name: "setcaptain",
			group: "settings",
			memberName: "setcaptain",
			description: "Sets the captain role, for use in the -gather command.",
			examples: [],
			args: [
				{
					key: "captain",
					prompt: "**what is the full name of the captain role?**\n\nYou do not need to mention it, just type the full name.\nExample: type 'Captain' (without the quotation marks)",
					type: "role",

				}
			],
			guildOnly: true,
			userPermissions: ["MANAGE_CHANNELS", "MOVE_MEMBERS"],
		})
	}


	run(msg, args){
		const { captain } = args

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (serverInfo.captainRole == captain.id){
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0xFF0000)
				.setFooter("Created by @Feldma#1776.")
				.addField(":no_entry: An error occurred!", captain + " is already the set captain role!")
			return msg.replyEmbed(embed)
		}
		else {
			serverInfo.captainRole = captain.id
		}

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", captain + " has been set as the captain role.")

			return msg.replyEmbed(embed)
		})
	}
}
