const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class RequireScreenshot extends Command {
	constructor(client) {
		super(client, {
			name: "requirescreenshot",
			group: "settings",
			memberName: "requirescreenshot",
			description: "Allows you to configure if screenshots are required or not.",
			examples: [],
			args: [
                {
                    key: "type",
                    prompt: "what gamemode type do you want to display the leaderboard for? Valid types are solos, duos and squads.",
                    type: "string",
                    validate: text => {
						if (text.indexOf("solo") !== -1 || text.indexOf("duo") !== -1 || text.indexOf("squad") !== -1 ) return true;
						return "Invalid gamemode! Avaliable options: solo, duo or squads."
					},

					parse: text => {
						if (text.indexOf("solo") !== -1){
							return "solo"
						}
						else if (text.indexOf("duo") !== -1){
							return "duo"
						}
						else {
							return "squads"
						}
					}
                },
                {
					key: "required",
					prompt: "do you want to require screenshots? Type `yes` to require, otherwise type `no`.",
					type: "boolean"
				}
			],
			userPermissions: ["MANAGE_CHANNELS"],
            guildOnly: true,
		})
	}


	run(msg, args){
		const { type, required } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        switch ( type ) {
			case "solo":
                serverInfo.soloRequirePhoto = required
				break;
			case "duo":
                serverInfo.duoRequirePhoto = required
				break;
			case "squads":
                serverInfo.squadRequirePhoto = required
				break;
		}


		base.saveServerInfo(msg, serverInfo, () => {
            var grammarString = "required."
            if (!required){
                grammarString = "not required."
            }
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
                .setTitle("Require Screenshot Setup")
                .addField("Success!", "Screenshots in the gamemode " + type + " have been set to " + grammarString)

            msg.embed(embed)
		})
	}
}
