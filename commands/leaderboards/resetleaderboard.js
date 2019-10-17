const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js');

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))

module.exports = class ResetLeaderboard extends Command {
	constructor(client){
		super(client, {
			name: "resetleaderboard",
			group: "leaderboards",
			memberName: "resetleaderboard",
			description: "Completely resets all leaderboard information.",
			examples: ["resetleaderboard"],
			userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
			args: [
                {
					key: "type",
					prompt: "what gamemode do you want to reset the leaderboard for? Options are solo, duo or squads.",
					type: "string",
					validate: text => {
						if (text.indexOf("solo") !== -1 || text.indexOf("duo") !== -1 || text.indexOf("squad") !== -1 ) return true;
						return "Invalid game type! Avaliable options: solo, duo or squads."
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
					key: "confirm",
					prompt: "are you sure you want to reset the leaderboard?\nThis action cannot be undone.\nType **yes** if you want to continue.",
					type: "boolean",
				}
			]
		})
	}


	async run (msg, args) {
		const { type, confirm }  = args;

		if (!confirm){
			return msg.reply("leaderboard reset aborted!")
		}

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

		// Determine what game type we want.
		var types = teamModule.getGameType( type )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

		// Grab our point structure and saved leaderboard info.
		var infos = teamModule.returnInfoTypes(serverInfo, typeSolo, typeDuo, typeSquad)
		var pointInfo = infos[0], leadInfo = infos[1]


		// We just need to delete all the data in squadLeaderboard.
		if (leadInfo.length == 0){ // there is no data to reset.
			return msg.reply("there is no leaderboard information to reset!")
		}


        if (typeSolo){
            serverInfo.soloLeaderboard = []
        }
        else if (typeDuo){
            serverInfo.duoLeaderboard = []
        }
        else{
            serverInfo.squadLeaderboard = []
        }


		// Save data
		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "The " + type + " leaderboard has been reset by " + msg.member + "!")

			msg.embed(embed)


		})
	}
}
